import apiClient from '../lib/apiClient';

export interface Notification {
  id: string;
  employee_id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  metadata: any;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export const notificationService = {
  async getAll(limit?: number) {
    const response = await apiClient.get<{ success: boolean; data: Notification[] }>(
      '/api/backoffice/notifications',
      { params: { limit } }
    );
    return response.data.data;
  },

  async getUnreadCount() {
    const response = await apiClient.get<{ success: boolean; data: { count: number } }>(
      '/api/backoffice/notifications/unread/count'
    );
    return response.data.data.count;
  },

  async markAsRead(id: string) {
    const response = await apiClient.patch(`/api/backoffice/notifications/${id}/read`);
    return response.data;
  },

  async markAllAsRead() {
    const response = await apiClient.post('/api/backoffice/notifications/read-all');
    return response.data;
  },

  async delete(id: string) {
    const response = await apiClient.delete(`/api/backoffice/notifications/${id}`);
    return response.data;
  }
};
