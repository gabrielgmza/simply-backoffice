import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { integrationsService } from '@/services/integrationsService';
import { Integration, IntegrationType, Permission } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { Power, PowerOff, Settings, TestTube, AlertCircle, CheckCircle } from 'lucide-react';

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingId, setTestingId] = useState<string | null>(null);
  const hasPermission = useAuthStore(state => state.hasPermission);
  
  const canManage = hasPermission(Permission.MANAGE_INTEGRATIONS);

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      const data = await integrationsService.getAll();
      setIntegrations(data);
    } catch (error) {
      console.error('Error loading integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (integration: Integration) => {
    if (!canManage) return;
    
    try {
      await integrationsService.toggleStatus(integration.id, !integration.is_enabled);
      await loadIntegrations();
    } catch (error) {
      console.error('Error toggling integration:', error);
      alert('Error al cambiar el estado de la integración');
    }
  };

  const handleTest = async (integrationId: string) => {
    setTestingId(integrationId);
    try {
      const result = await integrationsService.testConnection(integrationId);
      alert(result.success ? '✅ Conexión exitosa' : `❌ Error: ${result.message}`);
    } catch (error) {
      alert('❌ Error al probar la conexión');
    } finally {
      setTestingId(null);
    }
  };

  const getStatusBadge = (integration: Integration) => {
    if (!integration.is_enabled) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <PowerOff className="w-3 h-3" />
          Inactiva
        </span>
      );
    }

    switch (integration.status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3" />
            Activa
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertCircle className="w-3 h-3" />
            Error
          </span>
        );
      case 'maintenance':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertCircle className="w-3 h-3" />
            Mantenimiento
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Inactiva
          </span>
        );
    }
  };

  const getIntegrationIcon = (type: IntegrationType) => {
    // Aquí podrías usar logos reales de las integraciones
    return <Settings className="w-8 h-8 text-primary" />;
  };

  const integrationDescriptions: Record<IntegrationType, string> = {
    [IntegrationType.BIND]: 'Servicios bancarios: cuentas, FCI, transferencias CVU',
    [IntegrationType.DIDIT]: 'Verificación de identidad (KYC) y biometría',
    [IntegrationType.VISA]: 'Tarjetas de débito virtuales y físicas',
    [IntegrationType.STRIPE]: 'Compra de crypto (USDC) con tarjeta internacional',
    [IntegrationType.RAPIPAGO]: 'Depósitos y retiros en efectivo',
    [IntegrationType.COELSA]: 'Pago de servicios (luz, gas, agua, telefonía)',
    [IntegrationType.MODO]: 'Pagos QR interoperables',
    [IntegrationType.ANTHROPIC]: 'AI Assistants para empleados'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando integraciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Integraciones</h1>
        <p className="text-muted-foreground mt-2">
          Gestiona las integraciones con servicios externos. Activa o desactiva APIs según sea necesario.
        </p>
      </div>

      {!canManage && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm font-medium">
                Solo tienes permisos de lectura. No puedes modificar las integraciones.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrations.map((integration) => (
          <Card key={integration.id} className={!integration.is_enabled ? 'opacity-60' : ''}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getIntegrationIcon(integration.type)}
                  <div>
                    <CardTitle className="text-xl">{integration.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {integrationDescriptions[integration.type]}
                    </CardDescription>
                  </div>
                </div>
                {getStatusBadge(integration)}
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {/* Error message si existe */}
                {integration.error_message && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                    <p className="text-sm text-red-800">
                      <strong>Error:</strong> {integration.error_message}
                    </p>
                  </div>
                )}

                {/* Last health check */}
                {integration.last_health_check && (
                  <div className="text-sm text-muted-foreground">
                    <strong>Último check:</strong>{' '}
                    {new Date(integration.last_health_check).toLocaleString('es-AR')}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  {canManage && (
                    <Button
                      variant={integration.is_enabled ? 'destructive' : 'default'}
                      size="sm"
                      onClick={() => handleToggle(integration)}
                      className="flex-1"
                    >
                      {integration.is_enabled ? (
                        <>
                          <PowerOff className="w-4 h-4 mr-2" />
                          Desactivar
                        </>
                      ) : (
                        <>
                          <Power className="w-4 h-4 mr-2" />
                          Activar
                        </>
                      )}
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTest(integration.id)}
                    disabled={!integration.is_enabled || testingId === integration.id}
                  >
                    {testingId === integration.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                    ) : (
                      <>
                        <TestTube className="w-4 h-4 mr-2" />
                        Test
                      </>
                    )}
                  </Button>

                  {canManage && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        // TODO: Abrir modal de configuración
                        alert('Modal de configuración - TODO');
                      }}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info card */}
      <Card>
        <CardHeader>
          <CardTitle>ℹ️ Información</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>Fase 1 (Activas):</strong> BIND, didit, Stripe, Anthropic
          </p>
          <p>
            <strong>Fase 2 (Próximamente):</strong> VISA, Rapipago
          </p>
          <p>
            <strong>Fase 3 (Futuro):</strong> COELSA, MODO
          </p>
          <p className="text-xs mt-4">
            Al desactivar una integración, la funcionalidad asociada quedará temporalmente deshabilitada
            en la app móvil y en el backoffice.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
