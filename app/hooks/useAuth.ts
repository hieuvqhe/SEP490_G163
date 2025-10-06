// Custom hooks for authentication using TanStack Query
import { useMutation } from '@tanstack/react-query';
import { authService, RegisterFormData, RegisterResponse, VerifyEmailResponse, ApiError } from '../services/authService';

interface UseRegisterOptions {
  onSuccess?: (data: RegisterResponse) => void;
  onError?: (error: string) => void;
  onFieldError?: (errors: Record<string, string>) => void;
}

export const useRegister = ({ onSuccess, onError, onFieldError }: UseRegisterOptions = {}) => {
  return useMutation({
    mutationFn: (data: RegisterFormData) => authService.register(data),
    onSuccess: (data) => {
      console.log('useRegister - Success:', data);
      onSuccess?.(data);
    },
    onError: (error: ApiError) => {
      console.log('useRegister - Error:', error);
      
      // Handle single error message format: {"error": "message"}
      if (error.error) {
        const errorMessage = error.error;
        
        // Map specific errors to form fields
        const fieldErrors: Record<string, string> = {};
        
        if (errorMessage.includes('Username already exists')) {
          fieldErrors.username = 'Tên đăng nhập đã tồn tại';
        } else if (errorMessage.includes('Email already exists')) {
          fieldErrors.email = 'Email đã được sử dụng';
        } else if (errorMessage.includes('Username can only contain')) {
          fieldErrors.username = 'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới';
        } else if (errorMessage.includes('Username must be between')) {
          fieldErrors.username = 'Tên đăng nhập phải có từ 8-15 ký tự';
        } else if (errorMessage.includes('Invalid email format')) {
          fieldErrors.email = 'Định dạng email không hợp lệ';
        } else if (errorMessage.includes('Password must be between')) {
          fieldErrors.password = 'Mật khẩu phải có từ 6-12 ký tự';
        } else if (errorMessage.includes('Password must include')) {
          fieldErrors.password = 'Mật khẩu phải bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt';
        } else if (errorMessage.includes('Password and ConfirmPassword do not match')) {
          fieldErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        } else if (errorMessage.includes('Full name is required')) {
          fieldErrors.fullName = 'Họ và tên là bắt buộc';
        }
        
        if (Object.keys(fieldErrors).length > 0) {
          onFieldError?.(fieldErrors);
          return;
        } else {
          onError?.(errorMessage);
          return;
        }
      }
      
      // Handle validation errors format: {"errors": {...}}
      if (error.errors) {
        const fieldErrors: Record<string, string> = {};
        Object.keys(error.errors).forEach(field => {
          const fieldKey = field.toLowerCase();
          if (fieldKey === 'confirmpassword') {
            fieldErrors.confirmPassword = error.errors![field][0];
          } else {
            fieldErrors[fieldKey] = error.errors![field][0];
          }
        });
        onFieldError?.(fieldErrors);
        return;
      }
      
      // Handle other error types
      if (error.message) {
        onError?.(error.message);
        return;
      }
      
      if (error.isNetworkError) {
        onError?.('Không thể kết nối đến server');
        return;
      }
      
      // Fallback
      onError?.('Có lỗi xảy ra trong quá trình đăng ký. Vui lòng thử lại.');
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
      console.log('useVerifyEmail - Success:', data);
      options.onSuccess?.(data);
    },
    onError: (error: ApiError) => {
      console.log('useVerifyEmail - Error:', error);
      
      if (error.message) {
        options.onError?.(error.message);
      } else if (error.error) {
        options.onError?.(error.error);
      } else {
        options.onError?.('Có lỗi xảy ra trong quá trình xác minh email.');
      }
    }
  });
};