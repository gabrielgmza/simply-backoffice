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
  LinearProgress,
} from '@mui/material';
import {
  ArrowBack,
  TrendingUp,
  AccountBalance,
  CreditCard,
  Edit,
  Delete,
} from '@mui/icons-material';
import { investmentsApi } from '../services/api';
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

export default function InvestmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [investment, setInvestment] = useState<any>(null);
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [liquidateDialogOpen, setLiquidateDialogOpen] = useState(false);
  const [newValue, setNewValue] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (id) loadInvestment();
  }, [id]);

  const loadInvestment = async () => {
    try {
      const response = await investmentsApi.getById(id!);
      if (response.data.success) {
        setInvestment(response.data.data);
        setNewValue(response.data.data.current_value?.toString() || '');
      }
    } catch (error) {
      toast.error('Error al cargar inversión');
    } finally {
      setLoading(false);
    }
  };

  const handleAdjust = async () => {
    try {
      await investmentsApi.adjustValue(id!, parseFloat(newValue), reason);
      toast.success('Valor ajustado');
      setAdjustDialogOpen(false);
      setReason('');
      loadInvestment();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error');
    }
  };

  const handleLiquidate = async () => {
    try {
      await investmentsApi.liquidate(id!, reason);
      toast.success('Inversión liquidada');
      setLiquidateDialogOpen(false);
      setReason('');
      loadInvestment();
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
            <Skeleton height={300} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (!investment) {
    return <Alert severity="error">Inversión no encontrada</Alert>;
  }

  const creditUsedPct = parseFloat(investment.credit_limit) > 0
    ? (parseFloat(investment.credit_used) / parseFloat(investment.credit_limit) * 100)
    : 0;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate('/investments')}>
          <ArrowBack />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Inversión #{investment.id.slice(0, 8)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {investment.user?.first_name} {investment.user?.last_name} - {investment.user?.email}
          </Typography>
        </Box>
        <Chip
          label={investment.status}
          color={investment.status === 'ACTIVE' ? 'success' : 'default'}
          sx={{ fontWeight: 600 }}
        />
        
        {investment.status === 'ACTIVE' && hasPermission('investments:update') && (
          <>
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={() => setAdjustDialogOpen(true)}
            >
              Ajustar Valor
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={() => setLiquidateDialogOpen(true)}
            >
              Liquidar
            </Button>
          </>
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

              <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 2, textAlign: 'center' }}>
                <TrendingUp sx={{ color: 'success.main', fontSize: 40, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                  {formatCurrency(investment.current_value)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Valor Actual
                </Typography>
              </Box>

              <Box sx={{ '& > div': { mb: 2, display: 'flex', justifyContent: 'space-between' } }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Monto Inicial</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {formatCurrency(investment.amount)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Rendimientos</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, color: 'primary.main' }}>
                    +{formatCurrency(investment.returns_earned)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Tasa Anual</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {investment.annual_rate}%
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Tipo FCI</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {investment.fci_type}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Fecha Inicio</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {format(new Date(investment.started_at), "dd/MM/yyyy")}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Credit Info */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                <CreditCard sx={{ mr: 1, verticalAlign: 'middle' }} />
                Crédito Disponible
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Usado</Typography>
                  <Typography variant="body2">
                    {formatCurrency(investment.credit_used)} / {formatCurrency(investment.credit_limit)}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={creditUsedPct}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: 'background.default',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: creditUsedPct > 80 ? 'error.main' : creditUsedPct > 50 ? 'warning.main' : 'success.main',
                    },
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Disponible</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                    {formatCurrency(investment.stats?.creditAvailable || 0)}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" color="text.secondary">Financiaciones</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {investment.stats?.activeFinancings || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Returns History */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Historial de Rendimientos
              </Typography>
              
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Fecha</TableCell>
                    <TableCell align="right">Valor Base</TableCell>
                    <TableCell align="right">Tasa</TableCell>
                    <TableCell align="right">Rendimiento</TableCell>
                    <TableCell align="right">Valor Final</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {investment.returns?.map((ret: any) => (
                    <TableRow key={ret.id}>
                      <TableCell>
                        {format(new Date(ret.return_date), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell align="right">{formatCurrency(ret.base_value)}</TableCell>
                      <TableCell align="right">{ret.rate_applied}%</TableCell>
                      <TableCell align="right" sx={{ color: 'success.main', fontWeight: 500 }}>
                        +{formatCurrency(ret.return_amount)}
                      </TableCell>
                      <TableCell align="right">{formatCurrency(ret.final_value)}</TableCell>
                    </TableRow>
                  ))}
                  {(!investment.returns || investment.returns.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography color="text.secondary">Sin rendimientos registrados</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Financings */}
          {investment.financings?.length > 0 && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Financiaciones Asociadas
                </Typography>
                
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell align="right">Monto</TableCell>
                      <TableCell>Cuotas</TableCell>
                      <TableCell align="right">Restante</TableCell>
                      <TableCell>Estado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {investment.financings.map((fin: any) => (
                      <TableRow
                        key={fin.id}
                        hover
                        onClick={() => navigate(`/financings/${fin.id}`)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>{fin.id.slice(0, 8)}</TableCell>
                        <TableCell align="right">{formatCurrency(fin.amount)}</TableCell>
                        <TableCell>{fin.installments} cuotas</TableCell>
                        <TableCell align="right">{formatCurrency(fin.remaining)}</TableCell>
                        <TableCell>
                          <Chip
                            label={fin.status}
                            size="small"
                            color={fin.status === 'ACTIVE' ? 'success' : fin.status === 'COMPLETED' ? 'default' : 'error'}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Adjust Dialog */}
      <Dialog open={adjustDialogOpen} onClose={() => setAdjustDialogOpen(false)}>
        <DialogTitle>Ajustar Valor de Inversión</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Este cambio afectará el límite de crédito disponible
          </Alert>
          <TextField
            fullWidth
            label="Nuevo Valor"
            type="number"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Motivo del ajuste"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            multiline
            rows={2}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAdjustDialogOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleAdjust}
            disabled={!reason.trim()}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Liquidate Dialog */}
      <Dialog open={liquidateDialogOpen} onClose={() => setLiquidateDialogOpen(false)}>
        <DialogTitle>Liquidar Inversión</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            Esta acción es irreversible. El valor actual ({formatCurrency(investment.current_value)}) 
            será acreditado en la cuenta del usuario.
          </Alert>
          
          {investment.stats?.activeFinancings > 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Esta inversión tiene {investment.stats.activeFinancings} financiación(es) activa(s).
              Debes liquidarlas primero.
            </Alert>
          )}

          <TextField
            fullWidth
            label="Motivo de la liquidación"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            multiline
            rows={3}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLiquidateDialogOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleLiquidate}
            disabled={!reason.trim() || investment.stats?.activeFinancings > 0}
          >
            Liquidar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
