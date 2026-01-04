import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  Search,
  Refresh,
  CheckCircle,
  Error,
  Block,
} from '@mui/icons-material';
import { auditApi } from '../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const actionColors: Record<string, string> = {
  create: '#10b981',
  update: '#6366f1',
  delete: '#ef4444',
  login: '#3b82f6',
  logout: '#94a3b8',
  block: '#f59e0b',
  unblock: '#10b981',
};

const statusIcons: Record<string, React.ReactNode> = {
  success: <CheckCircle fontSize="small" sx={{ color: 'success.main' }} />,
  failed: <Error fontSize="small" sx={{ color: 'error.main' }} />,
  blocked: <Block fontSize="small" sx={{ color: 'warning.main' }} />,
};

export default function AuditLogs() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [actionFilter, setActionFilter] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadLogs();
    loadStats();
  }, [page, pageSize, actionFilter, resourceFilter, statusFilter]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const response = await auditApi.getAll({
        page: page + 1,
        limit: pageSize,
        action: actionFilter || undefined,
        resource: resourceFilter || undefined,
        status: statusFilter || undefined,
      });

      if (response.data.success) {
        setLogs(response.data.data.logs);
        setTotal(response.data.data.pagination.total);
      }
    } catch (error) {
      toast.error('Error al cargar logs');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await auditApi.getStats(7);
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error loading stats');
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'created_at',
      headerName: 'Fecha',
      width: 160,
      renderCell: (params: GridRenderCellParams) =>
        format(new Date(params.value), "dd/MM/yyyy HH:mm:ss", { locale: es }),
    },
    {
      field: 'actor',
      headerName: 'Actor',
      width: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {params.row.actor_email || 'Sistema'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.actor_role || params.row.actor_type}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'action',
      headerName: 'Acción',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            bgcolor: actionColors[params.value] || '#6366f1',
            color: 'white',
            fontWeight: 500,
          }}
        />
      ),
    },
    {
      field: 'resource',
      headerName: 'Recurso',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'description',
      headerName: 'Descripción',
      flex: 1,
      minWidth: 250,
    },
    {
      field: 'ip_address',
      headerName: 'IP',
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
          {params.value || '-'}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Estado',
      width: 80,
      align: 'center',
      renderCell: (params: GridRenderCellParams) => {
        const icon = statusIcons[params.value] || statusIcons.success;
        return (
          <Tooltip title={params.value}>
            <span>{icon}</span>
          </Tooltip>
        );
      },
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Registro de Auditoría
        </Typography>
        <Tooltip title="Actualizar">
          <IconButton onClick={() => { loadLogs(); loadStats(); }}>
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Stats */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {stats.total}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Acciones (7 días)
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                  {stats.byStatus?.find((s: any) => s.status === 'success')?._count || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Exitosas
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main' }}>
                  {stats.byStatus?.find((s: any) => s.status === 'failed')?._count || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Fallidas
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {stats.byAction?.length || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Tipos de Acción
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Buscar..."
              size="small"
              sx={{ minWidth: 250 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Acción</InputLabel>
              <Select
                value={actionFilter}
                label="Acción"
                onChange={(e) => setActionFilter(e.target.value)}
              >
                <MenuItem value="">Todas</MenuItem>
                <MenuItem value="create">Crear</MenuItem>
                <MenuItem value="update">Actualizar</MenuItem>
                <MenuItem value="delete">Eliminar</MenuItem>
                <MenuItem value="login">Login</MenuItem>
                <MenuItem value="logout">Logout</MenuItem>
                <MenuItem value="block">Bloquear</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Recurso</InputLabel>
              <Select
                value={resourceFilter}
                label="Recurso"
                onChange={(e) => setResourceFilter(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="users">Usuarios</MenuItem>
                <MenuItem value="investments">Inversiones</MenuItem>
                <MenuItem value="financings">Financiaciones</MenuItem>
                <MenuItem value="system_settings">Configuración</MenuItem>
                <MenuItem value="auth">Autenticación</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Estado</InputLabel>
              <Select
                value={statusFilter}
                label="Estado"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="success">Exitoso</MenuItem>
                <MenuItem value="failed">Fallido</MenuItem>
                <MenuItem value="blocked">Bloqueado</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <DataGrid
          rows={logs}
          columns={columns}
          rowCount={total}
          loading={loading}
          pageSizeOptions={[20, 50, 100]}
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
    </Box>
  );
}
