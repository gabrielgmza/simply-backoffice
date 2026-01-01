import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  // Auto-logout por inactividad (30 minutos)
  useSessionTimeout();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-background p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
