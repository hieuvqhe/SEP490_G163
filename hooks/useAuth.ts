// Custom hooks for authentication using TanStack Query
import React from 'react';
import { useMutation, useQuery, useQueryClient  } from '@tanstack/react-query';
import { authService, RegisterFormData, RegisterResponse, VerifyEmailResponse, LoginFormData, LoginResponse, ApiError, UserInfo, LogoutData, LogoutResponse, ResendVerificationData, ResendVerificationResponse, ForgotPasswordData, ForgotPasswordResponse, VerifyResetCodeData, VerifyResetCodeResponse, ResetPasswordData, ResetPasswordResponse, UpdateUserInfoData, GoogleLoginData, GoogleLoginResponse, ChangePasswordData, ChangePasswordResponse } from '@/services/authService';
import { useAuthStore } from '../store/authStore';
interface UseLoginOptions {
  onSuccess?: (data: LoginResponse) => void;
  onError?: (error: string) => void;
  onFieldError?: (fieldErrors: Record<string, string>) => void;
}

export const useLogin = (options: UseLoginOptions = {}) => {
  return useMutation({
    mutationFn: (data: LoginFormData) => authService.login(data),
    onSuccess: (data) => {
      // BƯỚC 2: Cập nhật store sau khi đăng nhập thành công
      const { setTokens } = useAuthStore.getState();
      setTokens(data.data.accessToken, data.data.refreshToken, data.data.role);
      
      // Vẫn gọi callback gốc để component có thể xử lý tiếp (ví dụ: đóng modal)
      options.onSuccess?.(data);
    },
    onError: (error: any) => {
      // ... (logic xử lý lỗi giữ nguyên)
      if (error.errors) {
        const fieldErrors: Record<string, string> = {};
        Object.entries(error.errors).forEach(([field, messages]) => {
          if (Array.isArray(messages) && messages.length > 0) {
            fieldErrors[field.toLowerCase()] = messages[0];
          }
        });
        options.onFieldError?.(fieldErrors);
      } else {
        const errorMessage = error.message || error.error || 'Đăng nhập thất bại. Vui lòng thử lại.';
        options.onError?.(errorMessage);
      }
    }
  });
};

interface UseRegisterOptions {
  onSuccess?: (data: RegisterResponse) => void;
  onError?: (error: string) => void;
  onFieldError?: (fieldErrors: Record<string, string>) => void;
}

export const useRegister = (options: UseRegisterOptions = {}) => {
  return useMutation({
    mutationFn: (data: RegisterFormData) => authService.register(data),
    onSuccess: (data) => {
      options.onSuccess?.(data);
    },
    onError: (error: ApiError) => {
      // Handle validation errors format: {"errors": {...}}
      if (error.errors) {
        const fieldErrors: Record<string, string> = {};
        Object.entries(error.errors).forEach(([field, messages]) => {
          if (Array.isArray(messages) && messages.length > 0) {
            fieldErrors[field.toLowerCase()] = messages[0];
          }
        });
        options.onFieldError?.(fieldErrors);
        return;
      }
      
      // Handle single error message format: {"error": "message"} or {"message": "message"}
      const errorMessage = error.message || error.error || 'Đăng ký thất bại. Vui lòng thử lại.';
      options.onError?.(errorMessage);
    }
  });
};

interface UseVerifyEmailOptions {
  onSuccess?: (data: VerifyEmailResponse) => void;
  onError?: (error: string) => void;
}

export const useVerifyEmail = (token: string, options: UseVerifyEmailOptions = {}) => {
  return useMutation({
    mutationFn: () => authService.verifyEmail(token),
    onSuccess: (data) => {
      options.onSuccess?.(data);
    },
    onError: (error: ApiError) => {
      const errorMessage = error.message || error.error || 'Xác minh email thất bại. Vui lòng thử lại.';
      options.onError?.(errorMessage);
    }
  });
};

interface UseGetUserInfoOptions {
  onSuccess?: (data: UserInfo) => void;
  onError?: (error: string) => void;
}

