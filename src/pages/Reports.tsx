import { useState } from 'react';
import { Box, Card, CardContent, Typography, Grid, Button, Select, MenuItem, FormControl, InputLabel, TextField, Chip, Alert, LinearProgress, Table, TableBody, TableCell, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, Divider } from '@mui/material';
import { PictureAsPdf, Download, Schedule, CheckCircle, History, Assessment, TrendingUp, People, AccountBalance } from '@mui/icons-material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import api from '../services/api';
import toast from 'react-hot-toast';

interface ReportConfig {
  id: string;
  name: string;
  description: string;
  icon: JSX.Element;
  color: string;
  params: string[];
}

const REPORT_TYPES: ReportConfig[] = [
  { id: 'uif-monthly', name: 'Reporte UIF Mensual', description: 'Reporte mensual de operaciones para la Unidad de Información Financiera', icon: <Assessment />, color: '#6366f1', params: ['month', 'year'] },
  { id: 'investments-summary', name: 'Resumen de Inversiones', description: 'Estado de todas las inversiones activas con rendimientos acumulados', icon: <TrendingUp />, color: '#10b981', params: ['dateFrom', 'dateTo'] },
  { id: 'financings-status', name: 'Estado de Financiaciones', description: 'Detalle de financiaciones activas, cuotas pendientes y morosos', icon: <AccountBalance />, color: '#f59e0b', params: ['dateFrom', 'dateTo', 'status'] },
  { id: 'users-report', name: 'Reporte de Usuarios', description: 'Listado de usuarios con estado KYC, nivel y actividad', icon: <People />, color: '#ec4899', params: ['dateFrom', 'dateTo', 'level'] },
  { id: 'transactions-daily', name: 'Movimientos Diarios', description: 'Detalle de todas las transacciones del período seleccionado', icon: <History />, color: '#8b5cf6', params: ['date'] },
  { id: 'treasury-balance', name: 'Balance de Tesorería', description: 'Estado de cuentas, flujos y conciliación bancaria', icon: <AccountBalance />, color: '#64748b', params: ['date'] },
];

