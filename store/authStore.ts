import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserInfo } from '@/services/authService';

interface AuthState {
  user: UserInfo | null;
  accessToken: string | null;
  refreshToken: string | null;
  isHydrated: boolean;
  isLoading: boolean;
  setUser: (user: UserInfo | null) => void;
  setAccessToken: (token: string | null) => void;
  setRefreshToken: (token: string | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isHydrated: false,
      isLoading: true,
      setUser: (user) => set({ user, isLoading: false }),
      setAccessToken: (accessToken) => set({ accessToken }),
      setRefreshToken: (refreshToken) => set({ refreshToken }),
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken, isLoading: false }),
      clearAuth: () => set({ user: null, accessToken: null, refreshToken: null, isLoading: false }),
    }),
    {
      name: 'auth-storage', // key in localStorage
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken, refreshToken: state.refreshToken }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isHydrated = true;
          // Set loading to false after hydration is complete
          state.isLoading = false;
        }
      },
    }
  )
);
