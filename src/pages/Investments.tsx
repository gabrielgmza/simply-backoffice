import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  Search,
  Download,
  Add,
  TrendingUp,
} from '@mui/icons-material';
import { investmentsApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const formatCurrency = (value: number | string) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(num || 0);
};

export default function Investments() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [investments, setInvestments] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadInvestments();
    loadStats();
  }, [page, pageSize, statusFilter]);

  const loadInvestments = async () => {
    setLoading(true);
    try {
      const response = await investmentsApi.getAll({
        page: page + 1,
        limit: pageSize,
        status: statusFilter || undefined,
      });

      if (response.data.success) {
        setInvestments(response.data.data.investments);
        setTotal(response.data.data.pagination.total);
      }
    } catch (error) {
      toast.error('Error al cargar inversiones');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await investmentsApi.getStats();
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error loading stats');
    }
  };

  const handleExport = async () => {
    try {
      const response = await investmentsApi.export();
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inversiones-${Date.now()}.csv`;
      a.click();
      toast.success('Exportación completada');
    } catch (error) {
      toast.error('Error al exportar');
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'user',
      headerName: 'Usuario',
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {params.row.user?.first_name} {params.row.user?.last_name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.user?.email}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'amount',
      headerName: 'Monto Inicial',
      width: 140,
      renderCell: (params: GridRenderCellParams) => formatCurrency(params.value),
    },
    {
      field: 'current_value',
      headerName: 'Valor Actual',
      width: 140,
      renderCell: (params: GridRenderCellParams) => (
        <Typography sx={{ color: 'success.main', fontWeight: 500 }}>
          {formatCurrency(params.value)}
        </Typography>
      ),
    },
    {
      field: 'returns_earned',
      headerName: 'Rendimientos',
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        <Typography sx={{ color: 'primary.main' }}>
          +{formatCurrency(params.value)}
        </Typography>
      ),
    },
    {
      field: 'credit_used',
      headerName: 'Crédito Usado',
      width: 130,
      renderCell: (params: GridRenderCellParams) => {
        const used = parseFloat(params.value || 0);
        const limit = parseFloat(params.row.credit_limit || 0);
        const pct = limit > 0 ? (used / limit * 100).toFixed(0) : 0;
        return (
          <Box>
            <Typography variant="body2">{formatCurrency(used)}</Typography>
            <Typography variant="caption" color="text.secondary">
              {pct}% del límite
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'status',
      headerName: 'Estado',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'ACTIVE' ? 'success' : 'default'}
        />
      ),
    },
    {
      field: 'started_at',
      headerName: 'Inicio',
      width: 110,
      renderCell: (params: GridRenderCellParams) =>
        format(new Date(params.value), 'dd/MM/yyyy'),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Inversiones
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleExport}
          >
            Exportar
          </Button>
        </Box>
      </Box>

      {/* Stats */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <TrendingUp sx={{ color: 'primary.main', mb: 1 }} />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {formatCurrency(stats.overview?.totalInvested || 0)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Invertido
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main' }}>
                  {stats.overview?.totalActive || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Inversiones Activas
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {formatCurrency(stats.overview?.totalReturnsGenerated || 0)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Rendimientos Generados
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {stats.distribution?.uniqueInvestors || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Inversores Únicos
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Estado</InputLabel>
              <Select
                value={statusFilter}
                label="Estado"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="ACTIVE">Activo</MenuItem>
                <MenuItem value="LIQUIDATED">Liquidado</MenuItem>
                <MenuItem value="LIQUIDATED_BY_PENALTY">Liquidado por Penalización</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <DataGrid
          rows={investments}
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
          onRowClick={(params) => navigate(`/investments/${params.row.id}`)}
          sx={{
            border: 'none',
            '& .MuiDataGrid-row': {
              cursor: 'pointer',
            },
          }}
          autoHeight
        />
      </Card>
    </Box>
  );
}
