import {
  useInfiniteQuery,
  UseInfiniteQueryOptions,
} from '@tanstack/react-query';

interface PaginationResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

interface UseInfiniteQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  isPublished?: boolean;
}

export function useInfiniteQueryData<T>(
  queryKey: (string | Record<string, any>)[],
  fetchFunction: (
    params: UseInfiniteQueryParams
  ) => Promise<PaginationResponse<T>>,
  options?: Omit<
    UseInfiniteQueryOptions<PaginationResponse<T>>,
    'queryKey' | 'queryFn' | 'getNextPageParam'
  >
) {
  return useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 1 }) => {
      const params: UseInfiniteQueryParams = {
        page: pageParam as number,
        limit: 10,
      };

      // Extract filters from queryKey
      const filters = queryKey[1] as Record<string, any>;
      if (filters) {
        if (filters.category) params.category = filters.category;
        if (filters.isPublished !== undefined)
          params.isPublished = filters.isPublished;
      }

      return fetchFunction(params);
    },
    getNextPageParam: lastPage => {
      return lastPage.pagination.hasNextPage
        ? lastPage.pagination.page + 1
        : undefined;
    },
    initialPageParam: 1,
    ...options,
  });
}
