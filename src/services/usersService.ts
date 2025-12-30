import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://vsggmk7vo9.execute-api.us-east-1.amazonaws.com';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  dni: string;
  phone: string;
  user_status: string;
  kyc_status: string;
  user_level: string;
  created_at: string;
}

export const usersService = {
  async getUsers() {
    try {
      const response = await axios.get(`${API_URL}/api/backoffice/users`);
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  async getUserById(id: string) {
    try {
      const response = await axios.get(`${API_URL}/api/backoffice/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  async updateUser(id: string, data: Partial<User>) {
    try {
      const response = await axios.put(`${API_URL}/api/backoffice/users/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  async deleteUser(id: string) {
    try {
      const response = await axios.delete(`${API_URL}/api/backoffice/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
};
