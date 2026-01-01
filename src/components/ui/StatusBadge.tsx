import React from 'react';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default';

export interface StatusBadgeProps {
  status: string;
  variant?: BadgeVariant;
  customColors?: {
    bg: string;
    text: string;
  };
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
  success: {
    bg: 'bg-green-100',
    text: 'text-green-800'
  },
  warning: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800'
  },
  error: {
    bg: 'bg-red-100',
    text: 'text-red-800'
  },
  info: {
    bg: 'bg-blue-100',
    text: 'text-blue-800'
  },
  default: {
    bg: 'bg-gray-100',
    text: 'text-gray-800'
  }
};

const statusToVariant: Record<string, BadgeVariant> = {
  // User/Employee status
  'ACTIVE': 'success',
  'INACTIVE': 'default',
  'SUSPENDED': 'error',
  'active': 'success',
  'inactive': 'default',
  'suspended': 'error',
  
  // Ticket status
  'OPEN': 'info',
  'IN_PROGRESS': 'warning',
  'WAITING': 'warning',
  'RESOLVED': 'success',
  'CLOSED': 'default',
  'open': 'info',
  'in_progress': 'warning',
  'waiting': 'warning',
  'resolved': 'success',
  'closed': 'default',
  
  // Priority
  'LOW': 'default',
  'MEDIUM': 'info',
  'HIGH': 'warning',
  'URGENT': 'error',
  'low': 'default',
  'medium': 'info',
  'high': 'warning',
  'urgent': 'error',
  
  // KYC Status
  'PENDING': 'warning',
  'VERIFIED': 'success',
  'REJECTED': 'error',
  'pending': 'warning',
  'verified': 'success',
  'rejected': 'error',
  
  // Leads
  'new': 'info',
  'contacted': 'warning',
  'converted': 'success',
  'lost': 'error'
};

const statusLabels: Record<string, string> = {
  // Employee Status
  'ACTIVE': 'Activo',
  'INACTIVE': 'Inactivo',
  'SUSPENDED': 'Suspendido',
  
  // Ticket Status
  'OPEN': 'Abierto',
  'IN_PROGRESS': 'En Progreso',
  'WAITING': 'En Espera',
  'RESOLVED': 'Resuelto',
  'CLOSED': 'Cerrado',
  
  // Priority
  'LOW': 'Baja',
  'MEDIUM': 'Media',
  'HIGH': 'Alta',
  'URGENT': 'Urgente',
  
  // KYC
  'PENDING': 'Pendiente',
  'VERIFIED': 'Verificado',
  'REJECTED': 'Rechazado',
  
  // Leads
  'new': 'Nuevo',
  'contacted': 'Contactado',
  'converted': 'Convertido',
  'lost': 'Perdido'
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant,
  customColors
}) => {
  const autoVariant = statusToVariant[status] || 'default';
  const finalVariant = variant || autoVariant;
  const styles = customColors || variantStyles[finalVariant];
  const label = statusLabels[status] || status;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles.bg} ${styles.text}`}
    >
      {label}
    </span>
  );
};
