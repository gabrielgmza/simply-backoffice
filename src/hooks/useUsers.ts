import { useState, useEffect, useCallback } from 'react';
import { User, UserStatus, KYCStatus, UserLevel } from '@/types';
import { usersService } from '@/services/usersService';

interface UserFilters {
  search: string;
  status: string;
  kycStatus: string;
  level: string;
}

interface UseUsersReturn {
  users: User[];
  loading: boolean;
  error: string | null;
  filters: UserFilters;
  page: number;
  totalPages: number;
  setFilters: (filters: Partial<UserFilters>) => void;
  setPage: (page: number) => void;
  refetch: () => void;
}

export function useUsers(): UseUsersReturn {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<UserFilters>({
    search: '',
    status: 'all',
    kycStatus: 'all',
    level: 'all'
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await usersService.getAll(filters, { page, limit: 20 });
      setUsers(response.data);
      setTotalPages(response.pagination.total_pages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const setFilters = useCallback((newFilters: Partial<UserFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
    setPage(1); // Reset to first page when filters change
  }, []);

  return {
    users,
    loading,
    error,
    filters,
    page,
    totalPages,
    setFilters,
    setPage,
    refetch: loadUsers
  };
}
