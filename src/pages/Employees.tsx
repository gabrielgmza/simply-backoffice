import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  FormControl,
  InputLabel,
  Grid,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  Add,
  MoreVert,
  Edit,
  Delete,
  Lock,
  LockOpen,
  PersonOff,
  SwapHoriz,
} from '@mui/icons-material';
import { employeesApi } from '../services/api';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const roleColors: Record<string, string> = {
  SUPER_ADMIN: '#ef4444',
  ADMIN: '#f59e0b',
  COMPLIANCE: '#10b981',
  CUSTOMER_SERVICE: '#3b82f6',
  ANALYST: '#8b5cf6',
};

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Administrador',
  COMPLIANCE: 'Compliance',
  CUSTOMER_SERVICE: 'Atención al Cliente',
  ANALYST: 'Analista',
};

// Jerarquía de roles (qué puede gestionar cada uno)
const ROLE_HIERARCHY: Record<string, number> = {
  SUPER_ADMIN: 100,
  ADMIN: 80,
  COMPLIANCE: 60,
  CUSTOMER_SERVICE: 40,
  ANALYST: 20
};

const canManageRole = (myRole: string, targetRole: string): boolean => {
  return (ROLE_HIERARCHY[myRole] || 0) > (ROLE_HIERARCHY[targetRole] || 0);
};

