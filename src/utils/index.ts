import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

// ============================================
// CURRENCY FORMATTING
// ============================================
export const formatCurrency = (value: number | string, currency: string = 'ARS'): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (currency === 'USD' || currency === 'USDT') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(num || 0);
  }
  
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num || 0);
};

export const formatNumber = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('es-AR').format(num || 0);
};

export const formatPercent = (value: number | string, decimals: number = 2): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return `${num.toFixed(decimals)}%`;
};

// ============================================
// DATE FORMATTING
// ============================================
export const formatDate = (date: string | Date, formatStr: string = 'dd/MM/yyyy'): string => {
  try {
    return format(new Date(date), formatStr, { locale: es });
  } catch {
    return '-';
  }
};

export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, 'dd/MM/yyyy HH:mm');
};

export const formatRelative = (date: string | Date): string => {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es });
  } catch {
    return '-';
  }
};

// ============================================
// TEXT UTILITIES
// ============================================
export const truncate = (str: string, length: number = 50): string => {
  if (str.length <= length) return str;
  return `${str.slice(0, length)}...`;
};

export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const formatDNI = (dni: string): string => {
  return dni.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export const formatCVU = (cvu: string): string => {
  return cvu.replace(/(.{4})/g, '$1 ').trim();
};

// ============================================
// VALIDATION
// ============================================
export const isValidEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const isValidDNI = (dni: string): boolean => {
  const cleaned = dni.replace(/\D/g, '');
  return cleaned.length >= 7 && cleaned.length <= 8;
};

export const isValidCVU = (cvu: string): boolean => {
  const cleaned = cvu.replace(/\D/g, '');
  return cleaned.length === 22;
};

// ============================================
// COLOR UTILITIES
// ============================================
export const levelColors: Record<string, string> = {
  PLATA: '#94a3b8',
  ORO: '#fbbf24',
  BLACK: '#475569',
  DIAMANTE: '#818cf8',
};

export const statusColors: Record<string, string> = {
  ACTIVE: '#10b981',
  PENDING: '#f59e0b',
  BLOCKED: '#ef4444',
  SUSPENDED: '#f97316',
  COMPLETED: '#6b7280',
  OVERDUE: '#ef4444',
  PAID: '#10b981',
  APPROVED: '#10b981',
  REJECTED: '#ef4444',
  NOT_STARTED: '#6b7280',
};

export const getStatusColor = (status: string): 'success' | 'error' | 'warning' | 'default' => {
  const colorMap: Record<string, 'success' | 'error' | 'warning' | 'default'> = {
    ACTIVE: 'success',
    COMPLETED: 'success',
    PAID: 'success',
    APPROVED: 'success',
    PENDING: 'warning',
    SUSPENDED: 'warning',
    BLOCKED: 'error',
    OVERDUE: 'error',
    DEFAULTED: 'error',
    REJECTED: 'error',
    LIQUIDATED: 'default',
    NOT_STARTED: 'default',
  };
  return colorMap[status] || 'default';
};

// ============================================
// FILE UTILITIES
// ============================================
export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// ============================================
// PERMISSION UTILITIES
// ============================================
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  SUPER_ADMIN: ['*'],
  ADMIN: [
    'employees:read',
    'users:*',
    'leads:*',
    'tickets:*',
    'settings:read',
    'settings:update',
    'investments:*',
    'financings:*',
    'audit:read',
  ],
  COMPLIANCE: [
    'users:*',
    'leads:read',
    'tickets:read',
    'settings:read',
    'investments:read',
    'financings:read',
    'audit:read',
  ],
  CUSTOMER_SERVICE: [
    'users:read',
    'leads:read',
    'tickets:*',
    'investments:read',
    'financings:read',
    'financings:pay',
  ],
  ANALYST: [
    'users:read',
    'leads:*',
    'tickets:read',
    'settings:read',
    'investments:read',
    'financings:read',
    'audit:read',
  ],
};

export const checkPermission = (role: string, permission: string): boolean => {
  const permissions = ROLE_PERMISSIONS[role] || [];
  
  if (permissions.includes('*')) return true;
  
  return permissions.some(p => {
    if (p.endsWith(':*')) {
      const prefix = p.replace(':*', '');
      return permission.startsWith(prefix);
    }
    return p === permission;
  });
};
