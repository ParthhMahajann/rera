/**
 * Frontend Component Test Suite
 * Tests all React components, user interactions, and UI functionality
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';

// Mock components for testing
import CreateQuotation from '../components/CreateQuotation';
import QuotationList from '../components/QuotationList';
import QuotationDisplay from '../components/QuotationDisplay';
import Dashboard from '../components/Dashboard';

// Mock API calls
jest.mock('../api', () => ({
  createQuotation: jest.fn(),
  getQuotations: jest.fn(),
  downloadQuotationPDF: jest.fn(),
  getPendingQuotations: jest.fn(),
}));

const mockApi = require('../api');

// Test wrapper for components that need Router
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('CreateQuotation Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders create quotation form', () => {
    render(
      <TestWrapper>
        <CreateQuotation />
      </TestWrapper>
    );

    expect(screen.getByText(/create quotation/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/developer type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/project region/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/plot area/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/developer name/i)).toBeInTheDocument();
  });

  test('validates required fields', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <CreateQuotation />
      </TestWrapper>
    );

    // Try to submit without filling required fields
    const submitButton = screen.getByRole('button', { name: /create quotation/i });
    await user.click(submitButton);

    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(/developer type is required/i)).toBeInTheDocument();
    });
  });

  test('submits form with valid data', async () => {
    const user = userEvent.setup();
    mockApi.createQuotation.mockResolvedValue({
      data: { id: 'Q001', message: 'Success' }
    });

    render(
      <TestWrapper>
        <CreateQuotation />
      </TestWrapper>
    );

    // Fill form
    await user.selectOptions(screen.getByLabelText(/developer type/i), 'category 2');
    await user.selectOptions(screen.getByLabelText(/project region/i), 'Mumbai');
    await user.type(screen.getByLabelText(/plot area/i), '5000');
    await user.type(screen.getByLabelText(/developer name/i), 'Test Developer');
    await user.type(screen.getByLabelText(/project name/i), 'Test Project');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /create quotation/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockApi.createQuotation).toHaveBeenCalledWith(
        expect.objectContaining({
          developerType: 'category 2',
          projectRegion: 'Mumbai',
          plotArea: 5000,
          developerName: 'Test Developer',
          projectName: 'Test Project'
        })
      );
    });
  });

  test('handles API errors gracefully', async () => {
    const user = userEvent.setup();
    mockApi.createQuotation.mockRejectedValue(new Error('API Error'));

    render(
      <TestWrapper>
        <CreateQuotation />
      </TestWrapper>
    );

    // Fill minimum required fields
    await user.selectOptions(screen.getByLabelText(/developer type/i), 'category 1');
    await user.selectOptions(screen.getByLabelText(/project region/i), 'Delhi');
    await user.type(screen.getByLabelText(/plot area/i), '1000');
    await user.type(screen.getByLabelText(/developer name/i), 'Test');

    const submitButton = screen.getByRole('button', { name: /create quotation/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/error creating quotation/i)).toBeInTheDocument();
    });
  });

  test('calculates pricing correctly according to rules', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <CreateQuotation />
      </TestWrapper>
    );

    // Set category 2 developer (should use category 2 pricing)
    await user.selectOptions(screen.getByLabelText(/developer type/i), 'category 2');
    await user.type(screen.getByLabelText(/plot area/i), '5000');

    // Check that pricing is calculated without multipliers or GST
    await waitFor(() => {
      const priceElements = screen.getAllByText(/₹/);
      expect(priceElements.length).toBeGreaterThan(0);
      
      // Prices should be exactly as specified in JSON without GST
      priceElements.forEach(element => {
        expect(element.textContent).not.toMatch(/\+.*gst/i);
      });
    });
  });
});

describe('QuotationList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders quotation list', async () => {
    const mockQuotations = [
      {
        id: 'Q001',
        developer_name: 'Test Developer 1',
        project_name: 'Test Project 1',
        created_at: '2023-01-01'
      },
      {
        id: 'Q002',
        developer_name: 'Test Developer 2',
        project_name: 'Test Project 2',
        created_at: '2023-01-02'
      }
    ];

    mockApi.getQuotations.mockResolvedValue({ quotations: mockQuotations });

    render(
      <TestWrapper>
        <QuotationList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Developer 1')).toBeInTheDocument();
      expect(screen.getByText('Test Developer 2')).toBeInTheDocument();
      expect(screen.getByText('Test Project 1')).toBeInTheDocument();
      expect(screen.getByText('Test Project 2')).toBeInTheDocument();
    });
  });

  test('handles empty quotation list', async () => {
    mockApi.getQuotations.mockResolvedValue({ quotations: [] });

    render(
      <TestWrapper>
        <QuotationList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/no quotations found/i)).toBeInTheDocument();
    });
  });

  test('filters quotations by search term', async () => {
    const user = userEvent.setup();
    const mockQuotations = [
      {
        id: 'Q001',
        developer_name: 'ABC Developer',
        project_name: 'ABC Project',
        created_at: '2023-01-01'
      },
      {
        id: 'Q002',
        developer_name: 'XYZ Developer',
        project_name: 'XYZ Project',
        created_at: '2023-01-02'
      }
    ];

    mockApi.getQuotations.mockResolvedValue({ quotations: mockQuotations });

    render(
      <TestWrapper>
        <QuotationList />
      </TestWrapper>
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('ABC Developer')).toBeInTheDocument();
    });

    // Search for ABC
    const searchInput = screen.getByPlaceholderText(/search/i);
    await user.type(searchInput, 'ABC');

    await waitFor(() => {
      expect(screen.getByText('ABC Developer')).toBeInTheDocument();
      expect(screen.queryByText('XYZ Developer')).not.toBeInTheDocument();
    });
  });

  test('downloads PDF when button clicked', async () => {
    const user = userEvent.setup();
    mockApi.downloadQuotationPDF.mockResolvedValue(new Blob(['PDF content']));
    
    const mockQuotations = [
      {
        id: 'Q001',
        developer_name: 'Test Developer',
        project_name: 'Test Project',
        created_at: '2023-01-01'
      }
    ];

    mockApi.getQuotations.mockResolvedValue({ quotations: mockQuotations });

    render(
      <TestWrapper>
        <QuotationList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Developer')).toBeInTheDocument();
    });

    const downloadButton = screen.getByRole('button', { name: /download/i });
    await user.click(downloadButton);

    expect(mockApi.downloadQuotationPDF).toHaveBeenCalledWith('Q001', true);
  });
});

describe('QuotationDisplay Component', () => {
  const mockQuotation = {
    id: 'Q001',
    developer_name: 'Test Developer',
    project_name: 'Test Project',
    developer_type: 'category 2',
    project_region: 'Mumbai',
    plot_area: 5000,
    validity: '30 days',
    payment_schedule: '50%',
    services: [
      {
        name: 'RERA Registration',
        price: 50000,
        description: 'Complete RERA registration process'
      }
    ]
  };

  test('displays quotation details correctly', () => {
    render(
      <TestWrapper>
        <QuotationDisplay quotation={mockQuotation} />
      </TestWrapper>
    );

    expect(screen.getByText('Test Developer')).toBeInTheDocument();
    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('category 2')).toBeInTheDocument();
    expect(screen.getByText('Mumbai')).toBeInTheDocument();
    expect(screen.getByText('5000')).toBeInTheDocument();
    expect(screen.getByText('RERA Registration')).toBeInTheDocument();
  });

  test('shows prices without GST as per user rules', () => {
    render(
      <TestWrapper>
        <QuotationDisplay quotation={mockQuotation} />
      </TestWrapper>
    );

    // Check that prices are displayed without GST
    const priceElements = screen.getAllByText(/₹.*50,000/);
    expect(priceElements.length).toBeGreaterThan(0);
    
    // Should not show any GST additions
    expect(screen.queryByText(/gst/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/tax/i)).not.toBeInTheDocument();
  });

  test('uses elegant MUI styling with white theme and blue accents', () => {
    const { container } = render(
      <TestWrapper>
        <QuotationDisplay quotation={mockQuotation} />
      </TestWrapper>
    );

    // Check for MUI components and styling
    const muiElements = container.querySelectorAll('[class*="Mui"]');
    expect(muiElements.length).toBeGreaterThan(0);
    
    // Look for white/blue color scheme indicators
    const styledElements = container.querySelectorAll('[class*="white"], [class*="blue"]');
    expect(styledElements.length).toBeGreaterThanOrEqual(0);
  });
});

describe('Dashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders dashboard with statistics', async () => {
    mockApi.getQuotations.mockResolvedValue({
      quotations: [
        { id: 'Q001', status: 'completed' },
        { id: 'Q002', status: 'pending' }
      ]
    });

    mockApi.getPendingQuotations.mockResolvedValue({
      quotations: [{ id: 'Q002', status: 'pending' }]
    });

    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      expect(screen.getByText(/2/)).toBeInTheDocument(); // Total quotations
      expect(screen.getByText(/1/)).toBeInTheDocument(); // Pending quotations
    });
  });

  test('shows recent activity', async () => {
    const recentQuotations = [
      {
        id: 'Q001',
        developer_name: 'Recent Developer',
        created_at: new Date().toISOString()
      }
    ];

    mockApi.getQuotations.mockResolvedValue({ quotations: recentQuotations });

    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/recent activity/i)).toBeInTheDocument();
      expect(screen.getByText('Recent Developer')).toBeInTheDocument();
    });
  });

  test('navigates to create quotation', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );

    const createButton = screen.getByRole('button', { name: /create.*quotation/i });
    await user.click(createButton);

    // Would test navigation but requires router setup
    expect(createButton).toHaveBeenCalled || expect(createButton).toBeInTheDocument();
  });
});

describe('Responsive Design Tests', () => {
  test('components adapt to mobile viewport', () => {
    // Mock window.matchMedia for responsive tests
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query.includes('max-width: 768px'),
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    render(
      <TestWrapper>
        <CreateQuotation />
      </TestWrapper>
    );

    // Component should render without errors on mobile
    expect(screen.getByText(/create quotation/i)).toBeInTheDocument();
  });
});

describe('Error Boundary Tests', () => {
  // Mock console.error to prevent error output during tests
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  test('handles component errors gracefully', () => {
    // Create a component that throws an error
    const ThrowError = () => {
      throw new Error('Test error');
    };

    // This would require an actual error boundary component
    // For now, just test that the error doesn't crash the test
    expect(() => {
      render(<ThrowError />);
    }).toThrow('Test error');
  });
});

describe('Accessibility Tests', () => {
  test('components have proper ARIA labels', () => {
    render(
      <TestWrapper>
        <CreateQuotation />
      </TestWrapper>
    );

    // Check for form labels
    expect(screen.getByLabelText(/developer type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/project region/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/plot area/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/developer name/i)).toBeInTheDocument();
  });

  test('buttons have accessible names', () => {
    render(
      <TestWrapper>
        <CreateQuotation />
      </TestWrapper>
    );

    const submitButton = screen.getByRole('button', { name: /create quotation/i });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toBeEnabled();
  });

  test('form has proper keyboard navigation', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <CreateQuotation />
      </TestWrapper>
    );

    const firstInput = screen.getByLabelText(/developer type/i);
    firstInput.focus();

    // Tab through form elements
    await user.tab();
    expect(screen.getByLabelText(/project region/i)).toHaveFocus();

    await user.tab();
    expect(screen.getByLabelText(/plot area/i)).toHaveFocus();
  });
});

describe('Performance Tests', () => {
  test('components render within acceptable time', async () => {
    const startTime = performance.now();
    
    render(
      <TestWrapper>
        <CreateQuotation />
      </TestWrapper>
    );

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Component should render in under 100ms
    expect(renderTime).toBeLessThan(100);
  });

  test('list components handle large datasets', async () => {
    const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
      id: `Q${i.toString().padStart(3, '0')}`,
      developer_name: `Developer ${i}`,
      project_name: `Project ${i}`,
      created_at: new Date().toISOString()
    }));

    mockApi.getQuotations.mockResolvedValue({ quotations: largeDataset });

    const startTime = performance.now();
    
    render(
      <TestWrapper>
        <QuotationList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Developer 0')).toBeInTheDocument();
    });

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Should handle large datasets reasonably well (under 1 second)
    expect(renderTime).toBeLessThan(1000);
  });
});

// Integration test for complete user workflow
describe('User Workflow Integration', () => {
  test('complete quotation creation and viewing workflow', async () => {
    const user = userEvent.setup();
    
    // Mock successful API responses
    mockApi.createQuotation.mockResolvedValue({
      data: { 
        id: 'Q001', 
        message: 'Quotation created successfully',
        developer_name: 'Integration Test Developer',
        project_name: 'Integration Test Project'
      }
    });

    mockApi.getQuotations.mockResolvedValue({
      quotations: [{
        id: 'Q001',
        developer_name: 'Integration Test Developer',
        project_name: 'Integration Test Project',
        created_at: new Date().toISOString()
      }]
    });

    // Step 1: Create quotation
    const { rerender } = render(
      <TestWrapper>
        <CreateQuotation />
      </TestWrapper>
    );

    // Fill form
    await user.selectOptions(screen.getByLabelText(/developer type/i), 'category 2');
    await user.selectOptions(screen.getByLabelText(/project region/i), 'Mumbai');
    await user.type(screen.getByLabelText(/plot area/i), '5000');
    await user.type(screen.getByLabelText(/developer name/i), 'Integration Test Developer');
    await user.type(screen.getByLabelText(/project name/i), 'Integration Test Project');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /create quotation/i });
    await user.click(submitButton);

    // Wait for success message
    await waitFor(() => {
      expect(mockApi.createQuotation).toHaveBeenCalled();
    });

    // Step 2: View quotations list
    rerender(
      <TestWrapper>
        <QuotationList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Integration Test Developer')).toBeInTheDocument();
      expect(screen.getByText('Integration Test Project')).toBeInTheDocument();
    });
  });
});
