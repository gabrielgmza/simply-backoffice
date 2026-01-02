import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Alert,
  Skeleton,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
  ArrowBack,
  Payment,
  Delete,
  CalendarMonth,
  RemoveCircle,
  CheckCircle,
  Warning,
  Schedule,
} from '@mui/icons-material';
import { financingsApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const formatCurrency = (value: number | string) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(num || 0);
};

const statusColors: Record<string, 'success' | 'error' | 'warning' | 'default'> = {
  PENDING: 'warning',
  PAID: 'success',
  OVERDUE: 'error',
  DROPPED: 'default',
};

export default function FinancingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [financing, setFinancing] = useState<any>(null);
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [liquidateDialogOpen, setLiquidateDialogOpen] = useState(false);
  const [waiveDialogOpen, setWaiveDialogOpen] = useState(false);
  const [extendDialogOpen, setExtendDialogOpen] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState<any>(null);
  const [reason, setReason] = useState('');
  const [newDueDate, setNewDueDate] = useState<Date | null>(null);

  useEffect(() => {
    if (id) loadFinancing();
  }, [id]);

  const loadFinancing = async () => {
    try {
      const response = await financingsApi.getById(id!);
      if (response.data.success) {
        setFinancing(response.data.data);
      }
    } catch (error) {
      toast.error('Error al cargar financiación');
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    try {
      await financingsApi.payInstallment(selectedInstallment.id, reason);
      toast.success('Cuota pagada');
      setPayDialogOpen(false);
      setReason('');
      setSelectedInstallment(null);
      loadFinancing();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error');
    }
  };

  const handleLiquidate = async () => {
    try {
      await financingsApi.liquidate(id!, reason);
      toast.success('Financiación liquidada');
      setLiquidateDialogOpen(false);
      setReason('');
      loadFinancing();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error');
    }
  };

  const handleWaive = async () => {
    try {
      await financingsApi.waivePenalty(selectedInstallment.id, reason);
      toast.success('Penalización condonada');
      setWaiveDialogOpen(false);
      setReason('');
      setSelectedInstallment(null);
      loadFinancing();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error');
    }
  };

  const handleExtend = async () => {
    if (!newDueDate) return;
    try {
      await financingsApi.extendDueDate(selectedInstallment.id, newDueDate.toISOString(), reason);
      toast.success('Vencimiento extendido');
      setExtendDialogOpen(false);
      setReason('');
      setNewDueDate(null);
      setSelectedInstallment(null);
      loadFinancing();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error');
    }
  };

  if (loading) {
    return (
      <Box>
        <Skeleton height={60} width={300} sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Skeleton height={300} />
          </Grid>
          <Grid item xs={12} md={8}>
            <Skeleton height={400} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (!financing) {
    return <Alert severity="error">Financiación no encontrada</Alert>;
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate('/financings')}>
          <ArrowBack />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Financiación #{financing.id.slice(0, 8)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {financing.user?.first_name} {financing.user?.last_name} - {financing.user?.email}
          </Typography>
        </Box>
        <Chip
          label={financing.status}
          color={
            financing.status === 'ACTIVE' ? 'success' :
            financing.status === 'COMPLETED' ? 'default' :
            'error'
          }
          sx={{ fontWeight: 600 }}
        />
        
        {financing.status === 'ACTIVE' && hasPermission('financings:liquidate') && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={() => setLiquidateDialogOpen(true)}
          >
            Liquidar
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Info Panel */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Resumen
              </Typography>

              <Box sx={{ '& > div': { mb: 2, display: 'flex', justifyContent: 'space-between' } }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Monto Total</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {formatCurrency(financing.amount)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Cuotas</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {financing.installments} x {formatCurrency(financing.installment_amount)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Restante</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, color: 'warning.main' }}>
                    {formatCurrency(financing.remaining)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Próximo Vencimiento</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {financing.next_due_date 
                      ? format(new Date(financing.next_due_date), "dd/MM/yyyy")
                      : '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Fecha Inicio</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {format(new Date(financing.started_at), "dd/MM/yyyy")}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Estado de Cuotas
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'success.main' + '20', borderRadius: 2 }}>
                    <CheckCircle sx={{ color: 'success.main' }} />
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {financing.stats?.installmentsPaid || 0}
                    </Typography>
                    <Typography variant="caption">Pagadas</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'warning.main' + '20', borderRadius: 2 }}>
                    <Schedule sx={{ color: 'warning.main' }} />
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {financing.stats?.installmentsPending || 0}
                    </Typography>
                    <Typography variant="caption">Pendientes</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'error.main' + '20', borderRadius: 2 }}>
                    <Warning sx={{ color: 'error.main' }} />
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {financing.stats?.installmentsOverdue || 0}
                    </Typography>
                    <Typography variant="caption">Vencidas</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'background.default', borderRadius: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'error.main' }}>
                      {formatCurrency(financing.stats?.totalPenalties || 0)}
                    </Typography>
                    <Typography variant="caption">Penalizaciones</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Investment */}
          {financing.investment && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Inversión Garantía
                </Typography>
                <Box sx={{ '& > div': { mb: 1 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Valor Actual</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: 'success.main' }}>
                      {formatCurrency(financing.investment.current_value)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Estado</Typography>
                    <Chip
                      label={financing.investment.status}
                      size="small"
                      color={financing.investment.status === 'ACTIVE' ? 'success' : 'default'}
                    />
                  </Box>
                </Box>
                <Button
                  size="small"
                  fullWidth
                  sx={{ mt: 1 }}
                  onClick={() => navigate(`/investments/${financing.investment.id}`)}
                >
                  Ver Inversión
                </Button>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Installments Table */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Cuotas
              </Typography>
              
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Vencimiento</TableCell>
                    <TableCell align="right">Monto</TableCell>
                    <TableCell align="right">Penalización</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {financing.installment_records?.map((inst: any) => (
                    <TableRow key={inst.id}>
                      <TableCell>{inst.number}</TableCell>
                      <TableCell>
                        {format(new Date(inst.due_date), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell align="right">{formatCurrency(inst.amount)}</TableCell>
                      <TableCell align="right" sx={{ color: parseFloat(inst.penalty_amount) > 0 ? 'error.main' : 'inherit' }}>
                        {parseFloat(inst.penalty_amount) > 0 ? formatCurrency(inst.penalty_amount) : '-'}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 500 }}>
                        {formatCurrency(inst.total_due)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={inst.status}
                          size="small"
                          color={statusColors[inst.status] || 'default'}
                        />
                      </TableCell>
                      <TableCell align="center">
                        {inst.status !== 'PAID' && inst.status !== 'DROPPED' && hasPermission('financings:pay') && (
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                            <IconButton
                              size="small"
                              color="success"
                              title="Pagar"
                              onClick={() => {
                                setSelectedInstallment(inst);
                                setPayDialogOpen(true);
                              }}
                            >
                              <Payment fontSize="small" />
                            </IconButton>
                            
                            {parseFloat(inst.penalty_amount) > 0 && hasPermission('financings:waive') && (
                              <IconButton
                                size="small"
                                color="warning"
                                title="Condonar penalización"
                                onClick={() => {
                                  setSelectedInstallment(inst);
                                  setWaiveDialogOpen(true);
                                }}
                              >
                                <RemoveCircle fontSize="small" />
                              </IconButton>
                            )}
                            
                            {hasPermission('financings:update') && (
                              <IconButton
                                size="small"
                                color="primary"
                                title="Extender vencimiento"
                                onClick={() => {
                                  setSelectedInstallment(inst);
                                  setNewDueDate(new Date(inst.due_date));
                                  setExtendDialogOpen(true);
                                }}
                              >
                                <CalendarMonth fontSize="small" />
                              </IconButton>
                            )}
                          </Box>
                        )}
                        {inst.status === 'PAID' && (
                          <Typography variant="caption" color="text.secondary">
                            {inst.paid_at ? format(new Date(inst.paid_at), "dd/MM") : '-'}
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Pay Dialog */}
      <Dialog open={payDialogOpen} onClose={() => setPayDialogOpen(false)}>
        <DialogTitle>Pagar Cuota #{selectedInstallment?.number}</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Total a pagar: {formatCurrency(selectedInstallment?.total_due || 0)}
          </Alert>
          <TextField
            fullWidth
            label="Motivo"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            multiline
            rows={2}
            placeholder="Ej: Pago recibido en efectivo"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPayDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handlePay} disabled={!reason.trim()}>
            Confirmar Pago
          </Button>
        </DialogActions>
      </Dialog>

      {/* Liquidate Dialog */}
      <Dialog open={liquidateDialogOpen} onClose={() => setLiquidateDialogOpen(false)}>
        <DialogTitle>Liquidar Financiación</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            Se cobrará una penalización del 3% sobre el saldo restante y se liquidará la inversión garantía.
          </Alert>
          <Box sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="body2">Saldo restante: {formatCurrency(financing.remaining)}</Typography>
            <Typography variant="body2">Penalización estimada: {formatCurrency(parseFloat(financing.remaining) * 0.03)}</Typography>
          </Box>
          <TextField
            fullWidth
            label="Motivo"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLiquidateDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleLiquidate} disabled={!reason.trim()}>
            Liquidar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Waive Dialog */}
      <Dialog open={waiveDialogOpen} onClose={() => setWaiveDialogOpen(false)}>
        <DialogTitle>Condonar Penalización</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Se eliminará la penalización de {formatCurrency(selectedInstallment?.penalty_amount || 0)} de la cuota #{selectedInstallment?.number}
          </Alert>
          <TextField
            fullWidth
            label="Motivo"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            multiline
            rows={2}
            placeholder="Ej: Gesto comercial por antigüedad"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWaiveDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleWaive} disabled={!reason.trim()}>
            Condonar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Extend Dialog */}
      <Dialog open={extendDialogOpen} onClose={() => setExtendDialogOpen(false)}>
        <DialogTitle>Extender Vencimiento</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2, mt: 1 }}>
            <DatePicker
              label="Nueva fecha de vencimiento"
              value={newDueDate}
              onChange={(date) => setNewDueDate(date)}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Box>
          <TextField
            fullWidth
            label="Motivo"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            multiline
            rows={2}
            placeholder="Ej: Solicitud del usuario por viaje"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExtendDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleExtend} disabled={!reason.trim() || !newDueDate}>
            Extender
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
