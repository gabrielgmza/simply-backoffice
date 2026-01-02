import { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Button, TextField, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Tabs, Tab, Card, CardContent, Alert, CircularProgress, Pagination,
  useTheme, useMediaQuery, Grid, Avatar
} from '@mui/material';
import {
  Refresh as RefreshIcon, Visibility as ViewIcon, SmartToy as AriaIcon,
  Reply as ReplyIcon, AccessTime as TimeIcon, Warning as WarningIcon
} from '@mui/icons-material';
import { api } from '../services/api';

interface Ticket {
  id: string; subject: string; description: string; category: string; status: string;
  priority: string; ai_auto_resolvable: boolean; assigned_team: string;
  users?: { email: string; first_name: string; last_name: string };
  _count?: { messages: number }; created_at: string;
}
interface TicketMessage { id: string; sender_type: string; content: string; is_internal: boolean; aria_generated: boolean; created_at: string; }

export default function Tickets() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ status: '', priority: '' });
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [tab, setTab] = useState(0);
  const [ariaLoading, setAriaLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { loadTickets(); loadStats(); }, [page, filters]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '15' });
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      const res = await api.get(`/backoffice/tickets?${params}`);
      setTickets(res.data.tickets || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const loadStats = async () => {
    try { const res = await api.get('/backoffice/tickets/stats'); setStats(res.data.data); } catch (err) { console.error(err); }
  };

  const openTicket = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setDialogOpen(true);
    try { const res = await api.get(`/backoffice/tickets/${ticket.id}`); setMessages(res.data.data.messages || []); } catch (err) { console.error(err); }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;
    try {
      await api.post(`/backoffice/tickets/${selectedTicket.id}/messages`, { content: newMessage, isInternal: tab === 1 });
      setNewMessage('');
      const res = await api.get(`/backoffice/tickets/${selectedTicket.id}`);
      setMessages(res.data.data.messages || []);
      loadTickets();
    } catch (err: any) { setError(err.response?.data?.error || 'Error'); }
  };

  const letAriaRespond = async () => {
    if (!selectedTicket) return;
    setAriaLoading(true);
    try {
      const res = await api.post(`/backoffice/tickets/${selectedTicket.id}/aria-respond`);
      alert(`Aria sugiere:\n\n${res.data.data.response}\n\nConfianza: ${(res.data.data.confidence * 100).toFixed(0)}%`);
    } catch (err: any) { setError(err.response?.data?.error || 'Error'); }
    finally { setAriaLoading(false); }
  };

  const closeTicket = async () => {
    if (!selectedTicket) return;
    const resolution = prompt('Resolución:');
    if (resolution === null) return;
    try { await api.post(`/backoffice/tickets/${selectedTicket.id}/close`, { resolution }); setDialogOpen(false); loadTickets(); }
    catch (err: any) { setError(err.response?.data?.error || 'Error'); }
  };

  const getPriorityColor = (p: string) => ({ urgent: 'error', high: 'warning', medium: 'info', low: 'default' }[p] || 'default') as any;
  const getStatusColor = (s: string) => ({ open: 'info', in_progress: 'warning', waiting_customer: 'secondary', resolved: 'success', closed: 'default' }[s] || 'default') as any;

  const StatCard = ({ title, value, color, icon }: any) => (
    <Card variant="outlined" sx={{ borderRadius: 3, flex: 1, minWidth: { xs: '45%', sm: 120 } }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          {icon}
          <Typography variant="caption" color="text.secondary">{title}</Typography>
        </Box>
        <Typography variant="h4" fontWeight={700} color={color}>{value}</Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" fontWeight={700}>Tickets de Soporte</Typography>
        <IconButton onClick={loadTickets}><RefreshIcon /></IconButton>
      </Box>

      {/* Stats */}
      {stats && (
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <StatCard title="Total" value={stats.total} color="text.primary" icon={<TimeIcon color="action" />} />
          <StatCard title="Abiertos" value={stats.byStatus?.open || 0} color="info.main" icon={<TimeIcon color="info" />} />
          <StatCard title="En Progreso" value={stats.byStatus?.in_progress || 0} color="warning.main" icon={<TimeIcon color="warning" />} />
          <StatCard title="SLA Vencido" value={stats.slaBreached || 0} color="error.main" icon={<WarningIcon color="error" />} />
        </Box>
      )}

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField select size="small" label="Estado" value={filters.status} sx={{ minWidth: 140 }}
          onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="open">Abierto</MenuItem>
          <MenuItem value="in_progress">En progreso</MenuItem>
          <MenuItem value="resolved">Resuelto</MenuItem>
        </TextField>
        <TextField select size="small" label="Prioridad" value={filters.priority} sx={{ minWidth: 140 }}
          onChange={e => setFilters(f => ({ ...f, priority: e.target.value }))}>
          <MenuItem value="">Todas</MenuItem>
          <MenuItem value="urgent">Urgente</MenuItem>
          <MenuItem value="high">Alta</MenuItem>
          <MenuItem value="medium">Media</MenuItem>
        </TextField>
      </Box>

      {/* Table / Cards */}
      {isMobile ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {loading ? <CircularProgress sx={{ mx: 'auto' }} /> : tickets.map(ticket => (
            <Card key={ticket.id} variant="outlined" sx={{ borderRadius: 3 }} onClick={() => openTicket(ticket)}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ flex: 1 }}>{ticket.subject.slice(0, 40)}...</Typography>
                  <Chip size="small" label={ticket.priority} color={getPriorityColor(ticket.priority)} />
                </Box>
                <Typography variant="caption" color="text.secondary" display="block">{ticket.users?.email || 'N/A'}</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                  <Chip size="small" label={ticket.status} color={getStatusColor(ticket.status)} />
                  {ticket.ai_auto_resolvable && <Chip size="small" icon={<AriaIcon />} label="AI" color="success" />}
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
                <TableCell>Asunto</TableCell>
                <TableCell>Usuario</TableCell>
                <TableCell>Prioridad</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>AI</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} align="center"><CircularProgress /></TableCell></TableRow>
              ) : tickets.map(ticket => (
                <TableRow key={ticket.id} hover sx={{ cursor: 'pointer' }} onClick={() => openTicket(ticket)}>
                  <TableCell><Typography variant="body2" fontFamily="monospace">{ticket.id.slice(0, 8)}</Typography></TableCell>
                  <TableCell>{ticket.subject.slice(0, 35)}...</TableCell>
                  <TableCell>{ticket.users?.email || 'N/A'}</TableCell>
                  <TableCell><Chip size="small" label={ticket.priority} color={getPriorityColor(ticket.priority)} /></TableCell>
                  <TableCell><Chip size="small" label={ticket.status} color={getStatusColor(ticket.status)} /></TableCell>
                  <TableCell>{ticket.ai_auto_resolvable && <Chip size="small" icon={<AriaIcon />} label="Auto" color="success" />}</TableCell>
                  <TableCell>{new Date(ticket.created_at).toLocaleDateString()}</TableCell>
                  <TableCell><IconButton size="small"><ViewIcon /></IconButton></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} color="primary" />
      </Box>

      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth fullScreen={isMobile}>
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="h6" fontWeight={600}>{selectedTicket?.subject}</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip size="small" label={selectedTicket?.priority} color={getPriorityColor(selectedTicket?.priority || '')} />
              <Chip size="small" label={selectedTicket?.status} color={getStatusColor(selectedTicket?.status || '')} />
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}
          
          <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
            <Typography variant="body2">{selectedTicket?.description}</Typography>
          </Paper>

          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
            <Tab label="Mensajes" />
            <Tab label="Notas internas" />
          </Tabs>

          <Box sx={{ maxHeight: 300, overflow: 'auto', mb: 2 }}>
            {messages.filter(m => tab === 0 ? !m.is_internal : m.is_internal).map(msg => (
              <Box key={msg.id} sx={{ mb: 2, p: 2, borderRadius: 2, bgcolor: msg.sender_type === 'user' ? 'primary.50' : 'grey.100' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 24, height: 24, bgcolor: msg.sender_type === 'user' ? 'primary.main' : 'secondary.main' }}>
                      {msg.sender_type === 'aria' ? <AriaIcon sx={{ fontSize: 14 }} /> : msg.sender_type.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="caption" fontWeight={600}>
                      {msg.sender_type === 'user' ? 'Cliente' : msg.sender_type === 'aria' ? 'Aria' : 'Agente'}
                      {msg.aria_generated && ' (AI)'}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">{new Date(msg.created_at).toLocaleString()}</Typography>
                </Box>
                <Typography variant="body2">{msg.content}</Typography>
              </Box>
            ))}
          </Box>

          <TextField fullWidth multiline rows={3} placeholder={tab === 0 ? "Responder..." : "Nota interna..."} value={newMessage} onChange={e => setNewMessage(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1, flexWrap: 'wrap' }}>
          <Button startIcon={ariaLoading ? <CircularProgress size={16} /> : <AriaIcon />} onClick={letAriaRespond} disabled={ariaLoading}>Sugerir con Aria</Button>
          <Button variant="contained" startIcon={<ReplyIcon />} onClick={sendMessage}>{tab === 0 ? 'Responder' : 'Agregar nota'}</Button>
          {selectedTicket?.status !== 'closed' && <Button color="success" onClick={closeTicket}>Cerrar</Button>}
          <Button onClick={() => setDialogOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
