'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { DataTable } from '../ui/data-table';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Eye, Edit, Trash2, UserPlus } from 'lucide-react';
import { apiRequest } from '../../lib/queryClient';
import { useToast } from '../../hooks/use-toast';
import { useLanguage } from '../../hooks/use-language';

interface User {
  id: string;
  username: string;
  role: string;
  fullName?: string;
  email?: string;
  phone?: string;
  teacherSubject?: string;
  profileImageUrl?: string;
  createdAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface UsersResponse {
  success: boolean;
  users: User[];
  pagination: PaginationInfo;
}

export default function UsersManagement() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [currentLimit, setCurrentLimit] = useState(10);
  const [filters, setFilters] = useState<{
    role?: string;
    teacherSubject?: string;
  }>({});
  const [searchQuery, setSearchQuery] = useState('');

  // Build query parameters
  const buildQueryParams = () => {
    const params = new URLSearchParams();
    params.append('page', currentPage.toString());
    params.append('limit', currentLimit.toString());

    if (filters.role) params.append('role', filters.role);
    if (filters.teacherSubject)
      params.append('teacherSubject', filters.teacherSubject);

    return params.toString();
  };

  // Fetch users with pagination
  const {
    data: usersResponse,
    isLoading,
    error,
    refetch,
  } = useQuery<UsersResponse>({
    queryKey: ['users', currentPage, currentLimit, filters],
    queryFn: async () => {
      const response = await apiRequest(
        'GET',
        `/api/users?${buildQueryParams()}`
      );
      if (!response) throw new Error('Failed to fetch users');
      return response.json();
    },
  });

  const users = usersResponse?.users || [];
  const pagination = usersResponse?.pagination;

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest('DELETE', `/api/users/${userId}`);
      if (!response) throw new Error('Failed to delete user');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t('Success'),
        description: t('User deleted successfully'),
      });
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: t('Error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle limit change
  const handleLimitChange = (limit: number) => {
    setCurrentLimit(limit);
    setCurrentPage(1); // Reset to first page when changing limit
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // You can implement search functionality here
    // For now, we'll just store the query
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: Record<string, string>) => {
    setFilters({
      role: newFilters.role || undefined,
      teacherSubject: newFilters.teacherSubject || undefined,
    });
    setCurrentPage(1); // Reset to first page when changing filters
  };

  // Table columns
  const columns = [
    {
      key: 'username',
      label: t('Username'),
    },
    {
      key: 'fullName',
      label: t('Full Name'),
      render: (value: string) => value || '-',
    },
    {
      key: 'role',
      label: t('Role'),
      render: (value: string) => (
        <Badge
          variant={
            value === 'super_admin'
              ? 'destructive'
              : value === 'admin'
                ? 'default'
                : 'secondary'
          }
        >
          {value}
        </Badge>
      ),
    },
    {
      key: 'email',
      label: t('Email'),
      render: (value: string) => value || '-',
    },
    {
      key: 'teacherSubject',
      label: t('Subject'),
      render: (value: string) => value || '-',
    },
    {
      key: 'createdAt',
      label: t('Created'),
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: t('Actions'),
      render: (_: any, row: User) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Handle view user
            }}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Handle edit user
            }}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => deleteUserMutation.mutate(row.id)}
            disabled={deleteUserMutation.isPending}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Filter options
  const filterOptions = [
    {
      key: 'role',
      label: t('Role'),
      options: [
        { value: 'user', label: t('User') },
        { value: 'admin', label: t('Admin') },
        { value: 'super_admin', label: t('Super Admin') },
        { value: 'teacher', label: t('Teacher') },
      ],
    },
    {
      key: 'teacherSubject',
      label: t('Subject'),
      options: [
        { value: 'Mathematics', label: t('Mathematics') },
        { value: 'Physics', label: t('Physics') },
        { value: 'Chemistry', label: t('Chemistry') },
        { value: 'Biology', label: t('Biology') },
        { value: 'English', label: t('English') },
        { value: 'French', label: t('French') },
      ],
    },
  ];

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{t('Error loading users')}</p>
        <Button onClick={() => refetch()} className="mt-4">
          {t('Retry')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('Users Management')}</h2>
          <p className="text-gray-600">
            {t('Manage system users and their roles')}
          </p>
        </div>
        <Button>
          <UserPlus className="w-4 h-4 mr-2" />
          {t('Add User')}
        </Button>
      </div>

      <DataTable
        title=""
        description={t('All registered users in the system')}
        columns={columns}
        data={users}
        loading={isLoading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        onSearch={handleSearch}
        filterOptions={filterOptions}
        onFilterChange={handleFilterChange}
        searchPlaceholder={t('Search users...')}
        showSearch={true}
        showFilters={true}
        showPagination={true}
        defaultLimit={10}
        limitOptions={[5, 10, 20, 50, 100]}
      />
    </div>
  );
}
