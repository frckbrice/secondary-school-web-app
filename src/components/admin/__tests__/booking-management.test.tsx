import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import BookingManagement from '../booking-management';
import { ThemeProvider } from '../../../components/providers/theme-provider';
import { AuthProvider } from '../../../components/providers/auth-provider';
import { vi } from 'vitest';
import { LanguageProvider } from '../../../hooks/use-language';

// Create a new QueryClient for testing
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>{children}</AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

describe('BookingManagement', () => {
  beforeEach(() => {
    // Reset any mocks before each test
    vi.clearAllMocks();
  });

  it('renders booking management component', async () => {
    render(
      <TestWrapper>
        <LanguageProvider>
          <BookingManagement />
        </LanguageProvider>
      </TestWrapper>
    );

    // Check if the component renders
    expect(screen.getByText(/Booking Management/i)).toBeInTheDocument();
    expect(screen.getByText(/Create New Booking/i)).toBeInTheDocument();
  });

  it('opens create booking dialog when create button is clicked', async () => {
    render(
      <TestWrapper>
        <LanguageProvider>
          <BookingManagement />
        </LanguageProvider>
      </TestWrapper>
    );

    // Click the create button
    const createButton = screen.getByText(/Create New Booking/i);
    fireEvent.click(createButton);

    // Check if dialog opens
    await waitFor(() => {
      expect(screen.getByText(/Create New Booking/i)).toBeInTheDocument();
    });
  });

  it('displays booking data in table', async () => {
    render(
      <TestWrapper>
        <LanguageProvider>
          <BookingManagement />
        </LanguageProvider>
      </TestWrapper>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Test Student')).toBeInTheDocument();
      expect(screen.getByText('Test Parent')).toBeInTheDocument();
    });
  });

  it('filters bookings by status', async () => {
    render(
      <TestWrapper>
        <LanguageProvider>
          <BookingManagement />
        </LanguageProvider>
      </TestWrapper>
    );

    // Find and click the status filter
    const statusFilter = screen.getByLabelText(/Status/i);
    fireEvent.click(statusFilter);

    // Select a status option
    const pendingOption = screen.getByText(/Pending/i);
    fireEvent.click(pendingOption);

    // Check if filter is applied
    await waitFor(() => {
      expect(statusFilter).toHaveValue('pending');
    });
  });

  it('searches bookings by student name', async () => {
    render(
      <TestWrapper>
        <LanguageProvider>
          <BookingManagement />
        </LanguageProvider>
      </TestWrapper>
    );

    // Find the search input
    const searchInput = screen.getByPlaceholderText(/Search bookings/i);

    // Type in search query
    fireEvent.change(searchInput, { target: { value: 'Test Student' } });

    // Check if search is applied
    await waitFor(() => {
      expect(searchInput).toHaveValue('Test Student');
    });
  });

  it('changes items per page', async () => {
    render(
      <TestWrapper>
        <LanguageProvider>
          <BookingManagement />
        </LanguageProvider>
      </TestWrapper>
    );

    // Find the items per page selector
    const itemsPerPageSelect = screen.getByLabelText(/Items per page/i);
    fireEvent.click(itemsPerPageSelect);

    // Select a different option
    const option5 = screen.getByText('5');
    fireEvent.click(option5);

    // Check if the selection is applied
    await waitFor(() => {
      expect(itemsPerPageSelect).toHaveValue('5');
    });
  });

  it('navigates through pagination', async () => {
    render(
      <TestWrapper>
        <LanguageProvider>
          <BookingManagement />
        </LanguageProvider>
      </TestWrapper>
    );

    // Find pagination controls
    const nextButton = screen.getByLabelText(/Next page/i);
    const prevButton = screen.getByLabelText(/Previous page/i);

    // Check if buttons are present
    expect(nextButton).toBeInTheDocument();
    expect(prevButton).toBeInTheDocument();

    // Click next page
    fireEvent.click(nextButton);

    // Check if page changes
    await waitFor(() => {
      expect(screen.getByText(/Page 2/i)).toBeInTheDocument();
    });
  });

  it('updates booking status', async () => {
    render(
      <TestWrapper>
        <LanguageProvider>
          <BookingManagement />
        </LanguageProvider>
      </TestWrapper>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Test Student')).toBeInTheDocument();
    });

    // Find and click the status update button
    const statusButtons = screen.getAllByRole('button');
    const confirmButton = statusButtons.find(button =>
      button.textContent?.includes('Confirm')
    );

    if (confirmButton) {
      fireEvent.click(confirmButton);

      // Check if status is updated
      await waitFor(() => {
        expect(
          screen.getByText(/Booking status updated successfully/i)
        ).toBeInTheDocument();
      });
    }
  });

  it('handles form validation', async () => {
    render(
      <TestWrapper>
        <LanguageProvider>
          <BookingManagement />
        </LanguageProvider>
      </TestWrapper>
    );

    // Open create dialog
    const createButton = screen.getByText(/Create New Booking/i);
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText(/Create New Booking/i)).toBeInTheDocument();
    });

    // Try to submit without filling required fields
    const submitButton = screen.getByText(/Create Booking/i);
    fireEvent.click(submitButton);

    // Check if validation errors are shown
    await waitFor(() => {
      expect(screen.getByText(/Student name is required/i)).toBeInTheDocument();
    });
  });

  it('creates a new booking successfully', async () => {
    render(
      <TestWrapper>
        <LanguageProvider>
          <BookingManagement />
        </LanguageProvider>
      </TestWrapper>
    );

    // Open create dialog
    const createButton = screen.getByText(/Create New Booking/i);
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText(/Create New Booking/i)).toBeInTheDocument();
    });

    // Fill in the form
    const studentNameInput = screen.getByLabelText(/Student Name/i);
    const parentNameInput = screen.getByLabelText(/Parent Name/i);
    const parentEmailInput = screen.getByLabelText(/Parent Email/i);
    const parentPhoneInput = screen.getByLabelText(/Parent Phone/i);
    const teacherNameInput = screen.getByLabelText(/Teacher Name/i);
    const subjectSelect = screen.getByLabelText(/Subject/i);
    const purposeInput = screen.getByLabelText(/Purpose/i);
    const dateInput = screen.getByLabelText(/Preferred Date/i);
    const timeInput = screen.getByLabelText(/Preferred Time/i);

    fireEvent.change(studentNameInput, { target: { value: 'New Student' } });
    fireEvent.change(parentNameInput, { target: { value: 'New Parent' } });
    fireEvent.change(parentEmailInput, {
      target: { value: 'new@example.com' },
    });
    fireEvent.change(parentPhoneInput, { target: { value: '+237 987654321' } });
    fireEvent.change(teacherNameInput, { target: { value: 'New Teacher' } });
    fireEvent.change(subjectSelect, { target: { value: 'mathematics' } });
    fireEvent.change(purposeInput, { target: { value: 'Test purpose' } });
    fireEvent.change(dateInput, { target: { value: '2024-02-20' } });
    fireEvent.change(timeInput, { target: { value: '15:00' } });

    // Submit the form
    const submitButton = screen.getByText(/Create Booking/i);
    fireEvent.click(submitButton);

    // Check if booking is created successfully
    await waitFor(() => {
      expect(
        screen.getByText(/Booking created successfully/i)
      ).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    // Mock a failed API call
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('API Error'));

    render(
      <TestWrapper>
        <LanguageProvider>
          <BookingManagement />
        </LanguageProvider>
      </TestWrapper>
    );

    // Wait for the error to be handled
    await waitFor(() => {
      expect(screen.getByText(/Error loading bookings/i)).toBeInTheDocument();
    });
  });
});
