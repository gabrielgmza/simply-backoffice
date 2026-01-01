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
  ChevronRight,
  UserPlus,
  UserCog,
  Ticket,
  Sparkles,
  LogOut
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
  section?: string;
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    section: 'Principal'
  },
  {
    title: 'Leads',
    href: '/leads',
    icon: UserPlus,
    section: 'Principal'
  },
  {
    title: 'Usuarios',
    href: '/users',
    icon: Users,
    permission: Permission.VIEW_USERS,
    section: 'Gestión'
  },
  {
    title: 'Empleados',
    href: '/employees',
    icon: UserCog,
    section: 'Gestión'
  },
  {
    title: 'Tickets',
    href: '/tickets',
    icon: Ticket,
    section: 'Soporte'
  },
  {
    title: 'Aria AI',
    href: '/aria',
    icon: Sparkles,
    badge: 'NEW',
    section: 'Herramientas'
  },
  {
    title: 'Transacciones',
    href: '/transactions',
    icon: CreditCard,
    permission: Permission.VIEW_TRANSACTIONS,
    section: 'Finanzas'
  },
  {
    title: 'Compliance',
    href: '/compliance',
    icon: ShieldCheck,
    permission: Permission.VIEW_ROS,
    section: 'Finanzas'
  },
  {
    title: 'Soporte',
    href: '/support',
    icon: MessageSquare,
    permission: Permission.VIEW_TICKETS,
    section: 'Soporte'
  },
  {
    title: 'Reportes',
    href: '/reports',
    icon: BarChart3,
    permission: Permission.VIEW_REPORTS,
    section: 'Herramientas'
  },
  {
    title: 'Configuración',
    href: '/settings',
    icon: Settings,
    permission: Permission.MANAGE_SETTINGS,
    section: 'Sistema'
  },
];

export function Sidebar() {
  const location = useLocation();
  const hasPermission = useAuthStore(state => state.hasPermission);
  const employee = useAuthStore(state => state.employee);
  const logout = useAuthStore(state => state.logout);
  const [collapsed, setCollapsed] = useState(false);

  const visibleItems = navItems.filter(item => {
    if (!item.permission) return true;
    return hasPermission(item.permission);
  });

  return (
    <div 
      className={cn(
        "h-screen bg-[hsl(240,6%,10%)] border-r border-border/50 flex flex-col transition-all duration-300 relative",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Header with logo */}
      <div className="h-16 border-b border-border/50 flex items-center justify-between px-4">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <span className="text-lg font-bold text-white">S</span>
            </div>
            <div>
              <h1 className="font-bold text-lg text-foreground">Simply</h1>
              <p className="text-[10px] text-muted-foreground -mt-0.5">Backoffice v3.0</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center shadow-lg shadow-violet-500/20 mx-auto">
            <span className="text-lg font-bold text-white">S</span>
          </div>
        )}
      </div>

      {/* Toggle button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[hsl(240,6%,15%)] border border-border/50 flex items-center justify-center hover:bg-[hsl(240,6%,20%)] transition-colors z-10"
      >
        {collapsed ? (
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
        )}
      </button>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {visibleItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "nav-active text-violet-300" 
                  : "text-muted-foreground hover:text-foreground hover:bg-[hsl(240,5%,15%)]",
                collapsed && "justify-center px-2"
              )}
              style={{ animationDelay: `${index * 0.03}s` }}
            >
              <Icon className={cn(
                "w-5 h-5 shrink-0 transition-colors",
                isActive && "text-violet-400"
              )} />
              {!collapsed && (
                <>
                  <span className="text-sm font-medium">{item.title}</span>
                  {item.badge && (
                    <span className="ml-auto text-[10px] font-bold bg-gradient-to-r from-violet-500 to-cyan-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wide">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
              
              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-[hsl(240,6%,15%)] border border-border/50 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl">
                  <span className="text-sm font-medium text-foreground">{item.title}</span>
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-border/50 p-3">
        {!collapsed && employee && (
          <div className="flex items-center gap-3 p-2 rounded-xl bg-[hsl(240,5%,12%)] mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-violet-500/30 flex items-center justify-center">
              <span className="text-sm font-bold text-violet-300">
                {employee.first_name[0]}{employee.last_name[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {employee.first_name} {employee.last_name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {employee.role.replace(/_/g, ' ')}
              </p>
            </div>
          </div>
        )}
        
        {collapsed && employee && (
          <div className="flex justify-center mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-violet-500/30 flex items-center justify-center">
              <span className="text-sm font-bold text-violet-300">
                {employee.first_name[0]}{employee.last_name[0]}
              </span>
            </div>
          </div>
        )}

        {/* Logout button */}
        <button
          onClick={logout}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="text-sm font-medium">Cerrar sesión</span>}
        </button>
      </div>
    </div>
  );
}
