import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Employee, Permission } from '../types';

interface AuthState {
  employee: Employee | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  
  setAuth: (employee: Employee, accessToken: string) => void;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      employee: null,
      accessToken: null,
      isAuthenticated: false,
      
      setAuth: (employee, accessToken) => {
        set({
          employee,
          accessToken,
          isAuthenticated: true
        });
      },
      
      logout: () => {
        set({
          employee: null,
          accessToken: null,
          isAuthenticated: false
        });
      },
      
      hasPermission: (permission) => {
        const { employee } = get();
        return employee?.permissions.includes(permission) ?? false;
      },
      
      hasAnyPermission: (permissions) => {
        const { employee } = get();
        if (!employee) return false;
        return permissions.some(p => employee.permissions.includes(p));
      }
    }),
    {
      name: 'simply-auth'
    }
  )
);
