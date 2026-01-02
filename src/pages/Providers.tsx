import { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Card, CardContent, CardActions, Button, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, CircularProgress,
  useTheme, useMediaQuery, Avatar, LinearProgress
} from '@mui/material';
import {
  Refresh as RefreshIcon, CheckCircle as ActiveIcon, Cancel as InactiveIcon, Error as ErrorIcon,
  Settings as ConfigIcon, PlayArrow as ActivateIcon, Stop as DeactivateIcon, HealthAndSafety as HealthIcon
} from '@mui/icons-material';
import { api } from '../services/api';

interface Provider {
  slug: string; name: string; description: string; category: string;
  configured: boolean; status: string; features: string[]; lastHealthCheck?: string;
}

const PROVIDER_ICONS: Record<string, string> = {
  bind: '🏦', didit: '🪪', stripe: '💳', bcra: '🏛️', coelsa: '🔄', rapipago: '💵', anthropic: '🤖', recaptcha: '🔒'
};

const CATEGORY_COLORS: Record<string, string> = {
  banking: '#1976d2', kyc: '#9c27b0', payments: '#2e7d32', credit: '#ed6c02',
  interoperability: '#0288d1', collection: '#7b1fa2', ai: '#6366f1', security: '#455a64'
};

const REQUIRED_CREDENTIALS: Record<string, string[]> = {
  bind: ['client_id', 'client_secret', 'account_id'],
  didit: ['api_key', 'webhook_secret'],
  stripe: ['secret_key', 'publishable_key', 'webhook_secret'],
  bcra: ['api_key', 'entity_id'],
  coelsa: ['participant_id', 'certificate', 'private_key'],
  rapipago: ['merchant_id', 'api_key', 'secret'],
  anthropic: ['api_key'],
  recaptcha: ['site_key', 'secret_key']
};

export default function Providers() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { loadProviders(); }, []);

  const loadProviders = async () => {
    setLoading(true);
    try { const res = await api.get('/backoffice/providers'); setProviders(res.data.data || []); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
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
    } catch (err: any) { setError(err.response?.data?.error || 'Error'); }
    finally { setActionLoading(false); }
  };

  const activateProvider = async (slug: string) => {
    setActionLoading(true);
    try { await api.post(`/backoffice/providers/${slug}/activate`); setSuccess('Proveedor activado'); loadProviders(); }
    catch (err: any) { setError(err.response?.data?.error || 'Error'); }
    finally { setActionLoading(false); }
  };

  const deactivateProvider = async (slug: string) => {
    const reason = prompt('Motivo:');
    if (!reason) return;
    setActionLoading(true);
    try { await api.post(`/backoffice/providers/${slug}/deactivate`, { reason }); setSuccess('Proveedor desactivado'); loadProviders(); }
    catch (err: any) { setError(err.response?.data?.error || 'Error'); }
    finally { setActionLoading(false); }
  };

  const checkHealth = async (slug: string) => {
    setActionLoading(true);
    try {
      const res = await api.post(`/backoffice/providers/${slug}/health-check`);
      if (res.data.data.healthy) setSuccess(`${slug}: OK (${res.data.data.latencyMs}ms)`);
      else setError(`${slug}: ${res.data.data.error}`);
      loadProviders();
    } catch (err: any) { setError(err.response?.data?.error || 'Error'); }
    finally { setActionLoading(false); }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <ActiveIcon sx={{ color: 'success.main' }} />;
      case 'error': return <ErrorIcon sx={{ color: 'error.main' }} />;
      default: return <InactiveIcon sx={{ color: 'grey.400' }} />;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Proveedores</Typography>
        <IconButton onClick={loadProviders}><RefreshIcon /></IconButton>
      </Box>

      {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2, borderRadius: 2 }}>{success}</Alert>}

      {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box> : (
        <Grid container spacing={3}>
          {providers.map(provider => (
            <Grid item xs={12} sm={6} md={4} key={provider.slug}>
              <Card variant="outlined" sx={{
                height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3,
                transition: 'all 0.2s', '&:hover': { boxShadow: 3, transform: 'translateY(-2px)' }
              }}>
                <CardContent sx={{ flex: 1, p: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 48, height: 48, fontSize: 24, bgcolor: 'grey.100' }}>
                        {PROVIDER_ICONS[provider.slug] || '📦'}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>{provider.name}</Typography>
                        <Chip size="small" label={provider.category}
                          sx={{ height: 20, bgcolor: CATEGORY_COLORS[provider.category] || '#757575', color: 'white', fontSize: 10 }} />
                      </Box>
                    </Box>
                    {getStatusIcon(provider.status)}
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                    {provider.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {provider.features?.slice(0, 3).map(f => (
                      <Chip key={f} size="small" label={f} variant="outlined" sx={{ height: 22, fontSize: 10 }} />
                    ))}
                    {provider.features?.length > 3 && (
                      <Chip size="small" label={`+${provider.features.length - 3}`} variant="outlined" sx={{ height: 22, fontSize: 10 }} />
                    )}
                  </Box>
                </CardContent>
                
                <CardActions sx={{ p: 2, pt: 0, gap: 1, flexWrap: 'wrap' }}>
                  {!provider.configured ? (
                    <Button size="small" variant="contained" startIcon={<ConfigIcon />} onClick={() => openConfigDialog(provider)}
                      sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
                      Configurar
                    </Button>
                  ) : (
                    <>
                      <IconButton size="small" onClick={() => checkHealth(provider.slug)} title="Health Check"><HealthIcon /></IconButton>
                      {provider.status === 'active' ? (
                        <IconButton size="small" color="error" onClick={() => deactivateProvider(provider.slug)} title="Desactivar"><DeactivateIcon /></IconButton>
                      ) : (
                        <IconButton size="small" color="success" onClick={() => activateProvider(provider.slug)} title="Activar"><ActivateIcon /></IconButton>
                      )}
                      <Button size="small" onClick={() => openConfigDialog(provider)}>Reconfigurar</Button>
                    </>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Config Dialog */}
      <Dialog open={configDialogOpen} onClose={() => setConfigDialogOpen(false)} maxWidth="sm" fullWidth fullScreen={isMobile}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'grey.100', fontSize: 24 }}>{PROVIDER_ICONS[selectedProvider?.slug || ''] || '📦'}</Avatar>
            <Box>
              <Typography variant="h6" fontWeight={600}>Configurar {selectedProvider?.name}</Typography>
              <Typography variant="caption" color="text.secondary">{selectedProvider?.category}</Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Ingresa las credenciales para conectar con {selectedProvider?.name}
          </Typography>
          {REQUIRED_CREDENTIALS[selectedProvider?.slug || '']?.map(cred => (
            <TextField key={cred} fullWidth label={cred.replace(/_/g, ' ').toUpperCase()}
              type={cred.includes('secret') || cred.includes('key') || cred.includes('private') ? 'password' : 'text'}
              value={credentials[cred] || ''} onChange={e => setCredentials(c => ({ ...c, [cred]: e.target.value }))}
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          ))}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setConfigDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={saveConfig} disabled={actionLoading}
            sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
            {actionLoading ? <CircularProgress size={20} /> : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
