import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { api } from '../services/api';

interface Employee {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatarUrl?: string;
}

interface AuthContextType {
  employee: Employee | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Constantes de almacenamiento seguro
const TOKEN_KEY = 'simply_bo_token';
const REFRESH_TOKEN_KEY = 'simply_bo_refresh';

// sessionStorage = tokens expiran al cerrar navegador (más seguro que localStorage)
const secureStorage = {
  getItem: (key: string) => sessionStorage.getItem(key),
  setItem: (key: string, value: string) => sessionStorage.setItem(key, value),
  removeItem: (key: string) => sessionStorage.removeItem(key),
};

const PERMISSIONS: Record<string, string[]> = {
  SUPER_ADMIN: ['*'],
  ADMIN: [
    'employees:read', 'users:*', 'leads:*', 'tickets:*', 'settings:read', 'settings:update',
    'investments:*', 'financings:*', 'audit:read',
    'treasury:read', 'treasury:operate', 'otc:read', 'otc:create',
    'fraud:read', 'compliance:read', 'aria:use', 'jobs:manage', 'reports:read', 'marketing:read', 'rewards:read'
  ],
  COMPLIANCE: [
    'users:*', 'leads:read', 'tickets:read', 'settings:read',
    'investments:read', 'financings:read', 'audit:read',
    'treasury:read', 'otc:read', 'otc:approve',
    'fraud:*', 'compliance:*', 'aria:use', 'reports:read'
  ],
  CUSTOMER_SERVICE: [
    'users:read', 'leads:read', 'tickets:*',
    'investments:read', 'financings:read', 'financings:pay',
    'otc:read', 'fraud:read', 'aria:use'
  ],
  ANALYST: [
    'users:read', 'leads:*', 'tickets:read', 'settings:read',
    'investments:read', 'financings:read', 'audit:read',
    'treasury:read', 'otc:read', 'fraud:read', 'compliance:read', 'aria:use', 'reports:read'
  ],
  FINANCE: ['investments:*', 'financings:*', 'treasury:*', 'otc:*', 'users:read', 'audit:read', 'reports:read'],
  RISK: ['fraud:*', 'compliance:read', 'users:read', 'audit:read', 'investments:read', 'financings:read', 'reports:read', 'aria:use'],
  SUPPORT: ['users:read', 'tickets:*', 'rewards:read', 'aria:use'],
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    const storedRefresh = secureStorage.getItem(REFRESH_TOKEN_KEY);
    if (!storedRefresh) return false;

    try {
      const response = await api.post('/api/backoffice/auth/refresh', { refreshToken: storedRefresh });
      if (response.data.success && response.data.data) {
        const { token: newToken, refreshToken: newRefresh } = response.data.data;
        secureStorage.setItem(TOKEN_KEY, newToken);
        if (newRefresh) secureStorage.setItem(REFRESH_TOKEN_KEY, newRefresh);
        setToken(newToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  }, []);

  // Interceptor para refresh automático en 401
  useEffect(() => {
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          const refreshed = await refreshToken();
          if (refreshed) {
            originalRequest.headers['Authorization'] = `Bearer ${secureStorage.getItem(TOKEN_KEY)}`;
            return api(originalRequest);
          } else {
            clearAuth();
          }
        }
        return Promise.reject(error);
      }
    );
    return () => { api.interceptors.response.eject(responseInterceptor); };
  }, [refreshToken]);

  useEffect(() => {
    const savedToken = secureStorage.getItem(TOKEN_KEY);
    if (savedToken) {
      setToken(savedToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      validateToken();
    } else {
      setIsLoading(false);
    }
  }, []);

  const validateToken = async () => {
    try {
      const response = await api.get('/api/backoffice/auth/me');
      if (response.data.success && response.data.data) {
        setEmployee({
          id: response.data.data.id,
          email: response.data.data.email,
          firstName: response.data.data.first_name,
          lastName: response.data.data.last_name,
          role: response.data.data.role,
          avatarUrl: response.data.data.avatar_url,
        });
      } else {
        clearAuth();
      }
    } catch (error) {
      const refreshed = await refreshToken();
      if (!refreshed) clearAuth();
    } finally {
      setIsLoading(false);
    }
  };

  const clearAuth = () => {
    secureStorage.removeItem(TOKEN_KEY);
    secureStorage.removeItem(REFRESH_TOKEN_KEY);
    setToken(null);
    setEmployee(null);
    delete api.defaults.headers.common['Authorization'];
  };

  const login = async (email: string, password: string) => {
    const response = await api.post('/api/backoffice/auth/login', { email, password });
    if (response.data.success && response.data.data) {
      const { token: newToken, refreshToken: newRefresh, employee: emp } = response.data.data;
      secureStorage.setItem(TOKEN_KEY, newToken);
      if (newRefresh) secureStorage.setItem(REFRESH_TOKEN_KEY, newRefresh);
      setToken(newToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setEmployee({
        id: emp.id, email: emp.email, firstName: emp.first_name,
        lastName: emp.last_name, role: emp.role, avatarUrl: emp.avatar_url,
      });
    } else {
      throw new Error(response.data.error || 'Error de autenticación');
    }
  };

  const logout = () => {
    api.post('/api/backoffice/auth/logout').catch(() => {});
    clearAuth();
  };

  const hasPermission = (permission: string): boolean => {
    if (!employee) return false;
    const rolePermissions = PERMISSIONS[employee.role] || [];
    if (rolePermissions.includes('*')) return true;
    return rolePermissions.some(p => {
      if (p.endsWith(':*')) return permission.startsWith(p.replace(':*', ''));
      return p === permission;
    });
  };

  return (
    <AuthContext.Provider value={{ employee, token, isAuthenticated: !!employee && !!token, isLoading, login, logout, hasPermission, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
