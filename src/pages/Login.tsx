import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  Divider,
  Avatar,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  AdminPanelSettings,
  TrendingUp,
  Security,
  Speed,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      toast.success('¡Bienvenido al panel de administración!');
      navigate('/');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Credenciales inválidas';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: <TrendingUp />, title: 'Inversiones', desc: 'Gestión de FCI' },
    { icon: <Security />, title: 'Compliance', desc: 'UIF & KYC' },
    { icon: <Speed />, title: 'Real-time', desc: 'Monitoreo 24/7' },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%)',
      }}
    >
      {/* Panel izquierdo - Branding */}
      <Box
        sx={{
          flex: 1,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 6,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Efectos de fondo */}
        <Box
          sx={{
            position: 'absolute',
            top: '20%',
            left: '10%',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '20%',
            right: '10%',
            width: 250,
            height: 250,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />

        {/* Logo grande */}
        <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: 4,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 4,
              boxShadow: '0 20px 60px rgba(99,102,241,0.4)',
            }}
          >
            <Typography variant="h2" sx={{ color: 'white', fontWeight: 800 }}>
              S
            </Typography>
          </Box>

          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
            }}
          >
            Simply Backoffice
          </Typography>

          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.6)', mb: 6, maxWidth: 400 }}>
            Panel de administración para la gestión integral de tu plataforma fintech
          </Typography>

          {/* Features */}
          <Box sx={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
            {features.map((feature, index) => (
              <Box key={index} sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    bgcolor: 'rgba(99,102,241,0.1)',
                    border: '1px solid rgba(99,102,241,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 1,
                    color: '#818cf8',
                  }}
                >
                  {feature.icon}
                </Box>
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                  {feature.title}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                  {feature.desc}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Panel derecho - Login form */}
      <Box
        sx={{
          flex: { xs: 1, md: 0.6 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2, sm: 4 },
        }}
      >
        <Card
          sx={{
            maxWidth: 440,
            width: '100%',
            bgcolor: 'rgba(26,26,46,0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(99,102,241,0.1)',
            borderRadius: 4,
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
            {/* Header mobile */}
            <Box sx={{ display: { xs: 'block', md: 'none' }, textAlign: 'center', mb: 4 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                  S
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'white' }}>
                Simply Backoffice
              </Typography>
            </Box>

            {/* Icono admin */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: 'rgba(99,102,241,0.15)',
                  color: '#818cf8',
                }}
              >
                <AdminPanelSettings />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
                  Iniciar Sesión
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                  Accede con tus credenciales de empleado
                </Typography>
              </Box>
            </Box>

            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  bgcolor: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  '& .MuiAlert-icon': { color: '#ef4444' },
                }}
              >
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: 'rgba(255,255,255,0.3)' }} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                sx={{ mb: 4 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: 'rgba(255,255,255,0.3)' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: 'rgba(255,255,255,0.5)' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  py: 1.5,
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  fontWeight: 600,
                  fontSize: '1rem',
                  borderRadius: 2,
                  textTransform: 'none',
                  boxShadow: '0 10px 30px rgba(99,102,241,0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                    boxShadow: '0 15px 40px rgba(99,102,241,0.4)',
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: 'white' }} />
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>
            </form>

            <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.1)' }} />

            <Typography variant="body2" sx={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
              Simply by PaySur © {new Date().getFullYear()}
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
