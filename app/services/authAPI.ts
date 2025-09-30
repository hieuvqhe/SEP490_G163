// Types cho API
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  userId?: number;
  email?: string;
}

// API service - sử dụng Next.js API routes để tránh CORS
export const authAPI = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    // Parse JSON response trước, bất kể status code
    const data = await response.json();
    
    // Trả về data, để LoginForm xử lý success/error dựa trên data.success
    return data;
  },
};