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
  FormControlLabel,
  Switch,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  Search,
  Download,
  Warning,
  CreditCard,
} from '@mui/icons-material';
import { financingsApi } from '../services/api';
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

export default function Financings() {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [financings, setFinancings] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState('');
  const [hasOverdue, setHasOverdue] = useState(false);

  useEffect(() => {
    loadFinancings();
    loadStats();
  }, [page, pageSize, statusFilter, hasOverdue]);

  const loadFinancings = async () => {
    setLoading(true);
    try {
      const response = await financingsApi.getAll({
        page: page + 1,
        limit: pageSize,
        status: statusFilter || undefined,
        hasOverdue: hasOverdue || undefined,
      });

      if (response.data.success) {
        setFinancings(response.data.data.financings);
        setTotal(response.data.data.pagination.total);
      }
    } catch (error) {
      toast.error('Error al cargar financiaciones');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await financingsApi.getStats();
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error loading stats');
    }
  };

  const handleExport = async () => {
    try {
      const response = await financingsApi.export();
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `financiaciones-${Date.now()}.csv`;
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
      headerName: 'Monto',
      width: 120,
      renderCell: (params: GridRenderCellParams) => formatCurrency(params.value),
    },
    {
      field: 'installments',
      headerName: 'Cuotas',
      width: 100,
      renderCell: (params: GridRenderCellParams) => {
        const summary = params.row.installmentsSummary;
        return (
          <Box>
            <Typography variant="body2">{params.value}</Typography>
            <Typography variant="caption" color="text.secondary">
              {summary?.paid || 0} pagadas
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'remaining',
      headerName: 'Restante',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Typography sx={{ color: 'warning.main', fontWeight: 500 }}>
          {formatCurrency(params.value)}
        </Typography>
      ),
    },
    {
      field: 'overdue',
      headerName: 'Vencidas',
      width: 100,
      renderCell: (params: GridRenderCellParams) => {
        const overdue = params.row.installmentsSummary?.overdue || 0;
        return overdue > 0 ? (
          <Chip
            label={overdue}
            size="small"
            color="error"
            icon={<Warning />}
          />
        ) : (
          <Typography variant="body2" color="text.secondary">-</Typography>
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
          color={
            params.value === 'ACTIVE' ? 'success' :
            params.value === 'COMPLETED' ? 'default' :
            params.value === 'DEFAULTED' ? 'error' : 'warning'
          }
        />
      ),
    },
    {
      field: 'next_due_date',
      headerName: 'Próx. Venc.',
      width: 110,
      renderCell: (params: GridRenderCellParams) =>
        params.value ? format(new Date(params.value), 'dd/MM/yyyy') : '-',
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Financiaciones
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Download />}
          onClick={handleExport}
        >
          Exportar
        </Button>
      </Box>

      {/* Stats */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <CreditCard sx={{ color: 'primary.main', mb: 1 }} />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {formatCurrency(stats.overview?.totalFinanced || 0)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Financiado
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
                  Financiaciones Activas
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'warning.main' }}>
                  {formatCurrency(stats.overview?.totalDebt || 0)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Deuda Pendiente
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card sx={{ bgcolor: parseFloat(stats.risk?.nplRatio) > 5 ? 'error.main' + '20' : undefined }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Warning sx={{ color: parseFloat(stats.risk?.nplRatio) > 5 ? 'error.main' : 'success.main', mb: 1 }} />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {stats.risk?.nplRatio}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  NPL Ratio
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
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
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Estado</InputLabel>
              <Select
                value={statusFilter}
                label="Estado"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="ACTIVE">Activo</MenuItem>
                <MenuItem value="COMPLETED">Completado</MenuItem>
                <MenuItem value="DEFAULTED">En Mora</MenuItem>
                <MenuItem value="LIQUIDATED">Liquidado</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={hasOverdue}
                  onChange={(e) => setHasOverdue(e.target.checked)}
                  color="error"
                />
              }
              label="Solo con cuotas vencidas"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <DataGrid
          rows={financings}
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
          onRowClick={(params) => navigate(`/financings/${params.row.id}`)}
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
