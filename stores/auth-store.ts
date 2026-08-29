import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { safeJSONStorage } from '@/lib/zustand-storage';

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  
  login: (user?: Partial<User>) => void;
  logout: () => void;
}

const defaultUser: User = {
  id: 'user_demo_001',
  name: 'Alex Johnson',
  email: 'alex@Solvix.demo',
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: (userData) =>
        set({
          user: { ...defaultUser, ...userData },
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'Solvix-auth',
      storage: safeJSONStorage,
    }
  )
);
