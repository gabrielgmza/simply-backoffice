import { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Card, CardContent, CardActions,
  Button, Chip, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Alert, CircularProgress, LinearProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tabs, Tab
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Error as ErrorIcon,
  Settings as ConfigIcon,
  PlayArrow as ActivateIcon,
  Stop as DeactivateIcon,
  HealthAndSafety as HealthIcon
} from '@mui/icons-material';
import { api } from '../services/api';

interface Provider {
  slug: string;
  name: string;
  description: string;
  category: string;
  configured: boolean;
  status: string;
  features: string[];
  lastHealthCheck?: string;
}

interface ProviderStats {
  apiCalls: { success: number; failed: number; total: number; successRate: number; avgLatencyMs: number };
  webhooks: Record<string, number>;
  uptime: number;
  lastHealthCheck?: string;
}

export default function Providers() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [stats, setStats] = useState<ProviderStats | null>(null);
  const [tab, setTab] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { loadProviders(); }, []);

  const loadProviders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/backoffice/providers');
      setProviders(res.data.data || []);
    } catch (err) {
      console.error('Error loading providers:', err);
    } finally {
      setLoading(false);
    }
  };

  const openProviderDetail = async (provider: Provider) => {
    setSelectedProvider(provider);
    setDialogOpen(true);
    if (provider.configured) {
      try {
        const res = await api.get(`/backoffice/providers/${provider.slug}/stats`);
        setStats(res.data.data);
      } catch (err) {
        console.error('Error loading stats:', err);
      }
    }
  };

  const openConfigDialog = (provider: Provider) => {
    setSelectedProvider(provider);
    setCredentials({});
    setConfigDialogOpen(true);
  };

  const saveConfig = async () => {
    if (!selectedProvider) return;
    setActionLoading(true);
    setError(null);
    try {
      await api.post(`/backoffice/providers/${selectedProvider.slug}/configure`, { credentials });
      setSuccess('Proveedor configurado correctamente');
      setConfigDialogOpen(false);
      loadProviders();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error configurando proveedor');
    } finally {
      setActionLoading(false);
    }
  };

  const activateProvider = async (slug: string) => {
    setActionLoading(true);
    try {
      await api.post(`/backoffice/providers/${slug}/activate`);
      setSuccess('Proveedor activado');
      loadProviders();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error activando proveedor');
    } finally {
      setActionLoading(false);
    }
  };

  const deactivateProvider = async (slug: string) => {
    const reason = prompt('Motivo de desactivación:');
    if (!reason) return;
    setActionLoading(true);
    try {
      await api.post(`/backoffice/providers/${slug}/deactivate`, { reason });
      setSuccess('Proveedor desactivado');
      loadProviders();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error desactivando proveedor');
    } finally {
      setActionLoading(false);
    }
  };

  const checkHealth = async (slug: string) => {
    setActionLoading(true);
    try {
      const res = await api.post(`/backoffice/providers/${slug}/health-check`);
      if (res.data.data.healthy) {
        setSuccess(`${slug}: Healthy (${res.data.data.latencyMs}ms)`);
      } else {
        setError(`${slug}: ${res.data.data.error}`);
      }
      loadProviders();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error en health check');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <ActiveIcon color="success" />;
      case 'inactive': return <InactiveIcon color="disabled" />;
      case 'error': return <ErrorIcon color="error" />;
      default: return <InactiveIcon color="disabled" />;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      banking: '#1976d2', kyc: '#9c27b0', payments: '#2e7d32',
      credit: '#ed6c02', interoperability: '#0288d1',
      collection: '#7b1fa2', ai: '#d32f2f', security: '#455a64'
    };
    return colors[category] || '#757575';
  };

  const requiredCredentials: Record<string, string[]> = {
    bind: ['client_id', 'client_secret', 'account_id'],
    didit: ['api_key', 'webhook_secret'],
    stripe: ['secret_key', 'publishable_key', 'webhook_secret'],
    bcra: ['api_key', 'entity_id'],
    coelsa: ['participant_id', 'certificate', 'private_key'],
    rapipago: ['merchant_id', 'api_key', 'secret'],
    anthropic: ['api_key'],
    recaptcha: ['site_key', 'secret_key']
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Proveedores</Typography>
        <IconButton onClick={loadProviders}><RefreshIcon /></IconButton>
      </Box>

      {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>{success}</Alert>}

      {loading ? <CircularProgress /> : (
        <Grid container spacing={3}>
          {providers.map(provider => (
            <Grid item xs={12} sm={6} md={4} key={provider.slug}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6">{provider.name}</Typography>
                    {getStatusIcon(provider.status)}
                  </Box>
                  <Chip 
                    size="small" 
                    label={provider.category} 
                    sx={{ bgcolor: getCategoryColor(provider.category), color: 'white', mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {provider.description}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {provider.features?.slice(0, 3).map(f => (
                      <Chip key={f} size="small" label={f} variant="outlined" />
                    ))}
                  </Box>
                </CardContent>
                <CardActions>
                  {!provider.configured ? (
                    <Button size="small" startIcon={<ConfigIcon />} onClick={() => openConfigDialog(provider)}>
                      Configurar
                    </Button>
                  ) : (
                    <>
                      <IconButton size="small" onClick={() => checkHealth(provider.slug)} title="Health Check">
                        <HealthIcon />
                      </IconButton>
                      {provider.status === 'active' ? (
                        <IconButton size="small" color="error" onClick={() => deactivateProvider(provider.slug)} title="Desactivar">
                          <DeactivateIcon />
                        </IconButton>
                      ) : (
                        <IconButton size="small" color="success" onClick={() => activateProvider(provider.slug)} title="Activar">
                          <ActivateIcon />
                        </IconButton>
                      )}
                      <Button size="small" onClick={() => openProviderDetail(provider)}>Ver detalles</Button>
                    </>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Detail Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedProvider?.name}
          <Chip size="small" label={selectedProvider?.status} sx={{ ml: 2 }} 
            color={selectedProvider?.status === 'active' ? 'success' : 'default'} />
        </DialogTitle>
        <DialogContent>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
            <Tab label="Estadísticas" />
            <Tab label="Configuración" />
          </Tabs>

          {tab === 0 && stats && (
            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4">{stats.apiCalls.total}</Typography>
                  <Typography variant="caption">Llamadas API (7d)</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main">
                    {stats.apiCalls.successRate.toFixed(1)}%
                  </Typography>
                  <Typography variant="caption">Tasa de éxito</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4">{stats.apiCalls.avgLatencyMs}ms</Typography>
                  <Typography variant="caption">Latencia promedio</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color={stats.uptime > 99 ? 'success.main' : 'warning.main'}>
                    {stats.uptime}%
                  </Typography>
                  <Typography variant="caption">Uptime</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>Webhooks recibidos</Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Estado</TableCell>
                        <TableCell align="right">Cantidad</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(stats.webhooks || {}).map(([status, count]) => (
                        <TableRow key={status}>
                          <TableCell>{status}</TableCell>
                          <TableCell align="right">{count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          )}

          {tab === 1 && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Para reconfigurar credenciales, usa el botón Configurar en la tarjeta del proveedor.
              </Typography>
              <Typography variant="subtitle2">Credenciales requeridas:</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                {requiredCredentials[selectedProvider?.slug || '']?.map(cred => (
                  <Chip key={cred} label={cred} size="small" />
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Config Dialog */}
      <Dialog open={configDialogOpen} onClose={() => setConfigDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Configurar {selectedProvider?.name}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Ingresa las credenciales para conectar con {selectedProvider?.name}
          </Typography>
          {requiredCredentials[selectedProvider?.slug || '']?.map(cred => (
            <TextField
              key={cred}
              fullWidth
              label={cred}
              type={cred.includes('secret') || cred.includes('key') ? 'password' : 'text'}
              value={credentials[cred] || ''}
              onChange={e => setCredentials(c => ({ ...c, [cred]: e.target.value }))}
              sx={{ mb: 2 }}
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfigDialogOpen(false)}>Cancelar</Button>
          <Button 
            variant="contained" 
            onClick={saveConfig} 
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={20} /> : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
