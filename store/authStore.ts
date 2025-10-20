import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserInfo } from '@/services/authService';

interface AuthState {
  user: UserInfo | null;
  accessToken: string | null;
  refreshToken: string | null;
  role: string | null;
  isHydrated: boolean;
  isLoading: boolean;
  setUser: (user: UserInfo | null) => void;
  setAccessToken: (token: string | null) => void;
  setRefreshToken: (token: string | null) => void;
  setRole: (role: string | null) => void;
  setTokens: (accessToken: string, refreshToken: string, role?: string) => void;
  clearAuth: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      role: null,
      isHydrated: false,
      isLoading: true,
      setUser: (user) => set({ user, isLoading: false }),
      setAccessToken: (accessToken) => set({ accessToken }),
      setRefreshToken: (refreshToken) => set({ refreshToken }),
      setRole: (role) => set({ role }),
      setTokens: (accessToken, refreshToken, role) => {
        // cập nhật state
        set({ accessToken, refreshToken, role, isLoading: false });
        // đồng bộ cookie cho middleware (không thể đọc localStorage)
        if (typeof window !== 'undefined') {
          const roleLower = role ? role.toLowerCase() : undefined;
          // cookie phiên, path=/ để áp dụng toàn site
          document.cookie = `token=${accessToken}; path=/`;
          if (roleLower) {
            document.cookie = `role=${roleLower}; path=/`;
          }
        }
      },
      clearAuth: () => {
        set({ user: null, accessToken: null, refreshToken: null, role: null, isLoading: false });
        // xóa cookie để middleware không còn coi là đăng nhập
        if (typeof window !== 'undefined') {
          document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT';
          document.cookie = 'role=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
      },
      logout: () => {
        // Gọi clearAuth để xóa toàn bộ state và cookie
        const { clearAuth } = useAuthStore.getState();
        clearAuth();
      },
    }),
    {
      name: 'auth-storage', // key in localStorage
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken, refreshToken: state.refreshToken, role: state.role }),
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
