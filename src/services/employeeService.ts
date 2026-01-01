import apiClient from '../lib/apiClient';

export interface Employee {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  status: string;
  avatar_url?: string;
  preferences?: any;
  last_login_at?: string;
  last_activity_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface EmployeesResponse {
  success: boolean;
  data: {
    employees: Employee[];
    total: number;
    page: number;
    totalPages: number;
  };
}

export interface EmployeeResponse {
  success: boolean;
  data: Employee;
}

export const employeeService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
  }) {
    const response = await apiClient.get<EmployeesResponse>('/api/backoffice/employees', {
      params
    });
    return response.data.data;
  },

  async getById(id: string) {
    const response = await apiClient.get<EmployeeResponse>(`/api/backoffice/employees/${id}`);
    return response.data.data;
  },

  async create(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
  }) {
    const response = await apiClient.post<EmployeeResponse>('/api/backoffice/employees', data);
    return response.data.data;
  },

  async update(id: string, data: {
    firstName?: string;
    lastName?: string;
    role?: string;
    status?: string;
    avatarUrl?: string;
    preferences?: any;
  }) {
    const response = await apiClient.put<EmployeeResponse>(`/api/backoffice/employees/${id}`, data);
    return response.data.data;
  },

  async updatePassword(id: string, newPassword: string) {
    const response = await apiClient.patch(`/api/backoffice/employees/${id}/password`, {
      newPassword
    });
    return response.data;
  },

  async delete(id: string) {
    const response = await apiClient.delete(`/api/backoffice/employees/${id}`);
    return response.data;
  },

  async getStats() {
    const response = await apiClient.get('/api/backoffice/employees/stats/overview');
    return response.data.data;
  }
};
