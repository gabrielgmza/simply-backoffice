import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PERMISSIONS: Record<string, string[]> = {
  SUPER_ADMIN: ['*'],
  ADMIN: [
    'employees:read', 'users:*', 'leads:*', 'tickets:*', 'settings:read',
    'investments:*', 'financings:*', 'audit:read',
    'treasury:read', 'treasury:operate', 'otc:read', 'otc:create',
    'fraud:read', 'compliance:read'
  ],
  COMPLIANCE: [
    'users:*', 'leads:read', 'tickets:read', 'settings:read',
    'investments:read', 'financings:read', 'audit:read',
    'treasury:read', 'otc:read', 'otc:approve',
    'fraud:*', 'compliance:*'
  ],
  CUSTOMER_SERVICE: [
    'users:read', 'leads:read', 'tickets:*',
    'investments:read', 'financings:read', 'financings:pay',
    'otc:read', 'fraud:read'
  ],
  ANALYST: [
    'users:read', 'leads:*', 'tickets:read', 'settings:read',
    'investments:read', 'financings:read', 'audit:read',
    'treasury:read', 'otc:read', 'fraud:read', 'compliance:read'
  ],
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchMe();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const fetchMe = async () => {
    try {
      const response = await api.get('/api/backoffice/auth/me');
      if (response.data.success) {
        setEmployee({
          id: response.data.data.id,
          email: response.data.data.email,
          firstName: response.data.data.first_name,
          lastName: response.data.data.last_name,
          role: response.data.data.role,
          avatarUrl: response.data.data.avatar_url,
        });
      }
    } catch (error) {
      localStorage.removeItem('token');
      setToken(null);
      setEmployee(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await api.post('/api/backoffice/auth/login', { email, password });
    
    if (response.data.success) {
      const { token: newToken, employee: emp } = response.data.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setEmployee({
        id: emp.id,
        email: emp.email,
        firstName: emp.first_name,
        lastName: emp.last_name,
        role: emp.role,
        avatarUrl: emp.avatar_url,
      });
    } else {
      throw new Error(response.data.error || 'Error de autenticación');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setEmployee(null);
    delete api.defaults.headers.common['Authorization'];
  };

  const hasPermission = (permission: string): boolean => {
    if (!employee) return false;
    
    const rolePermissions = PERMISSIONS[employee.role] || [];
    
    if (rolePermissions.includes('*')) return true;
    
    return rolePermissions.some(p => {
      if (p.endsWith(':*')) {
        const prefix = p.replace(':*', '');
        return permission.startsWith(prefix);
      }
      return p === permission;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        employee,
        token,
        isAuthenticated: !!employee,
        isLoading,
        login,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
