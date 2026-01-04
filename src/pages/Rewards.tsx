import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Card, CardContent, Button, Chip, Alert, Tabs, Tab,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Switch, FormControlLabel,
  Select, MenuItem, FormControl, InputLabel, InputAdornment, Slider, Divider,
} from '@mui/material';
import {
  Star, Diamond, Edit, Delete, Add, Save, TrendingUp, Percent, CreditCard,
  LocalOffer, Restaurant, Movie, Flight, ShoppingBag, Refresh, People,
} from '@mui/icons-material';
import toast from 'react-hot-toast';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

// Level configuration type
interface LevelConfig {
  id: string;
  level: 'PLATA' | 'ORO' | 'BLACK' | 'DIAMANTE';
  name: string;
  color: string;
  colorDark: string;
  minInvestment: number;
  pointsMultiplier: number;
  cashbackPercent: number;
  financingMaxPercent: number;
  fciExtraRate: number;
  dailyLimit: number;
  monthlyLimit: number;
  transferLimit: number;
  cardFeeDiscount: number;
  freePhysicalCard: boolean;
  prioritySupport: boolean;
  discounts: LevelDiscount[];
}

interface LevelDiscount {
  id: string;
  category: string;
  discountPercent: number;
  maxDiscount?: number;
  validDays: number[];
  isActive: boolean;
}

// Mock data
const defaultLevels: LevelConfig[] = [
  {
    id: '1', level: 'PLATA', name: 'Plata', color: '#9CA3AF', colorDark: '#6B7280',
    minInvestment: 0, pointsMultiplier: 1.0, cashbackPercent: 0.5, financingMaxPercent: 15,
    fciExtraRate: 0, dailyLimit: 100000, monthlyLimit: 500000, transferLimit: 50000,
    cardFeeDiscount: 0, freePhysicalCard: false, prioritySupport: false,
    discounts: [],
  },
  {
    id: '2', level: 'ORO', name: 'Oro', color: '#F59E0B', colorDark: '#D97706',
    minInvestment: 100000, pointsMultiplier: 1.25, cashbackPercent: 1.0, financingMaxPercent: 15,
    fciExtraRate: 0.5, dailyLimit: 500000, monthlyLimit: 2000000, transferLimit: 200000,
    cardFeeDiscount: 25, freePhysicalCard: false, prioritySupport: false,
    discounts: [
      { id: 'd1', category: 'GASTRONOMIA', discountPercent: 10, validDays: [1,2,3,4,5,6,7], isActive: true },
    ],
  },
  {
    id: '3', level: 'BLACK', name: 'Black', color: '#374151', colorDark: '#1F2937',
    minInvestment: 500000, pointsMultiplier: 1.5, cashbackPercent: 1.5, financingMaxPercent: 15,
    fciExtraRate: 1.0, dailyLimit: 2000000, monthlyLimit: 10000000, transferLimit: 1000000,
    cardFeeDiscount: 50, freePhysicalCard: true, prioritySupport: true,
    discounts: [
      { id: 'd2', category: 'GASTRONOMIA', discountPercent: 15, validDays: [1,2,3,4,5,6,7], isActive: true },
      { id: 'd3', category: 'ENTRETENIMIENTO', discountPercent: 20, validDays: [5,6,7], isActive: true },
    ],
  },
  {
    id: '4', level: 'DIAMANTE', name: 'Diamante', color: '#60A5FA', colorDark: '#3B82F6',
    minInvestment: 2000000, pointsMultiplier: 2.0, cashbackPercent: 2.0, financingMaxPercent: 20,
    fciExtraRate: 1.5, dailyLimit: 10000000, monthlyLimit: 50000000, transferLimit: 5000000,
    cardFeeDiscount: 100, freePhysicalCard: true, prioritySupport: true,
    discounts: [
      { id: 'd4', category: 'GASTRONOMIA', discountPercent: 25, validDays: [1,2,3,4,5,6,7], isActive: true },
      { id: 'd5', category: 'ENTRETENIMIENTO', discountPercent: 30, validDays: [1,2,3,4,5,6,7], isActive: true },
      { id: 'd6', category: 'VIAJES', discountPercent: 15, validDays: [1,2,3,4,5,6,7], isActive: true },
      { id: 'd7', category: 'SHOPPING', discountPercent: 10, validDays: [1,2,3,4,5,6,7], isActive: true },
    ],
  },
];

