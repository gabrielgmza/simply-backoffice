import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { MainLayout } from '@/components/layout/MainLayout';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  
  // Session timeout - 30 minutos de inactividad
  useSessionTimeout(30);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}
