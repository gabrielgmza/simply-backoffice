import { useState, useEffect, useRef } from 'react';
import {
  Box, Paper, Typography, TextField, Button, CircularProgress,
  List, ListItem, ListItemText, ListItemAvatar, Avatar, Chip,
  Divider, IconButton, Alert, Card, CardContent
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as AriaIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Undo as UndoIcon
} from '@mui/icons-material';
import { api } from '../services/api';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  tool_calls?: string[];
  created_at: string;
}

interface Session {
  id: string;
  status: string;
  started_at: string;
  last_activity: string;
  _count: { messages: number; decisions: number };
}

interface Decision {
  id: string;
  tool_name: string;
  status: string;
  risk_level: string;
  confidence_score: number;
  created_at: string;
  rollback_expires_at?: string;
}

export default function Aria() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (currentSession) {
      loadSession(currentSession);
    }
  }, [currentSession]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadSessions = async () => {
    try {
      const res = await api.get('/backoffice/aria/sessions');
      setSessions(res.data.data || []);
    } catch (err: any) {
      console.error('Error loading sessions:', err);
    }
  };

  const loadSession = async (sessionId: string) => {
    try {
      const res = await api.get(`/backoffice/aria/sessions/${sessionId}`);
      setMessages(res.data.data.messages || []);
      setDecisions(res.data.data.decisions || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error cargando sesión');
    }
  };

  const createSession = async () => {
    setLoading(true);
    try {
      const res = await api.post('/backoffice/aria/sessions');
      setCurrentSession(res.data.data.sessionId);
      setMessages([]);
      setDecisions([]);
      loadSessions();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error creando sesión');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !currentSession) return;
    
    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { 
      id: Date.now().toString(), 
      role: 'user', 
      content: userMessage, 
      created_at: new Date().toISOString() 
    }]);
    setLoading(true);
    setError(null);

    try {
      const res = await api.post(`/backoffice/aria/sessions/${currentSession}/chat`, {
        message: userMessage
      });
      
      setMessages(prev => [...prev, {
        id: Date.now().toString() + '-aria',
        role: 'assistant',
        content: res.data.data.response,
        tool_calls: res.data.data.toolsUsed,
        created_at: new Date().toISOString()
      }]);

      if (res.data.data.decisions?.length > 0) {
        setDecisions(prev => [...res.data.data.decisions, ...prev]);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error enviando mensaje');
    } finally {
      setLoading(false);
    }
  };

  const rollbackDecision = async (decisionId: string) => {
    const reason = prompt('Motivo del rollback:');
    if (!reason) return;

    try {
      await api.post(`/backoffice/aria/decisions/${decisionId}/rollback`, { reason });
      loadSession(currentSession!);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error en rollback');
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 100px)', gap: 2 }}>
      {/* Sessions Sidebar */}
      <Paper sx={{ width: 280, p: 2, overflow: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Sesiones</Typography>
          <IconButton onClick={loadSessions} size="small">
            <RefreshIcon />
          </IconButton>
        </Box>
        <Button
          fullWidth
          variant="contained"
          startIcon={<AriaIcon />}
          onClick={createSession}
          sx={{ mb: 2 }}
        >
          Nueva Sesión
        </Button>
        <List dense>
          {sessions.map(session => (
            <ListItem
              key={session.id}
              button
              selected={session.id === currentSession}
              onClick={() => setCurrentSession(session.id)}
            >
              <ListItemText
                primary={`Sesión ${session.id.slice(0, 8)}...`}
                secondary={`${session._count.messages} msgs • ${new Date(session.started_at).toLocaleDateString()}`}
              />
              <Chip
                size="small"
                label={session.status}
                color={session.status === 'active' ? 'success' : 'default'}
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Chat Area */}
      <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
        {!currentSession ? (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography color="text.secondary">
              Selecciona o crea una sesión para hablar con Aria
            </Typography>
          </Box>
        ) : (
          <>
            {error && (
              <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* Messages */}
            <Box sx={{ flex: 1, overflow: 'auto', mb: 2 }}>
              {messages.map(msg => (
                <Box
                  key={msg.id}
                  sx={{
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    mb: 2
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: '70%',
                      p: 2,
                      borderRadius: 2,
                      bgcolor: msg.role === 'user' ? 'primary.main' : 'grey.100',
                      color: msg.role === 'user' ? 'white' : 'text.primary'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Avatar sx={{ width: 24, height: 24, bgcolor: msg.role === 'user' ? 'primary.dark' : 'secondary.main' }}>
                        {msg.role === 'user' ? <PersonIcon fontSize="small" /> : <AriaIcon fontSize="small" />}
                      </Avatar>
                      <Typography variant="caption">
                        {msg.role === 'user' ? 'Tú' : 'Aria'}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {msg.content}
                    </Typography>
                    {msg.tool_calls && msg.tool_calls.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        {msg.tool_calls.map((tool, i) => (
                          <Chip key={i} size="small" label={tool} sx={{ mr: 0.5 }} />
                        ))}
                      </Box>
                    )}
                  </Box>
                </Box>
              ))}
              {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.100' }}>
                    <CircularProgress size={20} />
                  </Box>
                </Box>
              )}
              <div ref={messagesEndRef} />
            </Box>

            {/* Input */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                placeholder="Escribe un mensaje para Aria..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                disabled={loading}
                multiline
                maxRows={4}
              />
              <Button
                variant="contained"
                onClick={sendMessage}
                disabled={loading || !input.trim()}
              >
                <SendIcon />
              </Button>
            </Box>
          </>
        )}
      </Paper>

      {/* Decisions Sidebar */}
      {currentSession && (
        <Paper sx={{ width: 320, p: 2, overflow: 'auto' }}>
          <Typography variant="h6" gutterBottom>Decisiones</Typography>
          {decisions.length === 0 ? (
            <Typography color="text.secondary" variant="body2">
              Aria no ha tomado decisiones aún
            </Typography>
          ) : (
            <List dense>
              {decisions.map(decision => (
                <Card key={decision.id} sx={{ mb: 1 }}>
                  <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle2">{decision.tool_name}</Typography>
                      <Chip
                        size="small"
                        label={decision.risk_level}
                        color={getRiskColor(decision.risk_level) as any}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Confianza: {(Number(decision.confidence_score) * 100).toFixed(0)}%
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Chip size="small" label={decision.status} />
                      {decision.status === 'executed' && decision.rollback_expires_at && 
                       new Date(decision.rollback_expires_at) > new Date() && (
                        <IconButton size="small" onClick={() => rollbackDecision(decision.id)}>
                          <UndoIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </List>
          )}
        </Paper>
      )}
    </Box>
  );
}