const categories = [
  { value: 'GASTRONOMIA', label: 'Gastronomía', icon: <Restaurant /> },
  { value: 'ENTRETENIMIENTO', label: 'Entretenimiento', icon: <Movie /> },
  { value: 'VIAJES', label: 'Viajes', icon: <Flight /> },
  { value: 'SHOPPING', label: 'Shopping', icon: <ShoppingBag /> },
  { value: 'SUPERMERCADOS', label: 'Supermercados', icon: <ShoppingBag /> },
  { value: 'COMBUSTIBLE', label: 'Combustible', icon: <LocalOffer /> },
];

const daysOfWeek = [
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mié' },
  { value: 4, label: 'Jue' },
  { value: 5, label: 'Vie' },
  { value: 6, label: 'Sáb' },
  { value: 7, label: 'Dom' },
];

export default function Rewards() {
  const [tabValue, setTabValue] = useState(0);
  const [levels, setLevels] = useState<LevelConfig[]>(defaultLevels);
  const [editingLevel, setEditingLevel] = useState<LevelConfig | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [discountDialogOpen, setDiscountDialogOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Partial<LevelDiscount> | null>(null);
  const [selectedLevelForDiscount, setSelectedLevelForDiscount] = useState<string>('');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(value);
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'DIAMANTE': return <Diamond sx={{ color: '#60A5FA' }} />;
      case 'BLACK': return <Star sx={{ color: '#374151' }} />;
      case 'ORO': return <Star sx={{ color: '#F59E0B' }} />;
      default: return <Star sx={{ color: '#9CA3AF' }} />;
    }
  };

  const handleEditLevel = (level: LevelConfig) => {
    setEditingLevel({ ...level });
    setEditDialogOpen(true);
  };

  const handleSaveLevel = () => {
    if (!editingLevel) return;
    setLevels(prev => prev.map(l => l.id === editingLevel.id ? editingLevel : l));
    setEditDialogOpen(false);
    toast.success(`Nivel ${editingLevel.name} actualizado`);
  };

  const handleAddDiscount = (levelId: string) => {
    setSelectedLevelForDiscount(levelId);
    setEditingDiscount({ category: '', discountPercent: 10, validDays: [1,2,3,4,5,6,7], isActive: true });
    setDiscountDialogOpen(true);
  };

  const handleSaveDiscount = () => {
    if (!editingDiscount || !selectedLevelForDiscount) return;
    
    const newDiscount: LevelDiscount = {
      id: `d${Date.now()}`,
      category: editingDiscount.category || '',
      discountPercent: editingDiscount.discountPercent || 0,
      validDays: editingDiscount.validDays || [1,2,3,4,5,6,7],
      isActive: editingDiscount.isActive ?? true,
    };

    setLevels(prev => prev.map(l => {
      if (l.id === selectedLevelForDiscount) {
        return { ...l, discounts: [...l.discounts, newDiscount] };
      }
      return l;
    }));

    setDiscountDialogOpen(false);
    toast.success('Descuento agregado');
  };

  const handleDeleteDiscount = (levelId: string, discountId: string) => {
    setLevels(prev => prev.map(l => {
      if (l.id === levelId) {
        return { ...l, discounts: l.discounts.filter(d => d.id !== discountId) };
      }
      return l;
    }));
    toast.success('Descuento eliminado');
  };

  // Stats
  const mockStats = {
    plata: 8500, oro: 2300, black: 450, diamante: 75,
    totalPoints: 15000000, redeemedPoints: 3500000, expiredPoints: 500000,
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Niveles & Rewards</Typography>
        <Button variant="outlined" startIcon={<Refresh />}>Actualizar Niveles</Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {[
          { label: 'Usuarios Plata', value: mockStats.plata.toLocaleString(), color: '#9CA3AF', icon: <People /> },
          { label: 'Usuarios Oro', value: mockStats.oro.toLocaleString(), color: '#F59E0B', icon: <People /> },
          { label: 'Usuarios Black', value: mockStats.black.toLocaleString(), color: '#374151', icon: <People /> },
          { label: 'Usuarios Diamante', value: mockStats.diamante.toLocaleString(), color: '#60A5FA', icon: <Diamond /> },
        ].map((stat, i) => (
          <Grid item xs={6} md={3} key={i}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Box sx={{ color: stat.color }}>{stat.icon}</Box>
                  <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
                </Box>
                <Typography variant="h5" fontWeight="bold">{stat.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab label="Configuración de Niveles" icon={<Star />} iconPosition="start" />
          <Tab label="Descuentos por Nivel" icon={<Percent />} iconPosition="start" />
          <Tab label="Estadísticas de Puntos" icon={<TrendingUp />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Tab 1: Level Configuration */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {levels.map((level) => (
            <Grid item xs={12} md={6} key={level.id}>
              <Card sx={{ border: `2px solid ${level.color}` }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getLevelIcon(level.level)}
                      <Typography variant="h6" fontWeight="bold">{level.name}</Typography>
                    </Box>
                    <IconButton onClick={() => handleEditLevel(level)}><Edit /></IconButton>
                  </Box>

                  <Chip label={`Desde ${formatCurrency(level.minInvestment)}`} sx={{ mb: 2, bgcolor: level.color, color: 'white' }} />

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Multiplicador</Typography>
                      <Typography variant="body1" fontWeight="bold">{level.pointsMultiplier}x</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Cashback</Typography>
                      <Typography variant="body1" fontWeight="bold">{level.cashbackPercent}%</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">FCI Extra</Typography>
                      <Typography variant="body1" fontWeight="bold">+{level.fciExtraRate}%</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Financiación</Typography>
                      <Typography variant="body1" fontWeight="bold">{level.financingMaxPercent}%</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Límite Diario</Typography>
                      <Typography variant="body1" fontWeight="bold">{formatCurrency(level.dailyLimit)}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Dto. Tarjeta</Typography>
                      <Typography variant="body1" fontWeight="bold">{level.cardFeeDiscount}%</Typography>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {level.freePhysicalCard && <Chip size="small" icon={<CreditCard />} label="Tarjeta gratis" color="success" />}
                    {level.prioritySupport && <Chip size="small" label="Soporte prioritario" color="info" />}
                    <Chip size="small" label={`${level.discounts.length} descuentos`} variant="outlined" />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Tab 2: Discounts */}
      <TabPanel value={tabValue} index={1}>
        {levels.map((level) => (
          <Paper key={level.id} sx={{ mb: 3, p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getLevelIcon(level.level)}
                <Typography variant="h6">{level.name}</Typography>
              </Box>
              <Button startIcon={<Add />} variant="contained" size="small" onClick={() => handleAddDiscount(level.id)}>
                Agregar Descuento
              </Button>
            </Box>

            {level.discounts.length === 0 ? (
              <Alert severity="info">Sin descuentos configurados</Alert>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Categoría</TableCell>
                      <TableCell>Descuento</TableCell>
                      <TableCell>Días válidos</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell align="right">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {level.discounts.map((discount) => (
                      <TableRow key={discount.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {categories.find(c => c.value === discount.category)?.icon}
                            {categories.find(c => c.value === discount.category)?.label || discount.category}
                          </Box>
                        </TableCell>
                        <TableCell><Chip label={`${discount.discountPercent}%`} color="success" size="small" /></TableCell>
                        <TableCell>
                          {discount.validDays.length === 7 ? 'Todos los días' : 
                            discount.validDays.map(d => daysOfWeek.find(dw => dw.value === d)?.label).join(', ')}
                        </TableCell>
                        <TableCell>
                          <Chip label={discount.isActive ? 'Activo' : 'Inactivo'} color={discount.isActive ? 'success' : 'default'} size="small" />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small" color="error" onClick={() => handleDeleteDiscount(level.id, discount.id)}>
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        ))}
      </TabPanel>

      {/* Tab 3: Points Stats */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">Puntos Totales Emitidos</Typography>
                <Typography variant="h4" fontWeight="bold" color="primary">{mockStats.totalPoints.toLocaleString()}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">Puntos Canjeados</Typography>
                <Typography variant="h4" fontWeight="bold" color="success.main">{mockStats.redeemedPoints.toLocaleString()}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">Puntos Expirados</Typography>
                <Typography variant="h4" fontWeight="bold" color="error.main">{mockStats.expiredPoints.toLocaleString()}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <Alert severity="info" sx={{ mt: 3 }}>
          Los puntos expiran 12 meses después de ser otorgados. El job de expiración corre diariamente a las 00:00.
        </Alert>
      </TabPanel>

      {/* Edit Level Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Editar Nivel: {editingLevel?.name}</DialogTitle>
        <DialogContent>
          {editingLevel && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Inversión Mínima" type="number" value={editingLevel.minInvestment}
                  onChange={(e) => setEditingLevel({ ...editingLevel, minInvestment: Number(e.target.value) })}
                  InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Multiplicador de Puntos" type="number" value={editingLevel.pointsMultiplier}
                  onChange={(e) => setEditingLevel({ ...editingLevel, pointsMultiplier: Number(e.target.value) })}
                  InputProps={{ endAdornment: <InputAdornment position="end">x</InputAdornment> }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Cashback %" type="number" value={editingLevel.cashbackPercent}
                  onChange={(e) => setEditingLevel({ ...editingLevel, cashbackPercent: Number(e.target.value) })}
                  InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Tasa FCI Extra" type="number" value={editingLevel.fciExtraRate}
                  onChange={(e) => setEditingLevel({ ...editingLevel, fciExtraRate: Number(e.target.value) })}
                  InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Financiación Máx %" type="number" value={editingLevel.financingMaxPercent}
                  onChange={(e) => setEditingLevel({ ...editingLevel, financingMaxPercent: Number(e.target.value) })}
                  InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Descuento Tarjeta %" type="number" value={editingLevel.cardFeeDiscount}
                  onChange={(e) => setEditingLevel({ ...editingLevel, cardFeeDiscount: Number(e.target.value) })}
                  InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Límite Diario" type="number" value={editingLevel.dailyLimit}
                  onChange={(e) => setEditingLevel({ ...editingLevel, dailyLimit: Number(e.target.value) })}
                  InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Límite Mensual" type="number" value={editingLevel.monthlyLimit}
                  onChange={(e) => setEditingLevel({ ...editingLevel, monthlyLimit: Number(e.target.value) })}
                  InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Límite Transferencia" type="number" value={editingLevel.transferLimit}
                  onChange={(e) => setEditingLevel({ ...editingLevel, transferLimit: Number(e.target.value) })}
                  InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel control={<Switch checked={editingLevel.freePhysicalCard}
                  onChange={(e) => setEditingLevel({ ...editingLevel, freePhysicalCard: e.target.checked })} />}
                  label="Tarjeta física gratis" />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel control={<Switch checked={editingLevel.prioritySupport}
                  onChange={(e) => setEditingLevel({ ...editingLevel, prioritySupport: e.target.checked })} />}
                  label="Soporte prioritario" />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" startIcon={<Save />} onClick={handleSaveLevel}>Guardar</Button>
        </DialogActions>
      </Dialog>

      {/* Add Discount Dialog */}
      <Dialog open={discountDialogOpen} onClose={() => setDiscountDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Agregar Descuento</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Categoría</InputLabel>
                <Select value={editingDiscount?.category || ''} label="Categoría"
                  onChange={(e) => setEditingDiscount({ ...editingDiscount, category: e.target.value })}>
                  {categories.map((cat) => (
                    <MenuItem key={cat.value} value={cat.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>{cat.icon} {cat.label}</Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography gutterBottom>Porcentaje de descuento: {editingDiscount?.discountPercent}%</Typography>
              <Slider value={editingDiscount?.discountPercent || 10} min={1} max={50}
                onChange={(_, v) => setEditingDiscount({ ...editingDiscount, discountPercent: v as number })} />
            </Grid>
            <Grid item xs={12}>
              <Typography gutterBottom>Días válidos</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {daysOfWeek.map((day) => (
                  <Chip key={day.value} label={day.label} clickable
                    color={editingDiscount?.validDays?.includes(day.value) ? 'primary' : 'default'}
                    onClick={() => {
                      const days = editingDiscount?.validDays || [];
                      const newDays = days.includes(day.value) 
                        ? days.filter(d => d !== day.value) 
                        : [...days, day.value];
                      setEditingDiscount({ ...editingDiscount, validDays: newDays });
                    }} />
                ))}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDiscountDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveDiscount}>Agregar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
