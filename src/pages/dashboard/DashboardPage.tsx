import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CreditCard, AlertCircle, TrendingUp, DollarSign, Activity } from 'lucide-react';
import { DashboardStats } from '@/types';

// Mock data - reemplazar con API real
const mockStats: DashboardStats = {
  total_users: 1247,
  active_users: 892,
  pending_kyc: 23,
  total_transactions_today: 156,
  total_volume_today: 2847920,
  open_tickets: 12,
  active_retentions: 3,
  total_retained_amount: 125000,
  aum: 145800000,
  revenue_mtd: 423000
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setStats(mockStats);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('es-AR').format(value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Vista general del sistema Simply
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.total_users)}</div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(stats.active_users)} activos
            </p>
          </CardContent>
        </Card>

        {/* AUM */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AUM</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.aum)}</div>
            <p className="text-xs text-muted-foreground">
              Assets Under Management
            </p>
          </CardContent>
        </Card>

        {/* Revenue MTD */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue MTD</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.revenue_mtd)}</div>
            <p className="text-xs text-muted-foreground">
              Ingresos del mes
            </p>
          </CardContent>
        </Card>

        {/* Transactions Today */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transacciones Hoy</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.total_transactions_today)}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(stats.total_volume_today)} en volumen
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Warnings */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Pending KYC */}
        {stats.pending_kyc > 0 && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                Verificaciones KYC Pendientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-900">
                {stats.pending_kyc}
              </div>
              <p className="text-xs text-yellow-700 mt-1">
                Requieren revisión de compliance
              </p>
            </CardContent>
          </Card>
        )}

        {/* Open Tickets */}
        {stats.open_tickets > 0 && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600" />
                Tickets Abiertos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">
                {stats.open_tickets}
              </div>
              <p className="text-xs text-blue-700 mt-1">
                Requieren atención de soporte
              </p>
            </CardContent>
          </Card>
        )}

        {/* Active Retentions */}
        {stats.active_retentions > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                Retenciones Activas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-900">
                {stats.active_retentions}
              </div>
              <p className="text-xs text-red-700 mt-1">
                {formatCurrency(stats.total_retained_amount)} retenidos
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Charts Placeholder */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Transacciones por Día</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">
                📊 Gráfico de Recharts - TODO
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Crecimiento de Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">
                📈 Gráfico de Recharts - TODO
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Accesos Rápidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-3">
            <button className="p-4 border rounded-lg hover:bg-accent transition-colors text-left">
              <Users className="w-5 h-5 mb-2 text-primary" />
              <div className="font-medium">Usuarios</div>
              <div className="text-xs text-muted-foreground">Gestionar usuarios</div>
            </button>
            
            <button className="p-4 border rounded-lg hover:bg-accent transition-colors text-left">
              <CreditCard className="w-5 h-5 mb-2 text-primary" />
              <div className="font-medium">Transacciones</div>
              <div className="text-xs text-muted-foreground">Ver transacciones</div>
            </button>
            
            <button className="p-4 border rounded-lg hover:bg-accent transition-colors text-left">
              <AlertCircle className="w-5 h-5 mb-2 text-primary" />
              <div className="font-medium">Compliance</div>
              <div className="text-xs text-muted-foreground">KYC y ROS</div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
