import axios from 'axios';

// Obtener URL del backend desde variables de entorno
const API_URL = import.meta.env.VITE_API_URL || '';

// Debug en desarrollo
if (import.meta.env.DEV) {
  console.log('API URL configurada:', API_URL || '(vacío - usando mismo origen)');
}

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de request - agregar token si existe
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de response - manejar errores globales
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // No redirigir automáticamente en 401 - dejar que el AuthContext maneje
    if (error.response?.status === 401) {
      // Solo limpiar si no estamos en login
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      if (!isLoginRequest) {
        localStorage.removeItem('token');
        // No redirigir automáticamente, dejar que el componente maneje
      }
    }
    return Promise.reject(error);
  }
);

// ============================================
// AUTH API
// ============================================
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/api/backoffice/auth/login', { email, password }),
  me: () => api.get('/api/backoffice/auth/me'),
  logout: () => api.post('/api/backoffice/auth/logout'),
};

// ============================================
// DASHBOARD API
// ============================================
export const dashboardApi = {
  getStats: () => api.get('/api/backoffice/dashboard/stats'),
  getGrowth: (days?: number) => api.get('/api/backoffice/dashboard/growth', { params: { days } }),
  getActivity: (limit?: number) => api.get('/api/backoffice/dashboard/activity', { params: { limit } }),
  getPerformers: () => api.get('/api/backoffice/dashboard/performers'),
  getConversion: () => api.get('/api/backoffice/dashboard/conversion'),
};

// ============================================
// SETTINGS API
// ============================================
export const settingsApi = {
  getAll: () => api.get('/api/backoffice/settings'),
  getByCategory: (category: string) => api.get(`/api/backoffice/settings/category/${category}`),
  getRates: () => api.get('/api/backoffice/settings/rates'),
  getFeatures: () => api.get('/api/backoffice/settings/features'),
  update: (key: string, value: string, reason?: string) => 
    api.put(`/api/backoffice/settings/${key}`, { value, reason }),
  updateMultiple: (updates: { key: string; value: string }[], reason?: string) =>
    api.put('/api/backoffice/settings', { updates, reason }),
  simulate: (key: string, value: string) =>
    api.post(`/api/backoffice/settings/${key}/simulate`, { value }),
  getHistory: (params?: { key?: string; page?: number; limit?: number }) =>
    api.get('/api/backoffice/settings/history', { params }),
};

// ============================================
// INVESTMENTS API
// ============================================
export const investmentsApi = {
  getAll: (params?: Record<string, any>) => 
    api.get('/api/backoffice/investments', { params }),
  getById: (id: string) => 
    api.get(`/api/backoffice/investments/${id}`),
  getStats: () => 
    api.get('/api/backoffice/investments/stats/overview'),
  create: (userId: string, amount: number, reason: string) =>
    api.post('/api/backoffice/investments', { userId, amount, reason }),
  liquidate: (id: string, reason: string) =>
    api.post(`/api/backoffice/investments/${id}/liquidate`, { reason }),
  adjustValue: (id: string, value: number, reason: string) =>
    api.patch(`/api/backoffice/investments/${id}/value`, { value, reason }),
  export: () => 
    api.get('/api/backoffice/investments/export/csv', { responseType: 'blob' }),
};

// ============================================
// FINANCINGS API
// ============================================
export const financingsApi = {
  getAll: (params?: Record<string, any>) => 
    api.get('/api/backoffice/financings', { params }),
  getById: (id: string) => 
    api.get(`/api/backoffice/financings/${id}`),
  getStats: () => 
    api.get('/api/backoffice/financings/stats/overview'),
  getUpcoming: (days?: number) =>
    api.get('/api/backoffice/financings/upcoming', { params: { days } }),
  payInstallment: (id: string, reason: string) =>
    api.post(`/api/backoffice/financings/installments/${id}/pay`, { reason }),
  liquidate: (id: string, reason: string) =>
    api.post(`/api/backoffice/financings/${id}/liquidate`, { reason }),
  waivePenalty: (id: string, reason: string) =>
    api.post(`/api/backoffice/financings/installments/${id}/waive`, { reason }),
  extendDueDate: (id: string, newDueDate: string, reason: string) =>
    api.post(`/api/backoffice/financings/installments/${id}/extend`, { newDueDate, reason }),
  export: () => 
    api.get('/api/backoffice/financings/export/csv', { responseType: 'blob' }),
};

// ============================================
// USERS API
// ============================================
export const usersApi = {
  getAll: (params?: Record<string, any>) => 
    api.get('/api/backoffice/users', { params }),
  getById: (id: string) => 
    api.get(`/api/backoffice/users/${id}`),
  getFullProfile: (id: string) => 
    api.get(`/api/backoffice/users/${id}/full`),
  getTransactions: (id: string, params?: Record<string, any>) =>
    api.get(`/api/backoffice/users/${id}/transactions`, { params }),
  block: (id: string, reason: string) =>
    api.post(`/api/backoffice/users/${id}/block`, { reason }),
  unblock: (id: string, reason: string) =>
    api.post(`/api/backoffice/users/${id}/unblock`, { reason }),
  adjustLimits: (id: string, limits: { dailyLimit?: number; monthlyLimit?: number }, reason: string) =>
    api.patch(`/api/backoffice/users/${id}/limits`, { ...limits, reason }),
  updateLevel: (id: string, level: string, reason: string) =>
    api.patch(`/api/backoffice/users/${id}/level`, { level, reason }),
  updateKYC: (id: string, status: string) =>
    api.patch(`/api/backoffice/users/${id}/kyc`, { status }),
  addRiskFlag: (id: string, flag: { type: string; severity: string; description: string }) =>
    api.post(`/api/backoffice/users/${id}/risk-flags`, flag),
  resolveRiskFlag: (flagId: string, resolution: string) =>
    api.post(`/api/backoffice/risk-flags/${flagId}/resolve`, { resolution }),
  getAudit: (id: string) =>
    api.get(`/api/backoffice/users/${id}/audit`),
};

