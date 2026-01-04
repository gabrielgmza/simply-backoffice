import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, AppBar, Toolbar, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  IconButton, Avatar, Menu, MenuItem, Divider, useTheme, useMediaQuery, Tooltip, Badge, Collapse,
  Popover, CircularProgress, Fab, Dialog, DialogTitle, DialogContent, TextField, Button
} from '@mui/material';
import {
  Menu as MenuIcon, Dashboard, People, TrendingUp, CreditCard, Settings, Logout, History,
  SupervisorAccount, AccountBalance, CurrencyExchange, Security, Policy, ChevronLeft, Notifications,
  ExpandLess, ExpandMore, SmartToy, SupportAgent, Extension, HowToReg, Close, Send, Check, CardGiftcard
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { notificationsApi } from '../../services/api';
import toast from 'react-hot-toast';
import api from '../../services/api';

const drawerWidth = 260;
const miniDrawerWidth = 72;

interface Notification {
  id: string; title: string; message: string; type: string; read: boolean; created_at: string;
}

export default function MainLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifAnchor, setNotifAnchor] = useState<null | HTMLElement>(null);
  const [financeOpen, setFinanceOpen] = useState(true);
  const [securityOpen, setSecurityOpen] = useState(true);
  const [supportOpen, setSupportOpen] = useState(true);
  const { employee, logout, hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);

  // Aria floating
  const [ariaOpen, setAriaOpen] = useState(false);
  const [ariaMessage, setAriaMessage] = useState('');
  const [ariaChat, setAriaChat] = useState<{role: string; content: string}[]>([]);
  const [ariaLoading, setAriaLoading] = useState(false);
  const [ariaSessionId, setAriaSessionId] = useState<string | null>(null);

  useEffect(() => { loadNotifications(); const interval = setInterval(loadNotifications, 60000); return () => clearInterval(interval); }, []);

  const loadNotifications = async () => {
    try {
      const [notifRes, countRes] = await Promise.all([
        notificationsApi.getAll(10),
        notificationsApi.getUnreadCount()
      ]);
      setNotifications(notifRes.data.data || []);
      setUnreadCount(countRes.data.data?.count || 0);
    } catch (err) { console.error(err); }
  };

  const markAsRead = async (id: string) => {
    try { await notificationsApi.markAsRead(id); loadNotifications(); }
    catch (err) { console.error(err); }
  };

  const markAllRead = async () => {
    try { await notificationsApi.markAllAsRead(); loadNotifications(); toast.success('Notificaciones marcadas como leídas'); }
    catch (err) { console.error(err); }
  };

  // Aria Chat
  const initAriaSession = async () => {
    if (ariaSessionId) return;
    try {
      const res = await api.post('/api/backoffice/aria/sessions');
      setAriaSessionId(res.data.data.sessionId);
    } catch (err) { console.error(err); }
  };

  const sendToAria = async () => {
    if (!ariaMessage.trim()) return;
    const msg = ariaMessage;
    setAriaMessage('');
    setAriaChat(prev => [...prev, { role: 'user', content: msg }]);
    setAriaLoading(true);

    try {
      if (!ariaSessionId) await initAriaSession();
      const res = await api.post(`/api/backoffice/aria/sessions/${ariaSessionId}/chat`, { message: msg });
      setAriaChat(prev => [...prev, { role: 'assistant', content: res.data.data.response }]);
    } catch (err: any) {
      setAriaChat(prev => [...prev, { role: 'assistant', content: 'Error: ' + (err.response?.data?.error || 'No pude procesar tu solicitud') }]);
    } finally { setAriaLoading(false); }
  };

  const handleLogout = () => { logout(); toast.success('Sesión cerrada'); navigate('/login'); };

  const menuSections = [
    { title: 'Principal', items: [
      { text: 'Dashboard', icon: <Dashboard />, path: '/', permission: null },
      { text: 'Configuración', icon: <Settings />, path: '/settings', permission: 'settings:read' },
    ]},
    { title: 'Usuarios', items: [
      { text: 'Usuarios', icon: <People />, path: '/users', permission: 'users:read' },
      { text: 'Empleados', icon: <SupervisorAccount />, path: '/employees', permission: 'employees:read' },
    ]},
    { title: 'Finanzas', collapsible: true, open: financeOpen, toggle: () => setFinanceOpen(!financeOpen), items: [
      { text: 'Inversiones', icon: <TrendingUp />, path: '/investments', permission: 'investments:read' },
      { text: 'Financiamientos', icon: <CreditCard />, path: '/financings', permission: 'financings:read' },
      { text: 'Tesorería', icon: <AccountBalance />, path: '/treasury', permission: 'treasury:read' },
      { text: 'Mesa OTC', icon: <CurrencyExchange />, path: '/otc', permission: 'otc:read' },
      { text: 'BCRA', icon: <AccountBalance />, path: '/bcra', permission: 'compliance:read' },
    ]},
    { title: 'Seguridad', collapsible: true, open: securityOpen, toggle: () => setSecurityOpen(!securityOpen), items: [
      { text: 'Alertas de Fraude', icon: <Security />, path: '/fraud', permission: 'fraud:read' },
      { text: 'Compliance', icon: <Policy />, path: '/compliance', permission: 'compliance:read' },
      { text: 'Auditoría', icon: <History />, path: '/audit', permission: 'audit:read' },
      { text: 'Aprobaciones', icon: <HowToReg />, path: '/approvals', permission: null },
    ]},
    { title: 'Soporte & AI', collapsible: true, open: supportOpen, toggle: () => setSupportOpen(!supportOpen), items: [
      { text: 'Tickets', icon: <SupportAgent />, path: '/tickets', permission: null },
      { text: 'Proveedores', icon: <Extension />, path: '/providers', permission: null },
      { text: 'Rewards', icon: <CardGiftcard />, path: '/rewards', permission: 'rewards:read' },
    ]},
  ];

  const currentDrawerWidth = collapsed ? miniDrawerWidth : drawerWidth;

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Box sx={{ width: 40, height: 40, borderRadius: 2, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>S</Typography>
        </Box>
        {!collapsed && <Box><Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>Simply</Typography><Typography variant="caption" sx={{ color: 'text.secondary' }}>Backoffice</Typography></Box>}
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto', py: 2 }}>
        {menuSections.map((section) => {
          const visibleItems = section.items.filter(item => !item.permission || hasPermission(item.permission));
          if (visibleItems.length === 0) return null;
          return (
            <Box key={section.title} sx={{ mb: 1 }}>
              {!collapsed && (
                <Box sx={{ px: 3, py: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: section.collapsible ? 'pointer' : 'default' }} onClick={section.toggle}>
                  <Typography variant="overline" sx={{ color: 'text.secondary', fontSize: '0.65rem', fontWeight: 600, letterSpacing: 1 }}>{section.title}</Typography>
                  {section.collapsible && (section.open ? <ExpandLess sx={{ fontSize: 16, color: 'text.secondary' }} /> : <ExpandMore sx={{ fontSize: 16, color: 'text.secondary' }} />)}
                </Box>
              )}
              <Collapse in={!section.collapsible || section.open} timeout="auto">
                <List sx={{ px: 0.5 }} dense>
                  {visibleItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <ListItem key={item.text} disablePadding sx={{ mb: 0.25 }}>
                        <Tooltip title={collapsed ? item.text : ''} placement="right">
                          <ListItemButton onClick={() => { navigate(item.path); if (isMobile) setMobileOpen(false); }}
                            sx={{ borderRadius: 1.5, mx: 0.5, py: 0.75, bgcolor: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent', '&:hover': { bgcolor: isActive ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.05)' } }}>
                            <ListItemIcon sx={{ color: isActive ? '#818cf8' : 'text.secondary', minWidth: collapsed ? 0 : 36 }}>{item.icon}</ListItemIcon>
                            {!collapsed && <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: isActive ? 600 : 400, color: isActive ? '#818cf8' : 'text.primary' }} />}
                          </ListItemButton>
                        </Tooltip>
                      </ListItem>
                    );
                  })}
                </List>
              </Collapse>
            </Box>
          );
        })}
      </Box>

      <Box sx={{ p: 1.5, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)' }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: '#6366f1', fontSize: '0.75rem' }}>{employee?.firstName?.[0]}{employee?.lastName?.[0]}</Avatar>
          {!collapsed && <Box sx={{ flex: 1, minWidth: 0 }}><Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }} noWrap>{employee?.firstName} {employee?.lastName}</Typography><Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }} noWrap>{employee?.role}</Typography></Box>}
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ width: { md: `calc(100% - ${currentDrawerWidth}px)` }, ml: { md: `${currentDrawerWidth}px` }, bgcolor: 'background.paper', borderBottom: '1px solid rgba(255,255,255,0.05)', boxShadow: 'none' }}>
        <Toolbar sx={{ minHeight: 56 }}>
          <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 2, display: { md: 'none' } }}><MenuIcon /></IconButton>
          <IconButton color="inherit" onClick={() => setCollapsed(!collapsed)} sx={{ mr: 2, display: { xs: 'none', md: 'flex' } }}><ChevronLeft sx={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: '0.2s' }} /></IconButton>
          <Box sx={{ flex: 1 }} />

          {/* Notifications */}
          <IconButton color="inherit" onClick={(e) => setNotifAnchor(e.currentTarget)} sx={{ mr: 1 }}>
            <Badge badgeContent={unreadCount} color="error"><Notifications /></Badge>
          </IconButton>
          <Popover open={Boolean(notifAnchor)} anchorEl={notifAnchor} onClose={() => setNotifAnchor(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
            <Box sx={{ width: 360, maxHeight: 400 }}>
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle1" fontWeight={600}>Notificaciones</Typography>
                {unreadCount > 0 && <Button size="small" onClick={markAllRead}>Marcar todas</Button>}
              </Box>
              {notifications.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}><Typography color="text.secondary">Sin notificaciones</Typography></Box>
              ) : (
                <List sx={{ p: 0 }}>
                  {notifications.map(notif => (
                    <ListItem key={notif.id} sx={{ bgcolor: notif.read ? 'transparent' : 'action.hover', cursor: 'pointer' }} onClick={() => markAsRead(notif.id)}>
                      <ListItemText
                        primary={<Typography variant="body2" fontWeight={notif.read ? 400 : 600}>{notif.title}</Typography>}
                        secondary={<><Typography variant="caption" color="text.secondary">{notif.message}</Typography><br/><Typography variant="caption" color="text.disabled">{new Date(notif.created_at).toLocaleString()}</Typography></>}
                      />
                      {!notif.read && <Check sx={{ color: 'success.main', fontSize: 18 }} />}
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </Popover>

          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}><Avatar sx={{ width: 32, height: 32, bgcolor: '#6366f1' }}>{employee?.firstName?.[0]}</Avatar></IconButton>
        </Toolbar>
      </AppBar>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)} transformOrigin={{ horizontal: 'right', vertical: 'top' }} anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
        <Box sx={{ px: 2, py: 1 }}><Typography variant="body2" fontWeight={600}>{employee?.firstName} {employee?.lastName}</Typography><Typography variant="caption" color="text.secondary">{employee?.email}</Typography></Box>
        <Divider />
        <MenuItem onClick={handleLogout}><ListItemIcon><Logout fontSize="small" /></ListItemIcon>Cerrar Sesión</MenuItem>
      </Menu>

      <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: drawerWidth, bgcolor: 'background.paper' } }}>{drawer}</Drawer>
      <Drawer variant="permanent" sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: currentDrawerWidth, bgcolor: 'background.paper', borderRight: '1px solid rgba(255,255,255,0.05)', transition: 'width 0.2s', overflowX: 'hidden' } }}>{drawer}</Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, ml: { md: `${currentDrawerWidth}px` }, width: { xs: '100%', md: `calc(100% - ${currentDrawerWidth}px)` }, mt: '56px', bgcolor: 'background.default', minHeight: 'calc(100vh - 56px)', transition: 'margin-left 0.2s, width 0.2s' }}>
        <Outlet />
      </Box>

      {/* Aria Floating Button */}
      {hasPermission('aria:use') && (
        <>
          <Fab color="primary" onClick={() => { setAriaOpen(true); initAriaSession(); }} sx={{ position: 'fixed', bottom: 24, right: 24, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
            <SmartToy />
          </Fab>

          <Dialog open={ariaOpen} onClose={() => setAriaOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, maxHeight: '80vh' } }}>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', width: 36, height: 36 }}><SmartToy /></Avatar>
                <Box><Typography variant="subtitle1" fontWeight={600}>Aria</Typography><Typography variant="caption" color="text.secondary">Tu asistente AI</Typography></Box>
              </Box>
              <IconButton onClick={() => setAriaOpen(false)}><Close /></IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 2, height: 350, overflow: 'auto' }}>
              {ariaChat.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}><Typography color="text.secondary">¡Hola! Soy Aria, tu asistente. ¿En qué puedo ayudarte?</Typography></Box>
              ) : ariaChat.map((msg, i) => (
                <Box key={i} sx={{ mb: 2, display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <Box sx={{ maxWidth: '80%', p: 1.5, borderRadius: 2, bgcolor: msg.role === 'user' ? 'primary.main' : 'grey.800', color: 'white' }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{msg.content}</Typography>
                  </Box>
                </Box>
              ))}
              {ariaLoading && <Box sx={{ display: 'flex', gap: 1, color: 'text.secondary' }}><CircularProgress size={16} /><Typography variant="body2">Pensando...</Typography></Box>}
            </DialogContent>
            <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
              <TextField fullWidth size="small" placeholder="Escribe un mensaje..." value={ariaMessage} onChange={e => setAriaMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' && sendToAria()} disabled={ariaLoading} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              <Button variant="contained" onClick={sendToAria} disabled={ariaLoading || !ariaMessage.trim()} sx={{ borderRadius: 2, minWidth: 48, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}><Send /></Button>
            </Box>
          </Dialog>
        </>
      )}
    </Box>
  );
}
