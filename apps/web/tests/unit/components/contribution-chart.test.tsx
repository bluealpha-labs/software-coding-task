import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ContributionChart } from '@/components/charts/contribution-chart';
import { mmmApi } from '@/lib/mmm-api';

// Mock the API
jest.mock('@/lib/mmm-api', () => ({
  mmmApi: {
    getContributions: jest.fn(),
    getAIExplanation: jest.fn(),
  },
  getCachedExplanation: jest.fn(),
  setCachedExplanation: jest.fn(),
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

const mockContributionsData = {
  contributions: [
    { channel: 'TV', value: 100000 },
    { channel: 'Digital', value: 75000 },
    { channel: 'Radio', value: 50000 },
  ],
  total_contribution: 225000,
  period: '2024-Q1',
};

const mockAIExplanation = {
  summary: 'TV shows the highest contribution with $100,000',
  drill_downs: ['Analyze TV performance by time period', 'Compare TV vs Digital ROI'],
  caveat: 'Data based on Q1 2024 performance',
  confidence_score: 0.85,
  generated_at: '2024-01-15T10:00:00Z',
};

describe('ContributionChart', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state initially', () => {
    (mmmApi.getContributions as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<ContributionChart />);
    
    expect(screen.getByText('Loading contribution data...')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should render chart with data', async () => {
    (mmmApi.getContributions as jest.Mock).mockResolvedValue({
      data: mockContributionsData,
    });

    render(<ContributionChart />);

    await waitFor(() => {
      expect(screen.getByText('Channel Performance')).toBeInTheDocument();
    });

    expect(screen.getByText('Contribution by Channel')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /explain/i })).toBeInTheDocument();
  });

  it('should handle API errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    (mmmApi.getContributions as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(<ContributionChart />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load contribution data')).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  it('should handle explain button click', async () => {
    (mmmApi.getContributions as jest.Mock).mockResolvedValue({
      data: mockContributionsData,
    });
    (mmmApi.getAIExplanation as jest.Mock).mockResolvedValue({
      data: mockAIExplanation,
    });

    const mockOnExplainRequest = jest.fn();
    render(<ContributionChart onExplainRequest={mockOnExplainRequest} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /explain/i })).toBeInTheDocument();
    });

    const explainButton = screen.getByRole('button', { name: /explain/i });
    fireEvent.click(explainButton);

    await waitFor(() => {
      expect(mockOnExplainRequest).toHaveBeenCalled();
    });
  });

  it('should show loading state when explaining', async () => {
    (mmmApi.getContributions as jest.Mock).mockResolvedValue({
      data: mockContributionsData,
    });
    (mmmApi.getAIExplanation as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<ContributionChart />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /explain/i })).toBeInTheDocument();
    });

    const explainButton = screen.getByRole('button', { name: /explain/i });
    fireEvent.click(explainButton);

    await waitFor(() => {
      expect(screen.getByText('Analyzing...')).toBeInTheDocument();
    });
  });

  it('should use cached explanation when available', async () => {
    const { getCachedExplanation } = require('@/lib/mmm-api');
    (getCachedExplanation as jest.Mock).mockReturnValue(mockAIExplanation);
    
    (mmmApi.getContributions as jest.Mock).mockResolvedValue({
      data: mockContributionsData,
    });

    const mockOnExplainRequest = jest.fn();
    render(<ContributionChart onExplainRequest={mockOnExplainRequest} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /explain/i })).toBeInTheDocument();
    });

    const explainButton = screen.getByRole('button', { name: /explain/i });
    fireEvent.click(explainButton);

    expect(getCachedExplanation).toHaveBeenCalled();
    expect(mockOnExplainRequest).toHaveBeenCalled();
    expect(mmmApi.getAIExplanation).not.toHaveBeenCalled();
  });

  it('should have proper accessibility attributes', async () => {
    (mmmApi.getContributions as jest.Mock).mockResolvedValue({
      data: mockContributionsData,
    });

    render(<ContributionChart />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /explain contribution chart/i })).toBeInTheDocument();
    });

    expect(screen.getByTestId('contribution-chart')).toBeInTheDocument();
  });
});
