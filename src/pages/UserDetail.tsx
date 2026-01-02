import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Avatar,
  Button,
  Tabs,
  Tab,
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
  Skeleton,
  Alert,
  IconButton,
} from '@mui/material';
import {
  ArrowBack,
  Block,
  CheckCircle,
  Edit,
  Warning,
  TrendingUp,
  CreditCard,
  AccountBalance,
  Flag,
} from '@mui/icons-material';
import { usersApi } from '../services/api';
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

const levelColors: Record<string, string> = {
  PLATA: '#94a3b8',
  ORO: '#fbbf24',
  BLACK: '#475569',
  DIAMANTE: '#818cf8',
};

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [limitsDialogOpen, setLimitsDialogOpen] = useState(false);
  const [dailyLimit, setDailyLimit] = useState('');
  const [monthlyLimit, setMonthlyLimit] = useState('');
  const [limitsReason, setLimitsReason] = useState('');
  const [levelDialogOpen, setLevelDialogOpen] = useState(false);
  const [newLevel, setNewLevel] = useState('');
  const [levelReason, setLevelReason] = useState('');
  const [flagDialogOpen, setFlagDialogOpen] = useState(false);
  const [flagType, setFlagType] = useState('');
  const [flagSeverity, setFlagSeverity] = useState('medium');
  const [flagDescription, setFlagDescription] = useState('');

  useEffect(() => {
    if (id) loadProfile();
  }, [id]);

  const loadProfile = async () => {
    try {
      const response = await usersApi.getFullProfile(id!);
      if (response.data.success) {
        setProfile(response.data.data);
        setDailyLimit(response.data.data.account?.dailyLimit?.toString() || '');
        setMonthlyLimit(response.data.data.account?.monthlyLimit?.toString() || '');
        setNewLevel(response.data.data.user?.userLevel || '');
      }
    } catch (error) {
      toast.error('Error al cargar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = async () => {
    try {
      if (profile.user.status === 'BLOCKED') {
        await usersApi.unblock(id!, blockReason);
        toast.success('Usuario desbloqueado');
      } else {
        await usersApi.block(id!, blockReason);
        toast.success('Usuario bloqueado');
      }
      setBlockDialogOpen(false);
      setBlockReason('');
      loadProfile();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error');
    }
  };

  const handleUpdateLimits = async () => {
    try {
      await usersApi.adjustLimits(id!, {
        dailyLimit: parseFloat(dailyLimit),
        monthlyLimit: parseFloat(monthlyLimit),
      }, limitsReason);
      toast.success('Límites actualizados');
      setLimitsDialogOpen(false);
      setLimitsReason('');
      loadProfile();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error');
    }
  };

  const handleUpdateLevel = async () => {
    try {
      await usersApi.updateLevel(id!, newLevel, levelReason);
      toast.success('Nivel actualizado');
      setLevelDialogOpen(false);
      setLevelReason('');
      loadProfile();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error');
    }
  };

  const handleAddFlag = async () => {
    try {
      await usersApi.addRiskFlag(id!, {
        type: flagType,
        severity: flagSeverity,
        description: flagDescription,
      });
      toast.success('Flag agregado');
      setFlagDialogOpen(false);
      setFlagType('');
      setFlagDescription('');
      loadProfile();
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
            <Skeleton height={400} />
          </Grid>
          <Grid item xs={12} md={8}>
            <Skeleton height={400} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box>
        <Alert severity="error">Usuario no encontrado</Alert>
      </Box>
    );
  }

  const { user, account, financialSummary, investments, financings, risk } = profile;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate('/users')}>
          <ArrowBack />
        </IconButton>
        <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: '1.5rem' }}>
          {user.firstName?.[0]}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {user.firstName} {user.lastName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user.email}
          </Typography>
        </Box>
        <Chip
          label={user.userLevel}
          sx={{
            bgcolor: levelColors[user.userLevel],
            color: user.userLevel === 'BLACK' ? 'white' : 'black',
            fontWeight: 600,
          }}
        />
        <Chip
          label={user.status}
          color={user.status === 'ACTIVE' ? 'success' : user.status === 'BLOCKED' ? 'error' : 'warning'}
        />
        {hasPermission('users:block') && (
          <Button
            variant={user.status === 'BLOCKED' ? 'contained' : 'outlined'}
            color={user.status === 'BLOCKED' ? 'success' : 'error'}
            startIcon={user.status === 'BLOCKED' ? <CheckCircle /> : <Block />}
            onClick={() => setBlockDialogOpen(true)}
          >
            {user.status === 'BLOCKED' ? 'Desbloquear' : 'Bloquear'}
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Info Panel */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Información Personal
              </Typography>
              
              <Box sx={{ '& > div': { mb: 2 } }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">DNI</Typography>
                  <Typography variant="body2">{user.dni || '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Teléfono</Typography>
                  <Typography variant="body2">{user.phone || '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">KYC</Typography>
                  <Chip
                    label={user.kycStatus}
                    size="small"
                    color={user.kycStatus === 'APPROVED' ? 'success' : user.kycStatus === 'PENDING' ? 'warning' : 'error'}
                  />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Registro</Typography>
                  <Typography variant="body2">
                    {format(new Date(user.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Último acceso</Typography>
                  <Typography variant="body2">
                    {user.lastLoginAt ? format(new Date(user.lastLoginAt), "dd/MM/yyyy HH:mm") : '-'}
                  </Typography>
                </Box>
              </Box>

              {hasPermission('users:update') && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Edit />}
                  onClick={() => setLevelDialogOpen(true)}
                  fullWidth
                >
                  Cambiar Nivel
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Account Info */}
          {account && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Cuenta
                </Typography>
                
                <Box sx={{ '& > div': { mb: 2 } }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">CVU</Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {account.cvu}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Alias</Typography>
                    <Typography variant="body2">{account.alias}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Saldo</Typography>
                    <Typography variant="h6" sx={{ color: 'success.main', fontWeight: 700 }}>
                      {formatCurrency(account.balance)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Límite Diario</Typography>
                    <Typography variant="body2">{formatCurrency(account.dailyLimit)}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Límite Mensual</Typography>
                    <Typography variant="body2">{formatCurrency(account.monthlyLimit)}</Typography>
                  </Box>
                </Box>

                {hasPermission('users:update') && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Edit />}
                    onClick={() => setLimitsDialogOpen(true)}
                    fullWidth
                  >
                    Ajustar Límites
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Risk Flags */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Flags de Riesgo
                </Typography>
                {hasPermission('users:risk') && (
                  <Button size="small" startIcon={<Flag />} onClick={() => setFlagDialogOpen(true)}>
                    Agregar
                  </Button>
                )}
              </Box>
              
              {risk.flags.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Sin flags de riesgo
                </Typography>
              ) : (
                risk.flags.map((flag: any) => (
                  <Alert
                    key={flag.id}
                    severity={flag.severity === 'critical' ? 'error' : flag.severity === 'high' ? 'warning' : 'info'}
                    sx={{ mb: 1 }}
                  >
                    <Typography variant="caption">{flag.type}</Typography>
                    <Typography variant="body2">{flag.description}</Typography>
                  </Alert>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Financial Summary */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Resumen Financiero
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                    <AccountBalance sx={{ color: 'primary.main', mb: 1 }} />
                    <Typography variant="caption" color="text.secondary" display="block">
                      Saldo
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {formatCurrency(financialSummary.balance)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                    <TrendingUp sx={{ color: 'success.main', mb: 1 }} />
                    <Typography variant="caption" color="text.secondary" display="block">
                      Invertido
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {formatCurrency(financialSummary.totalInvested)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                    <CreditCard sx={{ color: 'warning.main', mb: 1 }} />
                    <Typography variant="caption" color="text.secondary" display="block">
                      Crédito Disponible
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {formatCurrency(financialSummary.creditAvailable)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                    <Warning sx={{ color: 'error.main', mb: 1 }} />
                    <Typography variant="caption" color="text.secondary" display="block">
                      Deuda
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {formatCurrency(financialSummary.totalDebt)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Card>
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label={`Inversiones (${investments.total})`} />
              <Tab label={`Financiaciones (${financings.total})`} />
            </Tabs>

            <CardContent>
              {activeTab === 0 && (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Monto</TableCell>
                      <TableCell>Valor Actual</TableCell>
                      <TableCell>Rendimientos</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Fecha</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {investments.list.map((inv: any) => (
                      <TableRow
                        key={inv.id}
                        hover
                        onClick={() => navigate(`/investments/${inv.id}`)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>{formatCurrency(inv.amount)}</TableCell>
                        <TableCell sx={{ color: 'success.main', fontWeight: 500 }}>
                          {formatCurrency(inv.current_value)}
                        </TableCell>
                        <TableCell>{formatCurrency(inv.returns_earned)}</TableCell>
                        <TableCell>
                          <Chip
                            label={inv.status}
                            size="small"
                            color={inv.status === 'ACTIVE' ? 'success' : 'default'}
                          />
                        </TableCell>
                        <TableCell>{format(new Date(inv.started_at), 'dd/MM/yyyy')}</TableCell>
                      </TableRow>
                    ))}
                    {investments.list.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography color="text.secondary">Sin inversiones</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}

              {activeTab === 1 && (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Monto</TableCell>
                      <TableCell>Cuotas</TableCell>
                      <TableCell>Restante</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Próx. Venc.</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {financings.list.map((fin: any) => (
                      <TableRow
                        key={fin.id}
                        hover
                        onClick={() => navigate(`/financings/${fin.id}`)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>{formatCurrency(fin.amount)}</TableCell>
                        <TableCell>{fin.installments}</TableCell>
                        <TableCell sx={{ color: 'warning.main', fontWeight: 500 }}>
                          {formatCurrency(fin.remaining)}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={fin.status}
                            size="small"
                            color={fin.status === 'ACTIVE' ? 'success' : fin.status === 'COMPLETED' ? 'default' : 'error'}
                          />
                        </TableCell>
                        <TableCell>
                          {fin.next_due_date ? format(new Date(fin.next_due_date), 'dd/MM/yyyy') : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                    {financings.list.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography color="text.secondary">Sin financiaciones</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialogs */}
      {/* Block Dialog */}
      <Dialog open={blockDialogOpen} onClose={() => setBlockDialogOpen(false)}>
        <DialogTitle>
          {user.status === 'BLOCKED' ? 'Desbloquear Usuario' : 'Bloquear Usuario'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Motivo"
            value={blockReason}
            onChange={(e) => setBlockReason(e.target.value)}
            multiline
            rows={3}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBlockDialogOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            color={user.status === 'BLOCKED' ? 'success' : 'error'}
            onClick={handleBlock}
            disabled={!blockReason.trim()}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Limits Dialog */}
      <Dialog open={limitsDialogOpen} onClose={() => setLimitsDialogOpen(false)}>
        <DialogTitle>Ajustar Límites</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Límite Diario"
            type="number"
            value={dailyLimit}
            onChange={(e) => setDailyLimit(e.target.value)}
            sx={{ mt: 1, mb: 2 }}
          />
          <TextField
            fullWidth
            label="Límite Mensual"
            type="number"
            value={monthlyLimit}
            onChange={(e) => setMonthlyLimit(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Motivo"
            value={limitsReason}
            onChange={(e) => setLimitsReason(e.target.value)}
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLimitsDialogOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleUpdateLimits}
            disabled={!limitsReason.trim()}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Level Dialog */}
      <Dialog open={levelDialogOpen} onClose={() => setLevelDialogOpen(false)}>
        <DialogTitle>Cambiar Nivel</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1, mb: 2 }}>
            <InputLabel>Nivel</InputLabel>
            <Select
              value={newLevel}
              label="Nivel"
              onChange={(e) => setNewLevel(e.target.value)}
            >
              <MenuItem value="PLATA">Plata</MenuItem>
              <MenuItem value="ORO">Oro</MenuItem>
              <MenuItem value="BLACK">Black</MenuItem>
              <MenuItem value="DIAMANTE">Diamante</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Motivo"
            value={levelReason}
            onChange={(e) => setLevelReason(e.target.value)}
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLevelDialogOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleUpdateLevel}
            disabled={!levelReason.trim()}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Flag Dialog */}
      <Dialog open={flagDialogOpen} onClose={() => setFlagDialogOpen(false)}>
        <DialogTitle>Agregar Flag de Riesgo</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1, mb: 2 }}>
            <InputLabel>Tipo</InputLabel>
            <Select
              value={flagType}
              label="Tipo"
              onChange={(e) => setFlagType(e.target.value)}
            >
              <MenuItem value="high_volume">Alto Volumen</MenuItem>
              <MenuItem value="unusual_pattern">Patrón Inusual</MenuItem>
              <MenuItem value="suspicious_ip">IP Sospechosa</MenuItem>
              <MenuItem value="manual">Manual</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Severidad</InputLabel>
            <Select
              value={flagSeverity}
              label="Severidad"
              onChange={(e) => setFlagSeverity(e.target.value)}
            >
              <MenuItem value="low">Baja</MenuItem>
              <MenuItem value="medium">Media</MenuItem>
              <MenuItem value="high">Alta</MenuItem>
              <MenuItem value="critical">Crítica</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Descripción"
            value={flagDescription}
            onChange={(e) => setFlagDescription(e.target.value)}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFlagDialogOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleAddFlag}
            disabled={!flagType || !flagDescription.trim()}
          >
            Agregar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
