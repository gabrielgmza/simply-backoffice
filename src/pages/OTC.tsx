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
  Alert,
} from '@mui/material';
import {
  CurrencyExchange,
  Refresh,
  CheckCircle,
  Cancel,
  PlayArrow,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import api from '../services/api';

const formatCurrency = (value: number, currency: string = 'ARS') => {
  if (currency === 'USD' || currency === 'USDT') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  }
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(value);
};

const statusColors: Record<string, 'default' | 'warning' | 'success' | 'error' | 'info'> = {
  PENDING: 'warning',
  APPROVED: 'info',
  EXECUTED: 'success',
  CANCELLED: 'default',
  REJECTED: 'error',
};

export default function OTC() {
  const [loading, setLoading] = useState(true);
  const [operations, setOperations] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rates, setRates] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Dialogs
  const [createOpen, setCreateOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [selectedOp, setSelectedOp] = useState<any>(null);

  // Form
  const [formUserId, setFormUserId] = useState('');
  const [formType, setFormType] = useState<'BUY' | 'SELL'>('BUY');
  const [formAsset, setFormAsset] = useState<'USD' | 'USDT'>('USD');
  const [formAmount, setFormAmount] = useState('');
  const [quote, setQuote] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    loadData();
    loadRates();
    loadStats();
  }, [page, statusFilter]);

  const loadData = async () => {
    try {
      const params: any = { page: page + 1, limit: 20 };
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/api/backoffice/otc/operations', { params });
      if (res.data.success) {
        setOperations(res.data.data.operations);
        setTotal(res.data.data.total);
      }
    } catch (error) {
      toast.error('Error al cargar operaciones');
    } finally {
      setLoading(false);
    }
  };

  const loadRates = async () => {
    try {
      const res = await api.get('/api/backoffice/otc/rates');
      if (res.data.success) setRates(res.data.data);
    } catch (error) {
      console.error('Error loading rates');
    }
  };

  const loadStats = async () => {
    try {
      const res = await api.get('/api/backoffice/otc/stats');
      if (res.data.success) setStats(res.data.data);
    } catch (error) {
      console.error('Error loading stats');
    }
  };

  const getQuote = async () => {
    if (!formAmount || parseFloat(formAmount) <= 0) return;
    try {
      const res = await api.post('/api/backoffice/otc/quote', {
        asset: formAsset,
        type: formType,
        amount: parseFloat(formAmount),
      });
      if (res.data.success) setQuote(res.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al obtener cotización');
    }
  };

  const handleCreate = async () => {
    if (!quote || !formUserId) return;
    try {
      await api.post('/api/backoffice/otc/operations', {
        userId: formUserId,
        type: formType,
        asset: formAsset,
        amount: parseFloat(formAmount),
        rate: quote.rate,
        totalARS: quote.totalARS,
        fee: quote.fee,
      });
      toast.success('Operación creada');
      setCreateOpen(false);
      resetForm();
      loadData();
      loadStats();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.post(`/backoffice/otc/operations/${id}/approve`);
      toast.success('Operación aprobada');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error');
    }
  };

  const handleExecute = async (id: string) => {
    try {
      await api.post(`/backoffice/otc/operations/${id}/execute`);
      toast.success('Operación ejecutada');
      loadData();
      loadStats();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error');
    }
  };

  const handleReject = async () => {
    if (!selectedOp || !rejectReason) return;
    try {
      await api.post(`/backoffice/otc/operations/${selectedOp.id}/reject`, {
        reason: rejectReason,
      });
      toast.success('Operación rechazada');
      setRejectOpen(false);
      setSelectedOp(null);
      setRejectReason('');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error');
    }
  };

  const resetForm = () => {
    setFormUserId('');
    setFormType('BUY');
    setFormAsset('USD');
    setFormAmount('');
    setQuote(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          OTC - Operaciones
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="contained" startIcon={<CurrencyExchange />} onClick={() => setCreateOpen(true)}>
            Nueva Operación
          </Button>
          <Tooltip title="Actualizar">
            <IconButton onClick={() => { loadData(); loadRates(); loadStats(); }}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Rates Card */}
      {rates && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Cotizaciones Actuales
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">USD Compra</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: 'error.main' }}>
                    ${rates.USD?.buy?.toLocaleString()}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">USD Venta</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main' }}>
                    ${rates.USD?.sell?.toLocaleString()}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">USDT Compra</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: 'error.main' }}>
                    ${rates.USDT?.buy?.toLocaleString()}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">USDT Venta</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main' }}>
                    ${rates.USDT?.sell?.toLocaleString()}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {stats.operationCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">Operaciones (30d)</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {formatCurrency(stats.totalVolume?.ARS || 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">Volumen ARS</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                  {formatCurrency(stats.totalFees || 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">Comisiones</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {formatCurrency(stats.avgSize || 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">Promedio</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Box sx={{ mb: 2 }}>
        <ToggleButtonGroup
          value={statusFilter}
          exclusive
          onChange={(_, v) => { setStatusFilter(v || ''); setPage(0); }}
          size="small"
        >
          <ToggleButton value="">Todas</ToggleButton>
          <ToggleButton value="PENDING">Pendientes</ToggleButton>
          <ToggleButton value="APPROVED">Aprobadas</ToggleButton>
          <ToggleButton value="EXECUTED">Ejecutadas</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Table */}
      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Usuario</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Asset</TableCell>
              <TableCell align="right">Cantidad</TableCell>
              <TableCell align="right">Tasa</TableCell>
              <TableCell align="right">Total ARS</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {operations.map((op) => (
              <TableRow key={op.id} hover>
                <TableCell>{format(new Date(op.created_at), 'dd/MM HH:mm')}</TableCell>
                <TableCell>
                  <Typography variant="body2">{op.users?.first_name} {op.users?.last_name}</Typography>
                  <Typography variant="caption" color="text.secondary">{op.users?.email}</Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    icon={op.type === 'BUY' ? <TrendingUp /> : <TrendingDown />}
                    label={op.type === 'BUY' ? 'Compra' : 'Venta'}
                    size="small"
                    color={op.type === 'BUY' ? 'error' : 'success'}
                  />
                </TableCell>
                <TableCell>{op.asset}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  {formatCurrency(parseFloat(op.amount), op.asset)}
                </TableCell>
                <TableCell align="right">${parseFloat(op.rate).toLocaleString()}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  {formatCurrency(parseFloat(op.total_ars))}
                </TableCell>
                <TableCell>
                  <Chip label={op.status} size="small" color={statusColors[op.status]} />
                </TableCell>
                <TableCell>
                  {op.status === 'PENDING' && (
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Aprobar">
                        <IconButton size="small" color="success" onClick={() => handleApprove(op.id)}>
                          <CheckCircle />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Rechazar">
                        <IconButton size="small" color="error" onClick={() => { setSelectedOp(op); setRejectOpen(true); }}>
                          <Cancel />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                  {op.status === 'APPROVED' && (
                    <Tooltip title="Ejecutar">
                      <IconButton size="small" color="primary" onClick={() => handleExecute(op.id)}>
                        <PlayArrow />
                      </IconButton>
                    </Tooltip>
                  )}
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

      {/* Create Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nueva Operación OTC</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="User ID"
            value={formUserId}
            onChange={(e) => setFormUserId(e.target.value)}
            sx={{ mt: 1, mb: 2 }}
            helperText="ID del usuario que realiza la operación"
          />
          
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Select value={formType} label="Tipo" onChange={(e) => setFormType(e.target.value as any)}>
                  <MenuItem value="BUY">Compra (Usuario compra USD)</MenuItem>
                  <MenuItem value="SELL">Venta (Usuario vende USD)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Asset</InputLabel>
                <Select value={formAsset} label="Asset" onChange={(e) => setFormAsset(e.target.value as any)}>
                  <MenuItem value="USD">USD</MenuItem>
                  <MenuItem value="USDT">USDT</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <TextField
            fullWidth
            label={`Cantidad ${formAsset}`}
            type="number"
            value={formAmount}
            onChange={(e) => setFormAmount(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Button variant="outlined" onClick={getQuote} disabled={!formAmount}>
            Obtener Cotización
          </Button>

          {quote && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Tasa:</strong> ${quote.rate?.toLocaleString()} ARS/{formAsset}
              </Typography>
              <Typography variant="body2">
                <strong>Subtotal:</strong> {formatCurrency(quote.totalARS)}
              </Typography>
              <Typography variant="body2">
                <strong>Comisión:</strong> {formatCurrency(quote.fee)}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 700, mt: 1 }}>
                {formType === 'BUY' ? 'Usuario paga:' : 'Usuario recibe:'} {formatCurrency(quote.netAmount)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Válido hasta: {format(new Date(quote.validUntil), 'HH:mm:ss')}
              </Typography>
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setCreateOpen(false); resetForm(); }}>Cancelar</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!quote || !formUserId}>
            Crear Operación
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectOpen} onClose={() => setRejectOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Rechazar Operación</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            ¿Está seguro de rechazar esta operación?
          </Typography>
          <TextField
            fullWidth
            label="Motivo del rechazo"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            multiline
            rows={3}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setRejectOpen(false); setRejectReason(''); }}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleReject} disabled={!rejectReason}>
            Rechazar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
