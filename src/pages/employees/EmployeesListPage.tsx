import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { employeeService, Employee } from '@/services/employeeService';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function EmployeesListPage() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sortKey, setSortKey] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeeService.getAll({
        page,
        limit: 20,
        search: search || undefined
      });
      
      setEmployees(data.employees);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error loading employees:', error);
      toast.error('Error al cargar empleados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, [page, search]);

  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setSortKey(key);
    setSortDirection(direction);
    // En una implementación real, recargaríamos con el sorting del backend
  };

  const columns: Column<Employee>[] = [
    {
      key: 'first_name',
      label: 'Nombre',
      sortable: true,
      render: (emp) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium">
            {emp.first_name[0]}{emp.last_name[0]}
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {emp.first_name} {emp.last_name}
            </div>
            <div className="text-sm text-gray-500">{emp.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Rol',
      sortable: true,
      render: (emp) => (
        <span className="text-sm text-gray-700">
          {emp.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Estado',
      sortable: true,
      render: (emp) => <StatusBadge status={emp.status} />
    },
    {
      key: 'last_login_at',
      label: 'Último Acceso',
      render: (emp) => (
        <span className="text-sm text-gray-600">
          {emp.last_login_at 
            ? new Date(emp.last_login_at).toLocaleDateString('es-AR')
            : 'Nunca'
          }
        </span>
      )
    },
    {
      key: 'created_at',
      label: 'Fecha de Creación',
      sortable: true,
      render: (emp) => (
        <span className="text-sm text-gray-600">
          {new Date(emp.created_at).toLocaleDateString('es-AR')}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (emp) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/employees/${emp.id}`)}
        >
          Ver Detalle
        </Button>
      )
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Empleados</h1>
          <p className="text-gray-600 mt-1">
            Gestiona el equipo del backoffice
          </p>
        </div>
        <Button onClick={() => navigate('/employees/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Empleado
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Empleados</p>
              <p className="text-2xl font-bold text-gray-900">{total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Activos</p>
              <p className="text-2xl font-bold text-gray-900">
                {employees.filter(e => e.status === 'ACTIVE').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Inactivos</p>
              <p className="text-2xl font-bold text-gray-900">
                {employees.filter(e => e.status !== 'ACTIVE').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por nombre, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <DataTable
          data={employees}
          columns={columns}
          onSort={handleSort}
          sortKey={sortKey}
          sortDirection={sortDirection}
          isLoading={loading}
          emptyMessage="No se encontraron empleados"
        />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">
            Mostrando {employees.length} de {total} empleados
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