// ============================================
// AUDIT API
// ============================================
export const auditApi = {
  getAll: (params?: Record<string, any>) => 
    api.get('/api/backoffice/audit', { params }),
  getStats: (days?: number) => 
    api.get('/api/backoffice/audit/stats', { params: { days } }),
  getRecent: (limit?: number) => 
    api.get('/api/backoffice/audit/recent', { params: { limit } }),
};

// ============================================
// EMPLOYEES API
// ============================================
export const employeesApi = {
  getAll: (params?: Record<string, any>) => 
    api.get('/api/backoffice/employees', { params }),
  getById: (id: string) => 
    api.get(`/api/backoffice/employees/${id}`),
  create: (data: { email: string; password: string; firstName: string; lastName: string; role: string }) =>
    api.post('/api/backoffice/employees', data),
  update: (id: string, data: Record<string, any>) =>
    api.put(`/api/backoffice/employees/${id}`, data),
  delete: (id: string) =>
    api.delete(`/api/backoffice/employees/${id}`),
  getStats: () =>
    api.get('/api/backoffice/employees/stats/overview'),
};

// ============================================
// TREASURY API
// ============================================
export const treasuryApi = {
  getAccounts: () => api.get('/api/backoffice/treasury/accounts'),
  getAccountById: (id: string) => api.get(`/api/backoffice/treasury/accounts/${id}`),
  getMovements: (accountId: string, params?: Record<string, any>) =>
    api.get(`/api/backoffice/treasury/accounts/${accountId}/movements`, { params }),
  getSummary: () => api.get('/api/backoffice/treasury/summary'),
  getCashflow: (days?: number) => api.get('/api/backoffice/treasury/cashflow', { params: { days } }),
  deposit: (accountId: string, amount: number, description: string) =>
    api.post('/api/backoffice/treasury/deposit', { accountId, amount, description }),
  withdraw: (accountId: string, amount: number, description: string) =>
    api.post('/api/backoffice/treasury/withdraw', { accountId, amount, description }),
  transfer: (fromAccountId: string, toAccountId: string, amount: number, description: string) =>
    api.post('/api/backoffice/treasury/transfer', { fromAccountId, toAccountId, amount, description }),
};

// ============================================
// OTC API
// ============================================
export const otcApi = {
  getRates: () => api.get('/api/backoffice/otc/rates'),
  getOperations: (params?: Record<string, any>) => api.get('/api/backoffice/otc/operations', { params }),
  getStats: () => api.get('/api/backoffice/otc/stats'),
  getQuote: (type: string, asset: string, amount: number) =>
    api.post('/api/backoffice/otc/quote', { type, asset, amount }),
  createOperation: (data: any) => api.post('/api/backoffice/otc/operations', data),
  approveOperation: (id: string) => api.post(`/api/backoffice/otc/operations/${id}/approve`),
  executeOperation: (id: string) => api.post(`/api/backoffice/otc/operations/${id}/execute`),
  rejectOperation: (id: string, reason: string) =>
    api.post(`/api/backoffice/otc/operations/${id}/reject`, { reason }),
};

// ============================================
// FRAUD API
// ============================================
export const fraudApi = {
  getAlerts: (params?: Record<string, any>) => api.get('/api/backoffice/fraud/alerts', { params }),
  getStats: () => api.get('/api/backoffice/fraud/stats'),
  reviewAlert: (id: string, status: string, notes?: string) =>
    api.post(`/api/backoffice/fraud/alerts/${id}/review`, { status, notes }),
  addToBlacklist: (ip: string, reason: string) =>
    api.post('/api/backoffice/fraud/blacklist/ip', { ip, reason }),
  removeFromBlacklist: (ip: string) =>
    api.delete(`/api/backoffice/fraud/blacklist/ip/${ip}`),
};

// ============================================
// COMPLIANCE API
// ============================================
export const complianceApi = {
  getReports: (params?: Record<string, any>) => api.get('/api/backoffice/compliance/reports', { params }),
  getThresholds: (date?: string) => api.get('/api/backoffice/compliance/thresholds', { params: { date } }),
  getUserStatus: (userId: string) => api.get(`/api/backoffice/compliance/users/${userId}/status`),
  getPendingReviews: () => api.get('/api/backoffice/compliance/reviews/pending'),
  getStats: () => api.get('/api/backoffice/compliance/stats'),
  generateROS: (data: any) => api.post('/api/backoffice/compliance/reports/ros', data),
  approveReport: (id: string) => api.post(`/api/backoffice/compliance/reports/${id}/approve`),
  submitReport: (id: string) => api.post(`/api/backoffice/compliance/reports/${id}/submit`),
  createReview: (data: any) => api.post('/api/backoffice/compliance/reviews', data),
};

// ============================================
// NOTIFICATIONS API
// ============================================
export const notificationsApi = {
  getAll: (limit?: number) => api.get('/api/backoffice/notifications', { params: { limit } }),
  getUnreadCount: () => api.get('/api/backoffice/notifications/unread/count'),
  markAsRead: (id: string) => api.patch(`/api/backoffice/notifications/${id}/read`),
  markAllAsRead: () => api.post('/api/backoffice/notifications/read-all'),
};

export default api;
