import { useEffect, useState } from 'react';
import { dashboardService, DashboardStats, GrowthData, Activity, TopPerformer } from '@/services/dashboardService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserPlus, Ticket, TrendingUp, ArrowUp, ArrowDown, Activity as ActivityIcon } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { toast } from 'sonner';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [growth, setGrowth] = useState<GrowthData[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [performers, setPerformers] = useState<TopPerformer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [statsData, growthData, activityData, performersData] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getGrowth(30),
        dashboardService.getActivity(8),
        dashboardService.getTopPerformers()
      ]);
      
      setStats(statsData);
      setGrowth(growthData);
      setActivity(activityData);
      setPerformers(performersData);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Error al cargar el dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Resumen general de Simply</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Users Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Usuarios Totales
            </CardTitle>
            <Users className="w-5 h-5 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.users.total}</div>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-sm text-gray-600">+{stats.users.newToday} hoy</span>
              {stats.users.growth > 0 && (
                <div className="flex items-center text-green-600 text-sm">
                  <ArrowUp className="w-4 h-4" />
                  {stats.users.growth}%
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Leads Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Leads
            </CardTitle>
            <UserPlus className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.leads.total}</div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-gray-600">+{stats.leads.newToday} hoy</span>
              <span className="text-sm text-indigo-600 font-medium">
                {stats.leads.conversionRate}% conversión
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Tickets Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Tickets
            </CardTitle>
            <Ticket className="w-5 h-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.tickets.total}</div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-orange-600">{stats.tickets.open} abiertos</span>
              <span className="text-sm text-green-600">
                {stats.tickets.resolutionRate}% resueltos
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Employees Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Equipo
            </CardTitle>
            <Users className="w-5 h-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.employees.total}</div>
            <div className="mt-2">
              <span className="text-sm text-green-600">{stats.employees.active} activos</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              Crecimiento (Últimos 30 días)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {growth.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={growth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#888"
                    fontSize={12}
                    tickFormatter={(value) => new Date(value).getDate().toString()}
                  />
                  <YAxis stroke="#888" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#6366f1" 
                    strokeWidth={2}
                    name="Usuarios"
                    dot={{ fill: '#6366f1' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="leads" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Leads"
                    dot={{ fill: '#3b82f6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No hay datos disponibles
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {performers.length > 0 ? (
                performers.map((performer, index) => (
                  <div 
                    key={performer.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{performer.name}</p>
                        <p className="text-sm text-gray-500">
                          {performer.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-indigo-600">{performer.total}</p>
                      <p className="text-xs text-gray-500">tickets</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-[250px] flex items-center justify-center text-gray-500">
                  No hay datos disponibles
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ActivityIcon className="w-5 h-5 text-green-600" />
            Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activity.length > 0 ? (
              activity.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className={`
                    w-2 h-2 rounded-full mt-2
                    ${item.type === 'user' ? 'bg-indigo-500' : ''}
                    ${item.type === 'lead' ? 'bg-blue-500' : ''}
                    ${item.type === 'ticket' ? 'bg-orange-500' : ''}
                  `} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{item.description}</p>
                    {item.creator && (
                      <p className="text-xs text-gray-500">Por {item.creator}</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {new Date(item.timestamp).toLocaleTimeString('es-AR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-gray-500">
                No hay actividad reciente
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
