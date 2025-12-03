
import { GoogleGenAI, Modality } from "@google/genai";
import { ChatMessage, MedicalReport, Medication } from "../types";

const fileToGenerativePart = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const GeminiService = {
  // 1. Chatbot Logic (Strictly Safe)
  async getMedicalAdvice(history: ChatMessage[], newUserMessage: string): Promise<{ text: string; risk: 'low' | 'moderate' | 'high' }> {
    if (!process.env.API_KEY) {
      return { text: "Error: Gemini API key not detected. Please ensure your environment is configured correctly.", risk: 'low' };
    }
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const systemInstruction = `
      You are Clarus, a premium medical companion.
      
      MANDATORY SAFETY RULES:
      1. NEVER diagnose a condition. Use "possible reasons" or "associated with".
      2. NEVER prescribe medication or dosages.
      3. NEVER advise stopping current medication.
      4. ALWAYS advise consulting a doctor for persistent or worsening symptoms.
      5. If symptoms indicate emergency (chest pain, stroke signs, severe bleeding), flag as HIGH risk and advise immediate ER visit.
      
      STRUCTURE YOUR RESPONSE:
      **Summary**: 1 sentence recap of user's issue.
      **Possible Reasons**: Bullet points of non-diagnostic possibilities.
      **What to Monitor**: Specific signs to watch for.
      **Self-care**: Safe, conservative steps (rest, hydration).
      **When to see a doctor**: Specific thresholds.

      At the very end, strictly output JSON risk level:
      \`\`\`json
      { "risk": "low" | "moderate" | "high" }
      \`\`\`
    `;

    const chatHistory = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    try {
      const chat = ai.chats.create({
        model: 'gemini-3-pro-preview',
        config: { systemInstruction, temperature: 0.3 },
        history: chatHistory
      });

      const result = await chat.sendMessage({ message: newUserMessage });
      const fullText = result.text || "";
      
      let risk: 'low' | 'moderate' | 'high' = 'low';
      const cleanText = fullText.replace(/```json\n\{\s*"risk":\s*"(low|moderate|high)"\s*\}\n```/g, (match, p1) => {
        risk = p1 as any;
        return ""; 
      }).trim();

      return { text: cleanText, risk };
    } catch (error: any) {
      console.error("Gemini Chat Error:", error);
      return { 
        text: "I am having trouble connecting to the medical database right now. Please try again in a moment.", 
        risk: 'low' 
      };
    }
  },

  // 2. Report & Prescription Analysis
  async analyzeDocument(file: File, type: 'lab' | 'prescription' | 'scan' | 'other'): Promise<MedicalReport | any | null> {
    if (!process.env.API_KEY) throw new Error("API Key missing");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const base64Data = await fileToGenerativePart(file);

    let prompt = "";
    if (type === 'lab') {
       prompt = `Analyze this LAB REPORT. Extract test names, values, and status (High/Low/Normal). 
         Return JSON: { "title": string, "date": string, "summary": string, "insights": [{ "label": string, "value": string, "status": "high"|"low"|"normal", "explanation": string }] }`;
    } else if (type === 'scan') {
       prompt = `Analyze this MEDICAL SCAN/X-RAY report/image text. Extract findings. 
         Return JSON: { "title": string, "date": string, "summary": string, "insights": [{ "label": string, "value": string, "status": "normal"|"high"|"low", "explanation": string }] }`;
    } else {
       prompt = `Analyze this PRESCRIPTION. Extract medications. DO NOT invent dosages.
         Return JSON: { "title": string, "date": string, "summary": string, "insights": [], "medications": [{ "name": string, "strength": string, "timing": string, "instructions": string }] }`;
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
            { inlineData: { mimeType: file.type, data: base64Data } },
            { text: prompt }
          ]
        },
        config: { responseMimeType: "application/json" }
      });

      return JSON.parse(response.text || "{}");
    } catch (error) {
      console.error("Analysis Error:", error);
      return null;
    }
  },

  // 3. Generate Doctor Summary
  async generateDoctorSummary(profile: any, history: ChatMessage[], meds: any[]): Promise<string> {
    if (!process.env.API_KEY) return "Unable to generate summary. API Key missing.";
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const context = `
      User: ${profile.name}
      Conditions: ${profile.medicalHistory?.join(', ') || 'None listed'}
      Allergies: ${profile.allergies?.join(', ') || 'None'}
      Current Meds: ${meds.map(m => m.name).join(', ')}
      Recent Chat: ${history.slice(-4).map(h => h.role + ': ' + h.text).join('\n')}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Create a concise medical summary for a doctor's visit based on this context. Format as: "Patient presents with [conditions]. Recent concerns include [symptoms from chat]. Current medications: [meds]. Allergies: [allergies]."` + context
    });

    return response.text || "Summary generation failed.";
  },

  // 4. Medication Interaction Check
  async checkInteractions(meds: Medication[], allergies: string[]): Promise<string> {
    if (!process.env.API_KEY) return "Safety check unavailable.";
    if (meds.length === 0) return "No medications to check.";

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
      Review these medications: ${meds.map(m => m.name).join(', ')}.
      Patient allergies: ${allergies.join(', ')}.
      Identify any potential serious drug-drug interactions or drug-allergy conflicts.
      Keep it brief (max 3 sentences). If safe, say "No significant interactions found."
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      return response.text || "No interactions found.";
    } catch (e) {
      return "Unable to verify interactions at this time.";
    }
  },

  // 5. Daily Insight
  async getFastInsight(topic: string): Promise<string> {
    if (!process.env.API_KEY) return "Stay hydrated and get enough rest.";
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Give me a 1-sentence interesting medical fact, wellness tip, or encouraging quote about ${topic}. Do not use markdown.`
      });
      return response.text || "Health is wealth.";
    } catch (e) {
      return "Take a deep breath and relax.";
    }
  },

  // 6. Text to Speech
  async speak(text: string, style: 'calm' | 'normal' = 'normal'): Promise<void> {
    if (!process.env.API_KEY) return;
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: text.substring(0, 400) }] }], // Limit length for speed
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: style === 'calm' ? 'Fenrir' : 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) return;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      
      const audioBuffer = await decodeAudioData(
        decode(base64Audio), 
        audioCtx, 
        24000, 
        1
      );
      
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);
      source.start();
      
    } catch (e) {
      console.error("TTS Error", e);
    }
  }
};
