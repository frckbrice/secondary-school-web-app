import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

export async function apiRequest(
  method: string,
  url: string,
  data?: any,
  options?: { on401?: 'returnNull' | 'throw' }
) {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  if (response.status === 401) {
    // Clear invalid token
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }

    if (options?.on401 === 'returnNull') {
      return null;
    }

    throw new Error('Unauthorized');
  }

  return response;
}

export function getQueryFn(options?: { on401?: 'returnNull' | 'throw' }) {
  return async ({ queryKey }: { queryKey: string[] }) => {
    const url = queryKey[0] as string;
    const response = await apiRequest('GET', url, undefined, options);

    if (!response) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.user || data; // Handle both user object and direct data
  };
}
