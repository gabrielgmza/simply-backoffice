import { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Button, TextField, MenuItem, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert, CircularProgress,
  Tabs, Tab, Card, CardContent
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  HourglassEmpty as PendingIcon
} from '@mui/icons-material';
import { api } from '../services/api';

interface ApprovalRequest {
  id: string;
  resource_type: string;
  resource_id: string;
  operation_type: string;
  status: string;
  amount?: number;
  requires_approvals: number;
  current_approvals: number;
  expires_at: string;
  created_at: string;
  maker_employees: { email: string; first_name: string; last_name: string };
  approval_decisions?: { decision: string; checker_employees: { email: string } }[];
}

export default function Approvals() {
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pendingRes, myRes] = await Promise.all([
        api.get('/backoffice/approvals/pending'),
        api.get('/backoffice/approvals/my-requests')
      ]);
      setPending(pendingRes.data.data || []);
      setMyRequests(myRes.data.data || []);
    } catch (err) {
      console.error('Error loading approvals:', err);
    } finally {
      setLoading(false);
    }
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
      await api.post(`/backoffice/approvals/${selectedRequest.id}/decide`, {
        decision,
        comments
      });
      setSuccess(`Solicitud ${decision === 'APPROVE' ? 'aprobada' : 'rechazada'}`);
      setDialogOpen(false);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error procesando decisión');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'error';
      case 'EXPIRED': return 'default';
      case 'EXECUTED': return 'info';
      default: return 'default';
    }
  };

  const getOperationLabel = (op: string) => {
    const labels: Record<string, string> = {
      user_block: 'Bloquear usuario',
      user_unblock: 'Desbloquear usuario',
      limit_increase: 'Aumentar límite',
      investment_liquidate: 'Liquidar inversión',
      settings_critical: 'Cambio crítico de config'
    };
    return labels[op] || op;
  };

  const formatAmount = (amount?: number) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
  };

  const currentList = tab === 0 ? pending : myRequests;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Aprobaciones</Typography>
        <IconButton onClick={loadData}><RefreshIcon /></IconButton>
      </Box>

      {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>{success}</Alert>}

      {/* Stats */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Card sx={{ minWidth: 150 }}>
          <CardContent sx={{ py: 1 }}>
            <Typography variant="h4" color="warning.main">{pending.length}</Typography>
            <Typography variant="caption">Pendientes de aprobar</Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 150 }}>
          <CardContent sx={{ py: 1 }}>
            <Typography variant="h4" color="info.main">{myRequests.filter(r => r.status === 'PENDING').length}</Typography>
            <Typography variant="caption">Mis solicitudes pendientes</Typography>
          </CardContent>
        </Card>
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label={`Por aprobar (${pending.length})`} />
        <Tab label={`Mis solicitudes (${myRequests.length})`} />
      </Tabs>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Operación</TableCell>
              <TableCell>Recurso</TableCell>
              <TableCell>Monto</TableCell>
              <TableCell>{tab === 0 ? 'Solicitante' : 'Estado'}</TableCell>
              <TableCell>Aprobaciones</TableCell>
              <TableCell>Expira</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={8} align="center"><CircularProgress /></TableCell></TableRow>
            ) : currentList.length === 0 ? (
              <TableRow><TableCell colSpan={8} align="center">Sin solicitudes</TableCell></TableRow>
            ) : currentList.map(req => (
              <TableRow key={req.id} hover>
                <TableCell>{req.id.slice(0, 8)}...</TableCell>
                <TableCell>{getOperationLabel(req.operation_type)}</TableCell>
                <TableCell>
                  <Chip size="small" label={req.resource_type} />
                  <Typography variant="caption" display="block">{req.resource_id.slice(0, 8)}...</Typography>
                </TableCell>
                <TableCell>{formatAmount(req.amount)}</TableCell>
                <TableCell>
                  {tab === 0 ? (
                    req.maker_employees.email
                  ) : (
                    <Chip size="small" label={req.status} color={getStatusColor(req.status) as any} />
                  )}
                </TableCell>
                <TableCell>
                  {req.current_approvals}/{req.requires_approvals}
                </TableCell>
                <TableCell>
                  <Typography variant="caption">
                    {new Date(req.expires_at).toLocaleString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => openDetail(req)}><ViewIcon /></IconButton>
                  {tab === 0 && req.status === 'PENDING' && (
                    <>
                      <IconButton size="small" color="success" onClick={() => { setSelectedRequest(req); decide('APPROVE'); }}>
                        <ApproveIcon />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => { setSelectedRequest(req); decide('REJECT'); }}>
                        <RejectIcon />
                      </IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Detail Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Solicitud de Aprobación
          <Chip 
            size="small" 
            label={selectedRequest?.status} 
            color={getStatusColor(selectedRequest?.status || '') as any}
            sx={{ ml: 2 }}
          />
        </DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">Operación</Typography>
            <Typography>{getOperationLabel(selectedRequest?.operation_type || '')}</Typography>
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">Recurso</Typography>
            <Typography>{selectedRequest?.resource_type}: {selectedRequest?.resource_id}</Typography>
          </Box>
          
          {selectedRequest?.amount && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">Monto</Typography>
              <Typography>{formatAmount(selectedRequest.amount)}</Typography>
            </Box>
          )}
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">Solicitante</Typography>
            <Typography>
              {selectedRequest?.maker_employees.first_name} {selectedRequest?.maker_employees.last_name}
              <Typography variant="caption" display="block">{selectedRequest?.maker_employees.email}</Typography>
            </Typography>
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">Aprobaciones</Typography>
            <Typography>{selectedRequest?.current_approvals}/{selectedRequest?.requires_approvals}</Typography>
            {selectedRequest?.approval_decisions?.map((d, i) => (
              <Chip 
                key={i} 
                size="small" 
                label={`${d.checker_employees.email}: ${d.decision}`}
                color={d.decision === 'APPROVE' ? 'success' : 'error'}
                sx={{ mr: 0.5, mt: 0.5 }}
              />
            ))}
          </Box>

          {tab === 0 && selectedRequest?.status === 'PENDING' && (
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Comentarios (opcional)"
              value={comments}
              onChange={e => setComments(e.target.value)}
              sx={{ mt: 2 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          {tab === 0 && selectedRequest?.status === 'PENDING' && (
            <>
              <Button
                color="error"
                startIcon={actionLoading ? <CircularProgress size={16} /> : <RejectIcon />}
                onClick={() => decide('REJECT')}
                disabled={actionLoading}
              >
                Rechazar
              </Button>
              <Button
                color="success"
                variant="contained"
                startIcon={actionLoading ? <CircularProgress size={16} /> : <ApproveIcon />}
                onClick={() => decide('APPROVE')}
                disabled={actionLoading}
              >
                Aprobar
              </Button>
            </>
          )}
          <Button onClick={() => setDialogOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
