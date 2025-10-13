import { BASE_URL } from "@/constants";

export interface ForgotPasswordData {
  emailOrUsername: string;
}
export interface ForgotPasswordResponse {
  message: string;
}

export interface VerifyResetCodeData {
  emailOrUsername: string;
  code: string;
}

export interface VerifyResetCodeResponse {
  message: string;
}

export interface ResetPasswordData {
  emailOrUsername: string;
  newPassword: string;
  verifyPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

// API service for authentication related calls
export interface LoginFormData {
  emailOrUsername: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    expireAt: string;
    fullName: string;
    role: string;
  };
}

export interface RegisterFormData {
  fullName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterResponse {
  message: string;
  user: {
    fullName: string;
    username: string;
    email: string;
    emailConfirmed: boolean;
  };
}

export interface VerifyEmailResponse {
  message: string;
  success: boolean;
}

export interface UserInfo {
  userId: number;
  fullname: string;
  username: string;
  phone?: string;
  password: string;
  avatarUrl: string;
  email: string;
}

export interface LogoutData {
  refreshToken: string;
}

export interface LogoutResponse {
  message: string;
}

export interface ResendVerificationData {
  email: string;
}

export interface ResendVerificationResponse {
  message: string;
}

export interface ApiError {
  error?: string;
  errors?: Record<string, string[]>;
  message?: string;
  isNetworkError?: boolean;
}

export interface UpdateUserInfoData {
  fullname?: string;
  phone?: string;
  avatarUrl?: string;
}

export interface GoogleLoginData {
  idToken: string;
}

export interface GoogleLoginResponse {
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    expireAt: string;
    fullName: string;
    role: string;
  };
}

class AuthService {

  async forgotPassword(data: ForgotPasswordData): Promise<ForgotPasswordResponse> {
    try {
      const response = await fetch(`${this.baseURL}/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (!response.ok) {
        throw result as ApiError;
      }
      return result;
    } catch (error: any) {
      if (error.name === 'TypeError') {
        throw { error: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.', isNetworkError: true } as ApiError;
      }
      throw error;
    }
  }
  private baseURL = `${BASE_URL}/api/Auth`;
  private userURL = `${BASE_URL}/api/User`;

  async login(data: LoginFormData): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.baseURL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw result as ApiError;
      }

      return result;
    } catch (error: any) {
      // Handle network errors
      if (error.name === 'TypeError') {
        throw { error: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.', isNetworkError: true } as ApiError;
      }
      
      // Re-throw API errors as-is
      throw error;
    }
  }

  async register(data: RegisterFormData): Promise<RegisterResponse> {
    try {
      const response = await fetch(`${this.baseURL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw result as ApiError;
      }

      return result;
    } catch (error: any) {
      // Handle network errors
      if (error.name === 'TypeError') {
        throw { error: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.', isNetworkError: true } as ApiError;
      }
      
      // Re-throw API errors as-is
      throw error;
    }
  }

  async verifyEmail(token: string): Promise<VerifyEmailResponse> {
    const response = await fetch(`${this.baseURL}/verify-email?token=${token}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });

    const result = await response.json();

    if (!response.ok) {
      throw result as ApiError;
    }

    return result;
  }

  async getUserInfo(accessToken: string): Promise<UserInfo> {
    try {
      const response = await fetch(`${this.userURL}/me`, {
        method: 'POST',
        headers: {
          'Accept': '*/*',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: ''
      });

      const result = await response.json();

      if (!response.ok) {
        throw result as ApiError;
      }

      return result;
    } catch (error: any) {
      // Handle network errors
      if (error.name === 'TypeError') {
        throw { error: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.', isNetworkError: true } as ApiError;
      }
      
      // Re-throw API errors as-is
      throw error;
    }
  }

  async logout(data: LogoutData, accessToken: string): Promise<LogoutResponse> {
    try {
      const response = await fetch(`${this.baseURL}/logout`, {
        method: 'POST',
        headers: {
          'Accept': '*/*',
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw result as ApiError;
      }

      return result;
    } catch (error: any) {
      // Handle network errors
      if (error.name === 'TypeError') {
        throw { error: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.', isNetworkError: true } as ApiError;
      }
      
      // Re-throw API errors as-is
      throw error;
    }
  }

  async resendVerification(data: ResendVerificationData): Promise<ResendVerificationResponse> {
    try {
      const response = await fetch(`${this.baseURL}/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw result as ApiError;
      }

      return result;
    } catch (error: any) {
      // Handle network errors
      if (error.name === 'TypeError') {
        throw { error: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.', isNetworkError: true } as ApiError;
      }
      
      // Re-throw API errors as-is
      throw error;
    }
  }

  async verifyResetCode(data: VerifyResetCodeData): Promise<VerifyResetCodeResponse> {
    try {
      const response = await fetch(`${this.baseURL}/verify-reset-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw result as ApiError;
      }

      return result;
    } catch (error: any) {
      if (error.name === 'TypeError') {
        throw { error: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.', isNetworkError: true } as ApiError;
      }
      throw error;
    }
  }

  async resetPassword(data: ResetPasswordData): Promise<ResetPasswordResponse> {
    try {
      const response = await fetch(`${this.baseURL}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw result as ApiError;
      }

      return result;
    } catch (error: any) {
      if (error.name === 'TypeError') {
        throw { error: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.', isNetworkError: true } as ApiError;
      }
      throw error;
    }
  }

   async updateUserInfo(data: UpdateUserInfoData, accessToken: string): Promise<UserInfo> {
    try {
      const response = await fetch(`${this.userURL}/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw result as ApiError; // Lỗi validation sẽ nằm trong result
      }

      return result as UserInfo;
    } catch (error: any) {
      // Xử lý lỗi mạng
      if (error.name === 'TypeError') {
        throw { error: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.', isNetworkError: true } as ApiError;
      }
      
      // Re-throw lỗi từ API (bao gồm cả lỗi validation)
      throw error;
    }
  }

  async googleLogin(data: GoogleLoginData): Promise<GoogleLoginResponse> {
    try {
      const response = await fetch(`${this.baseURL}/login/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw result as ApiError;
      }

      return result;
    } catch (error: any) {
      if (error.name === 'TypeError') {
        throw { error: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.', isNetworkError: true } as ApiError;
      }
      throw error;
    }
  }

  // Future authentication methods can be added here
  // async refreshToken(): Promise<TokenResponse> { ... }
}

export const authService = new AuthService();