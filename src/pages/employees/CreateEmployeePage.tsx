import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { employeeService } from '@/services/employeeService';
import { RoleSelector } from '@/components/ui/RoleSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateEmployeePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'ANALYST' as any
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    try {
      setLoading(true);
      await employeeService.create(formData);
      toast.success('Empleado creado exitosamente');
      navigate('/employees');
    } catch (error: any) {
      toast.error(error.message || 'Error al crear empleado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Button
        variant="ghost"
        onClick={() => navigate('/employees')}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver
      </Button>

      <div className="bg-white p-6 rounded-lg border">
        <h1 className="text-2xl font-bold mb-6">Nuevo Empleado</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Nombre</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Apellido</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
              minLength={8}
            />
            <p className="text-xs text-gray-500 mt-1">Mínimo 8 caracteres</p>
          </div>

          <RoleSelector
            value={formData.role}
            onChange={(role) => setFormData({...formData, role})}
          />

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Creando...' : 'Crear Empleado'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/employees')}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
