import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ProtectedRoute } from './components/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import IntegrationsPage from './pages/settings/IntegrationsPage';
import UsersListPage from './pages/users/UsersListPage';
import UserDetailPage from './pages/users/UserDetailPage';
import LeadsPage from './pages/leads/LeadsPage';
import EmployeesListPage from './pages/employees/EmployeesListPage';
import CreateEmployeePage from './pages/employees/CreateEmployeePage';
import EmployeeDetailPage from './pages/employees/EmployeeDetailPage';
import TicketsPage from './pages/tickets/TicketsPage';
import TicketDetailPage from './pages/tickets/TicketDetailPage';
import AriaPage from './pages/aria/AriaPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Placeholder pages
const TransactionsPage = () => <div className="p-6"><h1 className="text-2xl font-bold">Transacciones - Coming Soon</h1></div>;
const CompliancePage = () => <div className="p-6"><h1 className="text-2xl font-bold">Compliance - Coming Soon</h1></div>;
const SupportPage = () => <div className="p-6"><h1 className="text-2xl font-bold">Soporte - Coming Soon</h1></div>;
const ReportsPage = () => <div className="p-6"><h1 className="text-2xl font-bold">Reportes - Coming Soon</h1></div>;
const SettingsPage = () => <div className="p-6"><h1 className="text-2xl font-bold">Configuración - Coming Soon</h1></div>;

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/leads" element={<LeadsPage />} />
            
            <Route path="/users" element={<UsersListPage />} />
            <Route path="/users/:id" element={<UserDetailPage />} />
            
            <Route path="/employees" element={<EmployeesListPage />} />
            <Route path="/employees/new" element={<CreateEmployeePage />} />
            <Route path="/employees/:id" element={<EmployeeDetailPage />} />
            
            <Route path="/tickets" element={<TicketsPage />} />
            <Route path="/tickets/:id" element={<TicketDetailPage />} />
            
            <Route path="/aria" element={<AriaPage />} />
            
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/compliance" element={<CompliancePage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/settings/integrations" element={<IntegrationsPage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
