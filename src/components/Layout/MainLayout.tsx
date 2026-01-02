import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useTheme,
  useMediaQuery,
  Tooltip,
  Badge,
  Collapse,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  TrendingUp,
  CreditCard,
  Settings,
  Logout,
  History,
  SupervisorAccount,
  AccountBalance,
  CurrencyExchange,
  Security,
  Policy,
  ChevronLeft,
  Notifications,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const drawerWidth = 280;
const miniDrawerWidth = 72;

export default function MainLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [financeOpen, setFinanceOpen] = useState(true);
  const [operationsOpen, setOperationsOpen] = useState(true);
  const { employee, logout, hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    toast.success('Sesión cerrada');
    navigate('/login');
  };

  const menuSections = [
    {
      title: 'Principal',
      items: [
        { text: 'Dashboard', icon: <Dashboard />, path: '/', permission: null },
        { text: 'Configuración', icon: <Settings />, path: '/settings', permission: 'settings:read' },
      ],
    },
    {
      title: 'Usuarios',
      items: [
        { text: 'Usuarios', icon: <People />, path: '/users', permission: 'users:read' },
        { text: 'Empleados', icon: <SupervisorAccount />, path: '/employees', permission: 'employees:read' },
      ],
    },
    {
      title: 'Finanzas',
      collapsible: true,
      open: financeOpen,
      toggle: () => setFinanceOpen(!financeOpen),
      items: [
        { text: 'Inversiones', icon: <TrendingUp />, path: '/investments', permission: 'investments:read' },
        { text: 'Financiamientos', icon: <CreditCard />, path: '/financings', permission: 'financings:read' },
        { text: 'Tesorería', icon: <AccountBalance />, path: '/treasury', permission: 'treasury:read' },
        { text: 'Mesa OTC', icon: <CurrencyExchange />, path: '/otc', permission: 'otc:read' },
      ],
    },
    {
      title: 'Seguridad',
      collapsible: true,
      open: operationsOpen,
      toggle: () => setOperationsOpen(!operationsOpen),
      items: [
        { text: 'Alertas de Fraude', icon: <Security />, path: '/fraud', permission: 'fraud:read' },
        { text: 'Compliance', icon: <Policy />, path: '/compliance', permission: 'compliance:read' },
        { text: 'Auditoría', icon: <History />, path: '/audit', permission: 'audit:read' },
      ],
    },
  ];

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
            S
          </Typography>
        </Box>
        {!collapsed && (
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              Simply
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Backoffice
            </Typography>
          </Box>
        )}
      </Box>

      {/* Menu */}
      <Box sx={{ flex: 1, overflow: 'auto', py: 2 }}>
        {menuSections.map((section) => {
          const visibleItems = section.items.filter(
            (item) => !item.permission || hasPermission(item.permission)
          );

          if (visibleItems.length === 0) return null;

          return (
            <Box key={section.title} sx={{ mb: 2 }}>
              {!collapsed && (
                <Box
                  sx={{
                    px: 3,
                    py: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: section.collapsible ? 'pointer' : 'default',
                  }}
                  onClick={section.toggle}
                >
                  <Typography
                    variant="overline"
                    sx={{
                      color: 'text.secondary',
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      letterSpacing: 1.5,
                    }}
                  >
                    {section.title}
                  </Typography>
                  {section.collapsible && (
                    section.open ? <ExpandLess sx={{ fontSize: 18, color: 'text.secondary' }} /> : <ExpandMore sx={{ fontSize: 18, color: 'text.secondary' }} />
                  )}
                </Box>
              )}

              <Collapse in={!section.collapsible || section.open} timeout="auto">
                <List sx={{ px: 1 }}>
                  {visibleItems.map((item) => {
                    const isActive = location.pathname === item.path;

                    return (
                      <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                        <Tooltip title={collapsed ? item.text : ''} placement="right">
                          <ListItemButton
                            onClick={() => {
                              navigate(item.path);
                              if (isMobile) setMobileOpen(false);
                            }}
                            sx={{
                              borderRadius: 2,
                              mx: 1,
                              bgcolor: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                              '&:hover': {
                                bgcolor: isActive ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.05)',
                              },
                            }}
                          >
                            <ListItemIcon
                              sx={{
                                color: isActive ? '#818cf8' : 'text.secondary',
                                minWidth: collapsed ? 0 : 40,
                              }}
                            >
                              {item.icon}
                            </ListItemIcon>
                            {!collapsed && (
                              <ListItemText
                                primary={item.text}
                                primaryTypographyProps={{
                                  fontSize: '0.875rem',
                                  fontWeight: isActive ? 600 : 400,
                                  color: isActive ? '#818cf8' : 'text.primary',
                                }}
                              />
                            )}
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

      {/* User section */}
      <Box
        sx={{
          p: 2,
          borderTop: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 1.5,
            borderRadius: 2,
            bgcolor: 'rgba(255,255,255,0.03)',
          }}
        >
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: '#6366f1',
              fontSize: '0.875rem',
            }}
          >
            {employee?.firstName?.[0]}{employee?.lastName?.[0]}
          </Avatar>
          {!collapsed && (
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }} noWrap>
                {employee?.firstName} {employee?.lastName}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {employee?.role}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${collapsed ? miniDrawerWidth : drawerWidth}px)` },
          ml: { md: `${collapsed ? miniDrawerWidth : drawerWidth}px` },
          bgcolor: 'background.paper',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          boxShadow: 'none',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <IconButton
            color="inherit"
            onClick={() => setCollapsed(!collapsed)}
            sx={{ mr: 2, display: { xs: 'none', md: 'flex' } }}
          >
            <ChevronLeft sx={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
          </IconButton>

          <Box sx={{ flex: 1 }} />

          <IconButton color="inherit" sx={{ mr: 1 }}>
            <Badge badgeContent={3} color="error">
              <Notifications />
            </Badge>
          </IconButton>

          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: '#6366f1' }}>
              {employee?.firstName?.[0]}
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* User Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {employee?.firstName} {employee?.lastName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {employee?.email}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Cerrar Sesión
        </MenuItem>
      </Menu>

      {/* Drawer Mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            bgcolor: 'background.paper',
            borderRight: '1px solid rgba(255,255,255,0.05)',
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Drawer Desktop */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: collapsed ? miniDrawerWidth : drawerWidth,
            bgcolor: 'background.paper',
            borderRight: '1px solid rgba(255,255,255,0.05)',
            transition: 'width 0.3s ease',
            overflowX: 'hidden',
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${collapsed ? miniDrawerWidth : drawerWidth}px)` },
          mt: '64px',
          bgcolor: 'background.default',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