const GENERATED_REPORTS = [
  { id: '1', type: 'uif-monthly', name: 'Reporte UIF Diciembre 2024', generatedAt: '2025-01-02T10:30:00', generatedBy: 'Sistema', status: 'completed', size: '2.4 MB' },
  { id: '2', type: 'investments-summary', name: 'Inversiones Q4 2024', generatedAt: '2025-01-01T08:00:00', generatedBy: 'Admin', status: 'completed', size: '1.8 MB' },
  { id: '3', type: 'financings-status', name: 'Financiaciones Enero 2025', generatedAt: '2025-01-04T09:15:00', generatedBy: 'Sistema', status: 'completed', size: '3.1 MB' },
];

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [generating, setGenerating] = useState(false);
  const [dateFrom, setDateFrom] = useState<Date | null>(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [dateTo, setDateTo] = useState<Date | null>(new Date());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [status, setStatus] = useState('all');
  const [level, setLevel] = useState('all');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  const handleGenerate = async () => {
    if (!selectedReport) { toast.error('Seleccione un tipo de reporte'); return; }
    
    setGenerating(true);
    try {
      const params: Record<string, any> = { type: selectedReport };
      
      const config = REPORT_TYPES.find(r => r.id === selectedReport);
      if (config?.params.includes('dateFrom')) params.dateFrom = dateFrom?.toISOString();
      if (config?.params.includes('dateTo')) params.dateTo = dateTo?.toISOString();
      if (config?.params.includes('month')) params.month = month;
      if (config?.params.includes('year')) params.year = year;
      if (config?.params.includes('status') && status !== 'all') params.status = status;
      if (config?.params.includes('level') && level !== 'all') params.level = level;
      if (config?.params.includes('date')) params.date = dateTo?.toISOString();

      // Simular generación
      await new Promise(r => setTimeout(r, 2000));
      
      // En producción: const res = await api.post('/api/backoffice/reports/generate', params, { responseType: 'blob' });
      
      toast.success('Reporte generado exitosamente');
      setPreviewData({
        type: selectedReport,
        name: config?.name,
        generatedAt: new Date().toISOString(),
        params,
        summary: {
          totalRecords: Math.floor(Math.random() * 1000) + 100,
          totalAmount: Math.floor(Math.random() * 100000000),
          period: `${dateFrom?.toLocaleDateString()} - ${dateTo?.toLocaleDateString()}`
        }
      });
      setPreviewOpen(true);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al generar reporte');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (reportId: string) => {
    try {
      // En producción: const res = await api.get(`/api/backoffice/reports/${reportId}/download`, { responseType: 'blob' });
      toast.success('Descargando reporte...');
      
      // Simular descarga
      const blob = new Blob(['PDF Content'], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-${reportId}.pdf`;
      a.click();
    } catch (err) {
      toast.error('Error al descargar');
    }
  };

  const formatCurrency = (v: number) => `$${v.toLocaleString('es-AR')}`;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight={700}>Reportes PDF</Typography>
            <Typography variant="body2" color="text.secondary">Genera y descarga reportes en formato PDF</Typography>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Selector de Reporte */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>Generar Nuevo Reporte</Typography>
                
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {REPORT_TYPES.map(report => (
                    <Grid item xs={12} sm={6} md={4} key={report.id}>
                      <Card 
                        sx={{ 
                          cursor: 'pointer', 
                          border: selectedReport === report.id ? `2px solid ${report.color}` : '2px solid transparent',
                          bgcolor: selectedReport === report.id ? `${report.color}10` : 'transparent',
                          transition: 'all 0.2s',
                          '&:hover': { bgcolor: `${report.color}10` }
                        }}
                        onClick={() => setSelectedReport(report.id)}
                      >
                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                          <Box sx={{ color: report.color, mb: 1 }}>{report.icon}</Box>
                          <Typography variant="subtitle2" fontWeight={600}>{report.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{report.description}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                {selectedReport && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>Parámetros</Typography>
                    
                    <Grid container spacing={2}>
                      {REPORT_TYPES.find(r => r.id === selectedReport)?.params.includes('dateFrom') && (
                        <>
                          <Grid item xs={6}>
                            <DatePicker label="Desde" value={dateFrom} onChange={setDateFrom} slotProps={{ textField: { fullWidth: true, size: 'small' } }} />
                          </Grid>
                          <Grid item xs={6}>
                            <DatePicker label="Hasta" value={dateTo} onChange={setDateTo} slotProps={{ textField: { fullWidth: true, size: 'small' } }} />
                          </Grid>
                        </>
                      )}
                      
                      {REPORT_TYPES.find(r => r.id === selectedReport)?.params.includes('month') && (
                        <>
                          <Grid item xs={6}>
                            <FormControl fullWidth size="small">
                              <InputLabel>Mes</InputLabel>
                              <Select value={month} label="Mes" onChange={e => setMonth(Number(e.target.value))}>
                                {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                                  <MenuItem key={m} value={m}>{new Date(2000, m-1).toLocaleString('es', { month: 'long' })}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={6}>
                            <FormControl fullWidth size="small">
                              <InputLabel>Año</InputLabel>
                              <Select value={year} label="Año" onChange={e => setYear(Number(e.target.value))}>
                                {[2024, 2025, 2026].map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                              </Select>
                            </FormControl>
                          </Grid>
                        </>
                      )}
                      
                      {REPORT_TYPES.find(r => r.id === selectedReport)?.params.includes('status') && (
                        <Grid item xs={6}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Estado</InputLabel>
                            <Select value={status} label="Estado" onChange={e => setStatus(e.target.value)}>
                              <MenuItem value="all">Todos</MenuItem>
                              <MenuItem value="ACTIVE">Activos</MenuItem>
                              <MenuItem value="DEFAULT">En mora</MenuItem>
                              <MenuItem value="COMPLETED">Completados</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                      )}
                      
                      {REPORT_TYPES.find(r => r.id === selectedReport)?.params.includes('level') && (
                        <Grid item xs={6}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Nivel</InputLabel>
                            <Select value={level} label="Nivel" onChange={e => setLevel(e.target.value)}>
                              <MenuItem value="all">Todos</MenuItem>
                              <MenuItem value="PLATA">Plata</MenuItem>
                              <MenuItem value="ORO">Oro</MenuItem>
                              <MenuItem value="BLACK">Black</MenuItem>
                              <MenuItem value="DIAMANTE">Diamante</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                      )}
                    </Grid>

                    <Button 
                      variant="contained" 
                      startIcon={generating ? null : <PictureAsPdf />}
                      onClick={handleGenerate}
                      disabled={generating}
                      sx={{ mt: 3, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
                    >
                      {generating ? 'Generando...' : 'Generar Reporte'}
                    </Button>
                    
                    {generating && <LinearProgress sx={{ mt: 2 }} />}
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Info Panel */}
          <Grid item xs={12} md={4}>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>Información</Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Los reportes se generan en formato PDF y pueden demorar según la cantidad de datos.
                </Alert>
                <Typography variant="body2" color="text.secondary">
                  <strong>Formatos soportados:</strong> PDF, CSV, Excel<br />
                  <strong>Retención:</strong> 90 días<br />
                  <strong>Límite:</strong> 100,000 registros por reporte
                </Typography>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>Reportes Programados</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, bgcolor: 'rgba(99, 102, 241, 0.1)', borderRadius: 1, mb: 1 }}>
                  <Schedule sx={{ color: '#6366f1' }} />
                  <Box>
                    <Typography variant="body2" fontWeight={500}>UIF Mensual</Typography>
                    <Typography variant="caption" color="text.secondary">Día 1 de cada mes - 06:00</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, bgcolor: 'rgba(16, 185, 129, 0.1)', borderRadius: 1 }}>
                  <Schedule sx={{ color: '#10b981' }} />
                  <Box>
                    <Typography variant="body2" fontWeight={500}>Balance Diario</Typography>
                    <Typography variant="caption" color="text.secondary">Todos los días - 23:59</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Historial */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>Reportes Generados</Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Generado</TableCell>
                      <TableCell>Por</TableCell>
                      <TableCell>Tamaño</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell align="right">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {GENERATED_REPORTS.map(report => (
                      <TableRow key={report.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PictureAsPdf sx={{ color: '#ef4444' }} />
                            <Typography variant="body2" fontWeight={500}>{report.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{REPORT_TYPES.find(r => r.id === report.type)?.name}</TableCell>
                        <TableCell>{new Date(report.generatedAt).toLocaleString()}</TableCell>
                        <TableCell>{report.generatedBy}</TableCell>
                        <TableCell>{report.size}</TableCell>
                        <TableCell>
                          <Chip 
                            label="Completado" 
                            size="small" 
                            color="success" 
                            icon={<CheckCircle />}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Button 
                            size="small" 
                            startIcon={<Download />}
                            onClick={() => handleDownload(report.id)}
                          >
                            Descargar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Preview Dialog */}
        <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Reporte Generado</DialogTitle>
          <DialogContent>
            {previewData && (
              <Box>
                <Alert severity="success" sx={{ mb: 2 }}>Reporte generado exitosamente</Alert>
                <Typography variant="subtitle1" fontWeight={600}>{previewData.name}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Generado: {new Date(previewData.generatedAt).toLocaleString()}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="text.secondary">Registros</Typography>
                    <Typography variant="h6">{previewData.summary?.totalRecords?.toLocaleString()}</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="text.secondary">Monto Total</Typography>
                    <Typography variant="h6">{formatCurrency(previewData.summary?.totalAmount || 0)}</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="text.secondary">Período</Typography>
                    <Typography variant="body2">{previewData.summary?.period}</Typography>
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPreviewOpen(false)}>Cerrar</Button>
            <Button variant="contained" startIcon={<Download />} onClick={() => { handleDownload('new'); setPreviewOpen(false); }}>
              Descargar PDF
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
}
