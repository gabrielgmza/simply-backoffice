import { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Button, TextField, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, CircularProgress, Tabs, Tab, Card, CardContent, useTheme, useMediaQuery, Avatar
} from '@mui/material';
import {
  Refresh as RefreshIcon, CheckCircle as ApproveIcon, Cancel as RejectIcon, Visibility as ViewIcon,
  HourglassEmpty as PendingIcon, Schedule as TimeIcon
} from '@mui/icons-material';
import { api } from '../services/api';

interface ApprovalRequest {
  id: string; resource_type: string; resource_id: string; operation_type: string; status: string;
  amount?: number; requires_approvals: number; current_approvals: number; expires_at: string; created_at: string;
  maker_employees: { email: string; first_name: string; last_name: string };
  approval_decisions?: { decision: string; checker_employees: { email: string } }[];
}

const OPERATION_LABELS: Record<string, string> = {
  user_block: 'Bloquear usuario', user_unblock: 'Desbloquear usuario', limit_increase: 'Aumentar límite',
  investment_liquidate: 'Liquidar inversión', settings_critical: 'Cambio crítico'
};

export default function Approvals() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [pending, setPending] = useState<ApprovalRequest[]>([]);
  const [myRequests, setMyRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [comments, setComments] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pendingRes, myRes] = await Promise.all([
        api.get('/backoffice/approvals/pending'),
        api.get('/backoffice/approvals/my-requests')
      ]);
      setPending(pendingRes.data.data || []);
      setMyRequests(myRes.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const openDetail = (request: ApprovalRequest) => {
    setSelectedRequest(request);
    setComments('');
    setDialogOpen(true);
  };

  const decide = async (decision: 'APPROVE' | 'REJECT') => {
    if (!selectedRequest) return;
    setActionLoading(true);
    setError(null);
    try {
      await api.post(`/backoffice/approvals/${selectedRequest.id}/decide`, { decision, comments });
      setSuccess(`Solicitud ${decision === 'APPROVE' ? 'aprobada' : 'rechazada'}`);
      setDialogOpen(false);
      loadData();
    } catch (err: any) { setError(err.response?.data?.error || 'Error'); }
    finally { setActionLoading(false); }
  };

  const getStatusColor = (status: string) => ({ PENDING: 'warning', APPROVED: 'success', REJECTED: 'error', EXPIRED: 'default', EXECUTED: 'info' }[status] || 'default') as any;

  const formatAmount = (amount?: number) => amount ? new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount) : '-';

  const currentList = tab === 0 ? pending : myRequests;

  const StatCard = ({ title, value, color }: any) => (
    <Card variant="outlined" sx={{ borderRadius: 3, minWidth: { xs: '45%', sm: 150 } }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Typography variant="caption" color="text.secondary">{title}</Typography>
        <Typography variant="h4" fontWeight={700} color={color}>{value}</Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Aprobaciones</Typography>
        <IconButton onClick={loadData}><RefreshIcon /></IconButton>
      </Box>

      {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2, borderRadius: 2 }}>{success}</Alert>}

      {/* Stats */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <StatCard title="Por aprobar" value={pending.length} color="warning.main" />
        <StatCard title="Mis pendientes" value={myRequests.filter(r => r.status === 'PENDING').length} color="info.main" />
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, '& .MuiTab-root': { fontWeight: 600 } }}>
        <Tab label={`Por aprobar (${pending.length})`} icon={<PendingIcon />} iconPosition="start" />
        <Tab label={`Mis solicitudes (${myRequests.length})`} icon={<TimeIcon />} iconPosition="start" />
      </Tabs>

      {/* Content */}
      {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box> : isMobile ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {currentList.length === 0 ? (
            <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
              <Typography color="text.secondary">Sin solicitudes</Typography>
            </Paper>
          ) : currentList.map(req => (
            <Card key={req.id} variant="outlined" sx={{ borderRadius: 3 }} onClick={() => openDetail(req)}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2" fontWeight={600}>{OPERATION_LABELS[req.operation_type] || req.operation_type}</Typography>
                  <Chip size="small" label={req.status} color={getStatusColor(req.status)} />
                </Box>
                <Typography variant="caption" color="text.secondary" display="block">{req.maker_employees.email}</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                  <Typography variant="body2" fontWeight={500}>{formatAmount(req.amount)}</Typography>
                  <Typography variant="caption">{req.current_approvals}/{req.requires_approvals} aprobaciones</Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell>ID</TableCell>
                <TableCell>Operación</TableCell>
                <TableCell>Monto</TableCell>
                <TableCell>{tab === 0 ? 'Solicitante' : 'Estado'}</TableCell>
                <TableCell>Aprobaciones</TableCell>
                <TableCell>Expira</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentList.length === 0 ? (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}>Sin solicitudes</TableCell></TableRow>
              ) : currentList.map(req => (
                <TableRow key={req.id} hover sx={{ cursor: 'pointer' }} onClick={() => openDetail(req)}>
                  <TableCell><Typography variant="body2" fontFamily="monospace">{req.id.slice(0, 8)}</Typography></TableCell>
                  <TableCell>{OPERATION_LABELS[req.operation_type] || req.operation_type}</TableCell>
                  <TableCell>{formatAmount(req.amount)}</TableCell>
                  <TableCell>
                    {tab === 0 ? req.maker_employees.email : <Chip size="small" label={req.status} color={getStatusColor(req.status)} />}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 60, height: 6, bgcolor: 'grey.200', borderRadius: 1, overflow: 'hidden' }}>
                        <Box sx={{ width: `${(req.current_approvals / req.requires_approvals) * 100}%`, height: '100%', bgcolor: 'success.main' }} />
                      </Box>
                      <Typography variant="caption">{req.current_approvals}/{req.requires_approvals}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell><Typography variant="caption">{new Date(req.expires_at).toLocaleString()}</Typography></TableCell>
                  <TableCell>
                    <IconButton size="small"><ViewIcon /></IconButton>
                    {tab === 0 && req.status === 'PENDING' && (
                      <>
                        <IconButton size="small" color="success" onClick={e => { e.stopPropagation(); setSelectedRequest(req); decide('APPROVE'); }}><ApproveIcon /></IconButton>
                        <IconButton size="small" color="error" onClick={e => { e.stopPropagation(); setSelectedRequest(req); decide('REJECT'); }}><RejectIcon /></IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Detail Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth fullScreen={isMobile}>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={600}>Solicitud de Aprobación</Typography>
            <Chip size="small" label={selectedRequest?.status} color={getStatusColor(selectedRequest?.status || '')} />
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
          
          <Box sx={{ display: 'grid', gap: 2 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">Operación</Typography>
              <Typography variant="body1" fontWeight={500}>{OPERATION_LABELS[selectedRequest?.operation_type || ''] || selectedRequest?.operation_type}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Recurso</Typography>
              <Typography variant="body2">{selectedRequest?.resource_type}: {selectedRequest?.resource_id}</Typography>
            </Box>
            {selectedRequest?.amount && (
              <Box>
                <Typography variant="caption" color="text.secondary">Monto</Typography>
                <Typography variant="h6" fontWeight={600}>{formatAmount(selectedRequest.amount)}</Typography>
              </Box>
            )}
            <Box>
              <Typography variant="caption" color="text.secondary">Solicitante</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                  {selectedRequest?.maker_employees.first_name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="body2" fontWeight={500}>
                    {selectedRequest?.maker_employees.first_name} {selectedRequest?.maker_employees.last_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">{selectedRequest?.maker_employees.email}</Typography>
                </Box>
              </Box>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Aprobaciones</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                <Box sx={{ flex: 1, height: 8, bgcolor: 'grey.200', borderRadius: 1, overflow: 'hidden' }}>
                  <Box sx={{ width: `${((selectedRequest?.current_approvals || 0) / (selectedRequest?.requires_approvals || 1)) * 100}%`, height: '100%', bgcolor: 'success.main', transition: 'width 0.3s' }} />
                </Box>
                <Typography variant="body2" fontWeight={500}>{selectedRequest?.current_approvals}/{selectedRequest?.requires_approvals}</Typography>
              </Box>
              {selectedRequest?.approval_decisions?.map((d, i) => (
                <Chip key={i} size="small" label={`${d.checker_employees.email.split('@')[0]}: ${d.decision}`}
                  color={d.decision === 'APPROVE' ? 'success' : 'error'} sx={{ mr: 0.5, mt: 1 }} />
              ))}
            </Box>
          </Box>

          {tab === 0 && selectedRequest?.status === 'PENDING' && (
            <TextField fullWidth multiline rows={2} label="Comentarios (opcional)" value={comments}
              onChange={e => setComments(e.target.value)} sx={{ mt: 3, '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          {tab === 0 && selectedRequest?.status === 'PENDING' && (
            <>
              <Button color="error" variant="outlined" startIcon={actionLoading ? <CircularProgress size={16} /> : <RejectIcon />}
                onClick={() => decide('REJECT')} disabled={actionLoading} sx={{ borderRadius: 2 }}>Rechazar</Button>
              <Button color="success" variant="contained" startIcon={actionLoading ? <CircularProgress size={16} /> : <ApproveIcon />}
                onClick={() => decide('APPROVE')} disabled={actionLoading} sx={{ borderRadius: 2 }}>Aprobar</Button>
            </>
          )}
          <Button onClick={() => setDialogOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
