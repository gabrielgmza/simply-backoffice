import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import { useMockAuth } from '@/hooks/useMockAuth';
import { AlertCircle, Bug } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showMFA, setShowMFA] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  
  const navigate = useNavigate();
  const setAuth = useAuthStore(state => state.setAuth);
  const { mockLogin } = useMockAuth();
  
  const isDevelopment = import.meta.env.DEV;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login({ email, password });
      
      if (response.requires_mfa) {
        setShowMFA(true);
      } else {
        setAuth(response.employee, response.access_token);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleMFA = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.verifyMFA({ email, code: mfaCode });
      setAuth(response.employee, response.access_token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Código MFA inválido');
    } finally {
      setLoading(false);
    }
  };

  const handleMockLogin = () => {
    mockLogin();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-foreground">S</span>
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Simply Backoffice</CardTitle>
          <CardDescription className="text-center">
            {showMFA ? 'Ingresa tu código de autenticación' : 'Acceso para empleados'}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Mock Login en Desarrollo */}
          {isDevelopment && !showMFA && (
            <div className="mb-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
              <p className="text-xs font-medium text-yellow-800 mb-2">
                🔧 Modo Desarrollo
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleMockLogin}
              >
                <Bug className="w-4 h-4 mr-2" />
                Login Mock (Testing)
              </Button>
            </div>
          )}

          {!showMFA ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleMFA} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mfa">Código de autenticación (TOTP)</Label>
                <Input
                  id="mfa"
                  type="text"
                  placeholder="000000"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  maxLength={6}
                  className="text-center text-2xl tracking-widest"
                />
                <p className="text-xs text-muted-foreground text-center">
                  Ingresa el código de 6 dígitos de tu app de autenticación
                </p>
              </div>

              <div className="space-y-2">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Verificando...' : 'Verificar'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setShowMFA(false)}
                >
                  Volver
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <div className="fixed bottom-4 text-center text-xs text-muted-foreground w-full">
        <p>Simply © 2025 - Backoffice v1.0.0 Beta</p>
        {isDevelopment && (
          <p className="mt-1 text-yellow-600">⚠️ Modo Desarrollo</p>
        )}
      </div>
    </div>
  );
}
