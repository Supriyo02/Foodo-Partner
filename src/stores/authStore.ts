import { create } from 'zustand';

export type AuthState = {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,

  login: () => set({ isAuthenticated: true }),
  logout: () => set({ isAuthenticated: false }),
}));
