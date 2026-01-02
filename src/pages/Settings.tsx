import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Skeleton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Save,
  History,
  TrendingUp,
  Warning,
  Settings as SettingsIcon,
  Refresh,
} from '@mui/icons-material';
import { settingsApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Setting {
  key: string;
  value: string;
  type: string;
  description: string;
  updatedAt: string;
}

interface SettingsGroup {
  [category: string]: Setting[];
}

const categoryLabels: Record<string, string> = {
  rates: 'Tasas',
  limits: 'Límites',
  fees: 'Comisiones',
  features: 'Funcionalidades',
  operations: 'Operaciones',
  levels: 'Niveles',
};

const categoryIcons: Record<string, React.ReactNode> = {
  rates: <TrendingUp />,
  limits: <Warning />,
  fees: <SettingsIcon />,
  features: <SettingsIcon />,
  operations: <SettingsIcon />,
  levels: <SettingsIcon />,
};

export default function Settings() {
  const { hasPermission } = useAuth();
  const canEdit = hasPermission('settings:update');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SettingsGroup>({});
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState(0);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [simulateOpen, setSimulateOpen] = useState(false);
  const [simulateKey, setSimulateKey] = useState('');
  const [simulateValue, setSimulateValue] = useState('');
  const [simulateResult, setSimulateResult] = useState<any>(null);
  const [reason, setReason] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await settingsApi.getAll();
      if (response.data.success) {
        setSettings(response.data.data);
        
        // Inicializar valores editados
        const initial: Record<string, string> = {};
        Object.values(response.data.data).flat().forEach((s: any) => {
          initial[s.key] = s.value;
        });
        setEditedValues(initial);
      }
    } catch (error) {
      toast.error('Error al cargar configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleValueChange = (key: string, value: string) => {
    setEditedValues(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async (key: string) => {
    if (!reason.trim()) {
      toast.error('Debes indicar un motivo del cambio');
      return;
    }

    setSaving(true);
    try {
      await settingsApi.update(key, editedValues[key], reason);
      toast.success('Configuración actualizada');
      setReason('');
      loadSettings();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleFeature = async (key: string, currentValue: string) => {
    const newValue = currentValue === 'true' ? 'false' : 'true';
    
    try {
      await settingsApi.update(key, newValue, 'Toggle de funcionalidad');
      toast.success('Funcionalidad actualizada');
      loadSettings();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al actualizar');
    }
  };

  const loadHistory = async () => {
    try {
      const response = await settingsApi.getHistory({ limit: 50 });
      if (response.data.success) {
        setHistory(response.data.data.history);
      }
    } catch (error) {
      toast.error('Error al cargar historial');
    }
  };

  const handleOpenHistory = () => {
    loadHistory();
    setHistoryOpen(true);
  };

  const handleSimulate = async () => {
    try {
      const response = await settingsApi.simulate(simulateKey, simulateValue);
      if (response.data.success) {
        setSimulateResult(response.data.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error en simulación');
    }
  };

  const categories = Object.keys(settings);
  const currentCategory = categories[activeTab] || 'rates';
  const currentSettings = settings[currentCategory] || [];

  const hasChanges = (key: string, originalValue: string) => {
    return editedValues[key] !== originalValue;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
          Configuración del Sistema
        </Typography>
        <Card>
          <CardContent>
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} height={60} sx={{ mb: 2 }} />
            ))}
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Configuración del Sistema
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<History />}
            onClick={handleOpenHistory}
          >
            Historial
          </Button>
          <Tooltip title="Recargar">
            <IconButton onClick={loadSettings}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
          >
            {categories.map((cat) => (
              <Tab
                key={cat}
                label={categoryLabels[cat] || cat}
                icon={categoryIcons[cat]}
                iconPosition="start"
              />
            ))}
          </Tabs>
        </Box>

        <CardContent>
          {currentCategory === 'features' ? (
            // Features con switches
            <Grid container spacing={2}>
              {currentSettings.map((setting) => (
                <Grid item xs={12} sm={6} md={4} key={setting.key}>
                  <Card variant="outlined">
                    <CardContent>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={setting.value === 'true'}
                            onChange={() => handleToggleFeature(setting.key, setting.value)}
                            disabled={!canEdit}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {setting.description}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {setting.key}
                            </Typography>
                          </Box>
                        }
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            // Otras categorías con inputs
            <Grid container spacing={3}>
              {currentSettings.map((setting) => (
                <Grid item xs={12} md={6} key={setting.key}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: hasChanges(setting.key, setting.value) ? 'warning.main' : 'divider',
                      bgcolor: hasChanges(setting.key, setting.value) ? 'warning.main' + '10' : 'transparent',
                    }}
                  >
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {setting.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                      {setting.key}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                      <TextField
                        value={editedValues[setting.key] || ''}
                        onChange={(e) => handleValueChange(setting.key, e.target.value)}
                        size="small"
                        type={setting.type === 'number' ? 'number' : 'text'}
                        disabled={!canEdit}
                        sx={{ flex: 1 }}
                        InputProps={{
                          endAdornment: setting.key.includes('rate') || setting.key.includes('percentage') ? (
                            <Typography variant="body2" color="text.secondary">%</Typography>
                          ) : null,
                        }}
                      />
                      
                      {hasChanges(setting.key, setting.value) && canEdit && (
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<Save />}
                          onClick={() => {
                            setSimulateKey(setting.key);
                            setSimulateValue(editedValues[setting.key]);
                            setSimulateOpen(true);
                          }}
                          disabled={saving}
                        >
                          Guardar
                        </Button>
                      )}
                    </Box>

                    {hasChanges(setting.key, setting.value) && (
                      <Chip
                        label={`Original: ${setting.value}`}
                        size="small"
                        sx={{ mt: 1 }}
                        color="warning"
                      />
                    )}
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Simulación y Guardado */}
      <Dialog open={simulateOpen} onClose={() => setSimulateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Confirmar Cambio de Configuración</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Estás por cambiar:
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {simulateKey}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Chip label={`Actual: ${settings[currentCategory]?.find(s => s.key === simulateKey)?.value}`} />
              <Chip label={`Nuevo: ${simulateValue}`} color="primary" />
            </Box>
          </Box>

          <Button
            variant="outlined"
            onClick={handleSimulate}
            sx={{ mb: 2 }}
            fullWidth
          >
            Simular Impacto
          </Button>

          {simulateResult && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Impacto Estimado:
              </Typography>
              {simulateResult.totalAffected !== undefined && (
                <Typography variant="body2">
                  Total afectado: {formatCurrency(simulateResult.totalAffected)}
                </Typography>
              )}
              {simulateResult.dailyDifference !== undefined && (
                <Typography variant="body2">
                  Diferencia diaria: {formatCurrency(simulateResult.dailyDifference)}
                </Typography>
              )}
              {simulateResult.monthlyDifference !== undefined && (
                <Typography variant="body2">
                  Diferencia mensual: {formatCurrency(simulateResult.monthlyDifference)}
                </Typography>
              )}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Motivo del cambio"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            multiline
            rows={2}
            required
            placeholder="Ej: Ajuste por condiciones de mercado"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setSimulateOpen(false);
            setSimulateResult(null);
            setReason('');
          }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              handleSave(simulateKey);
              setSimulateOpen(false);
              setSimulateResult(null);
            }}
            disabled={!reason.trim() || saving}
          >
            Confirmar Cambio
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Historial */}
      <Dialog open={historyOpen} onClose={() => setHistoryOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Historial de Cambios</DialogTitle>
        <DialogContent>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Configuración</TableCell>
                <TableCell>Anterior</TableCell>
                <TableCell>Nuevo</TableCell>
                <TableCell>Motivo</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.map((h) => (
                <TableRow key={h.id}>
                  <TableCell>
                    {format(new Date(h.created_at), "dd/MM/yyyy HH:mm", { locale: es })}
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                      {h.setting_key}
                    </Typography>
                  </TableCell>
                  <TableCell>{h.old_value || '-'}</TableCell>
                  <TableCell sx={{ color: 'primary.main', fontWeight: 500 }}>
                    {h.new_value}
                  </TableCell>
                  <TableCell>{h.reason || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
