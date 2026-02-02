
import { create } from 'zustand';
import { User, AuthResponse } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginReason: string | undefined;
  
  // Actions
  login: (authData: AuthResponse) => void;
  logout: () => void;
  checkAuth: () => void;
  setLoginReason: (reason: string | undefined) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  loginReason: undefined,

  login: (authData: AuthResponse) => {
    // Save to localStorage
    localStorage.setItem('aura_user_token', authData.token);
    localStorage.setItem('aura_user_uid', authData.user.id);
    localStorage.setItem('aura_user_email', authData.user.email);
    localStorage.setItem('aura_is_authenticated', 'true');

    set({ 
      user: authData.user, 
      isAuthenticated: true,
      loginReason: undefined 
    });
  },

  logout: () => {
    // Clear localStorage
    localStorage.removeItem('aura_user_token');
    localStorage.removeItem('aura_user_uid');
    localStorage.removeItem('aura_user_email');
    localStorage.removeItem('aura_is_authenticated');

    set({ 
      user: null, 
      isAuthenticated: false 
    });
  },

  checkAuth: () => {
    const authStatus = localStorage.getItem('aura_is_authenticated');
    const token = localStorage.getItem('aura_user_token');
    const uid = localStorage.getItem('aura_user_uid');
    const email = localStorage.getItem('aura_user_email');

    if (authStatus === 'true' && token && uid) {
      // Reconstruct user from storage (simplified)
      // In a real app, you might validte the token or fetch full profile here
      const user: User = {
        id: uid,
        email: email || '',
        name: email?.split('@')[0] || 'User', // Fallback name
        role: 'user',
        avatarSeed: uid
      };

      set({ 
        isAuthenticated: true, 
        user: user,
        isLoading: false
      });
    } else {
      set({ 
        isAuthenticated: false, 
        user: null,
        isLoading: false 
      });
    }
  },

  setLoginReason: (reason) => set({ loginReason: reason }),
}));
