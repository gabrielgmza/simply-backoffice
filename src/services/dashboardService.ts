import apiClient from '../lib/apiClient';

export interface DashboardStats {
  users: {
    total: number;
    newToday: number;
    growth: number;
  };
  leads: {
    total: number;
    newToday: number;
    growth: number;
    conversionRate: number;
  };
  employees: {
    total: number;
    active: number;
  };
  tickets: {
    total: number;
    open: number;
    resolved: number;
    resolutionRate: number;
  };
}

export interface GrowthData {
  date: string;
  users: number;
  leads: number;
}

export interface Activity {
  type: 'user' | 'lead' | 'ticket';
  description: string;
  timestamp: string;
  id: string;
  creator?: string;
}

export interface TopPerformer {
  id: string;
  name: string;
  email: string;
  role: string;
  ticketsAssigned: number;
  ticketsCreated: number;
  total: number;
}

export interface LeadConversion {
  stages: Array<{ name: string; value: number }>;
  conversionRate: number;
}

export const dashboardService = {
  async getStats() {
    const response = await apiClient.get<{ success: boolean; data: DashboardStats }>('/api/backoffice/dashboard/stats');
    return response.data.data;
  },

  async getGrowth(days: number = 30) {
    const response = await apiClient.get<{ success: boolean; data: GrowthData[] }>('/api/backoffice/dashboard/growth', {
      params: { days }
    });
    return response.data.data;
  },

  async getActivity(limit: number = 10) {
    const response = await apiClient.get<{ success: boolean; data: Activity[] }>('/api/backoffice/dashboard/activity', {
      params: { limit }
    });
    return response.data.data;
  },

  async getTopPerformers() {
    const response = await apiClient.get<{ success: boolean; data: TopPerformer[] }>('/api/backoffice/dashboard/performers');
    return response.data.data;
  },

  async getConversion() {
    const response = await apiClient.get<{ success: boolean; data: LeadConversion }>('/api/backoffice/dashboard/conversion');
    return response.data.data;
  }
};
