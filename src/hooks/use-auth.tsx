import React from 'react';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  useQuery,
  useMutation,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';
import { User as SelectUser, InsertUser } from '../schema';
import { getQueryFn, apiRequest } from '../lib/queryClient';
import { useRouter, usePathname } from 'next/navigation';

// Mock data for fallback (only used if API is unreachable)
const mockUsers = [
  {
    id: 1,
    username: 'admin',
    fullName: 'Administrator',
    email: 'admin@gbhs-bafia.com',
    role: 'admin',
    teacherSubject: null,
    profileImageUrl: '',
    createdAt: new Date(),
  },
  {
    id: 2,
    username: 'super_admin',
    fullName: 'Super Administrator',
    email: 'superadmin@gbhs-bafia.com',
    role: 'super_admin',
    teacherSubject: null,
    profileImageUrl: '',
    createdAt: new Date(),
  },
  {
    id: 3,
    username: 'teacher1',
    fullName: 'John Doe',
    email: 'teacher1@gbhs-bafia.com',
    role: 'teacher',
    teacherSubject: 'Mathematics',
    profileImageUrl: '',
    createdAt: new Date(),
  },
  {
    id: 4,
    username: 'GBHS2024001',
    fullName: 'Alice Johnson',
    email: 'alice.johnson@example.com',
    role: 'student',
    teacherSubject: null,
    profileImageUrl: '',
    createdAt: new Date(),
  },
];

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, InsertUser>;
};

type LoginData = Pick<InsertUser, 'username' | 'password'>;

export const AuthContext = createContext<AuthContextType | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();

  // Check if token exists before making the query
  const [token, setToken] = useState<string | null>(null);
  const [shouldFetchUser, setShouldFetchUser] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
    setShouldFetchUser(!!storedToken);
  }, []);

  const {
    data: userData,
    error,
    isLoading,
  } = useQuery({
    queryKey: ['/api/users/me'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    enabled: shouldFetchUser, // Only fetch if token exists
    retry: 1,
    retryDelay: 1000,
  });

  // Extract user from the response
  const user = userData?.user || userData || null;

  // Handle automatic redirects based on user role and current path
  useEffect(() => {
    if (!isLoading && user) {
      const currentPath = pathname;

      // Don't redirect if already on the correct dashboard
      if (
        currentPath.startsWith('/admin') &&
        (user.role === 'admin' || user.role === 'super_admin')
      ) {
        return;
      }

      if (currentPath.startsWith('/teacher') && user.role === 'teacher') {
        return;
      }

      if (
        currentPath.startsWith('/student-portal') &&
        user.role === 'student'
      ) {
        return;
      }

      // Redirect based on role
      if (user.role === 'admin' || user.role === 'super_admin') {
        // Check if user was trying to access a specific admin page
        if (currentPath.startsWith('/admin/')) {
          // Keep the specific admin page
          return;
        }
        // Redirect to admin dashboard
        if (currentPath !== '/admin') {
          router.push('/admin');
        }
      } else if (user.role === 'teacher') {
        // Check if user was trying to access a specific teacher page
        if (currentPath.startsWith('/teacher/')) {
          // Keep the specific teacher page
          return;
        }
        // Redirect to teacher dashboard
        if (currentPath !== '/teacher') {
          router.push('/teacher');
        }
      } else if (user.role === 'student') {
        // Redirect to student portal
        if (currentPath !== '/student-portal') {
          router.push('/student-portal');
        }
      }
    }
  }, [isLoading, user, pathname, router]);

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      try {
        const res = await apiRequest('POST', '/api/auth/login', credentials);
        if (!res) {
          throw new Error('Login failed');
        }
        const data = await res.json();
        if (!data.success) {
          throw new Error(data.message || 'Login failed');
        }
        // Store token in localStorage for client-side access
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        return data.user;
      } catch (error: any) {
        // Only use mock data if the error is a network error
        if (error.message && error.message.includes('Failed to fetch')) {
          console.warn('API unreachable, using mock data:', error);
          const mockUser = mockUsers.find(
            u => u.username === credentials.username
          );
          if (mockUser) {
            localStorage.setItem('token', 'mock-token-' + Date.now());
            return mockUser;
          }
        }
        throw error;
      }
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(['/api/users/me'], { user });

      // Redirect based on role after successful login
      if (user.role === 'admin' || user.role === 'super_admin') {
        router.push('/admin');
      } else if (user.role === 'teacher') {
        router.push('/teacher');
      } else if (user.role === 'student') {
        router.push('/student-portal');
      }
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      try {
        const res = await apiRequest('POST', '/api/auth/register', credentials);
        if (!res) {
          throw new Error('Registration failed');
        }
        const data = await res.json();
        if (!data.success) {
          throw new Error(data.message || 'Registration failed');
        }
        // Store token in localStorage for client-side access
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        return data.user;
      } catch (error: any) {
        // Only use mock data if the error is a network error
        if (error.message && error.message.includes('Failed to fetch')) {
          console.warn('API unreachable, using mock data:', error);
          const mockUser = {
            id: Date.now(),
            username: credentials.username,
            fullName: credentials.fullName || '',
            email: credentials.email || '',
            role: credentials.role || 'user',
            teacherSubject: null,
            profileImageUrl: '',
            createdAt: new Date(),
          };
          localStorage.setItem('token', 'mock-token-' + Date.now());
          return mockUser;
        }
        throw error;
      }
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(['/api/users/me'], { user });

      // Redirect based on role after successful registration
      if (user.role === 'admin' || user.role === 'super_admin') {
        router.push('/admin');
      } else if (user.role === 'teacher') {
        router.push('/teacher');
      } else if (user.role === 'student') {
        router.push('/student-portal');
      }
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          await apiRequest('POST', '/api/auth/logout', { token });
        }
      } catch (error) {
        // Continue with logout even if API fails
      } finally {
        localStorage.removeItem('token');
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/users/me'], null);
      router.push('/');
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user as SelectUser | null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
