'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useGetUserInfo } from '@/hooks/useAuth';

export default function AuthInitializer() {
  const { accessToken, isHydrated, setTokens } = useAuthStore();
  const [hasInitialized, setHasInitialized] = useState(false);

  console.log('AuthInitializer: Current store state - accessToken:', !!accessToken, 'isHydrated:', isHydrated, 'hasInitialized:', hasInitialized);

  // Function to get cookie value
  const getCookie = (name: string): string | null => {
    if (typeof window === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  };

  // Sync tokens from URL params or localStorage to store after hydration
  useEffect(() => {
    if (typeof window !== 'undefined' && isHydrated && !hasInitialized) {
      console.log('AuthInitializer: Store is hydrated, checking for tokens');
      
      // Check URL params first (for Google OAuth callback)
      const urlParams = new URLSearchParams(window.location.search);
      const accessTokenFromUrl = urlParams.get('accessToken');
      const refreshTokenFromUrl = urlParams.get('refreshToken');
   

      if (accessTokenFromUrl && refreshTokenFromUrl) {
        console.log('AuthInitializer: Found tokens in URL params (Google OAuth)');
        setTokens(accessTokenFromUrl, refreshTokenFromUrl);
        setHasInitialized(true);
        
        // Clean up URL params
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('accessToken');
        newUrl.searchParams.delete('refreshToken');
        newUrl.searchParams.delete('googleAuth');
        window.history.replaceState({}, '', newUrl.toString());
        return;
      }

      // Check localStorage for existing tokens
      const accessTokenFromStorage = localStorage.getItem('auth-storage');
      if (accessTokenFromStorage) {
        try {
          const authData = JSON.parse(accessTokenFromStorage);
          if (authData.state?.accessToken && authData.state?.refreshToken) {
            console.log('AuthInitializer: Found tokens in localStorage');
            setTokens(authData.state.accessToken, authData.state.refreshToken);
            setHasInitialized(true);
            return;
          }
        } catch (error) {
          console.error('AuthInitializer: Error parsing localStorage auth data:', error);
        }
      }

      // Check cookies as fallback
      const accessTokenCookie = getCookie('accessToken');
      const refreshTokenCookie = getCookie('refreshToken');

      if (accessTokenCookie && refreshTokenCookie) {
        console.log('AuthInitializer: Found tokens in cookies');
        setTokens(accessTokenCookie, refreshTokenCookie);
        setHasInitialized(true);
      } else {
        console.log('AuthInitializer: No tokens found, marking as initialized');
        setHasInitialized(true);
      }
    }
  }, [isHydrated, hasInitialized, setTokens]);

  // Additional effect to handle URL params even if store is not hydrated yet
  useEffect(() => {
    if (typeof window !== 'undefined' && !hasInitialized) {
      const urlParams = new URLSearchParams(window.location.search);
      const accessTokenFromUrl = urlParams.get('accessToken');
      const refreshTokenFromUrl = urlParams.get('refreshToken');
      const isGoogleAuth = urlParams.get('googleAuth') === 'true';

      if (accessTokenFromUrl && refreshTokenFromUrl && isGoogleAuth) {
        console.log('AuthInitializer: Found Google OAuth tokens in URL, waiting for store hydration');
        // Store tokens temporarily in sessionStorage
        sessionStorage.setItem('tempAccessToken', accessTokenFromUrl);
        sessionStorage.setItem('tempRefreshToken', refreshTokenFromUrl);
        sessionStorage.setItem('tempGoogleAuth', 'true');
      }
    }
  }, [hasInitialized]);

  // Effect to process temp tokens once store is hydrated
  useEffect(() => {
    if (typeof window !== 'undefined' && isHydrated && !hasInitialized) {
      const tempAccessToken = sessionStorage.getItem('tempAccessToken');
      const tempRefreshToken = sessionStorage.getItem('tempRefreshToken');
      const tempGoogleAuth = sessionStorage.getItem('tempGoogleAuth');

      if (tempAccessToken && tempRefreshToken && tempGoogleAuth === 'true') {
        console.log('AuthInitializer: Processing temp Google OAuth tokens');
        setTokens(tempAccessToken, tempRefreshToken);
        setHasInitialized(true);
        
        // Clean up temp storage and URL
        sessionStorage.removeItem('tempAccessToken');
        sessionStorage.removeItem('tempRefreshToken');
        sessionStorage.removeItem('tempGoogleAuth');
        
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('accessToken');
        newUrl.searchParams.delete('refreshToken');
        newUrl.searchParams.delete('googleAuth');
        window.history.replaceState({}, '', newUrl.toString());
      }
    }
  }, [isHydrated, hasInitialized, setTokens]);

  // Fetch user info when accessToken is available
  const { refetch } = useGetUserInfo(accessToken || '', {
    onSuccess: (user) => {
      console.log('AuthInitializer: User info fetched successfully:', user);
      useAuthStore.getState().setUser(user);
    },
    onError: (error) => {
      console.error('AuthInitializer: Failed to fetch user info:', error);
    },
  });

  useEffect(() => {
    if (accessToken && hasInitialized) {
      console.log('AuthInitializer: Refetching user info for token:', accessToken.substring(0, 20) + '...');
      refetch();
    }
  }, [accessToken, hasInitialized, refetch]);

  return null;
}