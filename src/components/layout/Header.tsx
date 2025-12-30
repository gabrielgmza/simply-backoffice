import { Bell, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';

export function Header() {
  const employee = useAuthStore(state => state.employee);
  const logout = useAuthStore(state => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!employee) return null;

  const initials = `${employee.first_name[0]}${employee.last_name[0]}`;

  return (
    <header className="h-16 border-b bg-background sticky top-0 z-40">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex-1"></div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
          </Button>

          <div className="flex items-center gap-3 pl-4 border-l">
            <div className="text-right">
              <p className="text-sm font-medium">
                {employee.first_name} {employee.last_name}
              </p>
              <p className="text-xs text-muted-foreground">
                {employee.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </p>
            </div>
            
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>

            <Button variant="ghost" size="icon" onClick={handleLogout} title="Cerrar sesión">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
