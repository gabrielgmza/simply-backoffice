import apiClient from '../lib/apiClient';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  created_by: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  assigned_to?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  comments?: TicketComment[];
}

export interface TicketComment {
  id: string;
  ticket_id: string;
  comment: string;
  is_internal: boolean;
  created_at: string;
  employee: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

export const ticketService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
    category?: string;
    assignedTo?: string;
    createdBy?: string;
  }) {
    const response = await apiClient.get('/api/backoffice/tickets', { params });
    return response.data.data;
  },

  async getById(id: string) {
    const response = await apiClient.get(`/api/backoffice/tickets/${id}`);
    return response.data.data;
  },

  async create(data: {
    title: string;
    description: string;
    category: string;
    priority: string;
    assignedToId?: string;
    tags?: string[];
  }) {
    const response = await apiClient.post('/api/backoffice/tickets', data);
    return response.data.data;
  },

  async update(id: string, data: {
    title?: string;
    description?: string;
    category?: string;
    priority?: string;
    status?: string;
    tags?: string[];
  }) {
    const response = await apiClient.put(`/api/backoffice/tickets/${id}`, data);
    return response.data.data;
  },

  async assign(id: string, assignedToId: string) {
    const response = await apiClient.patch(`/api/backoffice/tickets/${id}/assign`, {
      assignedToId
    });
    return response.data.data;
  },

  async updateStatus(id: string, status: string) {
    const response = await apiClient.patch(`/api/backoffice/tickets/${id}/status`, {
      status
    });
    return response.data.data;
  },

  async addComment(id: string, comment: string, isInternal: boolean = false) {
    const response = await apiClient.post(`/api/backoffice/tickets/${id}/comments`, {
      comment,
      isInternal
    });
    return response.data.data;
  },

  async getStats() {
    const response = await apiClient.get('/api/backoffice/tickets/stats/overview');
    return response.data.data;
  }
};
