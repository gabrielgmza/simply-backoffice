import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { employeeService, Employee } from '@/services/employeeService';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { RoleSelectDropdown } from '@/components/ui/RoleSelector';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, Trash2, Key, User, Mail, Calendar, Activity as ActivityIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = useAuthStore(state => state.employee);
  
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    role: '' as any,
    status: '' as any
  });

  // Password change
  const [newPassword, setNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  
  // Delete confirmation
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    loadEmployee();
  }, [id]);

  const loadEmployee = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const data = await employeeService.getById(id);
      setEmployee(data);
      setFormData({
        firstName: data.first_name,
        lastName: data.last_name,
        role: data.role,
        status: data.status
      });
    } catch (error) {
      toast.error('Error al cargar empleado');
      navigate('/employees');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!id) return;

    try {
      setSaving(true);
      await employeeService.update(id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
        status: formData.status
      });
      toast.success('Empleado actualizado');
      setEditing(false);
      loadEmployee();
    } catch (error) {
      toast.error('Error al actualizar empleado');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!id || !newPassword || newPassword.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    try {
      setChangingPassword(true);
      await employeeService.updatePassword(id, newPassword);
      toast.success('Contraseña actualizada');
      setNewPassword('');
    } catch (error) {
      toast.error('Error al cambiar contraseña');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !employee) return;
    
    if (currentUser?.id === id) {
      toast.error('No podés eliminarte a vos mismo');
      return;
    }

    try {
      await employeeService.delete(id);
      toast.success('Empleado eliminado');
      navigate('/employees');
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar empleado');
    } finally {
      setShowDeleteDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!employee) return null;

  const canEdit = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN';
  const canDelete = currentUser?.role === 'SUPER_ADMIN' && currentUser?.id !== id;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/employees')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-2xl">
              {employee.first_name[0]}{employee.last_name[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {employee.first_name} {employee.last_name}
              </h1>
              <p className="text-gray-600">{employee.email}</p>
            </div>
          </div>
        </div>
        
        <StatusBadge status={employee.status} />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="info">Información</TabsTrigger>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
          <TabsTrigger value="activity">Actividad</TabsTrigger>
        </TabsList>

        {/* Info Tab */}
        <TabsContent value="info" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Datos Personales</CardTitle>
              {canEdit && (
                <div className="flex gap-2">
                  {editing ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditing(false);
                          setFormData({
                            firstName: employee.first_name,
                            lastName: employee.last_name,
                            role: employee.role,
                            status: employee.status
                          });
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={saving}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? 'Guardando...' : 'Guardar'}
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" onClick={() => setEditing(true)}>
                      Editar
                    </Button>
                  )}
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {editing ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Nombre</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Apellido</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      />
                    </div>
                  </div>

                  <RoleSelectDropdown
                    value={formData.role}
                    onChange={(role) => setFormData({...formData, role})}
                  />

                  <div>
                    <Label htmlFor="status">Estado</Label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="ACTIVE">Activo</option>
                      <option value="INACTIVE">Inactivo</option>
                      <option value="SUSPENDED">Suspendido</option>
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Nombre Completo
                      </p>
                      <p className="font-medium text-gray-900">
                        {employee.first_name} {employee.last_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email
                      </p>
                      <p className="font-medium text-gray-900">{employee.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Rol</p>
                      <p className="font-medium text-gray-900">
                        {employee.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Estado</p>
                      <StatusBadge status={employee.status} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Creado
                      </p>
                      <p className="font-medium text-gray-900">
                        {new Date(employee.created_at).toLocaleDateString('es-AR')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Último acceso</p>
                      <p className="font-medium text-gray-900">
                        {employee.last_login_at 
                          ? new Date(employee.last_login_at).toLocaleDateString('es-AR')
                          : 'Nunca'
                        }
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Cambiar Contraseña
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {canEdit ? (
                <>
                  <div>
                    <Label htmlFor="newPassword">Nueva Contraseña</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      minLength={8}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Mínimo 8 caracteres
                    </p>
                  </div>
                  <Button
                    onClick={handleChangePassword}
                    disabled={!newPassword || newPassword.length < 8 || changingPassword}
                  >
                    {changingPassword ? 'Cambiando...' : 'Cambiar Contraseña'}
                  </Button>
                </>
              ) : (
                <p className="text-sm text-gray-600">
                  No tenés permisos para cambiar contraseñas
                </p>
              )}
            </CardContent>
          </Card>

          {canDelete && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  Zona Peligrosa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Eliminar este empleado es una acción permanente. El empleado será marcado como inactivo.
                </p>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  Eliminar Empleado
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ActivityIcon className="w-5 h-5" />
                Actividad Reciente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-500 py-8">
                Historial de actividad próximamente
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Eliminar Empleado"
        description={`¿Estás seguro que querés eliminar a ${employee?.first_name} ${employee?.last_name}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
