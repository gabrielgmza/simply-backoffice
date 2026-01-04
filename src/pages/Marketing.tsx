import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Divider,
  LinearProgress,
} from '@mui/material';
import {
  Campaign as CampaignIcon,
  People as LeadsIcon,
  Image as BannerIcon,
  Share as SocialIcon,
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  Email,
  Notifications,
  Add,
  Refresh,
  TrendingUp,
  Construction,
} from '@mui/icons-material';

// Tabs
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

// Mock data
const mockCampaigns = [
  { id: '1', name: 'Bienvenida Enero', type: 'EMAIL', status: 'COMPLETED', sent: 1250, opened: 890 },
  { id: '2', name: 'Promo Inversión', type: 'PUSH', status: 'ACTIVE', sent: 5000, opened: 2100 },
  { id: '3', name: 'Black Friday', type: 'EMAIL', status: 'SCHEDULED', sent: 0, opened: 0 },
];

const mockLeads = [
  { id: '1', email: 'juan@email.com', name: 'Juan Pérez', source: 'LANDING', status: 'NEW', date: '2025-01-04' },
  { id: '2', email: 'maria@email.com', name: 'María González', source: 'LANDING', status: 'CONTACTED', date: '2025-01-03' },
  { id: '3', email: 'carlos@email.com', name: 'Carlos López', source: 'REFERRAL', status: 'QUALIFIED', date: '2025-01-02' },
];

const mockSocialMessages = [
  { id: '1', platform: 'FACEBOOK', sender: 'Juan Pérez', message: '¿Cómo puedo invertir?', unread: true },
  { id: '2', platform: 'INSTAGRAM', sender: '@maria_g', message: '¿Tienen app para iOS?', unread: true },
  { id: '3', platform: 'TWITTER', sender: '@carlos_l', message: 'Excelente servicio!', unread: false },
];

