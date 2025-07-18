import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Input } from './input';
import { Button } from './button';
import { Badge } from './badge';
import { Pagination } from './pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
import { Search, Filter, Download, FileText } from 'lucide-react';

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
  sortable?: boolean;
}

interface FilterOption {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface DataTableProps {
  title?: string;
  description?: string;
  columns: Column[];
  data: any[];
  loading?: boolean;
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  filterOptions?: FilterOption[];
  onFilterChange?: (filters: Record<string, string>) => void;
  onExport?: () => void;
  showSearch?: boolean;
  showFilters?: boolean;
  showPagination?: boolean;
  showExport?: boolean;
  defaultLimit?: number;
  limitOptions?: number[];
}

export function DataTable({
  title,
  description,
  columns,
  data,
  loading = false,
  pagination,
  onPageChange,
  onLimitChange,
  searchPlaceholder = 'Search...',
  onSearch,
  filterOptions = [],
  onFilterChange,
  onExport,
  showSearch = true,
  showFilters = true,
  showPagination = true,
  showExport = false,
  defaultLimit = 10,
  limitOptions = [5, 10, 20, 50, 100],
}: DataTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [currentLimit, setCurrentLimit] = useState(defaultLimit);

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters };
    if (value === 'all') {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  // Handle limit change
  const handleLimitChange = (limit: number) => {
    setCurrentLimit(limit);
    onLimitChange?.(limit);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    onPageChange?.(page);
  };

  return (
    <Card>
      {(title || description) && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              {title && <CardTitle>{title}</CardTitle>}
              {description && (
                <p className="text-sm text-gray-600 mt-1">{description}</p>
              )}
            </div>
            {showExport && onExport && (
              <Button onClick={onExport} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            )}
          </div>
        </CardHeader>
      )}
      <CardContent>
        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6 p-4 bg-gray-50 rounded-lg border">
          {showSearch && onSearch && (
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={e => handleSearch(e.target.value)}
                  className="pl-10 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {showFilters && filterOptions.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {filterOptions.map(filter => (
                <Select
                  key={filter.key}
                  value={filters[filter.key] || 'all'}
                  onValueChange={value => handleFilterChange(filter.key, value)}
                >
                  <SelectTrigger className="w-48 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder={filter.label} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {filter.options.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ))}
            </div>
          )}

          {/* Page Size Selector */}
          {showPagination && pagination && (
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded border border-gray-200">
              <span className="text-sm text-gray-600 whitespace-nowrap">
                Show:
              </span>
              <Select
                value={currentLimit.toString()}
                onValueChange={value => handleLimitChange(parseInt(value))}
              >
                <SelectTrigger className="w-20 bg-white border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {limitOptions.map(option => (
                    <SelectItem key={option} value={option.toString()}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-600 whitespace-nowrap">
                per page
              </span>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full border-collapse bg-white">
            <thead>
              <tr className="border-b bg-gray-50">
                {columns.map(column => (
                  <th
                    key={column.key}
                    className="text-left p-4 font-semibold text-gray-700 text-sm uppercase tracking-wide"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // Loading skeleton
                Array.from({ length: Math.min(currentLimit, 10) }).map(
                  (_, index) => (
                    <tr
                      key={`skeleton-${index}`}
                      className="border-b hover:bg-gray-50"
                    >
                      {columns.map(column => (
                        <td
                          key={`skeleton-${column.key}-${index}`}
                          className="p-4"
                        >
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </td>
                      ))}
                    </tr>
                  )
                )
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="text-center py-12 text-gray-500"
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <FileText className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-sm font-medium">No data found</p>
                      <p className="text-xs text-gray-400">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                (Array.isArray(data) ? data : []).map((row, index) => (
                  <tr
                    key={row.id || row._id || index}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    {columns.map(column => (
                      <td
                        key={`${column.key}-${row.id || row._id || index}`}
                        className="p-4 align-top"
                      >
                        {column.render
                          ? column.render(row[column.key], row)
                          : row[column.key]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {showPagination && pagination && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{' '}
              of {pagination.total} results
            </div>
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
              pageSize={pagination.limit}
              totalItems={pagination.total}
              showPageInfo={false}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
