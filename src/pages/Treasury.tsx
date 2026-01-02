import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  AccountBalance,
  Add,
  ArrowUpward,
  ArrowDownward,
  SwapHoriz,
  Refresh,
  TrendingUp,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import api from '../services/api';

const formatCurrency = (value: number, currency: string = 'ARS') => {
  if (currency === 'USD' || currency === 'USDT') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  }
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(value);
};

const typeColors: Record<string, string> = {
  main: '#6366f1',
  fci: '#10b981',
  fees: '#f59e0b',
  penalties: '#ef4444',
  otc: '#8b5cf6',
};

export default function Treasury() {
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [cashflow, setCashflow] = useState<any>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [movements, setMovements] = useState<any[]>([]);
  
  // Dialogs
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  
  // Form
  const [formAccountId, setFormAccountId] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formToAccountId, setFormToAccountId] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [accountsRes, summaryRes, cashflowRes] = await Promise.all([
        api.get('/api/backoffice/treasury/accounts'),
        api.get('/api/backoffice/treasury/summary'),
        api.get('/api/backoffice/treasury/cashflow'),
      ]);

      if (accountsRes.data.success) setAccounts(accountsRes.data.data);
      if (summaryRes.data.success) setSummary(summaryRes.data.data);
      if (cashflowRes.data.success) setCashflow(cashflowRes.data.data);
    } catch (error) {
      toast.error('Error al cargar datos de tesorería');
    } finally {
      setLoading(false);
    }
  };

  const loadMovements = async (accountId: string) => {
    try {
      const res = await api.get(`/backoffice/treasury/accounts/${accountId}/movements`);
      if (res.data.success) {
        setMovements(res.data.data.movements);
      }
    } catch (error) {
      toast.error('Error al cargar movimientos');
    }
  };

  const handleDeposit = async () => {
    try {
      await api.post('/api/backoffice/treasury/deposit', {
        accountId: formAccountId,
        amount: parseFloat(formAmount),
        description: formDescription,
      });
      toast.success('Depósito realizado');
      setDepositOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error');
    }
  };

  const handleWithdraw = async () => {
    try {
      await api.post('/api/backoffice/treasury/withdraw', {
        accountId: formAccountId,
        amount: parseFloat(formAmount),
        description: formDescription,
      });
      toast.success('Retiro realizado');
      setWithdrawOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error');
    }
  };

  const handleTransfer = async () => {
    try {
      await api.post('/api/backoffice/treasury/transfer', {
        fromAccountId: formAccountId,
        toAccountId: formToAccountId,
        amount: parseFloat(formAmount),
        description: formDescription,
      });
      toast.success('Transferencia realizada');
      setTransferOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error');
    }
  };

  const resetForm = () => {
    setFormAccountId('');
    setFormAmount('');
    setFormDescription('');
    setFormToAccountId('');
  };

  const groupedAccounts = accounts.reduce((acc, account) => {
    if (!acc[account.type]) acc[account.type] = [];
    acc[account.type].push(account);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Tesorería
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<ArrowUpward />} onClick={() => setDepositOpen(true)}>
            Depositar
          </Button>
          <Button variant="outlined" startIcon={<ArrowDownward />} onClick={() => setWithdrawOpen(true)}>
            Retirar
          </Button>
          <Button variant="contained" startIcon={<SwapHoriz />} onClick={() => setTransferOpen(true)}>
            Transferir
          </Button>
          <Tooltip title="Actualizar">
            <IconButton onClick={loadData}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Summary Cards */}
      {summary && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {summary.byCurrency?.map((curr: any) => (
            <Grid item xs={12} sm={4} key={curr.currency}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <AccountBalance sx={{ color: 'primary.main', fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {formatCurrency(curr.total, curr.currency)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total {curr.currency}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3 }}>
        <Tab label="Cuentas" />
        <Tab label="Flujo de Caja" />
        <Tab label="Movimientos Recientes" />
      </Tabs>

      {/* Tab 0: Cuentas */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {Object.entries(groupedAccounts).map(([type, accs]) => (
            <Grid item xs={12} md={6} key={type}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: typeColors[type] || '#6366f1',
                      }}
                    />
                    <Typography variant="h6" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                      {type === 'main' ? 'Principal' : type === 'fci' ? 'FCI' : type}
                    </Typography>
                  </Box>
                  
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Cuenta</TableCell>
                        <TableCell>Moneda</TableCell>
                        <TableCell align="right">Saldo</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(accs as any[]).map((acc) => (
                        <TableRow
                          key={acc.id}
                          hover
                          onClick={() => {
                            setSelectedAccount(acc);
                            loadMovements(acc.id);
                          }}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell>{acc.name}</TableCell>
                          <TableCell>
                            <Chip label={acc.currency} size="small" />
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            {formatCurrency(parseFloat(acc.balance), acc.currency)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Tab 1: Flujo de Caja */}
      {activeTab === 1 && cashflow && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Flujo de Caja (30 días)
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={cashflow.byDay}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="date" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <ChartTooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: '1px solid #334155',
                          borderRadius: 8,
                        }}
                      />
                      <Line type="monotone" dataKey="in" stroke="#10b981" strokeWidth={2} name="Ingresos" />
                      <Line type="monotone" dataKey="out" stroke="#ef4444" strokeWidth={2} name="Egresos" />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Resumen
                </Typography>
                <Box sx={{ '& > div': { mb: 2, display: 'flex', justifyContent: 'space-between' } }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Depósitos</Typography>
                    <Typography variant="h6" sx={{ color: 'success.main' }}>
                      +{formatCurrency(cashflow.deposits)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Retiros</Typography>
                    <Typography variant="h6" sx={{ color: 'error.main' }}>
                      -{formatCurrency(cashflow.withdrawals)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Comisiones</Typography>
                    <Typography variant="h6" sx={{ color: 'warning.main' }}>
                      +{formatCurrency(cashflow.fees)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Penalizaciones</Typography>
                    <Typography variant="h6" sx={{ color: 'warning.main' }}>
                      +{formatCurrency(cashflow.penalties)}
                    </Typography>
                  </Box>
                  <Box sx={{ pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2" color="text.secondary">Neto</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: cashflow.net >= 0 ? 'success.main' : 'error.main' }}>
                      {cashflow.net >= 0 ? '+' : ''}{formatCurrency(cashflow.net)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tab 2: Movimientos */}
      {activeTab === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Últimos Movimientos
            </Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Cuenta</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell align="right">Monto</TableCell>
                  <TableCell align="right">Saldo</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {summary?.recentMovements?.map((mov: any) => (
                  <TableRow key={mov.id}>
                    <TableCell>{format(new Date(mov.created_at), 'dd/MM HH:mm')}</TableCell>
                    <TableCell>{mov.internal_accounts?.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={mov.type}
                        size="small"
                        color={
                          mov.type === 'DEPOSIT' ? 'success' :
                          mov.type === 'WITHDRAWAL' ? 'error' :
                          'default'
                        }
                      />
                    </TableCell>
                    <TableCell>{mov.description}</TableCell>
                    <TableCell align="right" sx={{
                      color: ['DEPOSIT', 'FEE', 'PENALTY'].includes(mov.type) ? 'success.main' : 'error.main',
                      fontWeight: 500,
                    }}>
                      {['DEPOSIT', 'FEE', 'PENALTY'].includes(mov.type) ? '+' : '-'}
                      {formatCurrency(parseFloat(mov.amount), mov.internal_accounts?.currency)}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(parseFloat(mov.balance_after), mov.internal_accounts?.currency)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Deposit Dialog */}
      <Dialog open={depositOpen} onClose={() => setDepositOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Depositar</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1, mb: 2 }}>
            <InputLabel>Cuenta</InputLabel>
            <Select value={formAccountId} label="Cuenta" onChange={(e) => setFormAccountId(e.target.value)}>
              {accounts.map((acc) => (
                <MenuItem key={acc.id} value={acc.id}>
                  {acc.name} ({acc.currency})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Monto"
            type="number"
            value={formAmount}
            onChange={(e) => setFormAmount(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Descripción"
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDepositOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleDeposit} disabled={!formAccountId || !formAmount}>
            Depositar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={withdrawOpen} onClose={() => setWithdrawOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Retirar</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1, mb: 2 }}>
            <InputLabel>Cuenta</InputLabel>
            <Select value={formAccountId} label="Cuenta" onChange={(e) => setFormAccountId(e.target.value)}>
              {accounts.map((acc) => (
                <MenuItem key={acc.id} value={acc.id}>
                  {acc.name} - Saldo: {formatCurrency(parseFloat(acc.balance), acc.currency)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Monto"
            type="number"
            value={formAmount}
            onChange={(e) => setFormAmount(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Descripción"
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWithdrawOpen(false)}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleWithdraw} disabled={!formAccountId || !formAmount}>
            Retirar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={transferOpen} onClose={() => setTransferOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Transferir entre Cuentas</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1, mb: 2 }}>
            <InputLabel>Desde</InputLabel>
            <Select value={formAccountId} label="Desde" onChange={(e) => setFormAccountId(e.target.value)}>
              {accounts.map((acc) => (
                <MenuItem key={acc.id} value={acc.id}>
                  {acc.name} - {formatCurrency(parseFloat(acc.balance), acc.currency)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Hacia</InputLabel>
            <Select value={formToAccountId} label="Hacia" onChange={(e) => setFormToAccountId(e.target.value)}>
              {accounts.filter(a => a.id !== formAccountId).map((acc) => (
                <MenuItem key={acc.id} value={acc.id}>
                  {acc.name} ({acc.currency})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Monto"
            type="number"
            value={formAmount}
            onChange={(e) => setFormAmount(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Descripción"
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTransferOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleTransfer}
            disabled={!formAccountId || !formToAccountId || !formAmount}
          >
            Transferir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
