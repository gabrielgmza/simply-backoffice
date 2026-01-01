import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Users as UsersIcon, Search, Download, MoreVertical, Eye, Edit, Ban, CheckCircle, XCircle, Shield } from 'lucide-react';
import { User, UserStatus, KYCStatus, UserLevel } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { Permission } from '@/types';

// Mock data - reemplazar con API real
const mockUsers: User[] = [
  {
    id: '1',
    email: 'juan.perez@email.com',
    phone: '+54911234 5678',
    first_name: 'Juan',
    last_name: 'Pérez',
    dni: '12345678',
    date_of_birth: '1990-05-15',
    kyc_status: KYCStatus.APPROVED,
    kyc_level: 3,
    cvu: '0000003100012345678901',
    alias: 'juan.perez.simply',
    user_level: UserLevel.ORO,
    status: UserStatus.ACTIVE,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-12-20T15:30:00Z',
    last_login: '2024-12-29T08:00:00Z',
    account: {
      id: '1',
      user_id: '1',
      balance: 125000,
      available_balance: 100000,
      invested_amount: 80000,
      frozen_amount: 0,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-12-29T08:00:00Z'
    }
  }
  // ... más usuarios mock
];

export default function UsersListPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [kycFilter, setKycFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const navigate = useNavigate();
  const hasPermission = useAuthStore(state => state.hasPermission);
  const canEdit = hasPermission(Permission.EDIT_USERS);
  const canSuspend = hasPermission(Permission.SUSPEND_USERS);

  useEffect(() => {
    loadUsers();
  }, [search, statusFilter, kycFilter, levelFilter, page]);

  const loadUsers = async () => {
    setLoading(true);
    // Simular API call
    setTimeout(() => {
      let filtered = mockUsers;
      
      // Aplicar filtros
      if (search) {
        filtered = filtered.filter(u =>
          u.email.toLowerCase().includes(search.toLowerCase()) ||
          u.first_name.toLowerCase().includes(search.toLowerCase()) ||
          u.last_name.toLowerCase().includes(search.toLowerCase()) ||
          u.dni.includes(search)
        );
      }
      
      if (statusFilter !== 'all') {
        filtered = filtered.filter(u => u.status === statusFilter);
      }
      
      if (kycFilter !== 'all') {
        filtered = filtered.filter(u => u.kyc_status === kycFilter);
      }
      
      if (levelFilter !== 'all') {
        filtered = filtered.filter(u => u.user_level === levelFilter);
      }
      
      setUsers(filtered);
      setTotalPages(Math.ceil(filtered.length / 20));
      setLoading(false);
    }, 500);
  };

  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case UserStatus.ACTIVE:
        return <Badge variant="success"><CheckCircle className="w-3 h-3 mr-1" />Activo</Badge>;
      case UserStatus.SUSPENDED:
        return <Badge variant="warning"><Ban className="w-3 h-3 mr-1" />Suspendido</Badge>;
      case UserStatus.CLOSED:
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Cerrado</Badge>;
    }
  };

  const getKYCBadge = (status: KYCStatus) => {
    switch (status) {
      case KYCStatus.APPROVED:
        return <Badge variant="success">Aprobado</Badge>;
      case KYCStatus.PENDING:
        return <Badge variant="warning">Pendiente</Badge>;
      case KYCStatus.IN_PROGRESS:
        return <Badge variant="info">En Progreso</Badge>;
      case KYCStatus.REJECTED:
        return <Badge variant="destructive">Rechazado</Badge>;
    }
  };

  const getLevelBadge = (level: UserLevel) => {
    const colors = {
      [UserLevel.PLATA]: 'bg-gray-200 text-gray-800',
      [UserLevel.ORO]: 'bg-yellow-200 text-yellow-800',
      [UserLevel.BLACK]: 'bg-gray-800 text-white',
      [UserLevel.DIAMANTE]: 'bg-blue-200 text-blue-800'
    };
    
    return <Badge className={colors[level]}>{level.toUpperCase()}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const exportCSV = () => {
    // TODO: Implementar export real
    alert('Exportando CSV...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <UsersIcon className="w-8 h-8" />
            Usuarios
          </h1>
          <p className="text-muted-foreground mt-2">
            Gestiona todos los usuarios de Simply
          </p>
        </div>
        <Button onClick={exportCSV} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockUsers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {mockUsers.filter(u => u.status === UserStatus.ACTIVE).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">KYC Pendiente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {mockUsers.filter(u => u.kyc_status === KYCStatus.PENDING).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Suspendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {mockUsers.filter(u => u.status === UserStatus.SUSPENDED).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, email, DNI..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="suspended">Suspendido</SelectItem>
                <SelectItem value="closed">Cerrado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={kycFilter} onValueChange={setKycFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Estado KYC" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="approved">Aprobado</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="in_progress">En Progreso</SelectItem>
                <SelectItem value="rejected">Rechazado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Nivel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="plata">Plata</SelectItem>
                <SelectItem value="oro">Oro</SelectItem>
                <SelectItem value="black">Black</SelectItem>
                <SelectItem value="diamante">Diamante</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Usuario</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Estado</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">KYC</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Nivel</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Balance</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Registro</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      Cargando usuarios...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      No se encontraron usuarios
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/users/${user.id}`)}
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{user.first_name} {user.last_name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(user.status)}
                      </td>
                      <td className="px-4 py-3">
                        {getKYCBadge(user.kyc_status)}
                      </td>
                      <td className="px-4 py-3">
                        {getLevelBadge(user.user_level)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <p className="font-medium">{formatCurrency(user.account?.balance || 0)}</p>
                        <p className="text-sm text-muted-foreground">
                          Inv: {formatCurrency(user.account?.invested_amount || 0)}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString('es-AR')}
                      </td>
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/users/${user.id}`)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Ver Detalle
                            </DropdownMenuItem>
                            {canEdit && (
                              <DropdownMenuItem onClick={() => alert('Editar - TODO')}>
                                <Edit className="w-4 h-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {canSuspend && user.status === UserStatus.ACTIVE && (
                              <DropdownMenuItem
                                onClick={() => alert('Suspender - TODO')}
                                className="text-destructive"
                              >
                                <Ban className="w-4 h-4 mr-2" />
                                Suspender
                              </DropdownMenuItem>
                            )}
                            {canSuspend && user.status === UserStatus.SUSPENDED && (
                              <DropdownMenuItem onClick={() => alert('Reactivar - TODO')}>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Reactivar
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-4 border-t">
              <p className="text-sm text-muted-foreground">
                Página {page} de {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
