import apiClient from '../lib/apiClient';
import { Employee, ApiResponse } from '../types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  employee: Employee;
  access_token: string;
  requires_mfa: boolean;
}

export interface MFAVerification {
  email: string;
  code: string;
}

export const authService = {
  // Login (primer paso)
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      '/backoffice/auth/login',
      credentials
    );
    if (!response.data.data) throw new Error('Login failed');
    return response.data.data;
  },
  
  // Verificar MFA (segundo paso)
  verifyMFA: async (verification: MFAVerification): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      '/backoffice/auth/verify-mfa',
      verification
    );
    if (!response.data.data) throw new Error('MFA verification failed');
    return response.data.data;
  },
  
  // Refresh token
  refreshToken: async (refreshToken: string): Promise<{ access_token: string }> => {
    const response = await apiClient.post<ApiResponse<{ access_token: string }>>(
      '/backoffice/auth/refresh',
      { refresh_token: refreshToken }
    );
    if (!response.data.data) throw new Error('Token refresh failed');
    return response.data.data;
  },
  
  // Logout
  logout: async (): Promise<void> => {
    await apiClient.post('/backoffice/auth/logout');
  },
  
  // Recuperar contraseña
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      '/backoffice/auth/forgot-password',
      { email }
    );
    return response.data.data || { message: 'Email sent' };
  },
  
  // Reset password
  resetPassword: async (token: string, password: string): Promise<{ message: string }> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      '/backoffice/auth/reset-password',
      { token, password }
    );
    return response.data.data || { message: 'Password reset' };
  }
};
