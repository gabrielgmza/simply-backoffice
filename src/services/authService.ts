import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://sbgndespfp.us-east-1.awsapprunner.com';

console.log('Auth Service - API_URL:', API_URL);

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      avatar?: string;
    };
  };
  error?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string;
  status?: string;
  preferences?: any;
  lastLogin?: string;
  createdAt?: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('🔐 Attempting login with:', credentials.email);
      console.log('📡 API URL:', `${API_URL}/api/backoffice/auth/login`);
      
      const response = await axios.post(
        `${API_URL}/api/backoffice/auth/login`,
        credentials,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ Login response:', response.data);
      
      if (response.data.success && response.data.data) {
        // Guardar tokens JWT
        localStorage.setItem('accessToken', response.data.data.accessToken);
        localStorage.setItem('refreshToken', response.data.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        console.log('💾 Tokens saved successfully');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Login error:', error);
      console.error('Error response:', error.response?.data);
      
      return {
        success: false,
        error: error.response?.data?.error || 'Error al iniciar sesión. Por favor intenta de nuevo.'
      };
    }
  },

  async logout() {
    try {
      console.log('🚪 Logging out...');
      
      // Llamar al endpoint de logout
      const token = this.getAccessToken();
      if (token) {
        await axios.post(
          `${API_URL}/api/backoffice/auth/logout`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Limpiar localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      console.log('✅ Logged out successfully');
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const token = this.getAccessToken();
      if (!token) return null;

      const response = await axios.get(
        `${API_URL}/api/backoffice/auth/me`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success && response.data.data) {
        const userData = response.data.data;
        const user: User = {
          id: userData.id,
          email: userData.email,
          firstName: userData.first_name,
          lastName: userData.last_name,
          role: userData.role,
          avatar: userData.avatar_url,
          status: userData.status,
          preferences: userData.preferences,
          lastLogin: userData.last_login_at,
          createdAt: userData.created_at
        };
        
        // Actualizar user en localStorage
        localStorage.setItem('user', JSON.stringify(user));
        return user;
      }

      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  },

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  },

  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    return !!token;
  },

  updateActivity() {
    const lastActivity = Date.now();
    localStorage.setItem('lastActivity', lastActivity.toString());
  },

  getLastActivity(): number {
    const lastActivity = localStorage.getItem('lastActivity');
    return lastActivity ? parseInt(lastActivity) : Date.now();
  }
};
