import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Box, CircularProgress } from '@mui/material';

// Layout
import MainLayout from './components/Layout/MainLayout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Users from './pages/Users';
import UserDetail from './pages/UserDetail';
import Investments from './pages/Investments';
import InvestmentDetail from './pages/InvestmentDetail';
import Financings from './pages/Financings';
import FinancingDetail from './pages/FinancingDetail';
import AuditLogs from './pages/AuditLogs';
import Employees from './pages/Employees';
// Phase 2 & 3
import Treasury from './pages/Treasury';
import OTC from './pages/OTC';
import FraudAlerts from './pages/FraudAlerts';
import Compliance from './pages/Compliance';
// Phase 4
import Aria from './pages/Aria';
import Tickets from './pages/Tickets';
import Providers from './pages/Providers';
import Approvals from './pages/Approvals';
import Rewards from './pages/Rewards';
import BCRA from './pages/BCRA';

// Protected Route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'background.default' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="settings" element={<Settings />} />
        <Route path="users" element={<Users />} />
        <Route path="users/:id" element={<UserDetail />} />
        <Route path="investments" element={<Investments />} />
        <Route path="investments/:id" element={<InvestmentDetail />} />
        <Route path="financings" element={<Financings />} />
        <Route path="financings/:id" element={<FinancingDetail />} />
        <Route path="audit" element={<AuditLogs />} />
        <Route path="employees" element={<Employees />} />
        {/* Phase 2 & 3 */}
        <Route path="treasury" element={<Treasury />} />
        <Route path="otc" element={<OTC />} />
        <Route path="fraud" element={<FraudAlerts />} />
        <Route path="compliance" element={<Compliance />} />
        {/* Phase 4 */}
        <Route path="aria" element={<Aria />} />
        <Route path="tickets" element={<Tickets />} />
        <Route path="providers" element={<Providers />} />
        <Route path="approvals" element={<Approvals />} />
        <Route path="rewards" element={<Rewards />} />
        <Route path="bcra" element={<BCRA />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
