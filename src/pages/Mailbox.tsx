import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
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
  ListItemButton,
  Avatar,
  IconButton,
  Divider,
  TextField,
  InputAdornment,
  Badge,
  Drawer,
} from '@mui/material';
import {
  Inbox,
  Send,
  Drafts,
  Delete,
  Archive,
  Star,
  StarBorder,
  Search,
  Refresh,
  Create,
  AttachFile,
  MoreVert,
  Construction,
  Folder,
  Label,
  Person,
  Business,
} from '@mui/icons-material';

// Mock data
const mockFolders = [
  { name: 'Inbox', icon: <Inbox />, count: 45, unread: 8 },
  { name: 'Sent', icon: <Send />, count: 120, unread: 0 },
  { name: 'Drafts', icon: <Drafts />, count: 3, unread: 0 },
  { name: 'Trash', icon: <Delete />, count: 12, unread: 0 },
  { name: 'Archive', icon: <Archive />, count: 89, unread: 0 },
];

const mockEmails = [
  {
    id: '1',
    from: 'cliente@email.com',
    fromName: 'Juan Pérez',
    subject: 'Consulta sobre inversiones',
    preview: 'Hola, me gustaría saber más sobre los FCI disponibles y cómo empezar a invertir...',
    date: '10:30',
    unread: true,
    starred: false,
    hasAttachment: false,
  },
  {
    id: '2',
    from: 'maria@empresa.com',
    fromName: 'María González',
    subject: 'Solicitud de información comercial',
    preview: 'Buenos días, necesito información sobre servicios B2B para nuestra empresa...',
    date: '09:15',
    unread: true,
    starred: true,
    hasAttachment: true,
  },
  {
    id: '3',
    from: 'proveedor@bind.com.ar',
    fromName: 'Banco BIND',
    subject: 'Re: Integración API - Documentación',
    preview: 'Adjunto la documentación técnica actualizada para la integración...',
    date: 'Ayer',
    unread: false,
    starred: false,
    hasAttachment: true,
  },
  {
    id: '4',
    from: 'soporte@visa.com',
    fromName: 'VISA Argentina',
    subject: 'Certificación PCI DSS - Próximos pasos',
    preview: 'Estimados, les informamos los próximos pasos para completar la certificación...',
    date: 'Ayer',
    unread: false,
    starred: true,
    hasAttachment: false,
  },
  {
    id: '5',
    from: 'compliance@uif.gob.ar',
    fromName: 'UIF Argentina',
    subject: 'Confirmación de recepción ROS',
    preview: 'Se confirma la recepción del Reporte de Operación Sospechosa...',
    date: '2 Ene',
    unread: false,
    starred: false,
    hasAttachment: false,
  },
];

const mockMailboxes = [
  { email: 'soporte@paysur.com', name: 'Soporte', unread: 5 },
  { email: 'info@paysur.com', name: 'Información', unread: 3 },
  { email: 'compliance@paysur.com', name: 'Compliance', unread: 0 },
  { email: 'operaciones@paysur.com', name: 'Operaciones', unread: 2 },
];