export default function Marketing() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'FACEBOOK': return <Facebook sx={{ color: '#1877F2' }} />;
      case 'INSTAGRAM': return <Instagram sx={{ color: '#E4405F' }} />;
      case 'TWITTER': return <Twitter sx={{ color: '#1DA1F2' }} />;
      case 'LINKEDIN': return <LinkedIn sx={{ color: '#0A66C2' }} />;
      default: return <SocialIcon />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'ACTIVE': return 'primary';
      case 'SCHEDULED': return 'warning';
      case 'NEW': return 'error';
      case 'CONTACTED': return 'info';
      case 'QUALIFIED': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Marketing
        </Typography>
        <Chip 
          icon={<Construction />} 
          label="En Desarrollo" 
          color="warning" 
          variant="outlined" 
        />
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Módulo en desarrollo.</strong> Las funcionalidades de campañas, leads y redes sociales estarán disponibles próximamente. 
        Los datos mostrados son de ejemplo.
      </Alert>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CampaignIcon color="primary" />
                <Typography variant="subtitle2" color="text.secondary">Campañas Activas</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>3</Typography>
              <Typography variant="caption" color="success.main">+2 este mes</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LeadsIcon color="secondary" />
                <Typography variant="subtitle2" color="text.secondary">Leads Nuevos</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>156</Typography>
              <Typography variant="caption" color="success.main">+23 esta semana</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email color="info" />
                <Typography variant="subtitle2" color="text.secondary">Emails Enviados</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>12.5K</Typography>
              <Typography variant="caption" color="text.secondary">Este mes</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp color="success" />
                <Typography variant="subtitle2" color="text.secondary">Conversión</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>22%</Typography>
              <Typography variant="caption" color="success.main">+5% vs mes anterior</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
          <Tab icon={<CampaignIcon />} label="Campañas" />
          <Tab icon={<LeadsIcon />} label="Leads" />
          <Tab icon={<BannerIcon />} label="Banners" />
          <Tab icon={<SocialIcon />} label="Social Media" />
        </Tabs>
      </Paper>

      {/* Tab: Campañas */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Campañas de Marketing</Typography>
          <Button variant="contained" startIcon={<Add />} disabled>
            Nueva Campaña
          </Button>
        </Box>
        <Grid container spacing={2}>
          {mockCampaigns.map((campaign) => (
            <Grid item xs={12} md={4} key={campaign.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <Typography variant="h6">{campaign.name}</Typography>
                    <Chip 
                      label={campaign.status} 
                      size="small" 
                      color={getStatusColor(campaign.status) as any}
                    />
                  </Box>
                  <Chip 
                    icon={campaign.type === 'EMAIL' ? <Email /> : <Notifications />}
                    label={campaign.type}
                    size="small"
                    variant="outlined"
                    sx={{ mt: 1 }}
                  />
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Enviados: {campaign.sent.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Abiertos: {campaign.opened.toLocaleString()} ({campaign.sent > 0 ? Math.round(campaign.opened / campaign.sent * 100) : 0}%)
                    </Typography>
                    {campaign.sent > 0 && (
                      <LinearProgress 
                        variant="determinate" 
                        value={campaign.opened / campaign.sent * 100} 
                        sx={{ mt: 1 }}
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Tab: Leads */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Leads desde Landing</Typography>
          <Button variant="outlined" startIcon={<Refresh />} disabled>
            Actualizar
          </Button>
        </Box>
        <Paper>
          <List>
            {mockLeads.map((lead, index) => (
              <Box key={lead.id}>
                <ListItem
                  secondaryAction={
                    <Chip 
                      label={lead.status} 
                      size="small" 
                      color={getStatusColor(lead.status) as any}
                    />
                  }
                >
                  <ListItemAvatar>
                    <Avatar>{lead.name.charAt(0)}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={lead.name}
                    secondary={
                      <>
                        {lead.email} • {lead.source} • {lead.date}
                      </>
                    }
                  />
                </ListItem>
                {index < mockLeads.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        </Paper>
      </TabPanel>

      {/* Tab: Banners */}
      <TabPanel value={tabValue} index={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Banners de la App</Typography>
          <Button variant="contained" startIcon={<Add />} disabled>
            Nuevo Banner
          </Button>
        </Box>
        <Alert severity="info">
          Los banners se mostrarán en la aplicación móvil. Configura posiciones como HOME_TOP, HOME_BOTTOM, INVEST_TOP, etc.
        </Alert>
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <Box sx={{ height: 150, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="h6" color="white">Banner Home Top</Typography>
              </Box>
              <CardContent>
                <Typography variant="subtitle1">Promo Inversión</Typography>
                <Typography variant="body2" color="text.secondary">
                  Posición: HOME_TOP • Activo • 12,500 impresiones
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <Box sx={{ height: 150, bgcolor: 'secondary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="h6" color="white">Banner Financiación</Typography>
              </Box>
              <CardContent>
                <Typography variant="subtitle1">0% Interés</Typography>
                <Typography variant="body2" color="text.secondary">
                  Posición: INVEST_TOP • Activo • 8,900 impresiones
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Tab: Social Media */}
      <TabPanel value={tabValue} index={3}>
        <Grid container spacing={3}>
          {/* Conexiones */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Redes Conectadas</Typography>
              <List>
                <ListItem>
                  <ListItemAvatar><Avatar sx={{ bgcolor: '#1877F2' }}><Facebook /></Avatar></ListItemAvatar>
                  <ListItemText primary="Facebook" secondary="Simply Argentina • 12,500 seguidores" />
                  <Chip label="Conectado" color="success" size="small" />
                </ListItem>
                <ListItem>
                  <ListItemAvatar><Avatar sx={{ bgcolor: '#E4405F' }}><Instagram /></Avatar></ListItemAvatar>
                  <ListItemText primary="Instagram" secondary="@simply.ar • 8,900 seguidores" />
                  <Chip label="Conectado" color="success" size="small" />
                </ListItem>
                <ListItem>
                  <ListItemAvatar><Avatar sx={{ bgcolor: '#1DA1F2' }}><Twitter /></Avatar></ListItemAvatar>
                  <ListItemText primary="X (Twitter)" secondary="@SimplyAR • 4,500 seguidores" />
                  <Chip label="Conectado" color="success" size="small" />
                </ListItem>
                <ListItem>
                  <ListItemAvatar><Avatar sx={{ bgcolor: '#0A66C2' }}><LinkedIn /></Avatar></ListItemAvatar>
                  <ListItemText primary="LinkedIn" secondary="Simply by PaySur • 3,200 seguidores" />
                  <Chip label="Conectado" color="success" size="small" />
                </ListItem>
              </List>
            </Paper>
          </Grid>

          {/* Mensajes */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Bandeja Unificada</Typography>
                <Chip label="3 sin leer" color="error" size="small" />
              </Box>
              <List>
                {mockSocialMessages.map((msg, index) => (
                  <Box key={msg.id}>
                    <ListItem
                      secondaryAction={
                        <IconButton disabled>
                          <Email />
                        </IconButton>
                      }
                    >
                      <ListItemAvatar>
                        {getPlatformIcon(msg.platform)}
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1" fontWeight={msg.unread ? 'bold' : 'normal'}>
                              {msg.sender}
                            </Typography>
                            {msg.unread && <Chip label="Nuevo" size="small" color="error" />}
                          </Box>
                        }
                        secondary={msg.message}
                      />
                    </ListItem>
                    {index < mockSocialMessages.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Publicar */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Publicar en Todas las Redes</Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Esta función permitirá crear una publicación y replicarla automáticamente en Facebook, Instagram, Twitter y LinkedIn.
              </Alert>
              <Button variant="contained" startIcon={<Add />} disabled>
                Nueva Publicación
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>
    </Box>
  );
}
