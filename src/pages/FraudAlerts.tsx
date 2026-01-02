import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  ToggleButton,
  ToggleButtonGroup,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Security,
  Refresh,
  Warning,
  Error as ErrorIcon,
  CheckCircle,
  Block,
  Speed,
  Visibility,
  Flag,
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import api from '../services/api';

const levelColors: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
  LOW: 'success',
  MEDIUM: 'warning',
  HIGH: 'error',
  CRITICAL: 'error',
};

const statusColors: Record<string, 'default' | 'warning' | 'success' | 'error' | 'info'> = {
  PENDING: 'warning',
  REVIEWING: 'info',
  RESOLVED: 'success',
  ESCALATED: 'error',
  FALSE_POSITIVE: 'default',
};

const factorIcons: Record<string, any> = {
  HIGH_AMOUNT: '💰',
  VELOCITY_BREACH: '⚡',
  UNUSUAL_PATTERN: '🔄',
  SUSPICIOUS_IP: '🌐',
  NEW_DEVICE: '📱',
  RECIPIENT_RISK: '👤',
  TIME_ANOMALY: '🕐',
  LOCATION_ANOMALY: '📍',
};

export default function FraudAlerts() {
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [stats, setStats] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  const [levelFilter, setLevelFilter] = useState<string>('');

  // Dialogs
  const [detailOpen, setDetailOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);

  // Form
  const [resolution, setResolution] = useState<string>('RESOLVED');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadData();
    loadStats();
  }, [page, statusFilter, levelFilter]);

  const loadData = async () => {
    try {
      const params: any = { page: page + 1, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      if (levelFilter) params.level = levelFilter;

      const res = await api.get('/api/backoffice/fraud/alerts', { params });
      if (res.data.success) {
        setAlerts(res.data.data.alerts);
        setTotal(res.data.data.total);
      }
    } catch (error) {
      toast.error('Error al cargar alertas');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const res = await api.get('/api/backoffice/fraud/stats');
      if (res.data.success) setStats(res.data.data);
    } catch (error) {
      console.error('Error loading stats');
    }
  };

  const handleReview = async () => {
    if (!selectedAlert || !resolution) return;
    try {
      await api.post(`/backoffice/fraud/alerts/${selectedAlert.id}/review`, {
        resolution,
        notes,
      });
      toast.success('Alerta revisada');
      setReviewOpen(false);
      setSelectedAlert(null);
      setResolution('RESOLVED');
      setNotes('');
      loadData();
      loadStats();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error');
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return '#ef4444';
    if (score >= 60) return '#f59e0b';
    if (score >= 40) return '#eab308';
    return '#10b981';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          <Security sx={{ verticalAlign: 'middle', mr: 1 }} />
          Alertas de Fraude
        </Typography>
        <Tooltip title="Actualizar">
          <IconButton onClick={() => { loadData(); loadStats(); }}>
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Stats */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} md={2.4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {stats.totalAlerts}
                </Typography>
                <Typography variant="body2" color="text.secondary">Total Alertas</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={2.4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main' }}>
                  {stats.byLevel?.find((l: any) => l.level === 'CRITICAL')?.count || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">Críticas</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={2.4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                  {stats.blockedTransactions}
                </Typography>
                <Typography variant="body2" color="text.secondary">Bloqueadas</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={2.4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {Math.round(stats.avgScore)}
                </Typography>
                <Typography variant="body2" color="text.secondary">Score Promedio</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={2.4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                  {stats.falsePositiveRate?.toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">Falsos Positivos</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <ToggleButtonGroup
          value={statusFilter}
          exclusive
          onChange={(_, v) => { setStatusFilter(v || ''); setPage(0); }}
          size="small"
        >
          <ToggleButton value="">Todas</ToggleButton>
          <ToggleButton value="PENDING">Pendientes</ToggleButton>
          <ToggleButton value="REVIEWING">En Revisión</ToggleButton>
          <ToggleButton value="RESOLVED">Resueltas</ToggleButton>
          <ToggleButton value="ESCALATED">Escaladas</ToggleButton>
        </ToggleButtonGroup>

        <ToggleButtonGroup
          value={levelFilter}
          exclusive
          onChange={(_, v) => { setLevelFilter(v || ''); setPage(0); }}
          size="small"
        >
          <ToggleButton value="">Todos</ToggleButton>
          <ToggleButton value="CRITICAL">Crítico</ToggleButton>
          <ToggleButton value="HIGH">Alto</ToggleButton>
          <ToggleButton value="MEDIUM">Medio</ToggleButton>
          <ToggleButton value="LOW">Bajo</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Table */}
      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Usuario</TableCell>
              <TableCell>Score</TableCell>
              <TableCell>Nivel</TableCell>
              <TableCell>Factores</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {alerts.map((alert) => (
              <TableRow key={alert.id} hover>
                <TableCell>{format(new Date(alert.created_at), 'dd/MM HH:mm')}</TableCell>
                <TableCell>
                  <Typography variant="body2">{alert.users?.first_name} {alert.users?.last_name}</Typography>
                  <Typography variant="caption" color="text.secondary">{alert.users?.email}</Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 60 }}>
                      <LinearProgress
                        variant="determinate"
                        value={alert.risk_score}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: 'grey.800',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: getRiskColor(alert.risk_score),
                          },
                        }}
                      />
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {alert.risk_score}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={alert.risk_level}
                    size="small"
                    color={levelColors[alert.risk_level]}
                    icon={alert.risk_level === 'CRITICAL' ? <ErrorIcon /> : <Warning />}
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {alert.factors?.slice(0, 3).map((f: any, i: number) => (
                      <Tooltip key={i} title={f.details}>
                        <Chip
                          label={factorIcons[f.type] || '⚠️'}
                          size="small"
                          variant="outlined"
                        />
                      </Tooltip>
                    ))}
                    {alert.factors?.length > 3 && (
                      <Chip label={`+${alert.factors.length - 3}`} size="small" variant="outlined" />
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={alert.status}
                    size="small"
                    color={statusColors[alert.status]}
                  />
                  {alert.auto_blocked && (
                    <Chip
                      label="Bloqueado"
                      size="small"
                      color="error"
                      icon={<Block />}
                      sx={{ ml: 0.5 }}
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Ver Detalles">
                      <IconButton size="small" onClick={() => { setSelectedAlert(alert); setDetailOpen(true); }}>
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    {['PENDING', 'REVIEWING'].includes(alert.status) && (
                      <Tooltip title="Revisar">
                        <IconButton size="small" color="primary" onClick={() => { setSelectedAlert(alert); setReviewOpen(true); }}>
                          <Flag />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={20}
          rowsPerPageOptions={[20]}
        />
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Detalle de Alerta
          {selectedAlert && (
            <Chip
              label={selectedAlert.risk_level}
              color={levelColors[selectedAlert.risk_level]}
              sx={{ ml: 2 }}
            />
          )}
        </DialogTitle>
        <DialogContent>
          {selectedAlert && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Usuario</Typography>
                <Typography variant="body1">
                  {selectedAlert.users?.first_name} {selectedAlert.users?.last_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedAlert.users?.email}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Score de Riesgo</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: getRiskColor(selectedAlert.risk_score) }}>
                    {selectedAlert.risk_score}
                  </Typography>
                  <Box sx={{ flex: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={selectedAlert.risk_score}
                      sx={{
                        height: 12,
                        borderRadius: 6,
                        bgcolor: 'grey.800',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: getRiskColor(selectedAlert.risk_score),
                        },
                      }}
                    />
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="h6" sx={{ mb: 2 }}>Factores de Riesgo</Typography>
                <List dense>
                  {selectedAlert.factors?.map((factor: any, index: number) => (
                    <ListItem key={index}>
                      <ListItemIcon sx={{ minWidth: 40, fontSize: 24 }}>
                        {factorIcons[factor.type] || '⚠️'}
                      </ListItemIcon>
                      <ListItemText
                        primary={factor.type.replace(/_/g, ' ')}
                        secondary={factor.details}
                      />
                      <Chip
                        label={`Score: ${factor.score}`}
                        size="small"
                        sx={{ bgcolor: getRiskColor(factor.score), color: 'white' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>

              {selectedAlert.notes && (
                <Grid item xs={12}>
                  <Alert severity="info">
                    <Typography variant="subtitle2">Notas de Revisión</Typography>
                    <Typography variant="body2">{selectedAlert.notes}</Typography>
                  </Alert>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Cerrar</Button>
          {selectedAlert && ['PENDING', 'REVIEWING'].includes(selectedAlert.status) && (
            <Button variant="contained" onClick={() => { setDetailOpen(false); setReviewOpen(true); }}>
              Revisar
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={reviewOpen} onClose={() => setReviewOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Revisar Alerta</DialogTitle>
        <DialogContent>
          {selectedAlert && (
            <Alert severity={selectedAlert.risk_level === 'CRITICAL' ? 'error' : 'warning'} sx={{ mb: 2 }}>
              Score: {selectedAlert.risk_score} - {selectedAlert.risk_level}
            </Alert>
          )}

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Resolución</InputLabel>
            <Select value={resolution} label="Resolución" onChange={(e) => setResolution(e.target.value)}>
              <MenuItem value="RESOLVED">Resuelta (Sin Fraude)</MenuItem>
              <MenuItem value="FALSE_POSITIVE">Falso Positivo</MenuItem>
              <MenuItem value="ESCALATED">Escalar (Fraude Confirmado)</MenuItem>
            </Select>
          </FormControl>

          {resolution === 'ESCALATED' && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Al escalar, el usuario será bloqueado automáticamente y se creará un flag de riesgo crítico.
            </Alert>
          )}

          <TextField
            fullWidth
            label="Notas"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            multiline
            rows={3}
            placeholder="Detalles de la revisión..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setReviewOpen(false); setNotes(''); }}>Cancelar</Button>
          <Button
            variant="contained"
            color={resolution === 'ESCALATED' ? 'error' : 'primary'}
            onClick={handleReview}
          >
            {resolution === 'ESCALATED' ? 'Escalar y Bloquear' : 'Guardar Revisión'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
