// API service for authentication related calls
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

export interface ApiError {
  error?: string;
  errors?: Record<string, string[]>;
  message?: string;
  isNetworkError?: boolean;
}

class AuthService {
  private baseURL = 'https://localhost:7263/api/Auth';

  async register(data: RegisterFormData): Promise<RegisterResponse> {
    const response = await fetch(`${this.baseURL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    
    console.log('AuthService - API Response:', { status: response.status, result });

    if (!response.ok) {
      throw result as ApiError;
    }

    return result;
  }

  async verifyEmail(token: string): Promise<VerifyEmailResponse> {
    const response = await fetch(`${this.baseURL}/verify-email?token=${token}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });

    const result = await response.json();
    
    console.log('AuthService - Verify Email Response:', { status: response.status, result });

    if (!response.ok) {
      throw result as ApiError;
    }

    return result;
  }

  // Future authentication methods can be added here
  // async login(username: string, password: string): Promise<LoginResponse> { ... }
  // async logout(): Promise<void> { ... }
  // async refreshToken(): Promise<TokenResponse> { ... }
}

export const authService = new AuthService();