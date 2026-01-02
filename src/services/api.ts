import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

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
// NOTIFICATIONS API
// ============================================
export const notificationsApi = {
  getAll: (limit?: number) => api.get('/api/backoffice/notifications', { params: { limit } }),
  getUnreadCount: () => api.get('/api/backoffice/notifications/unread/count'),
  markAsRead: (id: string) => api.patch(`/api/backoffice/notifications/${id}/read`),
  markAllAsRead: () => api.post('/api/backoffice/notifications/read-all'),
};

export default api;
