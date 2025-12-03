
import React, { useState, useEffect, useRef } from 'react';
import { Send, Volume2, Sparkles, User, AlertTriangle } from 'lucide-react';
import { ChatMessage } from '../types';
import { GeminiService } from '../services/geminiService';
import { StorageService } from '../services/storage.ts';
import { SectionHeader, RiskBadge } from './UIComponents';

export const AskAI: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const history = StorageService.getChatHistory();
    setMessages(history.length ? history : [{
      id: 'init', role: 'model', text: "How are you feeling right now?", timestamp: Date.now()
    }]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    StorageService.saveChatHistory(messages);
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    setError(null);
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await GeminiService.getMedicalAdvice(messages, input);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), role: 'model', text: response.text, isRisk: response.risk, timestamp: Date.now()
      }]);
    } catch (e: any) { 
      console.error(e); 
      setError("Unable to connect to Medical Intelligence. Please check your internet connection.");
    } 
    finally { setLoading(false); }
  };

  const renderContent = (text: string) => {
    // Basic Markdown bold support
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, index) => index % 2 === 1 ? <strong key={index} className="font-bold text-slate-800 dark:text-slate-100">{part}</strong> : <span key={index}>{part}</span>);
  };

  return (
    <div className="flex flex-col h-full relative">
      <SectionHeader 
        title="Medical Intelligence" subtitle="AI Assistant"
        tutorial="Describe symptoms clearly. Clarus will provide a summary, possible reasons, and self-care tips."
        disclaimer="Clarus provides information, NOT medical advice. If you see a High Risk badge, seek professional help immediately."
        icon={<Sparkles size={20} />}
      />

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 pb-48 scrollbar-hide [mask-image:linear-gradient(to_bottom,transparent,black_20px,black_calc(100%-20px),transparent)]">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            <div className={`flex gap-3 max-w-[95%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-auto border border-slate-200 dark:border-slate-700 ${msg.role === 'user' ? 'bg-white dark:bg-slate-800 text-slate-400' : 'bg-medical-500 text-white'}`}>
                {msg.role === 'user' ? <User size={16} /> : <Sparkles size={16} />}
              </div>
              <div className={`p-6 rounded-[2rem] text-[15px] leading-relaxed relative group transition-all duration-300 border ${
                  msg.role === 'user' 
                    ? 'bg-slate-800 text-white rounded-br-none border-slate-800' 
                    : 'bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 rounded-bl-none border-slate-200 dark:border-slate-700'
                }`}>
                {msg.role === 'model' && msg.isRisk && (
                   <div className="mb-3"><RiskBadge level={msg.isRisk} /></div>
                )}
                <div className="whitespace-pre-line">{renderContent(msg.text)}</div>
                {msg.role === 'model' && (
                  <button onClick={() => GeminiService.speak(msg.text.replace(/\*/g, ''))} className="absolute -bottom-10 left-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md px-3 py-1.5 rounded-full text-slate-500 dark:text-slate-400 opacity-0 group-hover:opacity-100 flex items-center gap-2 border border-slate-200 dark:border-slate-700 transition-opacity">
                    <Volume2 size={12} /> <span className="text-[9px] font-bold uppercase">Listen</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {loading && <div className="pl-12 opacity-50 text-sm animate-pulse text-slate-500">Thinking...</div>}
        
        {error && (
          <div className="mx-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 animate-slide-up">
            <AlertTriangle size={18} />
            <span className="text-xs font-bold">{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="absolute bottom-32 left-0 right-0 px-6 z-20">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-2 pl-4 rounded-[3rem] border border-slate-200 dark:border-slate-700 flex items-center gap-2 pr-2 transition-all">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="How are you feeling?" className="flex-1 bg-transparent py-4 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none text-lg font-light" />
          <button onClick={handleSend} disabled={!input.trim()} className="w-12 h-12 bg-slate-900 dark:bg-slate-700 text-white rounded-full flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50"><Send size={20} /></button>
        </div>
      </div>
    </div>
  );
};
