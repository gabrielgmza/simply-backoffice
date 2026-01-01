import apiClient from '../lib/apiClient';

export interface Lead {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  terminos_aceptados: boolean;
  source: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadsResponse {
  success: boolean;
  data: {
    leads: Lead[];
    total: number;
    page: number;
    totalPages: number;
  };
}

export const leadsService = {
  async getLeads(params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
  }): Promise<LeadsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.order) queryParams.append('order', params.order);

    const response = await apiClient.get(`/api/backoffice/leads?${queryParams}`);
    return response.data;
  },

  async getLeadById(id: string): Promise<{ success: boolean; data: Lead }> {
    const response = await apiClient.get(`/api/backoffice/leads/${id}`);
    return response.data;
  },

  async exportLeads(): Promise<Blob> {
    const response = await apiClient.get('/api/backoffice/leads/export', {
      responseType: 'blob'
    });
    return response.data;
  }
};