export const useGetUserInfo = (accessToken: string | null, options: UseGetUserInfoOptions = {}) => {
  const query = useQuery({
    queryKey: ['userInfo', accessToken],
    queryFn: () => {
      if (!accessToken) {
        return Promise.reject(new Error('No access token'));
      }
      return authService.getUserInfo(accessToken);
    },
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Handle success and error using useEffect
  React.useEffect(() => {
    if (query.isSuccess && query.data) {
      // Chỉ cập nhật AuthStore nếu có options.onSuccess (tức là được gọi từ Header)
      if (options.onSuccess) {
        useAuthStore.getState().setUser(query.data);
        useAuthStore.getState().setRole(query.data.role);
      }
      options.onSuccess?.(query.data);
    }
  }, [query.isSuccess, query.data]);

  React.useEffect(() => {
    if (query.isError && query.error) {
      options.onError?.(query.error.message || 'Failed to fetch user info');
    }
  }, [query.isError, query.error]);

  
  return query;
};


interface UseLogoutOptions {
  onSuccess?: (data: LogoutResponse) => void;
  onError?: (error: string) => void;
}

export const useLogout = (options: UseLogoutOptions = {}) => {
  return useMutation({
    mutationFn: ({ data, accessToken }: { data: LogoutData, accessToken: string }) => 
      authService.logout(data, accessToken),
    onSuccess: (data) => {
      // BƯỚC 4: Xóa state khi đăng xuất thành công
      useAuthStore.getState().clearAuth();
      options.onSuccess?.(data);
    },
    onError: (error: any) => {
      // Cũng nên xóa state kể cả khi API logout lỗi, vì ý định của người dùng là đăng xuất
      useAuthStore.getState().clearAuth();
      const errorMessage = error.message || error.error || 'Đăng xuất thất bại. Vui lòng thử lại.';
      options.onError?.(errorMessage);
    }
  });
};

interface UseResendVerificationOptions {
  onSuccess?: (data: ResendVerificationResponse) => void;
  onError?: (error: string) => void;
}

export const useResendVerification = (options: UseResendVerificationOptions = {}) => {
  return useMutation({
    mutationFn: (data: ResendVerificationData) => authService.resendVerification(data),
    onSuccess: (data) => {
      options.onSuccess?.(data);
    },
    onError: (error: any) => {
      const errorMessage = error.message || error.error || 'Gửi lại email xác minh thất bại. Vui lòng thử lại.';
      options.onError?.(errorMessage);
    }
  });
};

interface UseForgotPasswordOptions {
  onSuccess?: (data: ForgotPasswordResponse) => void;
  onError?: (error: string) => void;
}

export const useForgotPassword = (options: UseForgotPasswordOptions = {}) => {
  return useMutation({
    mutationFn: (data: ForgotPasswordData) => authService.forgotPassword(data),
    onSuccess: (data) => {
      options.onSuccess?.(data);
    },
    onError: (error: any) => {
      const errorMessage = error.message || error.error || 'Không thể gửi email khôi phục.';
      options.onError?.(errorMessage);
    }
  });
};

interface UseVerifyResetCodeOptions {
  onSuccess?: (data: VerifyResetCodeResponse) => void;
  onError?: (error: string) => void;
}

export const useVerifyResetCode = (options: UseVerifyResetCodeOptions = {}) => {
  return useMutation({
    mutationFn: (data: VerifyResetCodeData) => authService.verifyResetCode(data),
    onSuccess: (data) => {
      options.onSuccess?.(data);
    },
    onError: (error: any) => {
      const errorMessage = error.message || error.error || 'Mã không hợp lệ hoặc đã hết hạn.';
      options.onError?.(errorMessage);
    }
  });
};

interface UseResetPasswordOptions {
  onSuccess?: (data: ResetPasswordResponse) => void;
  onError?: (error: string) => void;
}

export const useResetPassword = (options: UseResetPasswordOptions = {}) => {
  return useMutation({
    mutationFn: (data: ResetPasswordData) => authService.resetPassword(data),
    onSuccess: (data) => {
      options.onSuccess?.(data);
    },
    onError: (error: any) => {
      const errorMessage = error.message || error.error || 'Đặt lại mật khẩu thất bại.';
      options.onError?.(errorMessage);
    }
  });
};

interface UseUpdateUserInfoOptions {
  onSuccess?: (data: UserInfo) => void;
  onError?: (error: string) => void;
  // Không cần onFieldError vì lỗi validation của API này có dạng khác
}

export const useUpdateUserInfo = (options: UseUpdateUserInfoOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, accessToken }: { data: UpdateUserInfoData, accessToken: string }) => 
      authService.updateUserInfo(data, accessToken),
    
    onSuccess: (data, variables) => {
      // BƯỚC 5: Cập nhật lại user trong store sau khi chỉnh sửa hồ sơ
      useAuthStore.getState().setUser(data);
      useAuthStore.getState().setRole(data.role);

      queryClient.setQueryData(['userInfo', variables.accessToken], data);
      options.onSuccess?.(data);
    },
    
    onError: (error: any) => {
      const errorMessage = error.detail || error.message || error.error || 'Cập nhật thông tin thất bại.';
      options.onError?.(errorMessage);
    }
  });
};

interface UseGoogleLoginOptions {
  onSuccess?: (data: GoogleLoginResponse) => void;
  onError?: (error: string) => void;
}

export const useGoogleLogin = (options: UseGoogleLoginOptions = {}) => {
  return useMutation({
    mutationFn: (data: GoogleLoginData) => authService.googleLogin(data),
    onSuccess: (data) => {
      // Cập nhật store sau khi đăng nhập Google thành công
      const { setTokens } = useAuthStore.getState();
      setTokens(data.data.accessToken, data.data.refreshToken, data.data.role);
      
      options.onSuccess?.(data);
    },
    onError: (error: any) => {
      const errorMessage = error.message || error.error || 'Đăng nhập Google thất bại.';
      options.onError?.(errorMessage);
    }
  });
};

interface UseChangePasswordOptions {
  onSuccess?: (data: ChangePasswordResponse) => void;
  onError?: (error: string) => void;
}

export const useChangePassword = (options: UseChangePasswordOptions = {}) => {
  return useMutation({
    mutationFn: ({ data, accessToken }: { data: ChangePasswordData, accessToken: string }) => 
      authService.changePassword(data, accessToken),
    onSuccess: (data) => {
      options.onSuccess?.(data);
    },
    onError: (error: any) => {
      const errorMessage = error.message || error.error || 'Đổi mật khẩu thất bại.';
      options.onError?.(errorMessage);
    }
  });
};
