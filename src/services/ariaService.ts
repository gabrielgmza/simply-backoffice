import apiClient from '../lib/apiClient';

export interface AriaMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AriaConversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface AriaConversationDetail {
  id: string;
  title: string;
  messages: AriaMessage[];
  createdAt: string;
  updatedAt: string;
}

export const ariaService = {
  async chat(message: string, conversationId?: string) {
    const response = await apiClient.post('/api/backoffice/aria/chat', {
      message,
      conversationId
    });
    return response.data.data;
  },

  async getConversations(limit?: number) {
    const response = await apiClient.get('/api/backoffice/aria/conversations', {
      params: { limit }
    });
    return response.data.data;
  },

  async getConversation(id: string) {
    const response = await apiClient.get(`/api/backoffice/aria/conversations/${id}`);
    return response.data.data;
  },

  async deleteConversation(id: string) {
    const response = await apiClient.delete(`/api/backoffice/aria/conversations/${id}`);
    return response.data;
  },

  async updateTitle(id: string, title: string) {
    const response = await apiClient.patch(`/api/backoffice/aria/conversations/${id}`, {
      title
    });
    return response.data;
  }
};
