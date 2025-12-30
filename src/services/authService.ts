import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://vsggmk7vo9.execute-api.us-east-1.amazonaws.com';

console.log('Auth Service - API_URL:', API_URL);

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    role: string;
    first_name: string;
    last_name: string;
  };
  error?: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('Attempting login with:', credentials.email);
      console.log('API URL:', `${API_URL}/api/backoffice/auth/login`);
      
      const response = await axios.post(
        `${API_URL}/api/backoffice/auth/login`,
        credentials,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Login response:', response.data);
      
      if (response.data.success && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        console.log('Login successful, token saved');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Login error:', error);
      console.error('Error response:', error.response?.data);
      
      return {
        success: false,
        error: error.response?.data?.error || 'Error al iniciar sesión. Por favor intenta de nuevo.'
      };
    }
  },

  async logout() {
    console.log('Logging out');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated(): boolean {
    const token = this.getToken();
    console.log('Is authenticated?', !!token);
    return !!token;
  }
};
