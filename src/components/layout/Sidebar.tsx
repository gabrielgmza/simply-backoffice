import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  ShieldCheck, 
  MessageSquare, 
  BarChart3, 
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { Permission } from '@/types';
import { useState } from 'react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  permission?: Permission;
  badge?: string;
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Usuarios',
    href: '/users',
    icon: Users,
    permission: Permission.VIEW_USERS,
  },
  {
    title: 'Transacciones',
    href: '/transactions',
    icon: CreditCard,
    permission: Permission.VIEW_TRANSACTIONS,
  },
  {
    title: 'Compliance',
    href: '/compliance',
    icon: ShieldCheck,
    permission: Permission.VIEW_ROS,
  },
  {
    title: 'Soporte',
    href: '/support',
    icon: MessageSquare,
    permission: Permission.VIEW_TICKETS,
  },
  {
    title: 'Reportes',
    href: '/reports',
    icon: BarChart3,
    permission: Permission.VIEW_REPORTS,
  },
  {
    title: 'Configuración',
    href: '/settings',
    icon: Settings,
    permission: Permission.MANAGE_SETTINGS,
  },
];

export function Sidebar() {
  const location = useLocation();
  const hasPermission = useAuthStore(state => state.hasPermission);
  const employee = useAuthStore(state => state.employee);
  const [collapsed, setCollapsed] = useState(false);

  const visibleItems = navItems.filter(item => {
    if (!item.permission) return true;
    return hasPermission(item.permission);
  });

  return (
    <div 
      className={cn(
        "h-screen bg-card border-r flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="h-16 border-b flex items-center justify-between px-4">
        {!collapsed && (
          <div>
            <h1 className="font-bold text-xl text-primary">Simply</h1>
            <p className="text-xs text-muted-foreground">Backoffice</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 hover:bg-accent rounded-md transition-colors"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                "hover:bg-accent",
                isActive && "bg-primary text-primary-foreground hover:bg-primary/90",
                collapsed && "justify-center"
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && (
                <span className="text-sm font-medium">{item.title}</span>
              )}
              {!collapsed && item.badge && (
                <span className="ml-auto text-xs bg-destructive text-destructive-foreground px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        {!collapsed && employee && (
          <div className="space-y-1">
            <p className="text-sm font-medium truncate">
              {employee.first_name} {employee.last_name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {employee.role.replace('_', ' ')}
            </p>
          </div>
        )}
        {collapsed && employee && (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
              {employee.first_name[0]}{employee.last_name[0]}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
