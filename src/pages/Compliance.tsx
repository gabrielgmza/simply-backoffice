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
  Tabs,
  Tab,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Policy,
  Refresh,
  Add,
  Send,
  CheckCircle,
  Description,
  Warning,
  Schedule,
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import api from '../services/api';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(value);
};

const typeLabels: Record<string, string> = {
  ROS: 'Reporte Op. Sospechosa',
  ROE: 'Reporte Op. Especial',
  THRESHOLD: 'Operación Umbral',
  PERIODIC: 'Reporte Periódico',
};

const statusColors: Record<string, 'default' | 'warning' | 'success' | 'error' | 'info'> = {
  DRAFT: 'default',
  PENDING_REVIEW: 'warning',
  APPROVED: 'info',
  SUBMITTED: 'success',
  REJECTED: 'error',
};

export default function Compliance() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [reports, setReports] = useState<any[]>([]);
  const [totalReports, setTotalReports] = useState(0);
  const [page, setPage] = useState(0);
  const [stats, setStats] = useState<any>(null);
  const [thresholds, setThresholds] = useState<any>(null);
  const [pendingReviews, setPendingReviews] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Dialogs
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);

  // Form
  const [formUserId, setFormUserId] = useState('');
  const [formTransactionIds, setFormTransactionIds] = useState('');
  const [formType, setFormType] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formIndicators, setFormIndicators] = useState('');
  const [approveNotes, setApproveNotes] = useState('');

  useEffect(() => {
    loadData();
    loadStats();
    loadThresholds();
    loadPendingReviews();
  }, [page, statusFilter]);

  const loadData = async () => {
    try {
      const params: any = { page: page + 1, limit: 20 };
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/api/backoffice/compliance/reports', { params });
      if (res.data.success) {
        setReports(res.data.data.reports);
        setTotalReports(res.data.data.total);
      }
    } catch (error) {
      toast.error('Error al cargar reportes');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const res = await api.get('/api/backoffice/compliance/stats');
      if (res.data.success) setStats(res.data.data);
    } catch (error) {
      console.error('Error loading stats');
    }
  };

  const loadThresholds = async () => {
    try {
      const res = await api.get('/api/backoffice/compliance/thresholds');
      if (res.data.success) setThresholds(res.data.data);
    } catch (error) {
      console.error('Error loading thresholds');
    }
  };

  const loadPendingReviews = async () => {
    try {
      const res = await api.get('/api/backoffice/compliance/reviews/pending');
      if (res.data.success) setPendingReviews(res.data.data.reviews);
    } catch (error) {
      console.error('Error loading pending reviews');
    }
  };

  const handleCreateROS = async () => {
    try {
      await api.post('/api/backoffice/compliance/reports/ros', {
        userId: formUserId,
        transactionIds: formTransactionIds.split(',').map(id => id.trim()),
        type: formType,
        description: formDescription,
        amount: parseFloat(formAmount),
        indicators: formIndicators.split(',').map(i => i.trim()),
      });
      toast.success('ROS generado');
      setCreateOpen(false);
      resetForm();
      loadData();
      loadStats();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error');
    }
  };

  const handleApprove = async () => {
    if (!selectedReport) return;
    try {
      await api.post(`/backoffice/compliance/reports/${selectedReport.id}/approve`, {
        notes: approveNotes,
      });
      toast.success('Reporte aprobado');
      setApproveOpen(false);
      setSelectedReport(null);
      setApproveNotes('');
      loadData();
      loadStats();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error');
    }
  };

  const handleSubmit = async (reportId: string) => {
    try {
      await api.post(`/backoffice/compliance/reports/${reportId}/submit`);
      toast.success('Reporte enviado a UIF');
      loadData();
      loadStats();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error');
    }
  };

  const resetForm = () => {
    setFormUserId('');
    setFormTransactionIds('');
    setFormType('');
    setFormDescription('');
    setFormAmount('');
    setFormIndicators('');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          <Policy sx={{ verticalAlign: 'middle', mr: 1 }} />
          Compliance
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="contained" startIcon={<Add />} onClick={() => setCreateOpen(true)}>
            Generar ROS
          </Button>
          <Tooltip title="Actualizar">
            <IconButton onClick={() => { loadData(); loadStats(); loadThresholds(); }}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Stats */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} md={2.4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {stats.totalReports}
                </Typography>
                <Typography variant="body2" color="text.secondary">Reportes (30d)</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={2.4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                  {stats.pendingReviews}
                </Typography>
                <Typography variant="body2" color="text.secondary">Pendientes</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={2.4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main' }}>
                  {stats.thresholdBreaches}
                </Typography>
                <Typography variant="body2" color="text.secondary">Umbrales</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={2.4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                  {stats.byStatus?.find((s: any) => s.status === 'SUBMITTED')?.count || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">Enviados UIF</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={2.4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {stats.avgProcessingTime}h
                </Typography>
                <Typography variant="body2" color="text.secondary">Tiempo Prom.</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Threshold Alerts */}
      {thresholds && thresholds.overThreshold?.length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="subtitle2">
            ⚠️ {thresholds.overThreshold.length} usuarios superaron el umbral UIF hoy
          </Typography>
          {thresholds.overThreshold.slice(0, 3).map((t: any, i: number) => (
            <Typography key={i} variant="body2">
              • {t.userName} ({t.email}): {formatCurrency(t.total)}
            </Typography>
          ))}
        </Alert>
      )}

      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3 }}>
        <Tab label="Reportes" />
        <Tab label="Revisiones Pendientes" />
      </Tabs>

      {/* Tab 0: Reports */}
      {activeTab === 0 && (
        <>
          <Box sx={{ mb: 2 }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Estado</InputLabel>
              <Select value={statusFilter} label="Estado" onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}>
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="DRAFT">Borrador</MenuItem>
                <MenuItem value="PENDING_REVIEW">Pendiente</MenuItem>
                <MenuItem value="APPROVED">Aprobado</MenuItem>
                <MenuItem value="SUBMITTED">Enviado</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Card>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Usuario</TableCell>
                  <TableCell align="right">Monto</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Ref. UIF</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id} hover>
                    <TableCell>{format(new Date(report.created_at), 'dd/MM HH:mm')}</TableCell>
                    <TableCell>
                      <Chip
                        label={typeLabels[report.type] || report.type}
                        size="small"
                        icon={report.type === 'ROS' ? <Warning /> : <Description />}
                        color={report.type === 'ROS' ? 'error' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{report.users?.first_name} {report.users?.last_name}</Typography>
                      <Typography variant="caption" color="text.secondary">{report.users?.dni}</Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {formatCurrency(parseFloat(report.amount))}
                    </TableCell>
                    <TableCell>
                      <Chip label={report.status} size="small" color={statusColors[report.status]} />
                    </TableCell>
                    <TableCell>
                      {report.external_reference && (
                        <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                          {report.external_reference}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Ver Detalle">
                          <IconButton size="small" onClick={() => { setSelectedReport(report); setDetailOpen(true); }}>
                            <Description />
                          </IconButton>
                        </Tooltip>
                        {report.status === 'PENDING_REVIEW' && (
                          <Tooltip title="Aprobar">
                            <IconButton size="small" color="success" onClick={() => { setSelectedReport(report); setApproveOpen(true); }}>
                              <CheckCircle />
                            </IconButton>
                          </Tooltip>
                        )}
                        {report.status === 'APPROVED' && (
                          <Tooltip title="Enviar a UIF">
                            <IconButton size="small" color="primary" onClick={() => handleSubmit(report.id)}>
                              <Send />
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
              count={totalReports}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={20}
              rowsPerPageOptions={[20]}
            />
          </Card>
        </>
      )}

      {/* Tab 1: Pending Reviews */}
      {activeTab === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Revisiones Programadas</Typography>
            {pendingReviews.length === 0 ? (
              <Typography color="text.secondary">No hay revisiones pendientes</Typography>
            ) : (
              <List>
                {pendingReviews.map((review) => (
                  <ListItem key={review.id} divider>
                    <ListItemText
                      primary={`${review.users?.first_name} ${review.users?.last_name}`}
                      secondary={review.reason}
                    />
                    <Box sx={{ textAlign: 'right' }}>
                      <Chip
                        icon={<Schedule />}
                        label={`Vence: ${format(new Date(review.due_date), 'dd/MM/yyyy')}`}
                        size="small"
                        color={new Date(review.due_date) < new Date() ? 'error' : 'default'}
                      />
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create ROS Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Generar Reporte de Operación Sospechosa (ROS)</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="User ID"
                value={formUserId}
                onChange={(e) => setFormUserId(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Sospecha</InputLabel>
                <Select value={formType} label="Tipo de Sospecha" onChange={(e) => setFormType(e.target.value)}>
                  <MenuItem value="SMURFING">Smurfing (Fraccionamiento)</MenuItem>
                  <MenuItem value="LAVADO">Lavado de Activos</MenuItem>
                  <MenuItem value="FINANCIAMIENTO_TERRORISMO">Financiamiento del Terrorismo</MenuItem>
                  <MenuItem value="FRAUDE">Fraude</MenuItem>
                  <MenuItem value="OTRO">Otro</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Transaction IDs (separados por coma)"
                value={formTransactionIds}
                onChange={(e) => setFormTransactionIds(e.target.value)}
                helperText="IDs de las transacciones involucradas"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Monto Total"
                type="number"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Indicadores (separados por coma)"
                value={formIndicators}
                onChange={(e) => setFormIndicators(e.target.value)}
                helperText="Ej: multiple_small_tx, same_day, round_amounts"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                multiline
                rows={4}
                placeholder="Descripción detallada de la actividad sospechosa..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setCreateOpen(false); resetForm(); }}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleCreateROS}
            disabled={!formUserId || !formType || !formDescription}
          >
            Generar ROS
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Detalle del Reporte</DialogTitle>
        <DialogContent>
          {selectedReport && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Tipo</Typography>
                  <Typography variant="body1">{typeLabels[selectedReport.type]}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Estado</Typography>
                  <Chip label={selectedReport.status} color={statusColors[selectedReport.status]} />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Usuario</Typography>
                  <Typography variant="body1">
                    {selectedReport.users?.first_name} {selectedReport.users?.last_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    DNI: {selectedReport.users?.dni}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Monto</Typography>
                  <Typography variant="h6">{formatCurrency(parseFloat(selectedReport.amount))}</Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" color="text.secondary">Contenido del Reporte</Typography>
              <Box sx={{ bgcolor: 'grey.900', p: 2, borderRadius: 1, mt: 1, maxHeight: 300, overflow: 'auto' }}>
                <pre style={{ margin: 0, fontSize: 12, whiteSpace: 'pre-wrap' }}>
                  {JSON.stringify(selectedReport.content, null, 2)}
                </pre>
              </Box>

              {selectedReport.external_reference && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  Referencia UIF: {selectedReport.external_reference}
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={approveOpen} onClose={() => setApproveOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Aprobar Reporte</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Una vez aprobado, el reporte estará listo para ser enviado a la UIF.
          </Typography>
          <TextField
            fullWidth
            label="Notas de Aprobación"
            value={approveNotes}
            onChange={(e) => setApproveNotes(e.target.value)}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setApproveOpen(false); setApproveNotes(''); }}>Cancelar</Button>
          <Button variant="contained" color="success" onClick={handleApprove}>
            Aprobar Reporte
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
