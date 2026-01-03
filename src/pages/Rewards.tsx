import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Grid, Button, Chip, Table, TableBody, TableCell, TableHead, TableRow, TablePagination, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, FormControl, InputLabel, Alert, Skeleton, Avatar, InputAdornment } from '@mui/material';
import { CardGiftcard, TrendingUp, Redeem, Cancel, Add, Search } from '@mui/icons-material';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Reward { id: string; user_id: string; type: string; points: number; amount: number; status: string; description?: string; source_type?: string; expires_at?: string; created_at: string; user?: string; userEmail?: string; }
interface Stats { totalIssued: { points: number; amount: number }; totalRedeemed: { points: number; amount: number }; totalPending: { points: number; amount: number }; totalExpired: { points: number; amount: number }; }

const STATUS_COLORS: Record<string, 'success' | 'warning' | 'error' | 'default' | 'info'> = { EARNED: 'success', PENDING: 'warning', REDEEMED: 'info', EXPIRED: 'error', CANCELLED: 'default' };
const TYPE_LABELS: Record<string, string> = { CASHBACK: 'Cashback', POINTS: 'Puntos', BONUS_RATE: 'Tasa Bonus', FEE_WAIVER: 'Sin Comisión', REFERRAL: 'Referido' };

export default function Rewards() {
  const { hasPermission } = useAuth();
  const [loading, setLoading] = useState(true);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ status: '', type: '', userId: '' });
  const [grantOpen, setGrantOpen] = useState(false);
  const [grantData, setGrantData] = useState({ userId: '', type: 'POINTS', points: 0, amount: 0, description: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const canCreate = hasPermission('rewards:create');
  const canUpdate = hasPermission('rewards:update');

  useEffect(() => { loadData(); }, [page, filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: (page + 1).toString(), limit: '20' });
      if (filters.status) params.append('status', filters.status);
      if (filters.type) params.append('type', filters.type);
      if (filters.userId) params.append('userId', filters.userId);
      
      const [rewardsRes, statsRes] = await Promise.all([
        api.get(`/api/backoffice/rewards?${params}`),
        api.get('/api/backoffice/rewards/stats')
      ]);
      setRewards(rewardsRes.data.data.rewards || []);
      setTotal(rewardsRes.data.data.pagination?.total || 0);
      setStats(statsRes.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const grantReward = async () => {
    if (!grantData.userId || !grantData.description) { toast.error('Complete los campos'); return; }
    setActionLoading(true);
    try {
      await api.post('/api/backoffice/rewards/grant', grantData);
      toast.success('Reward otorgado');
      setGrantOpen(false);
      setGrantData({ userId: '', type: 'POINTS', points: 0, amount: 0, description: '' });
      loadData();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Error'); }
    finally { setActionLoading(false); }
  };

  const cancelReward = async (id: string) => {
    const reason = prompt('Motivo de cancelación:');
    if (!reason) return;
    try {
      await api.post(`/api/backoffice/rewards/${id}/cancel`, { reason });
      toast.success('Reward cancelado');
      loadData();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Error'); }
  };

  const formatCurrency = (v: number) => `$${v.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;

  if (loading && !rewards.length) return <Box><Skeleton variant="text" width={200} height={40} /><Grid container spacing={2} sx={{ mt: 2 }}>{[1,2,3,4].map(i => <Grid item xs={6} md={3} key={i}><Skeleton variant="rounded" height={100} /></Grid>)}</Grid></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box><Typography variant="h5" fontWeight={700}>Rewards</Typography><Typography variant="body2" color="text.secondary">Sistema de recompensas IFRS 15</Typography></Box>
        {canCreate && <Button variant="contained" startIcon={<Add />} onClick={() => setGrantOpen(true)} sx={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>Otorgar Reward</Button>}
      </Box>

      {/* Stats */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} md={3}>
            <Card sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <CardContent sx={{ py: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}><CardGiftcard sx={{ color: '#10b981' }} /><Typography variant="body2" color="text.secondary">Disponibles</Typography></Box>
                <Typography variant="h6" fontWeight={700}>{stats.totalIssued.points.toLocaleString()} pts</Typography>
                <Typography variant="body2" color="text.secondary">{formatCurrency(stats.totalIssued.amount)}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <CardContent sx={{ py: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}><Redeem sx={{ color: '#3b82f6' }} /><Typography variant="body2" color="text.secondary">Canjeados</Typography></Box>
                <Typography variant="h6" fontWeight={700}>{stats.totalRedeemed.points.toLocaleString()} pts</Typography>
                <Typography variant="body2" color="text.secondary">{formatCurrency(stats.totalRedeemed.amount)}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card sx={{ bgcolor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
              <CardContent sx={{ py: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}><TrendingUp sx={{ color: '#f59e0b' }} /><Typography variant="body2" color="text.secondary">Pendientes</Typography></Box>
                <Typography variant="h6" fontWeight={700}>{stats.totalPending.points.toLocaleString()} pts</Typography>
                <Typography variant="body2" color="text.secondary">{formatCurrency(stats.totalPending.amount)}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <CardContent sx={{ py: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}><Cancel sx={{ color: '#ef4444' }} /><Typography variant="body2" color="text.secondary">Expirados</Typography></Box>
                <Typography variant="h6" fontWeight={700}>{stats.totalExpired.points.toLocaleString()} pts</Typography>
                <Typography variant="body2" color="text.secondary">{formatCurrency(stats.totalExpired.amount)}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ py: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField size="small" placeholder="ID Usuario" value={filters.userId} onChange={e => setFilters(f => ({ ...f, userId: e.target.value }))} InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }} sx={{ width: 200 }} />
          <FormControl size="small" sx={{ width: 150 }}><InputLabel>Estado</InputLabel><Select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))} label="Estado"><MenuItem value="">Todos</MenuItem><MenuItem value="EARNED">Disponible</MenuItem><MenuItem value="PENDING">Pendiente</MenuItem><MenuItem value="REDEEMED">Canjeado</MenuItem><MenuItem value="EXPIRED">Expirado</MenuItem></Select></FormControl>
          <FormControl size="small" sx={{ width: 150 }}><InputLabel>Tipo</InputLabel><Select value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))} label="Tipo"><MenuItem value="">Todos</MenuItem><MenuItem value="POINTS">Puntos</MenuItem><MenuItem value="CASHBACK">Cashback</MenuItem><MenuItem value="REFERRAL">Referido</MenuItem></Select></FormControl>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <Table size="small">
          <TableHead>
            <TableRow><TableCell>Usuario</TableCell><TableCell>Tipo</TableCell><TableCell align="right">Puntos</TableCell><TableCell align="right">Monto</TableCell><TableCell>Estado</TableCell><TableCell>Descripción</TableCell><TableCell>Fecha</TableCell><TableCell>Acciones</TableCell></TableRow>
          </TableHead>
          <TableBody>
            {rewards.map(r => (
              <TableRow key={r.id} hover>
                <TableCell><Box><Typography variant="body2" fontWeight={500}>{r.user || 'N/A'}</Typography><Typography variant="caption" color="text.secondary">{r.userEmail}</Typography></Box></TableCell>
                <TableCell><Chip label={TYPE_LABELS[r.type] || r.type} size="small" variant="outlined" /></TableCell>
                <TableCell align="right">{r.points.toLocaleString()}</TableCell>
                <TableCell align="right">{formatCurrency(r.amount)}</TableCell>
                <TableCell><Chip label={r.status} size="small" color={STATUS_COLORS[r.status]} /></TableCell>
                <TableCell><Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.description}</Typography></TableCell>
                <TableCell>{new Date(r.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  {r.status === 'EARNED' && canUpdate && <Button size="small" color="error" onClick={() => cancelReward(r.id)}>Cancelar</Button>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination component="div" count={total} page={page} onPageChange={(_, p) => setPage(p)} rowsPerPage={20} rowsPerPageOptions={[20]} />
      </Card>

      {/* Grant Dialog */}
      <Dialog open={grantOpen} onClose={() => setGrantOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Otorgar Reward</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="ID Usuario" value={grantData.userId} onChange={e => setGrantData(d => ({ ...d, userId: e.target.value }))} fullWidth required />
            <FormControl fullWidth><InputLabel>Tipo</InputLabel><Select value={grantData.type} onChange={e => setGrantData(d => ({ ...d, type: e.target.value }))} label="Tipo"><MenuItem value="POINTS">Puntos</MenuItem><MenuItem value="CASHBACK">Cashback</MenuItem><MenuItem value="BONUS_RATE">Tasa Bonus</MenuItem><MenuItem value="FEE_WAIVER">Sin Comisión</MenuItem></Select></FormControl>
            <Grid container spacing={2}>
              <Grid item xs={6}><TextField label="Puntos" type="number" value={grantData.points} onChange={e => setGrantData(d => ({ ...d, points: parseInt(e.target.value) || 0 }))} fullWidth /></Grid>
              <Grid item xs={6}><TextField label="Monto" type="number" value={grantData.amount} onChange={e => setGrantData(d => ({ ...d, amount: parseFloat(e.target.value) || 0 }))} fullWidth InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} /></Grid>
            </Grid>
            <TextField label="Descripción" value={grantData.description} onChange={e => setGrantData(d => ({ ...d, description: e.target.value }))} fullWidth required multiline rows={2} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGrantOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={grantReward} disabled={actionLoading} sx={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>Otorgar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
