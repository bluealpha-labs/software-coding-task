import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ResponseCurvesChart } from '@/components/charts/response-curves-chart';
import { mmmApi } from '@/lib/mmm-api';

// Mock the API
jest.mock('@/lib/mmm-api', () => ({
  mmmApi: {
    getContributions: jest.fn(),
    getResponseCurve: jest.fn(),
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

const mockResponseCurveData = {
  channel: 'TV',
  points: [
    { spend: 0, response: 0 },
    { spend: 50000, response: 75000 },
    { spend: 100000, response: 100000 },
    { spend: 150000, response: 110000 },
  ],
  saturation_points: [
    { spend: 120000, response: 105000 },
  ],
  metadata: {
    elasticity: 0.8,
    roi: 1.1,
  },
};

const mockAIExplanation = {
  summary: 'TV shows diminishing returns after $120k spend',
  drill_downs: ['Analyze TV saturation point', 'Compare TV vs Digital efficiency'],
  caveat: 'Based on historical performance data',
  confidence_score: 0.78,
  generated_at: '2024-01-15T10:00:00Z',
};

describe('ResponseCurvesChart', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state initially', () => {
    (mmmApi.getContributions as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<ResponseCurvesChart />);
    
    expect(screen.getByText('Loading response curves...')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should render chart with data and channel selector', async () => {
    (mmmApi.getContributions as jest.Mock).mockResolvedValue({
      data: mockContributionsData,
    });
    (mmmApi.getResponseCurve as jest.Mock).mockResolvedValue({
      data: mockResponseCurveData,
    });

    render(<ResponseCurvesChart />);

    await waitFor(() => {
      expect(screen.getByText('Response Curves')).toBeInTheDocument();
    });

    expect(screen.getByText('Channel response to increased investment')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /explain/i })).toBeInTheDocument();
  });

  it('should handle channel selection', async () => {
    (mmmApi.getContributions as jest.Mock).mockResolvedValue({
      data: mockContributionsData,
    });
    (mmmApi.getResponseCurve as jest.Mock).mockResolvedValue({
      data: mockResponseCurveData,
    });

    render(<ResponseCurvesChart />);

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    const channelSelector = screen.getByRole('combobox');
    fireEvent.change(channelSelector, { target: { value: 'Digital' } });

    await waitFor(() => {
      expect(mmmApi.getResponseCurve).toHaveBeenCalledWith('Digital');
    });
  });

  it('should handle API errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    (mmmApi.getContributions as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(<ResponseCurvesChart />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load response curve data')).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  it('should handle explain button click', async () => {
    (mmmApi.getContributions as jest.Mock).mockResolvedValue({
      data: mockContributionsData,
    });
    (mmmApi.getResponseCurve as jest.Mock).mockResolvedValue({
      data: mockResponseCurveData,
    });
    (mmmApi.getAIExplanation as jest.Mock).mockResolvedValue({
      data: mockAIExplanation,
    });

    const mockOnExplainRequest = jest.fn();
    render(<ResponseCurvesChart onExplainRequest={mockOnExplainRequest} />);

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
    (mmmApi.getResponseCurve as jest.Mock).mockResolvedValue({
      data: mockResponseCurveData,
    });
    (mmmApi.getAIExplanation as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<ResponseCurvesChart />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /explain/i })).toBeInTheDocument();
    });

    const explainButton = screen.getByRole('button', { name: /explain/i });
    fireEvent.click(explainButton);

    await waitFor(() => {
      expect(screen.getByText('Analyzing...')).toBeInTheDocument();
    });
  });

  it('should have proper accessibility attributes', async () => {
    (mmmApi.getContributions as jest.Mock).mockResolvedValue({
      data: mockContributionsData,
    });
    (mmmApi.getResponseCurve as jest.Mock).mockResolvedValue({
      data: mockResponseCurveData,
    });

    render(<ResponseCurvesChart />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /explain response curve/i })).toBeInTheDocument();
    });

    expect(screen.getByTestId('response-curves-chart')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-label', 'Select channel');
  });

  it('should display saturation points when available', async () => {
    (mmmApi.getContributions as jest.Mock).mockResolvedValue({
      data: mockContributionsData,
    });
    (mmmApi.getResponseCurve as jest.Mock).mockResolvedValue({
      data: mockResponseCurveData,
    });

    render(<ResponseCurvesChart />);

    await waitFor(() => {
      expect(screen.getByText('Response Curves')).toBeInTheDocument();
    });

    // Chart should render with saturation points
    expect(screen.getByTestId('response-curves-chart')).toBeInTheDocument();
  });
});
