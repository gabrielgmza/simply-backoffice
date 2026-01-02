import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Select,
  FormControl,
  InputLabel,
  Button,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  Search,
  MoreVert,
  Visibility,
  Block,
  CheckCircle,
  Download,
  FilterList,
} from '@mui/icons-material';
import { usersApi } from '../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const levelColors: Record<string, string> = {
  PLATA: '#94a3b8',
  ORO: '#fbbf24',
  BLACK: '#475569',
  DIAMANTE: '#818cf8',
};

const statusColors: Record<string, 'success' | 'error' | 'warning' | 'default'> = {
  ACTIVE: 'success',
  BLOCKED: 'error',
  SUSPENDED: 'warning',
  PENDING: 'default',
};

const kycStatusColors: Record<string, 'success' | 'error' | 'warning' | 'default'> = {
  APPROVED: 'success',
  REJECTED: 'error',
  PENDING: 'warning',
  NOT_STARTED: 'default',
};

export default function Users() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [kycFilter, setKycFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  useEffect(() => {
    loadUsers();
  }, [page, pageSize, statusFilter, kycFilter, levelFilter]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await usersApi.getAll({
        page: page + 1,
        limit: pageSize,
        status: statusFilter || undefined,
        kycStatus: kycFilter || undefined,
        level: levelFilter || undefined,
        search: search || undefined,
      });

      if (response.data.success) {
        setUsers(response.data.data.users || response.data.data);
        setTotal(response.data.data.pagination?.total || response.data.data.length);
      }
    } catch (error) {
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(0);
    loadUsers();
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleBlockUser = async () => {
    if (!selectedUser) return;

    try {
      if (selectedUser.status === 'BLOCKED') {
        await usersApi.unblock(selectedUser.id, 'Desbloqueo desde backoffice');
        toast.success('Usuario desbloqueado');
      } else {
        await usersApi.block(selectedUser.id, 'Bloqueo desde backoffice');
        toast.success('Usuario bloqueado');
      }
      loadUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al actualizar usuario');
    }
    handleMenuClose();
  };

  const columns: GridColDef[] = [
    {
      field: 'user',
      headerName: 'Usuario',
      flex: 1,
      minWidth: 250,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
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
      field: 'dni',
      headerName: 'DNI',
      width: 120,
      renderCell: (params: GridRenderCellParams) => params.row.dni || '-',
    },
    {
      field: 'user_level',
      headerName: 'Nivel',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            bgcolor: levelColors[params.value] || '#6366f1',
            color: params.value === 'BLACK' ? 'white' : 'black',
            fontWeight: 500,
          }}
        />
      ),
    },
    {
      field: 'kyc_status',
      headerName: 'KYC',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          size="small"
          color={kycStatusColors[params.value] || 'default'}
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Estado',
      width: 110,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          size="small"
          color={statusColors[params.value] || 'default'}
        />
      ),
    },
    {
      field: 'created_at',
      headerName: 'Registro',
      width: 120,
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
          Usuarios
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Download />}
          onClick={() => toast.success('Exportación iniciada')}
        >
          Exportar
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Buscar por email, nombre o DNI..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              size="small"
              sx={{ minWidth: 300 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Estado</InputLabel>
              <Select
                value={statusFilter}
                label="Estado"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="ACTIVE">Activo</MenuItem>
                <MenuItem value="BLOCKED">Bloqueado</MenuItem>
                <MenuItem value="SUSPENDED">Suspendido</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>KYC</InputLabel>
              <Select
                value={kycFilter}
                label="KYC"
                onChange={(e) => setKycFilter(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="APPROVED">Aprobado</MenuItem>
                <MenuItem value="PENDING">Pendiente</MenuItem>
                <MenuItem value="REJECTED">Rechazado</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Nivel</InputLabel>
              <Select
                value={levelFilter}
                label="Nivel"
                onChange={(e) => setLevelFilter(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="PLATA">Plata</MenuItem>
                <MenuItem value="ORO">Oro</MenuItem>
                <MenuItem value="BLACK">Black</MenuItem>
                <MenuItem value="DIAMANTE">Diamante</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              onClick={handleSearch}
              startIcon={<FilterList />}
            >
              Filtrar
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <DataGrid
          rows={users}
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
          onRowClick={(params) => navigate(`/users/${params.row.id}`)}
          sx={{
            border: 'none',
            '& .MuiDataGrid-row': {
              cursor: 'pointer',
            },
          }}
          autoHeight
        />
      </Card>

      {/* Menu de acciones */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          navigate(`/users/${selectedUser?.id}`);
          handleMenuClose();
        }}>
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>
          Ver detalle
        </MenuItem>
        <MenuItem onClick={handleBlockUser}>
          <ListItemIcon>
            {selectedUser?.status === 'BLOCKED' ? (
              <CheckCircle fontSize="small" color="success" />
            ) : (
              <Block fontSize="small" color="error" />
            )}
          </ListItemIcon>
          {selectedUser?.status === 'BLOCKED' ? 'Desbloquear' : 'Bloquear'}
        </MenuItem>
      </Menu>
    </Box>
  );
}
