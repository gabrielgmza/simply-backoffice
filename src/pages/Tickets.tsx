import { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Button, TextField, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  Tabs, Tab, Card, CardContent, Alert, CircularProgress, Pagination
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  SmartToy as AriaIcon,
  Reply as ReplyIcon
} from '@mui/icons-material';
import { api } from '../services/api';

interface Ticket {
  id: string;
  subject: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  ai_auto_resolvable: boolean;
  assigned_team: string;
  users?: { email: string; first_name: string; last_name: string };
  _count?: { messages: number };
  created_at: string;
}

interface TicketMessage {
  id: string;
  sender_type: string;
  content: string;
  is_internal: boolean;
  aria_generated: boolean;
  created_at: string;
}

export default function Tickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ status: '', priority: '', category: '' });
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [tab, setTab] = useState(0);
  const [ariaLoading, setAriaLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTickets();
    loadStats();
  }, [page, filters]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '20' });
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.category) params.append('category', filters.category);

      const res = await api.get(`/backoffice/tickets?${params}`);
      setTickets(res.data.tickets || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error('Error loading tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const res = await api.get('/backoffice/tickets/stats');
      setStats(res.data.data);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const openTicket = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setDialogOpen(true);
    try {
      const res = await api.get(`/backoffice/tickets/${ticket.id}`);
      setMessages(res.data.data.messages || []);
    } catch (err) {
      console.error('Error loading ticket:', err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;
    try {
      await api.post(`/backoffice/tickets/${selectedTicket.id}/messages`, {
        content: newMessage,
        isInternal
      });
      setNewMessage('');
      const res = await api.get(`/backoffice/tickets/${selectedTicket.id}`);
      setMessages(res.data.data.messages || []);
      loadTickets();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error enviando mensaje');
    }
  };

  const letAriaRespond = async () => {
    if (!selectedTicket) return;
    setAriaLoading(true);
    try {
      const res = await api.post(`/backoffice/tickets/${selectedTicket.id}/aria-respond`);
      alert(`Aria sugiere:\n\n${res.data.data.response}\n\nConfianza: ${(res.data.data.confidence * 100).toFixed(0)}%`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error con Aria');
    } finally {
      setAriaLoading(false);
    }
  };

  const closeTicket = async () => {
    if (!selectedTicket) return;
    const resolution = prompt('Resolución del ticket:');
    if (resolution === null) return;
    try {
      await api.post(`/backoffice/tickets/${selectedTicket.id}/close`, { resolution });
      setDialogOpen(false);
      loadTickets();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error cerrando ticket');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'info';
      case 'in_progress': return 'warning';
      case 'waiting_customer': return 'secondary';
      case 'resolved': return 'success';
      case 'closed': return 'default';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Tickets de Soporte</Typography>
        <IconButton onClick={loadTickets}><RefreshIcon /></IconButton>
      </Box>

      {/* Stats */}
      {stats && (
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Card sx={{ minWidth: 120 }}>
            <CardContent sx={{ py: 1 }}>
              <Typography variant="h4">{stats.total}</Typography>
              <Typography variant="caption">Total</Typography>
            </CardContent>
          </Card>
          <Card sx={{ minWidth: 120 }}>
            <CardContent sx={{ py: 1 }}>
              <Typography variant="h4" color="info.main">{stats.byStatus?.open || 0}</Typography>
              <Typography variant="caption">Abiertos</Typography>
            </CardContent>
          </Card>
          <Card sx={{ minWidth: 120 }}>
            <CardContent sx={{ py: 1 }}>
              <Typography variant="h4" color="warning.main">{stats.byStatus?.in_progress || 0}</Typography>
              <Typography variant="caption">En progreso</Typography>
            </CardContent>
          </Card>
          <Card sx={{ minWidth: 120 }}>
            <CardContent sx={{ py: 1 }}>
              <Typography variant="h4" color="error.main">{stats.slaBreached || 0}</Typography>
              <Typography variant="caption">SLA vencido</Typography>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          select size="small" label="Estado" value={filters.status} sx={{ minWidth: 150 }}
          onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
        >
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="open">Abierto</MenuItem>
          <MenuItem value="in_progress">En progreso</MenuItem>
          <MenuItem value="waiting_customer">Esperando cliente</MenuItem>
          <MenuItem value="resolved">Resuelto</MenuItem>
          <MenuItem value="closed">Cerrado</MenuItem>
        </TextField>
        <TextField
          select size="small" label="Prioridad" value={filters.priority} sx={{ minWidth: 150 }}
          onChange={e => setFilters(f => ({ ...f, priority: e.target.value }))}
        >
          <MenuItem value="">Todas</MenuItem>
          <MenuItem value="urgent">Urgente</MenuItem>
          <MenuItem value="high">Alta</MenuItem>
          <MenuItem value="medium">Media</MenuItem>
          <MenuItem value="low">Baja</MenuItem>
        </TextField>
        <TextField
          select size="small" label="Categoría" value={filters.category} sx={{ minWidth: 150 }}
          onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
        >
          <MenuItem value="">Todas</MenuItem>
          <MenuItem value="billing">Facturación</MenuItem>
          <MenuItem value="account">Cuenta</MenuItem>
          <MenuItem value="technical">Técnico</MenuItem>
          <MenuItem value="investment">Inversión</MenuItem>
          <MenuItem value="financing">Financiación</MenuItem>
          <MenuItem value="general">General</MenuItem>
        </TextField>
      </Box>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Asunto</TableCell>
              <TableCell>Usuario</TableCell>
              <TableCell>Categoría</TableCell>
              <TableCell>Prioridad</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>AI</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={9} align="center"><CircularProgress /></TableCell></TableRow>
            ) : tickets.map(ticket => (
              <TableRow key={ticket.id} hover>
                <TableCell>{ticket.id.slice(0, 8)}...</TableCell>
                <TableCell>{ticket.subject.slice(0, 40)}...</TableCell>
                <TableCell>{ticket.users?.email || 'N/A'}</TableCell>
                <TableCell>{ticket.category}</TableCell>
                <TableCell>
                  <Chip size="small" label={ticket.priority} color={getPriorityColor(ticket.priority) as any} />
                </TableCell>
                <TableCell>
                  <Chip size="small" label={ticket.status} color={getStatusColor(ticket.status) as any} />
                </TableCell>
                <TableCell>
                  {ticket.ai_auto_resolvable && <Chip size="small" icon={<AriaIcon />} label="Auto" color="success" />}
                </TableCell>
                <TableCell>{new Date(ticket.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => openTicket(ticket)}><ViewIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} />
      </Box>

      {/* Ticket Detail Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Ticket: {selectedTicket?.subject}
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Chip size="small" label={selectedTicket?.priority} color={getPriorityColor(selectedTicket?.priority || '') as any} />
            <Chip size="small" label={selectedTicket?.status} color={getStatusColor(selectedTicket?.status || '') as any} />
            <Chip size="small" label={selectedTicket?.category} />
          </Box>
        </DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}
          
          <Typography variant="body2" sx={{ mb: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            {selectedTicket?.description}
          </Typography>

          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
            <Tab label="Mensajes" />
            <Tab label="Notas internas" />
          </Tabs>

          <Box sx={{ maxHeight: 300, overflow: 'auto', mb: 2 }}>
            {messages
              .filter(m => tab === 0 ? !m.is_internal : m.is_internal)
              .map(msg => (
                <Box key={msg.id} sx={{ mb: 2, p: 2, bgcolor: msg.sender_type === 'user' ? 'primary.50' : 'grey.100', borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" fontWeight="bold">
                      {msg.sender_type === 'user' ? 'Cliente' : msg.sender_type === 'aria' ? '🤖 Aria' : 'Empleado'}
                      {msg.aria_generated && ' (AI)'}
                    </Typography>
                    <Typography variant="caption">{new Date(msg.created_at).toLocaleString()}</Typography>
                  </Box>
                  <Typography variant="body2">{msg.content}</Typography>
                </Box>
              ))}
          </Box>

          <TextField
            fullWidth multiline rows={3}
            placeholder={tab === 0 ? "Responder al cliente..." : "Agregar nota interna..."}
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            startIcon={ariaLoading ? <CircularProgress size={16} /> : <AriaIcon />}
            onClick={letAriaRespond}
            disabled={ariaLoading}
          >
            Sugerir con Aria
          </Button>
          <Button startIcon={<ReplyIcon />} onClick={() => { setIsInternal(tab === 1); sendMessage(); }}>
            {tab === 0 ? 'Responder' : 'Agregar nota'}
          </Button>
          {selectedTicket?.status !== 'closed' && (
            <Button color="success" onClick={closeTicket}>Cerrar ticket</Button>
          )}
          <Button onClick={() => setDialogOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
