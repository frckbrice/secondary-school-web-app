'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DataTable } from '../../../ui/data-table';
import { Badge } from '../../../ui/badge';
import { Eye, Download } from 'lucide-react';
import { useLanguage } from '../../../../hooks/use-language';

interface Contribution {
  id: string;
  contributorName: string;
  contributorEmail?: string;
  contributorPhone: string;
  amount: string;
  currency: string;
  paymentProvider: string;
  transactionId?: string;
  purpose?: string;
  status: string;
  graduationYear?: string;
  isAlumni: boolean;
  createdAt: string;
}

export default function ContributionsManagement() {
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const pageSize = 10;

  // Fetch contributions with pagination and filters
  const { data: contributionsData, isLoading } = useQuery({
    queryKey: ['contributions', currentPage, filters, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        ...filters,
      });

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`/api/contributions?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch contributions');
      }
      return response.json();
    },
  });

  const formatCurrency = (amount: string, currency: string) => {
    const numAmount = parseFloat(amount);
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency || 'XAF',
      minimumFractionDigits: 0,
    }).format(numAmount);
  };

  const columns = [
    {
      key: 'contributorInfo',
      label: 'Contributor',
      render: (value: any, row: Contribution) => (
        <div>
          <div className="font-medium">{row.contributorName}</div>
          {row.contributorEmail && (
            <div className="text-sm text-gray-500">{row.contributorEmail}</div>
          )}
          <div className="text-sm text-gray-500">{row.contributorPhone}</div>
          {row.isAlumni && (
            <Badge variant="outline" className="mt-1">
              Alumni
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (value: string, row: Contribution) => (
        <div className="font-medium">
          {formatCurrency(row.amount, row.currency)}
        </div>
      ),
    },
    {
      key: 'paymentProvider',
      label: 'Payment Method',
      render: (value: string) => (
        <Badge variant="outline" className="capitalize">
          {value}
        </Badge>
      ),
    },
    {
      key: 'purpose',
      label: 'Purpose',
      render: (value: string) => (
        <div
          className="max-w-xs truncate"
          title={value || 'General contribution'}
        >
          {value || 'General contribution'}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <Badge
          variant={
            value === 'completed'
              ? 'default'
              : value === 'pending'
                ? 'secondary'
                : 'destructive'
          }
          className="capitalize"
        >
          {value}
        </Badge>
      ),
    },
    {
      key: 'graduationYear',
      label: 'Graduation Year',
      render: (value: string) => value || 'N/A',
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value: any, row: Contribution) => (
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-500 hover:text-gray-700">
            <Eye className="w-4 h-4" />
          </button>
          {row.transactionId && (
            <button className="p-2 text-gray-500 hover:text-gray-700">
              <Download className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const filterOptions = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'completed', label: 'Completed' },
        { value: 'failed', label: 'Failed' },
      ],
    },
    {
      key: 'paymentProvider',
      label: 'Payment Provider',
      options: [
        { value: 'MTN', label: 'MTN Mobile Money' },
        { value: 'Orange', label: 'Orange Money' },
        { value: 'Bank', label: 'Bank Transfer' },
      ],
    },
    {
      key: 'isAlumni',
      label: 'Contributor Type',
      options: [
        { value: 'true', label: 'Alumni' },
        { value: 'false', label: 'Non-Alumni' },
      ],
    },
  ];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (newFilters: Record<string, string>) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when search changes
  };

  const handleExport = () => {
    // Implement export functionality
    console.log('Export contributions');
  };

  const contributions = contributionsData?.contributions || [];
  const pagination = contributionsData?.pagination;

  return (
    <DataTable
      title=""
      description="Track and manage alumni and community contributions"
      columns={columns}
      data={contributions}
      loading={isLoading}
      pagination={
        pagination
          ? {
              page: pagination.page,
              totalPages: Math.ceil((pagination.total || 0) / pageSize),
              total: pagination.total,
              limit: pageSize,
              hasNextPage:
                pagination.page < Math.ceil((pagination.total || 0) / pageSize),
              hasPrevPage: pagination.page > 1,
            }
          : undefined
      }
      filterOptions={filterOptions}
      onFilterChange={handleFilterChange}
      searchPlaceholder="Search by contributor name..."
      onSearch={handleSearch}
      onExport={handleExport}
    />
  );
}
