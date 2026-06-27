import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, LoginInput } from '@krishi/shared';
import axios from 'axios';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setAuth: (user: User) => void;
  setUser: (user: User) => void;
  login: (data: LoginInput) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth: (user) =>
        set({ user, isAuthenticated: true }),

      setUser: (user) => set({ user }),

      login: async (data) => {
        set({ isLoading: true });
        try {
          const res = await axios.post('/api/auth/login', data, { withCredentials: true });
          const { user } = res.data.data;
          get().setAuth(user);
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const res = await axios.post('/api/auth/register', data, { withCredentials: true });
          const { user } = res.data.data;
          if (user) {
            get().setAuth(user);
          }
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try {
          await axios.post('/api/auth/logout', {}, { withCredentials: true });
        } catch (e) { console.error('Logout API error:', e); }
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
);