export default function Mailbox() {
  const [selectedFolder, setSelectedFolder] = useState('Inbox');
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Buzón de Correo
        </Typography>
        <Chip 
          icon={<Construction />} 
          label="En Desarrollo" 
          color="warning" 
          variant="outlined" 
        />
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Módulo en desarrollo.</strong> Sistema de correo corporativo @paysur.com. 
        Los emails se asignan a empleados y nunca se eliminan permanentemente por compliance.
      </Alert>

      <Grid container spacing={2}>
        {/* Sidebar */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Button 
              variant="contained" 
              fullWidth 
              startIcon={<Create />}
              onClick={() => setComposeOpen(true)}
              disabled
            >
              Redactar
            </Button>
          </Paper>

          {/* Folders */}
          <Paper sx={{ mb: 2 }}>
            <List>
              {mockFolders.map((folder) => (
                <ListItemButton
                  key={folder.name}
                  selected={selectedFolder === folder.name}
                  onClick={() => setSelectedFolder(folder.name)}
                >
                  <ListItemAvatar>
                    <Badge badgeContent={folder.unread} color="error">
                      {folder.icon}
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText primary={folder.name} />
                  <Typography variant="body2" color="text.secondary">
                    {folder.count}
                  </Typography>
                </ListItemButton>
              ))}
            </List>
          </Paper>

          {/* Mailboxes */}
          <Paper>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle2" color="text.secondary">
                CUENTAS @PAYSUR.COM
              </Typography>
            </Box>
            <List>
              {mockMailboxes.map((mailbox) => (
                <ListItem key={mailbox.email} dense>
                  <ListItemAvatar>
                    <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>
                      {mailbox.name.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={mailbox.name}
                    secondary={mailbox.email}
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                  {mailbox.unread > 0 && (
                    <Chip label={mailbox.unread} size="small" color="error" />
                  )}
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Email List */}
        <Grid item xs={12} md={selectedEmail ? 4 : 9}>
          <Paper>
            {/* Toolbar */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                placeholder="Buscar emails..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                sx={{ flexGrow: 1 }}
              />
              <IconButton disabled>
                <Refresh />
              </IconButton>
            </Box>

            {/* Email List */}
            <List sx={{ maxHeight: 'calc(100vh - 350px)', overflow: 'auto' }}>
              {mockEmails.map((email, index) => (
                <Box key={email.id}>
                  <ListItemButton
                    selected={selectedEmail === email.id}
                    onClick={() => setSelectedEmail(email.id)}
                    sx={{ 
                      bgcolor: email.unread ? 'action.hover' : 'transparent',
                    }}
                  >
                    <IconButton size="small" sx={{ mr: 1 }} disabled>
                      {email.starred ? <Star color="warning" /> : <StarBorder />}
                    </IconButton>
                    <ListItemAvatar>
                      <Avatar>{email.fromName.charAt(0)}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography 
                            variant="body2" 
                            fontWeight={email.unread ? 'bold' : 'normal'}
                          >
                            {email.fromName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {email.date}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography 
                            variant="body2" 
                            fontWeight={email.unread ? 'bold' : 'normal'}
                            noWrap
                          >
                            {email.subject}
                            {email.hasAttachment && (
                              <AttachFile sx={{ fontSize: 14, ml: 0.5, verticalAlign: 'middle' }} />
                            )}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {email.preview}
                          </Typography>
                        </>
                      }
                    />
                  </ListItemButton>
                  {index < mockEmails.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Email Detail */}
        {selectedEmail && (
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3 }}>
              {(() => {
                const email = mockEmails.find(e => e.id === selectedEmail);
                if (!email) return null;
                return (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6">{email.subject}</Typography>
                      <IconButton disabled>
                        <MoreVert />
                      </IconButton>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Avatar sx={{ width: 48, height: 48 }}>
                        {email.fromName.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {email.fromName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {email.from}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                        {email.date}
                      </Typography>
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
                      {email.preview}
                      <br /><br />
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
                      incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud 
                      exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                      <br /><br />
                      Saludos cordiales,
                      <br />
                      {email.fromName}
                    </Typography>

                    {email.hasAttachment && (
                      <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1, mb: 3 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          <AttachFile sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                          Adjuntos
                        </Typography>
                        <Chip 
                          icon={<AttachFile />} 
                          label="documento.pdf (2.4 MB)" 
                          variant="outlined" 
                          size="small"
                        />
                      </Box>
                    )}

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button variant="contained" disabled>
                        Responder
                      </Button>
                      <Button variant="outlined" disabled>
                        Reenviar
                      </Button>
                      <Button variant="outlined" color="error" disabled>
                        Archivar
                      </Button>
                    </Box>
                  </>
                );
              })()}
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Compose Drawer (placeholder) */}
      <Drawer
        anchor="bottom"
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        PaperProps={{ sx: { height: '70vh', borderTopLeftRadius: 16, borderTopRightRadius: 16 } }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Nuevo Mensaje</Typography>
          <Alert severity="info">
            La funcionalidad de envío de correos estará disponible próximamente.
          </Alert>
        </Box>
      </Drawer>
    </Box>
  );
}
