import { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, TextField, Button, Switch, FormControlLabel,
  Tabs, Tab, Divider, Alert, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, Table, TableBody, TableCell, TableHead, TableRow, Skeleton,
  Accordion, AccordionSummary, AccordionDetails, InputAdornment
} from '@mui/material';
import { Settings as SettingsIcon, Save, Refresh, ExpandMore, History, TrendingUp, Security, SmartToy } from '@mui/icons-material';
import { settingsApi } from '../services/api';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Setting { id: string; key: string; value: string; category: string; description?: string; data_type: string; is_sensitive: boolean; updated_at: string; }
interface HistoryEntry { id: string; key: string; old_value: string; new_value: string; changed_by: string; reason?: string; created_at: string; }

export default function Settings() {
  const { hasPermission } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState(0);
  const [settings, setSettings] = useState<Setting[]>([]);
  const [changes, setChanges] = useState<Record<string, string>>({});
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [ariaEnabled, setAriaEnabled] = useState(true);
  const [ariaRoles, setAriaRoles] = useState<string[]>([]);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canEdit = hasPermission('settings:update');

  useEffect(() => { loadSettings(); loadAriaConfig(); }, []);

  const loadSettings = async () => {
    setLoading(true);
    try { const res = await settingsApi.getAll(); setSettings(res.data.data || []); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const loadAriaConfig = async () => {
    try {
      const res = await api.get('/api/backoffice/aria/config');
      setAriaEnabled(res.data.data.enabled);
      setAriaRoles(res.data.data.allowedRoles || []);
    } catch (err) { console.error(err); }
  };

  const loadHistory = async () => {
    try { const res = await settingsApi.getHistory({ limit: 50 }); setHistory(res.data.data?.history || []); setHistoryOpen(true); }
    catch (err) { console.error(err); }
  };

  const handleChange = (key: string, value: string) => setChanges(prev => ({ ...prev, [key]: value }));

  const saveChanges = async () => {
    if (Object.keys(changes).length === 0) return;
    setSaving(true); setError(null);
    try {
      const updates = Object.entries(changes).map(([key, value]) => ({ key, value }));
      await settingsApi.updateMultiple(updates, 'Actualización desde backoffice');
      setSuccess('Configuración guardada'); setChanges({}); loadSettings(); toast.success('Guardado');
    } catch (err: any) { setError(err.response?.data?.error || 'Error'); toast.error('Error'); }
    finally { setSaving(false); }
  };

  const toggleAria = async () => {
    try {
      await api.post('/api/backoffice/aria/toggle', { enabled: !ariaEnabled });
      setAriaEnabled(!ariaEnabled);
      toast.success(`Aria ${!ariaEnabled ? 'habilitada' : 'deshabilitada'}`);
    } catch (err: any) { toast.error(err.response?.data?.error || 'Error'); }
  };

  const getValue = (key: string) => changes[key] ?? settings.find(s => s.key === key)?.value ?? '';

  const groupedSettings = settings.reduce((acc, s) => {
    const cat = s.category || 'general';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {} as Record<string, Setting[]>);

  if (loading) return <Box><Skeleton variant="text" width={200} height={40} sx={{ mb: 2 }} /><Grid container spacing={3}>{[1,2,3].map(i => <Grid item xs={12} md={6} key={i}><Skeleton variant="rounded" height={200} /></Grid>)}</Grid></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box><Typography variant="h5" fontWeight={700}>Configuración</Typography><Typography variant="body2" color="text.secondary">Tasas, límites y funcionalidades</Typography></Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" size="small" startIcon={<History />} onClick={loadHistory}>Historial</Button>
          <Button variant="outlined" size="small" startIcon={<Refresh />} onClick={loadSettings}>Actualizar</Button>
          {canEdit && Object.keys(changes).length > 0 && (
            <Button variant="contained" size="small" startIcon={<Save />} onClick={saveChanges} disabled={saving} sx={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
              Guardar ({Object.keys(changes).length})
            </Button>
          )}
        </Box>
      </Box>

      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}><Tab label="General" /><Tab label="Tasas" /><Tab label="Límites" /><Tab label="Aria AI" /></Tabs>

      {tab === 0 && (
        <Grid container spacing={3}>
          {Object.entries(groupedSettings).filter(([cat]) => !['rates', 'limits'].includes(cat)).map(([category, items]) => (
            <Grid item xs={12} md={6} key={category}>
              <Card><CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom sx={{ textTransform: 'capitalize' }}>{category}</Typography>
                <Divider sx={{ mb: 2 }} />
                {items.map(setting => (
                  <Box key={setting.key} sx={{ mb: 2 }}>
                    {setting.data_type === 'boolean' ? (
                      <FormControlLabel control={<Switch checked={getValue(setting.key) === 'true'} onChange={e => handleChange(setting.key, e.target.checked.toString())} disabled={!canEdit} />} label={setting.description || setting.key} />
                    ) : (
                      <TextField fullWidth size="small" label={setting.description || setting.key} value={getValue(setting.key)} onChange={e => handleChange(setting.key, e.target.value)} disabled={!canEdit} type={setting.is_sensitive ? 'password' : setting.data_type === 'number' ? 'number' : 'text'} />
                    )}
                  </Box>
                ))}
              </CardContent></Card>
            </Grid>
          ))}
        </Grid>
      )}

      {tab === 1 && (
        <Card><CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>Tasas y Comisiones</Typography>
          <Alert severity="info" sx={{ mb: 3 }}>Cambios afectan nuevas operaciones, no existentes.</Alert>
          <Grid container spacing={3}>
            {(groupedSettings['rates'] || []).map(setting => (
              <Grid item xs={12} sm={6} md={4} key={setting.key}>
                <TextField fullWidth label={setting.description || setting.key} value={getValue(setting.key)} onChange={e => handleChange(setting.key, e.target.value)} disabled={!canEdit} type="number" InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} />
              </Grid>
            ))}
            {(!groupedSettings['rates'] || groupedSettings['rates'].length === 0) && (
              <>
                <Grid item xs={12} sm={6} md={4}><TextField fullWidth label="Tasa FCI Anual" value={getValue('fci_annual_rate') || '22.08'} onChange={e => handleChange('fci_annual_rate', e.target.value)} disabled={!canEdit} type="number" InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} /></Grid>
                <Grid item xs={12} sm={6} md={4}><TextField fullWidth label="Penalidad Mora" value={getValue('default_penalty_rate') || '3'} onChange={e => handleChange('default_penalty_rate', e.target.value)} disabled={!canEdit} type="number" InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} /></Grid>
                <Grid item xs={12} sm={6} md={4}><TextField fullWidth label="Comisión Servicio" value={getValue('service_commission') || '1.5'} onChange={e => handleChange('service_commission', e.target.value)} disabled={!canEdit} type="number" InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} /></Grid>
              </>
            )}
          </Grid>
        </CardContent></Card>
      )}

      {tab === 2 && (
        <Card><CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>Límites Operativos</Typography>
          <Grid container spacing={3}>
            {(groupedSettings['limits'] || []).map(setting => (
              <Grid item xs={12} sm={6} md={4} key={setting.key}>
                <TextField fullWidth label={setting.description || setting.key} value={getValue(setting.key)} onChange={e => handleChange(setting.key, e.target.value)} disabled={!canEdit} type="number" InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} />
              </Grid>
            ))}
            {(!groupedSettings['limits'] || groupedSettings['limits'].length === 0) && (
              <>
                <Grid item xs={12} sm={6} md={4}><TextField fullWidth label="Inversión Mínima" value={getValue('min_investment') || '10000'} onChange={e => handleChange('min_investment', e.target.value)} disabled={!canEdit} type="number" InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} /></Grid>
                <Grid item xs={12} sm={6} md={4}><TextField fullWidth label="Inversión Máxima" value={getValue('max_investment') || '50000000'} onChange={e => handleChange('max_investment', e.target.value)} disabled={!canEdit} type="number" InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} /></Grid>
                <Grid item xs={12} sm={6} md={4}><TextField fullWidth label="Financiamiento Máx %" value={getValue('max_financing_percent') || '15'} onChange={e => handleChange('max_financing_percent', e.target.value)} disabled={!canEdit} type="number" InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} /></Grid>
                <Grid item xs={12} sm={6} md={4}><TextField fullWidth label="Transferencia Diaria" value={getValue('daily_transfer_limit') || '500000'} onChange={e => handleChange('daily_transfer_limit', e.target.value)} disabled={!canEdit} type="number" InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} /></Grid>
              </>
            )}
          </Grid>
        </CardContent></Card>
      )}

      {tab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card><CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><SmartToy sx={{ color: '#6366f1' }} /><Typography variant="h6" fontWeight={600}>Aria AI</Typography></Box>
                <Chip label={ariaEnabled ? 'Activa' : 'Inactiva'} color={ariaEnabled ? 'success' : 'default'} size="small" />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Asistente AI para empleados con consultas y operaciones.</Typography>
              <FormControlLabel control={<Switch checked={ariaEnabled} onChange={toggleAria} disabled={!canEdit} />} label={ariaEnabled ? 'Habilitada' : 'Deshabilitada'} />
              {!ariaEnabled && <Alert severity="warning" sx={{ mt: 2 }}>Aria está deshabilitada globalmente.</Alert>}
            </CardContent></Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card><CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>Roles con Acceso</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {['SUPER_ADMIN', 'ADMIN', 'COMPLIANCE', 'SUPPORT', 'FINANCE', 'OPERATIONS', 'RISK', 'AUDITOR', 'ANALYST'].map(role => (
                  <Chip key={role} label={role} color={ariaRoles.includes(role) ? 'primary' : 'default'} variant={ariaRoles.includes(role) ? 'filled' : 'outlined'}
                    onClick={() => { if (!canEdit) return; const newRoles = ariaRoles.includes(role) ? ariaRoles.filter(r => r !== role) : [...ariaRoles, role]; setAriaRoles(newRoles); api.post('/api/backoffice/aria/roles', { roles: newRoles }); }}
                    sx={{ cursor: canEdit ? 'pointer' : 'default' }} />
                ))}
              </Box>
            </CardContent></Card>
          </Grid>
          <Grid item xs={12}>
            <Card><CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>Herramientas por Rol</Typography>
              <Accordion><AccordionSummary expandIcon={<ExpandMore />}><Typography>SUPER_ADMIN</Typography></AccordionSummary><AccordionDetails><Typography variant="body2" color="text.secondary">Acceso completo: consultas, modificaciones, configuración, bloqueos, compliance, fraude, tesorería.</Typography></AccordionDetails></Accordion>
              <Accordion><AccordionSummary expandIcon={<ExpandMore />}><Typography>COMPLIANCE</Typography></AccordionSummary><AccordionDetails><Typography variant="body2" color="text.secondary">KYC, reportes UIF, transacciones, alertas fraude, auditoría.</Typography></AccordionDetails></Accordion>
              <Accordion><AccordionSummary expandIcon={<ExpandMore />}><Typography>SUPPORT</Typography></AccordionSummary><AccordionDetails><Typography variant="body2" color="text.secondary">Usuarios, tickets, respuestas, rewards.</Typography></AccordionDetails></Accordion>
              <Accordion><AccordionSummary expandIcon={<ExpandMore />}><Typography>FINANCE</Typography></AccordionSummary><AccordionDetails><Typography variant="body2" color="text.secondary">Tesorería, movimientos, cuotas, penalidades.</Typography></AccordionDetails></Accordion>
              <Accordion><AccordionSummary expandIcon={<ExpandMore />}><Typography>RISK</Typography></AccordionSummary><AccordionDetails><Typography variant="body2" color="text.secondary">Alertas fraude, bloquear usuarios, auditoría.</Typography></AccordionDetails></Accordion>
            </CardContent></Card>
          </Grid>
        </Grid>
      )}

      <Dialog open={historyOpen} onClose={() => setHistoryOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Historial de Cambios</DialogTitle>
        <DialogContent>
          <Table size="small">
            <TableHead><TableRow><TableCell>Config</TableCell><TableCell>Anterior</TableCell><TableCell>Nuevo</TableCell><TableCell>Por</TableCell><TableCell>Fecha</TableCell></TableRow></TableHead>
            <TableBody>
              {history.map(h => (
                <TableRow key={h.id}>
                  <TableCell><Typography variant="body2" fontWeight={500}>{h.key}</Typography></TableCell>
                  <TableCell><Chip label={h.old_value} size="small" color="error" variant="outlined" /></TableCell>
                  <TableCell><Chip label={h.new_value} size="small" color="success" variant="outlined" /></TableCell>
                  <TableCell>{h.changed_by}</TableCell>
                  <TableCell>{new Date(h.created_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions><Button onClick={() => setHistoryOpen(false)}>Cerrar</Button></DialogActions>
      </Dialog>
    </Box>
  );
}
