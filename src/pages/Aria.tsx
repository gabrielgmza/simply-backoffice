import { useState, useEffect, useRef } from 'react';
import {
  Box, Paper, Typography, TextField, Button, CircularProgress,
  List, ListItem, ListItemText, Avatar, Chip, IconButton, Alert,
  Card, CardContent, useTheme, useMediaQuery, Drawer, Fade
} from '@mui/material';
import {
  Send as SendIcon, SmartToy as AriaIcon, Person as PersonIcon,
  Refresh as RefreshIcon, Undo as UndoIcon, Menu as MenuIcon,
  Add as AddIcon, Close as CloseIcon
} from '@mui/icons-material';
import { api } from '../services/api';

interface Message { id: string; role: 'user' | 'assistant'; content: string; tool_calls?: string[]; created_at: string; }
interface Session { id: string; status: string; started_at: string; _count: { messages: number; decisions: number }; }
interface Decision { id: string; tool_name: string; status: string; risk_level: string; confidence_score: number; rollback_expires_at?: string; }

export default function Aria() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadSessions(); }, []);
  useEffect(() => { if (currentSession) loadSession(currentSession); }, [currentSession]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const loadSessions = async () => {
    try { const res = await api.get('/backoffice/aria/sessions'); setSessions(res.data.data || []); } 
    catch (err) { console.error(err); }
  };

  const loadSession = async (sessionId: string) => {
    try {
      const res = await api.get(`/backoffice/aria/sessions/${sessionId}`);
      setMessages(res.data.data.messages || []);
      setDecisions(res.data.data.decisions || []);
    } catch (err: any) { setError(err.response?.data?.error || 'Error'); }
  };

  const createSession = async () => {
    setLoading(true);
    try {
      const res = await api.post('/backoffice/aria/sessions');
      setCurrentSession(res.data.data.sessionId);
      setMessages([]); setDecisions([]);
      loadSessions();
      if (isMobile) setSidebarOpen(false);
    } catch (err: any) { setError(err.response?.data?.error || 'Error'); }
    finally { setLoading(false); }
  };

  const sendMessage = async () => {
    if (!input.trim() || !currentSession) return;
    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userMessage, created_at: new Date().toISOString() }]);
    setLoading(true);
    setError(null);
    try {
      const res = await api.post(`/backoffice/aria/sessions/${currentSession}/chat`, { message: userMessage });
      setMessages(prev => [...prev, { id: Date.now().toString() + '-aria', role: 'assistant', content: res.data.data.response, tool_calls: res.data.data.toolsUsed, created_at: new Date().toISOString() }]);
      if (res.data.data.decisions?.length > 0) setDecisions(prev => [...res.data.data.decisions, ...prev]);
    } catch (err: any) { setError(err.response?.data?.error || 'Error'); }
    finally { setLoading(false); }
  };

  const rollbackDecision = async (decisionId: string) => {
    const reason = prompt('Motivo del rollback:');
    if (!reason) return;
    try { await api.post(`/backoffice/aria/decisions/${decisionId}/rollback`, { reason }); loadSession(currentSession!); }
    catch (err: any) { setError(err.response?.data?.error || 'Error'); }
  };

  const getRiskColor = (level: string) => ({ low: 'success', medium: 'warning', high: 'error', critical: 'error' }[level] || 'default') as any;

  const SessionsSidebar = () => (
    <Box sx={{ width: { xs: 280, md: 300 }, p: 2, height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight={600}>Sesiones</Typography>
        <Box>
          <IconButton size="small" onClick={loadSessions}><RefreshIcon /></IconButton>
          {isMobile && <IconButton size="small" onClick={() => setSidebarOpen(false)}><CloseIcon /></IconButton>}
        </Box>
      </Box>
      <Button fullWidth variant="contained" startIcon={<AddIcon />} onClick={createSession} sx={{ mb: 2, borderRadius: 2, py: 1.2, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
        Nueva Sesión
      </Button>
      <List sx={{ flex: 1, overflow: 'auto' }}>
        {sessions.map(session => (
          <ListItem key={session.id} disablePadding sx={{ mb: 1 }}>
            <Box
              onClick={() => { setCurrentSession(session.id); if (isMobile) setSidebarOpen(false); }}
              sx={{
                width: '100%', p: 1.5, borderRadius: 2, cursor: 'pointer',
                bgcolor: session.id === currentSession ? 'primary.50' : 'grey.50',
                border: session.id === currentSession ? '2px solid' : '1px solid',
                borderColor: session.id === currentSession ? 'primary.main' : 'grey.200',
                transition: 'all 0.2s',
                '&:hover': { bgcolor: session.id === currentSession ? 'primary.100' : 'grey.100' }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" fontWeight={500}>#{session.id.slice(0, 8)}</Typography>
                <Chip size="small" label={session.status} color={session.status === 'active' ? 'success' : 'default'} sx={{ height: 20 }} />
              </Box>
              <Typography variant="caption" color="text.secondary">
                {session._count.messages} msgs • {new Date(session.started_at).toLocaleDateString()}
              </Typography>
            </Box>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 100px)', gap: { xs: 0, md: 2 } }}>
      {/* Sidebar Mobile */}
      {isMobile ? (
        <Drawer anchor="left" open={sidebarOpen} onClose={() => setSidebarOpen(false)}>
          <SessionsSidebar />
        </Drawer>
      ) : (
        <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'grey.200', overflow: 'hidden' }}>
          <SessionsSidebar />
        </Paper>
      )}

      {/* Chat Area */}
      <Paper elevation={0} sx={{ flex: 1, display: 'flex', flexDirection: 'column', borderRadius: 3, border: '1px solid', borderColor: 'grey.200', overflow: 'hidden' }}>
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'grey.200', display: 'flex', alignItems: 'center', gap: 2 }}>
          {isMobile && <IconButton onClick={() => setSidebarOpen(true)}><MenuIcon /></IconButton>}
          <Avatar sx={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}><AriaIcon /></Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>Aria</Typography>
            <Typography variant="caption" color="text.secondary">Asistente AI de Simply</Typography>
          </Box>
        </Box>

        {!currentSession ? (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
            <Box sx={{ textAlign: 'center', maxWidth: 400 }}>
              <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}><AriaIcon sx={{ fontSize: 40 }} /></Avatar>
              <Typography variant="h6" gutterBottom>Bienvenido a Aria</Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>Tu asistente AI para gestionar Simply. Crea una sesión para comenzar.</Typography>
              <Button variant="contained" onClick={createSession} sx={{ borderRadius: 2, px: 4, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>Crear Sesión</Button>
            </Box>
          </Box>
        ) : (
          <>
            {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mx: 2, mt: 2 }}>{error}</Alert>}

            {/* Messages */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              {messages.map(msg => (
                <Fade in key={msg.id}>
                  <Box sx={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', mb: 2 }}>
                    <Box sx={{
                      maxWidth: { xs: '90%', md: '70%' }, p: 2, borderRadius: 3,
                      bgcolor: msg.role === 'user' ? 'primary.main' : 'grey.100',
                      color: msg.role === 'user' ? 'white' : 'text.primary',
                      boxShadow: msg.role === 'user' ? '0 2px 8px rgba(99,102,241,0.3)' : 'none'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Avatar sx={{ width: 24, height: 24, bgcolor: msg.role === 'user' ? 'primary.dark' : 'secondary.main' }}>
                          {msg.role === 'user' ? <PersonIcon sx={{ fontSize: 16 }} /> : <AriaIcon sx={{ fontSize: 16 }} />}
                        </Avatar>
                        <Typography variant="caption" fontWeight={500}>{msg.role === 'user' ? 'Tú' : 'Aria'}</Typography>
                      </Box>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{msg.content}</Typography>
                      {msg.tool_calls && msg.tool_calls.length > 0 && (
                        <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {msg.tool_calls.map((tool, i) => <Chip key={i} size="small" label={tool} variant="outlined" sx={{ bgcolor: 'white' }} />)}
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Fade>
              ))}
              {loading && (
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', color: 'text.secondary' }}>
                  <CircularProgress size={16} />
                  <Typography variant="body2">Aria está pensando...</Typography>
                </Box>
              )}
              <div ref={messagesEndRef} />
            </Box>

            {/* Input */}
            <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'grey.200' }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth size="small" placeholder="Escribe un mensaje..."
                  value={input} onChange={e => setInput(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  disabled={loading} multiline maxRows={3}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                />
                <Button variant="contained" onClick={sendMessage} disabled={loading || !input.trim()}
                  sx={{ borderRadius: 3, minWidth: 48, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
                  <SendIcon />
                </Button>
              </Box>
            </Box>
          </>
        )}
      </Paper>

      {/* Decisions Panel - Desktop Only */}
      {!isMobile && currentSession && decisions.length > 0 && (
        <Paper elevation={0} sx={{ width: 280, borderRadius: 3, border: '1px solid', borderColor: 'grey.200', p: 2, overflow: 'auto' }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>Decisiones</Typography>
          {decisions.map(decision => (
            <Card key={decision.id} variant="outlined" sx={{ mb: 1, borderRadius: 2 }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="body2" fontWeight={500}>{decision.tool_name}</Typography>
                  <Chip size="small" label={decision.risk_level} color={getRiskColor(decision.risk_level)} sx={{ height: 20 }} />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Confianza: {(Number(decision.confidence_score) * 100).toFixed(0)}%
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                  <Chip size="small" label={decision.status} sx={{ height: 20 }} />
                  {decision.status === 'executed' && decision.rollback_expires_at && new Date(decision.rollback_expires_at) > new Date() && (
                    <IconButton size="small" onClick={() => rollbackDecision(decision.id)} title="Rollback">
                      <UndoIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Paper>
      )}
    </Box>
  );
}
