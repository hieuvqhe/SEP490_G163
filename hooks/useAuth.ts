// Custom hooks for authentication using TanStack Query
import React from 'react';
import { useMutation, useQuery, useQueryClient  } from '@tanstack/react-query';
import { authService, RegisterFormData, RegisterResponse, VerifyEmailResponse, LoginFormData, LoginResponse, ApiError, UserInfo, LogoutData, LogoutResponse, ResendVerificationData, ResendVerificationResponse, ForgotPasswordData, ForgotPasswordResponse, VerifyResetCodeData, VerifyResetCodeResponse, ResetPasswordData, ResetPasswordResponse, UpdateUserInfoData, GoogleLoginData, GoogleLoginResponse, ChangePasswordData, ChangePasswordResponse, RefreshTokenData, RefreshTokenResponse } from '@/services/authService';
import { useAuthStore } from '../store/authStore';
interface UseLoginOptions {
  onSuccess?: (data: LoginResponse) => void;
  onError?: (error: string) => void;
  onFieldError?: (fieldErrors: Record<string, string>) => void;
}

export const useLogin = (options: UseLoginOptions = {}) => {
  return useMutation({
    mutationFn: (data: LoginFormData) => {
      console.log('useLogin mutationFn called with:', data);
      return authService.login(data);
    },
    onSuccess: (data) => {
      console.log('useLogin onSuccess called with:', data);
      // BƯỚC 2: Cập nhật store sau khi đăng nhập thành công
      const { setTokens } = useAuthStore.getState();
      setTokens(data.result.accessToken, data.result.refreshToken, data.result.role, data.result.isBanned, data.result.isActive);
      
      // Vẫn gọi callback gốc để component có thể xử lý tiếp (ví dụ: đóng modal)
      options.onSuccess?.(data);
    },
    onError: (error: any) => {
      console.log('useLogin onError called with:', error);
      // Debug: Log the error structure to understand what we're getting
      console.log('Login error structure:', error);
      console.log('Error type:', typeof error);
      console.log('Error keys:', Object.keys(error || {}));
      
      // Handle validation errors (field-specific errors)
      if (error.errors) {
        console.log('Handling field errors:', error.errors);
        console.log('Error.errors structure:', JSON.stringify(error.errors, null, 2));
        const fieldErrors: Record<string, string> = {};
        Object.entries(error.errors).forEach(([field, messages]: [string, any]) => {
          console.log(`Processing field: ${field}, messages:`, messages, 'type:', typeof messages);
          if (Array.isArray(messages) && messages.length > 0) {
            fieldErrors[field.toLowerCase()] = messages[0];
          } else if (typeof messages === 'string') {
            fieldErrors[field.toLowerCase()] = messages;
          } else if (messages && typeof messages === 'object') {
            // Handle case where messages is an object with nested structure
            const messageValue = messages.message || messages.error || messages.detail || String(messages);
            fieldErrors[field.toLowerCase()] = messageValue;
          }
        });
        console.log('Calling options.onFieldError with:', fieldErrors);
        console.log('options.onFieldError exists:', !!options.onFieldError);
        
        // If we have field errors, show them
        if (Object.keys(fieldErrors).length > 0) {
          options.onFieldError?.(fieldErrors);
        } else {
          // If no field errors, show general error message
          const errorMessage = error.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
          console.log('No field errors, showing general error:', errorMessage);
          options.onError?.(errorMessage);
        }
        return;
      }
      
      // Handle general errors - try multiple possible error message properties
      let errorMessage = 'Đăng nhập thất bại. Vui lòng thử lại.';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.error) {
        errorMessage = error.error;
      } else if (error.detail) {
        errorMessage = error.detail;
      } else if (error.title) {
        errorMessage = error.title;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error.toString && error.toString() !== '[object Object]') {
        errorMessage = error.toString();
      }
      
      console.log('Final error message:', errorMessage);
      console.log('Calling options.onError with:', errorMessage);
      console.log('options.onError exists:', !!options.onError);
      options.onError?.(errorMessage);
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
      // Handle validation errors format: {"message": "Lỗi xác thực dữ liệu", "errors": {...}}
      // Handle conflict errors format: {"message": "Dữ liệu bị xung đột", "errors": {...}}
      if (error.errors) {
        const fieldErrors: Record<string, string> = {};
        Object.entries(error.errors).forEach(([field, errorObj]) => {
          if (errorObj && typeof errorObj === 'object' && 'msg' in errorObj && typeof errorObj.msg === 'string') {
            fieldErrors[field.toLowerCase()] = errorObj.msg;
          }
        });
        options.onFieldError?.(fieldErrors);
        return;
      }
      
      // Handle single error message format: {"message": "message"}
      const errorMessage = error.message || 'Đăng ký thất bại. Vui lòng thử lại.';
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
      // Handle validation errors format: {"message": "Xác thực thất bại", "errors": {"token": {...}}}
      if (error.errors && error.errors.token && typeof error.errors.token === 'object' && 'msg' in error.errors.token) {
        const errorMessage = error.errors.token.msg;
        options.onError?.(errorMessage);
        return;
      }
      
      // Handle system errors or other error formats: {"message": "Đã xảy ra lỗi hệ thống"}
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
      // Luôn cập nhật AuthStore với thông tin user mới nhất
      useAuthStore.getState().setUser(query.data);
      useAuthStore.getState().setRole(query.data.role);
      useAuthStore.getState().setIsBanned(query.data.isBanned);
      useAuthStore.getState().setIsActive(query.data.isActive);
      
      options.onSuccess?.(query.data);
    }
  }, [query.isSuccess, query.data]);

  React.useEffect(() => {
    if (query.isError && query.error) {
      // Handle auth errors format: {"message": "Xác thực thất bại", "errors": {"auth": {...}}}
      // Also handle case with capital "Errors" and "Msg"
      const error = query.error as ApiError;
      if (error.errors && error.errors.auth && typeof error.errors.auth === 'object') {
        const authError = error.errors.auth;
        if ('msg' in authError && typeof authError.msg === 'string') {
          options.onError?.(authError.msg);
          return;
        }
        if ('Msg' in authError && typeof authError.Msg === 'string') {
          options.onError?.(authError.Msg);
          return;
        }
      }
      
      // Handle user not found: {"message": "Người dùng không tồn tại."}
      // Handle system errors or other error formats: {"message": "Đã xảy ra lỗi hệ thống"}
      const errorMessage = error.message || error.error || 'Không thể lấy thông tin người dùng.';
      options.onError?.(errorMessage);
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
    onError: (error: ApiError) => {
      // Cũng nên xóa state kể cả khi API logout lỗi, vì ý định của người dùng là đăng xuất
      useAuthStore.getState().clearAuth();
      
      // Handle auth errors format: {"message": "Lỗi xác thực", "errors": {"refreshToken": {...}}}
      if (error.errors && error.errors.refreshToken && typeof error.errors.refreshToken === 'object' && 'msg' in error.errors.refreshToken) {
        const errorMessage = error.errors.refreshToken.msg;
        options.onError?.(errorMessage);
        return;
      }
      
      // Handle system errors or other error formats: {"message": "Đã xảy ra lỗi hệ thống"}
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
    onError: (error: ApiError) => {
      // Handle validation errors format: {"message": "Lỗi xác thực dữ liệu", "errors": {"email": {...}}}
      // Handle conflict errors format: {"message": "Dữ liệu bị xung đột", "errors": {"email": {...}}}
      if (error.errors && error.errors.email && typeof error.errors.email === 'object' && 'msg' in error.errors.email) {
        const errorMessage = error.errors.email.msg;
        options.onError?.(errorMessage);
        return;
      }
      
      // Handle system errors or other error formats: {"message": "Đã xảy ra lỗi hệ thống"}
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
    onError: (error: ApiError) => {
      // Handle validation errors format: {"message": "Lỗi xác thực", "errors": {"emailOrUsername": {...}}}
      // Handle conflict errors format: {"message": "Xung đột dữ liệu", "errors": {"emailOrUsername": {...}}}
      if (error.errors && error.errors.emailOrUsername && typeof error.errors.emailOrUsername === 'object' && 'msg' in error.errors.emailOrUsername) {
        const errorMessage = error.errors.emailOrUsername.msg;
        options.onError?.(errorMessage);
        return;
      }
      
      // Handle system errors or other error formats: {"message": "Đã xảy ra lỗi hệ thống"}
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
    onError: (error: ApiError) => {
      // Handle validation errors format: {"message": "Lỗi xác thực", "errors": {"code": {...}, "emailOrUsername": {...}}}
      if (error.errors) {
        const fieldErrors: Record<string, string> = {};
        Object.entries(error.errors).forEach(([field, errorObj]) => {
          if (errorObj && typeof errorObj === 'object' && 'msg' in errorObj && typeof errorObj.msg === 'string') {
            fieldErrors[field.toLowerCase()] = errorObj.msg;
          }
        });
        // Return the first error message found
        const firstError = Object.values(fieldErrors)[0];
        if (firstError) {
          options.onError?.(firstError);
          return;
        }
      }
      
      // Handle system errors or other error formats: {"message": "Đã xảy ra lỗi hệ thống"}
      const errorMessage = error.message || error.error || 'Xác minh mã thất bại. Vui lòng thử lại.';
      options.onError?.(errorMessage);
    }
  });
};

interface UseResetPasswordOptions {
  onSuccess?: (data: ResetPasswordResponse) => void;
  onError?: (error: string) => void;
  onFieldError?: (fieldErrors: Record<string, string>) => void;
}

export const useResetPassword = (options: UseResetPasswordOptions = {}) => {
  return useMutation({
    mutationFn: (data: ResetPasswordData) => authService.resetPassword(data),
    onSuccess: (data) => {
      options.onSuccess?.(data);
    },
    onError: (error: ApiError) => {
      // Handle validation errors format: {"message": "Lỗi xác thực", "errors": {"newPassword": {...}, "verifyPassword": {...}}}
      if (error.errors) {
        const fieldErrors: Record<string, string> = {};
        Object.entries(error.errors).forEach(([field, errorObj]) => {
          if (errorObj && typeof errorObj === 'object' && 'msg' in errorObj && typeof errorObj.msg === 'string') {
            fieldErrors[field.toLowerCase()] = errorObj.msg;
          }
        });
        if (Object.keys(fieldErrors).length > 0) {
          options.onFieldError?.(fieldErrors);
          return;
        }
      }
      
      // Handle system errors or other error formats: {"message": "Đã xảy ra lỗi hệ thống"}
      const errorMessage = error.message || error.error || 'Đặt lại mật khẩu thất bại. Vui lòng thử lại.';
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
      useAuthStore.getState().setIsBanned(data.isBanned);
      useAuthStore.getState().setIsActive(data.isActive);

      queryClient.setQueryData(['userInfo', variables.accessToken], data);
      options.onSuccess?.(data);
    },
    
    onError: (error: ApiError) => {
      // Handle auth errors format: {"message": "Xác thực thất bại", "errors": {"auth": {...}}}
      // Also handle case with capital "Errors" and "Msg"
      if (error.errors && error.errors.auth && typeof error.errors.auth === 'object') {
        const authError = error.errors.auth;
        if ('msg' in authError && typeof authError.msg === 'string') {
          options.onError?.(authError.msg);
          return;
        }
        if ('Msg' in authError && typeof authError.Msg === 'string') {
          options.onError?.(authError.Msg);
          return;
        }
      }
      
      // Handle user not found: {"message": "Người dùng không tồn tại."}
      // Handle system errors or other error formats: {"message": "Đã xảy ra lỗi hệ thống"}
      const errorMessage = error.message || error.error || 'Cập nhật thông tin thất bại.';
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
      setTokens(data.result.accessToken, data.result.refreshToken, data.result.role, data.result.isBanned, data.result.isActive);
      
      options.onSuccess?.(data);
    },
    onError: (error: ApiError) => {
      // Handle validation errors format: {"message": "Lỗi xác thực Google", "errors": {"idToken": {...}}}
      // Handle auth errors format: {"message": "Lỗi đăng nhập", "errors": {"email": {...}}}
      if (error.errors) {
        const fieldErrors: Record<string, string> = {};
        Object.entries(error.errors).forEach(([field, errorObj]) => {
          if (errorObj && typeof errorObj === 'object' && 'msg' in errorObj && typeof errorObj.msg === 'string') {
            // For auth errors, show as general error
            if (field === 'idToken' || field === 'email') {
              options.onError?.(errorObj.msg);
              return;
            } else {
              fieldErrors[field.toLowerCase()] = errorObj.msg;
            }
          }
        });
        return;
      }
      
      // Handle system errors or other error formats: {"message": "Đã xảy ra lỗi hệ thống"}
      const errorMessage = error.message || error.error || 'Đăng nhập Google thất bại.';
      options.onError?.(errorMessage);
    }
  });
};

interface UseChangePasswordOptions {
  onSuccess?: (data: ChangePasswordResponse) => void;
  onError?: (error: string) => void;
  onFieldError?: (fieldErrors: Record<string, string>) => void;
}

export const useChangePassword = (options: UseChangePasswordOptions = {}) => {
  return useMutation({
    mutationFn: ({ data, accessToken }: { data: ChangePasswordData, accessToken: string }) =>
      authService.changePassword(data, accessToken),
    onSuccess: (data) => {
      options.onSuccess?.(data);
    },
    onError: (error: ApiError) => {
      // Handle validation errors format: {"message": "Lỗi xác thực dữ liệu", "errors": {...}}
      if (error.errors) {
        const fieldErrors: Record<string, string> = {};
        Object.entries(error.errors).forEach(([field, errorObj]) => {
          if (errorObj && typeof errorObj === 'object' && 'msg' in errorObj && typeof errorObj.msg === 'string') {
            fieldErrors[field.toLowerCase()] = errorObj.msg;
          }
        });
        if (Object.keys(fieldErrors).length > 0) {
          options.onFieldError?.(fieldErrors);
          return;
        }
      }

      // Handle system errors or other error formats: {"message": "Đã xảy ra lỗi hệ thống"}
      const errorMessage = error.message || error.error || 'Đổi mật khẩu thất bại. Vui lòng thử lại.';
      options.onError?.(errorMessage);
    }
  });
};

interface UseRefreshTokenOptions {
  onSuccess?: (data: RefreshTokenResponse) => void;
  onError?: (error: string) => void;
}

export const useRefreshToken = (options: UseRefreshTokenOptions = {}) => {
  return useMutation({
    mutationFn: (data: RefreshTokenData) => authService.refreshToken(data),
    onSuccess: (data) => {
      // Cập nhật store sau khi refresh token thành công
      const { setTokens } = useAuthStore.getState();
      setTokens(data.result.accessToken, data.result.refreshToken, data.result.role, data.result.isBanned, data.result.isActive);
      
      options.onSuccess?.(data);
    },
    onError: (error: ApiError) => {
      // Handle auth errors format: {"message": "Xác thực thất bại", "errors": {"auth": {...}}}
      if (error.errors && error.errors.auth && typeof error.errors.auth === 'object' && 'msg' in error.errors.auth) {
        const errorMessage = error.errors.auth.msg;
        options.onError?.(errorMessage);
        return;
      }
      
      // Handle system errors or other error formats: {"message": "Đã xảy ra lỗi hệ thống"}
      const errorMessage = error.message || error.error || 'Làm mới token thất bại.';
      options.onError?.(errorMessage);
    }
  });
};
