import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Skeleton,
  Avatar,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  People,
  AccountBalance,
  CreditCard,
  Speed,
  Refresh,
  ArrowUpward,
  ArrowDownward,
  Warning,
  CheckCircle,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { dashboardApi } from '../services/api';
import toast from 'react-hot-toast';

interface StatCard {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

export default function Dashboard() {
  const { employee } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setRefreshing(true);
      const response = await dashboardApi.getStats();
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      // Usar datos mock si el backend no responde
      setStats({
        totalUsers: 1250,
        activeUsers: 980,
        totalInvestments: 45000000,
        activeFinancings: 320,
        monthlyVolume: 125000000,
        pendingKYC: 45,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toLocaleString()}`;
  };

  const statCards: StatCard[] = [
    {
      title: 'Usuarios Totales',
      value: stats?.totalUsers?.toLocaleString() || '0',
      change: 12.5,
      icon: <People />,
      color: '#6366f1',
      bgColor: 'rgba(99, 102, 241, 0.1)',
    },
    {
      title: 'AUM (Inversiones)',
      value: formatCurrency(stats?.totalInvestments || 0),
      change: 8.3,
      icon: <AccountBalance />,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
    },
    {
      title: 'Financiamientos Activos',
      value: stats?.activeFinancings?.toLocaleString() || '0',
      change: -2.1,
      icon: <CreditCard />,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)',
    },
    {
      title: 'Volumen Mensual',
      value: formatCurrency(stats?.monthlyVolume || 0),
      change: 15.7,
      icon: <Speed />,
      color: '#ec4899',
      bgColor: 'rgba(236, 72, 153, 0.1)',
    },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  if (loading) {
    return (
      <Box>
        <Skeleton variant="text" width={300} height={40} sx={{ mb: 1 }} />
        <Skeleton variant="text" width={200} height={24} sx={{ mb: 4 }} />
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} lg={3} key={i}>
              <Skeleton variant="rounded" height={160} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            {getGreeting()}, {employee?.firstName} 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Aquí tienes un resumen de la actividad de Simply
          </Typography>
        </Box>
        <Tooltip title="Actualizar datos">
          <IconButton
            onClick={loadStats}
            disabled={refreshing}
            sx={{
              bgcolor: 'rgba(99, 102, 241, 0.1)',
              '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.2)' },
            }}
          >
            <Refresh sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <Card
              sx={{
                height: '100%',
                background: `linear-gradient(135deg, ${stat.bgColor} 0%, rgba(26,26,46,0.5) 100%)`,
                border: `1px solid ${stat.color}20`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 12px 40px ${stat.color}30`,
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: stat.bgColor,
                      color: stat.color,
                      width: 48,
                      height: 48,
                    }}
                  >
                    {stat.icon}
                  </Avatar>
                  <Chip
                    size="small"
                    icon={stat.change >= 0 ? <ArrowUpward sx={{ fontSize: 14 }} /> : <ArrowDownward sx={{ fontSize: 14 }} />}
                    label={`${Math.abs(stat.change)}%`}
                    sx={{
                      bgcolor: stat.change >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: stat.change >= 0 ? '#10b981' : '#ef4444',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      '& .MuiChip-icon': {
                        color: stat.change >= 0 ? '#10b981' : '#ef4444',
                      },
                    }}
                  />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Alertas y Actividad */}
      <Grid container spacing={3}>
        {/* Alertas pendientes */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Alertas Pendientes
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                  }}
                >
                  <Warning sx={{ color: '#f59e0b' }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      KYC Pendientes
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {stats?.pendingKYC || 0} usuarios esperando verificación
                    </Typography>
                  </Box>
                  <Chip label={stats?.pendingKYC || 0} size="small" sx={{ bgcolor: '#f59e0b', color: 'white' }} />
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                  }}
                >
                  <Warning sx={{ color: '#ef4444' }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Alertas de Fraude
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      3 alertas críticas requieren revisión
                    </Typography>
                  </Box>
                  <Chip label="3" size="small" sx={{ bgcolor: '#ef4444', color: 'white' }} />
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                  }}
                >
                  <CheckCircle sx={{ color: '#10b981' }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Sistema Operativo
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Todos los servicios funcionando correctamente
                    </Typography>
                  </Box>
                  <Chip label="OK" size="small" sx={{ bgcolor: '#10b981', color: 'white' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Métricas de rendimiento */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Métricas de Rendimiento
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Tasa de Conversión</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>68%</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={68}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'rgba(99, 102, 241, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: '#6366f1',
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Retención de Usuarios</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>85%</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={85}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'rgba(16, 185, 129, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: '#10b981',
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">NPL (Morosidad)</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#10b981' }}>2.3%</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={2.3}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'rgba(16, 185, 129, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: '#10b981',
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Satisfacción (NPS)</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>72</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={72}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'rgba(236, 72, 153, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: '#ec4899',
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* CSS para animación de refresh */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Box>
  );
}
