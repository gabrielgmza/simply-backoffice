import apiClient from '../lib/apiClient';
import { Integration, IntegrationType, IntegrationStatus, ApiResponse } from '../types';

export interface UpdateIntegrationConfig {
  is_enabled?: boolean;
  config?: Record<string, any>;
}

export const integrationsService = {
  // Obtener todas las integraciones
  getAll: async (): Promise<Integration[]> => {
    const response = await apiClient.get<ApiResponse<Integration[]>>('/backoffice/integrations');
    return response.data.data || [];
  },
  
  // Obtener una integración específica
  getById: async (id: string): Promise<Integration> => {
    const response = await apiClient.get<ApiResponse<Integration>>(`/backoffice/integrations/${id}`);
    if (!response.data.data) throw new Error('Integration not found');
    return response.data.data;
  },
  
  // Activar/Desactivar integración
  toggleStatus: async (id: string, is_enabled: boolean): Promise<Integration> => {
    const response = await apiClient.patch<ApiResponse<Integration>>(
      `/backoffice/integrations/${id}/toggle`,
      { is_enabled }
    );
    if (!response.data.data) throw new Error('Failed to toggle integration');
    return response.data.data;
  },
  
  // Actualizar configuración de integración
  updateConfig: async (id: string, config: Record<string, any>): Promise<Integration> => {
    const response = await apiClient.patch<ApiResponse<Integration>>(
      `/backoffice/integrations/${id}/config`,
      { config }
    );
    if (!response.data.data) throw new Error('Failed to update config');
    return response.data.data;
  },
  
  // Actualizar credenciales (API keys)
  updateCredentials: async (id: string, credentials: Record<string, string>): Promise<Integration> => {
    const response = await apiClient.patch<ApiResponse<Integration>>(
      `/backoffice/integrations/${id}/credentials`,
      { credentials }
    );
    if (!response.data.data) throw new Error('Failed to update credentials');
    return response.data.data;
  },
  
  // Test de conexión / Health check
  testConnection: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<ApiResponse<{ success: boolean; message: string }>>(
      `/backoffice/integrations/${id}/test`
    );
    return response.data.data || { success: false, message: 'Unknown error' };
  },
  
  // Obtener logs de una integración
  getLogs: async (id: string, limit: number = 50): Promise<any[]> => {
    const response = await apiClient.get<ApiResponse<any[]>>(
      `/backoffice/integrations/${id}/logs`,
      { params: { limit } }
    );
    return response.data.data || [];
  }
};
