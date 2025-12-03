
import { User } from '../types';

const AUTH_KEY = 'clarus_auth_user';

export const AuthService = {
  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem(AUTH_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  login: async (): Promise<User> => {
    // Simulate Google Sign-In Network Delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock User Data simulating a Google Account
    const mockUser: User = {
      id: 'google_1029384756',
      name: 'Jane Doe',
      email: 'jane.doe@gmail.com',
      avatar: 'JD'
    };
    
    localStorage.setItem(AUTH_KEY, JSON.stringify(mockUser));
    return mockUser;
  },

  logout: () => {
    localStorage.removeItem(AUTH_KEY);
    window.location.reload();
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(AUTH_KEY);
  }
};