export default function Employees() {
  const { hasPermission, employee: currentEmployee } = useAuth();
  const canCreate = hasPermission('employees:create');
  const canEdit = hasPermission('employees:update');
  const canDelete = hasPermission('employees:delete');

  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [actionReason, setActionReason] = useState('');
  const [newRole, setNewRole] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'ANALYST',
  });

  useEffect(() => {
    loadEmployees();
  }, [page, pageSize]);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const response = await employeesApi.getAll({
        page: page + 1,
        limit: pageSize,
      });

      if (response.data.success) {
        setEmployees(response.data.data.employees || response.data.data);
        setTotal(response.data.data.pagination?.total || response.data.data.length);
      }
    } catch (error) {
      toast.error('Error al cargar empleados');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, employee: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedEmployee(employee);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCreate = async () => {
    try {
      await employeesApi.create(formData);
      toast.success('Empleado creado');
      setCreateDialogOpen(false);
      resetForm();
      loadEmployees();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al crear');
    }
  };

  const handleEdit = async () => {
    if (!selectedEmployee) return;
    try {
      await employeesApi.update(selectedEmployee.id, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        role: formData.role,
      });
      toast.success('Empleado actualizado');
      setEditDialogOpen(false);
      resetForm();
      loadEmployees();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al actualizar');
    }
  };

  const handleDelete = async () => {
    if (!selectedEmployee || !actionReason) return;
    try {
      await api.delete(`/api/backoffice/employees/${selectedEmployee.id}`, {
        data: { reason: actionReason }
      });
      toast.success('Empleado eliminado');
      setDeleteDialogOpen(false);
      setSelectedEmployee(null);
      setActionReason('');
      loadEmployees();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al eliminar');
    }
  };

  const handleBlock = async () => {
    if (!selectedEmployee || !actionReason) return;
    try {
      await api.post(`/api/backoffice/employees/${selectedEmployee.id}/block`, {
        reason: actionReason
      });
      toast.success('Empleado bloqueado');
      setBlockDialogOpen(false);
      setSelectedEmployee(null);
      setActionReason('');
      loadEmployees();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'No tienes permisos para bloquear este empleado');
    }
  };

  const handleUnblock = async () => {
    if (!selectedEmployee || !actionReason) return;
    try {
      await api.post(`/api/backoffice/employees/${selectedEmployee.id}/unblock`, {
        reason: actionReason
      });
      toast.success('Empleado desbloqueado');
      setBlockDialogOpen(false);
      setSelectedEmployee(null);
      setActionReason('');
      loadEmployees();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'No tienes permisos para desbloquear este empleado');
    }
  };

  const handleChangeRole = async () => {
    if (!selectedEmployee || !actionReason || !newRole) return;
    try {
      await api.post(`/api/backoffice/employees/${selectedEmployee.id}/role`, {
        newRole,
        reason: actionReason
      });
      toast.success('Rol actualizado');
      setRoleDialogOpen(false);
      setSelectedEmployee(null);
      setActionReason('');
      setNewRole('');
      loadEmployees();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'No tienes permisos para cambiar este rol');
    }
  };

  const openEditDialog = () => {
    if (!selectedEmployee) return;
    setFormData({
      email: selectedEmployee.email,
      password: '',
      firstName: selectedEmployee.first_name,
      lastName: selectedEmployee.last_name,
      role: selectedEmployee.role,
    });
    setEditDialogOpen(true);
    handleMenuClose();
  };

  const openDeleteDialog = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: 'ANALYST',
    });
  };

  const columns: GridColDef[] = [
    {
      field: 'employee',
      headerName: 'Empleado',
      flex: 1,
      minWidth: 250,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            src={params.row.avatar_url}
            sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}
          >
            {params.row.first_name?.[0]}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {params.row.first_name} {params.row.last_name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.email}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'role',
      headerName: 'Rol',
      width: 160,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={roleLabels[params.value] || params.value}
          size="small"
          sx={{
            bgcolor: roleColors[params.value] || '#6366f1',
            color: 'white',
            fontWeight: 500,
          }}
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Estado',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'active' ? 'success' : 'default'}
        />
      ),
    },
    {
      field: 'last_login_at',
      headerName: 'Último acceso',
      width: 140,
      renderCell: (params: GridRenderCellParams) =>
        params.value ? format(new Date(params.value), 'dd/MM/yyyy HH:mm') : '-',
    },
    {
      field: 'created_at',
      headerName: 'Creado',
      width: 110,
      renderCell: (params: GridRenderCellParams) =>
        format(new Date(params.value), 'dd/MM/yyyy'),
    },
    {
      field: 'actions',
      headerName: '',
      width: 60,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <IconButton
          size="small"
          onClick={(e) => handleMenuOpen(e, params.row)}
          disabled={params.row.id === currentEmployee?.id}
        >
          <MoreVert />
        </IconButton>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Empleados
        </Typography>
        {canCreate && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Nuevo Empleado
          </Button>
        )}
      </Box>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {Object.entries(roleLabels).map(([role, label]) => {
          const count = employees.filter(e => e.role === role).length;
          return (
            <Grid item xs={6} md={2.4} key={role}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {count}
                  </Typography>
                  <Chip
                    label={label}
                    size="small"
                    sx={{
                      bgcolor: roleColors[role],
                      color: 'white',
                      mt: 0.5,
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Table */}
      <Card>
        <DataGrid
          rows={employees}
          columns={columns}
          rowCount={total}
          loading={loading}
          pageSizeOptions={[10, 20, 50]}
          paginationModel={{ page, pageSize }}
          onPaginationModelChange={(model) => {
            setPage(model.page);
            setPageSize(model.pageSize);
          }}
          paginationMode="server"
          disableRowSelectionOnClick
          sx={{ border: 'none' }}
          autoHeight
        />
      </Card>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {canEdit && (
          <MenuItem onClick={openEditDialog}>
            <ListItemIcon>
              <Edit fontSize="small" />
            </ListItemIcon>
            Editar
          </MenuItem>
        )}
        {canEdit && selectedEmployee && currentEmployee && canManageRole(currentEmployee.role, selectedEmployee.role) && (
          <>
            <MenuItem onClick={() => { setRoleDialogOpen(true); setNewRole(selectedEmployee.role); handleMenuClose(); }}>
              <ListItemIcon>
                <SwapHoriz fontSize="small" />
              </ListItemIcon>
              Cambiar Rol
            </MenuItem>
            <MenuItem onClick={() => { setBlockDialogOpen(true); handleMenuClose(); }}>
              <ListItemIcon>
                {selectedEmployee.status === 'SUSPENDED' ? <LockOpen fontSize="small" color="success" /> : <Lock fontSize="small" color="warning" />}
              </ListItemIcon>
              {selectedEmployee.status === 'SUSPENDED' ? 'Desbloquear' : 'Bloquear'}
            </MenuItem>
          </>
        )}
        {canDelete && selectedEmployee && currentEmployee && canManageRole(currentEmployee.role, selectedEmployee.role) && (
          <MenuItem onClick={openDeleteDialog}>
            <ListItemIcon>
              <PersonOff fontSize="small" color="error" />
            </ListItemIcon>
            Eliminar
          </MenuItem>
        )}
        {selectedEmployee && currentEmployee && !canManageRole(currentEmployee.role, selectedEmployee.role) && (
          <MenuItem disabled>
            <Typography variant="caption" color="text.secondary">
              No puedes gestionar este rol
            </Typography>
          </MenuItem>
        )}
      </Menu>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nuevo Empleado</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Nombre"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Apellido"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Contraseña"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Rol</InputLabel>
                <Select
                  value={formData.role}
                  label="Rol"
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <MenuItem value="ANALYST">Analista</MenuItem>
                  <MenuItem value="CUSTOMER_SERVICE">Atención al Cliente</MenuItem>
                  <MenuItem value="COMPLIANCE">Compliance</MenuItem>
                  <MenuItem value="ADMIN">Administrador</MenuItem>
                  <MenuItem value="SUPER_ADMIN">Super Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setCreateDialogOpen(false); resetForm(); }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={!formData.email || !formData.password || !formData.firstName}
          >
            Crear
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Empleado</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Nombre"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Apellido"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                value={formData.email}
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Rol</InputLabel>
                <Select
                  value={formData.role}
                  label="Rol"
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <MenuItem value="ANALYST">Analista</MenuItem>
                  <MenuItem value="CUSTOMER_SERVICE">Atención al Cliente</MenuItem>
                  <MenuItem value="COMPLIANCE">Compliance</MenuItem>
                  <MenuItem value="ADMIN">Administrador</MenuItem>
                  <MenuItem value="SUPER_ADMIN">Super Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setEditDialogOpen(false); resetForm(); }}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleEdit}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => { setDeleteDialogOpen(false); setActionReason(''); }}>
        <DialogTitle>Eliminar Empleado</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de eliminar a <strong>{selectedEmployee?.first_name} {selectedEmployee?.last_name}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
            El empleado será desactivado (no se elimina físicamente por auditoría).
          </Typography>
          <TextField
            fullWidth
            label="Razón de eliminación"
            value={actionReason}
            onChange={(e) => setActionReason(e.target.value)}
            multiline
            rows={2}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDeleteDialogOpen(false); setActionReason(''); }}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleDelete} disabled={!actionReason}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Block/Unblock Dialog */}
      <Dialog open={blockDialogOpen} onClose={() => { setBlockDialogOpen(false); setActionReason(''); }}>
        <DialogTitle>
          {selectedEmployee?.status === 'SUSPENDED' ? 'Desbloquear' : 'Bloquear'} Empleado
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            {selectedEmployee?.status === 'SUSPENDED' 
              ? `¿Desbloquear a ${selectedEmployee?.first_name} ${selectedEmployee?.last_name}?`
              : `¿Bloquear a ${selectedEmployee?.first_name} ${selectedEmployee?.last_name}? No podrá acceder al sistema.`
            }
          </Typography>
          <TextField
            fullWidth
            label="Razón"
            value={actionReason}
            onChange={(e) => setActionReason(e.target.value)}
            multiline
            rows={2}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setBlockDialogOpen(false); setActionReason(''); }}>Cancelar</Button>
          <Button 
            variant="contained" 
            color={selectedEmployee?.status === 'SUSPENDED' ? 'success' : 'warning'} 
            onClick={selectedEmployee?.status === 'SUSPENDED' ? handleUnblock : handleBlock}
            disabled={!actionReason}
          >
            {selectedEmployee?.status === 'SUSPENDED' ? 'Desbloquear' : 'Bloquear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change Role Dialog */}
      <Dialog open={roleDialogOpen} onClose={() => { setRoleDialogOpen(false); setActionReason(''); setNewRole(''); }}>
        <DialogTitle>Cambiar Rol de Empleado</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Cambiar rol de <strong>{selectedEmployee?.first_name} {selectedEmployee?.last_name}</strong>
          </Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Nuevo Rol</InputLabel>
            <Select
              value={newRole}
              label="Nuevo Rol"
              onChange={(e) => setNewRole(e.target.value)}
            >
              {currentEmployee?.role === 'SUPER_ADMIN' && <MenuItem value="ADMIN">Administrador</MenuItem>}
              <MenuItem value="COMPLIANCE">Compliance</MenuItem>
              <MenuItem value="CUSTOMER_SERVICE">Atención al Cliente</MenuItem>
              <MenuItem value="ANALYST">Analista</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Razón del cambio"
            value={actionReason}
            onChange={(e) => setActionReason(e.target.value)}
            multiline
            rows={2}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setRoleDialogOpen(false); setActionReason(''); setNewRole(''); }}>Cancelar</Button>
          <Button 
            variant="contained" 
            onClick={handleChangeRole}
            disabled={!actionReason || !newRole}
          >
            Cambiar Rol
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
