import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { toast } from 'sonner';

export const useSessionTimeout = (timeoutMinutes: number = 30) => {
  const navigate = useNavigate();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const warningRef = useRef<NodeJS.Timeout>();

  const handleLogout = useCallback(() => {
    authService.logout();
    navigate('/login');
    toast.error('Sesión cerrada por inactividad');
  }, [navigate]);

  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current);
    }

    authService.updateActivity();

    // Warning 5 min antes
    const warningTime = (timeoutMinutes - 5) * 60 * 1000;
    warningRef.current = setTimeout(() => {
      toast.warning('Tu sesión expirará en 5 minutos por inactividad', {
        duration: 10000
      });
    }, warningTime);

    // Logout
    const timeoutTime = timeoutMinutes * 60 * 1000;
    timeoutRef.current = setTimeout(() => {
      handleLogout();
    }, timeoutTime);
  }, [timeoutMinutes, handleLogout]);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      return;
    }

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];

    let throttleTimer: NodeJS.Timeout | null = null;
    const throttledReset = () => {
      if (!throttleTimer) {
        resetTimeout();
        throttleTimer = setTimeout(() => {
          throttleTimer = null;
        }, 10000);
      }
    };

    events.forEach(event => {
      document.addEventListener(event, throttledReset);
    });

    resetTimeout();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, throttledReset);
      });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
      if (throttleTimer) clearTimeout(throttleTimer);
    };
  }, [resetTimeout]);

  return { resetTimeout };
};
