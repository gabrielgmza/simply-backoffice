import { useAuthStore } from '@/store/authStore';
import { Employee, Role, Permission, ROLE_PERMISSIONS } from '@/types';

// Mock employee para testing local
const mockEmployee: Employee = {
  id: 'mock-id-123',
  email: 'admin@simply.com',
  first_name: 'Admin',
  last_name: 'Simply',
  role: Role.SUPER_ADMIN,
  permissions: ROLE_PERMISSIONS[Role.SUPER_ADMIN],
  status: 'active',
  two_factor_enabled: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Hook para login mock (solo desarrollo)
export function useMockAuth() {
  const setAuth = useAuthStore(state => state.setAuth);

  const mockLogin = () => {
    setAuth(mockEmployee, 'mock-access-token-123');
    console.log('🔓 Mock login successful - Development Mode');
  };

  return { mockLogin };
}

// Activar mock auth automáticamente en desarrollo si no hay backend
export function enableMockAuthIfNeeded() {
  const isDevelopment = import.meta.env.DEV;
  const apiUrl = import.meta.env.VITE_API_URL;

  if (isDevelopment && !apiUrl) {
    console.log('⚠️ No VITE_API_URL configurado');
    console.log('🔧 Modo desarrollo: Mock auth disponible');
    console.log('💡 Presiona F12 y ejecuta: window.mockLogin()');

    // Exponer función mock globalmente para testing
    (window as any).mockLogin = () => {
      const setAuth = useAuthStore.getState().setAuth;
      setAuth(mockEmployee, 'mock-token');
      window.location.href = '/dashboard';
    };
  }
}
