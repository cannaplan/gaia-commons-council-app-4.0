import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import React from 'react';

// jsdom polyfills required for UI components
beforeAll(() => {
  class MockResizeObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  }
  (global as any).ResizeObserver = MockResizeObserver;
});

vi.mock('framer-motion', async () => {
  const { default: React } = await import('react');
  return {
    motion: new Proxy(
      {},
      {
        get:
          (_target, tag: string) =>
          ({ children, initial: _i, animate: _a, transition: _t, exit: _e, ...props }: any) =>
            React.createElement(tag, props, children),
      }
    ),
    AnimatePresence: ({ children }: any) => children,
  };
});

vi.mock('wouter', async () => {
  const { default: React } = await import('react');
  return {
    Link: ({ href, children, ...props }: { href: string; children?: React.ReactNode } & React.HTMLAttributes<HTMLAnchorElement>) =>
      React.createElement('a', { href, ...props }, children),
  };
});

vi.mock('recharts', async () => {
  const { default: React } = await import('react');
  const Noop = () => null;
  const Box = ({ children }: any) => React.createElement('div', {}, children);
  return {
    LineChart: Box,
    Line: Noop,
    XAxis: Noop,
    YAxis: Noop,
    CartesianGrid: Noop,
    Tooltip: Noop,
    Legend: Noop,
    ResponsiveContainer: Box,
    BarChart: Box,
    Bar: Noop,
    AreaChart: Box,
    Area: Noop,
    PieChart: Box,
    Pie: Noop,
    Cell: Noop,
    RadarChart: Box,
    PolarGrid: Noop,
    PolarAngleAxis: Noop,
    PolarRadiusAxis: Noop,
    Radar: Noop,
  };
});

vi.mock('html2canvas', () => ({ default: vi.fn().mockResolvedValue({ toDataURL: () => '' }) }));
vi.mock('jspdf', () => ({ default: vi.fn().mockImplementation(() => ({ addImage: vi.fn(), save: vi.fn() })) }));

vi.mock('@/lib/theme-context', () => ({
  ThemeProvider: ({ children }: any) => children,
  useColorScheme: () => ({ colorScheme: 'default', setColorScheme: vi.fn() }),
  colorSchemes: [{ id: 'default', name: 'Emerald', description: 'Fresh green theme', primary: '#10b981', accent: '#34d399' }],
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: vi.fn() },
  }),
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

// Mock Header and sub-components to avoid matchMedia / ThemeProvider / i18next issues
vi.mock('@/components/Header', () => ({ Header: () => null }));
vi.mock('@/components/QuickNav', () => ({ QuickNav: () => null }));
vi.mock('@/components/SocialSharing', () => ({ SocialSharing: () => null }));

function formatCurrencyMillions(value: string | undefined) {
  if (!value) return "—";
  return `$${value}`;
}

export default function Dashboard(): JSX.Element {
  const { data: health } = useHealth();
  const { data: pilot } = usePilotStats();
  const { data: endowment } = useEndowmentStats();
  const { data: timeline } = useTimeline();
  const { data: scaleProjections } = useScaleProjections();

  const statewide = scaleProjections?.find((item) => item.scale === "statewide");

  return (
    <main className="dashboard" style={{ padding: 16 }}>
      <h1 style={{ marginBottom: 12 }}>Gaia Dashboard</h1>

      <div
        role="tablist"
        aria-label="Dashboard sections"
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        <button role="tab" aria-selected="true" style={{ padding: "8px 12px" }}>
          Overview
        </button>
        <button role="tab" aria-selected="false" style={{ padding: "8px 12px" }}>
          Statewide
        </button>
        <button role="tab" aria-selected="false" style={{ padding: "8px 12px" }}>
          Investor
        </button>
        <button role="tab" aria-selected="false" style={{ padding: "8px 12px" }}>
          Timeline
        </button>
      </div>

      <CollapsibleCard id="overview" title="Overview">
        <div style={{ display: "grid", gap: 12 }}>
          <p>
            Status: <strong>{health?.status ?? "unknown"}</strong>
          </p>

          <div style={{ display: "grid", gap: 8 }}>
            <div>
              <strong>900,000 Students Fed</strong>
            </div>
            <div>
              <strong>1,200 Greenhouses</strong>
            </div>
            <div>
              <strong>statewide</strong>
            </div>
          </div>
        </div>
      </CollapsibleCard>

      <CollapsibleCard id="statewide" title="Statewide Scale">
        <div style={{ display: "grid", gap: 10 }}>
          <div>Scale: <strong>{statewide?.scale ?? "statewide"}</strong></div>
          <div>Students: <strong>{formatNumber(statewide?.students)}</strong></div>
          <div>Greenhouses: <strong>{formatNumber(statewide?.greenhouses)}</strong></div>
          <div>Schools: <strong>{formatNumber(statewide?.schools)}</strong></div>
          <div>Square feet: <strong>{formatNumber(statewide?.sqft)}</strong></div>
          <div>Meals per day: <strong>{formatNumber(statewide?.mealsPerDay)}</strong></div>
          <div>CO₂ avoided annually: <strong>{formatNumber(statewide?.co2TonsAnnual)}</strong></div>
        </div>
      </CollapsibleCard>

      <CollapsibleCard id="investor" title="Investor Dashboard">
        <div style={{ display: "grid", gap: 10 }}>
          <div>Endowment size: <strong>{formatCurrencyMillions(endowment?.size)}</strong></div>
          <div>Annual draw: <strong>{formatCurrencyMillions(endowment?.annual)}</strong></div>
          <div>Pilot schools: <strong>{formatNumber(pilot?.schools)}</strong></div>
          <div>Pilot students: <strong>{formatNumber(pilot?.students)}</strong></div>
          <div>Pilot square feet: <strong>{formatNumber(pilot?.sqft)}</strong></div>
        </div>
      </CollapsibleCard>

      <CollapsibleCard id="timeline" title="Timeline">
        <div style={{ display: "grid", gap: 8 }}>
          {timeline && timeline.length > 0 ? (
            timeline.slice(0, 5).map((item: any) => (
              <div key={item.id ?? `${item.year}-${item.event}`}>
                <strong>{item.year}</strong> — {item.event}
              </div>
            ))
          ) : (
            <div>No timeline events available.</div>
          )}
        </div>
      </CollapsibleCard>
    </main>
  );
}

describe('Dashboard page', () => {
  it('renders without crashing', () => {
    render(<Dashboard />, { wrapper: Wrapper });
  });

  it('renders the Gaia Dashboard heading', () => {
    render(<Dashboard />, { wrapper: Wrapper });
    expect(screen.getByRole('heading', { level: 1, name: /gaia dashboard/i })).toBeInTheDocument();
  });

  it('renders the Investor Dashboard card heading', () => {
    render(<Dashboard />, { wrapper: Wrapper });
    expect(screen.getByRole('heading', { level: 3, name: /investor dashboard/i })).toBeInTheDocument();
  });

  it('Investor Dashboard card is collapsed by default', () => {
    render(<Dashboard />, { wrapper: Wrapper });
    const toggleBtn = screen.getByRole('button', { name: /expand/i });
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');
  });

  it('expanding the Investor Dashboard card reveals placeholder content', async () => {
    const user = userEvent.setup();
    render(<Dashboard />, { wrapper: Wrapper });
    const toggleBtn = screen.getByRole('button', { name: /expand/i });
    await user.click(toggleBtn);
    expect(screen.getByText(/investor lcof\/bcr sensitivity/i)).toBeInTheDocument();
  });

  it('card toggle button has correct aria-controls attribute', () => {
    render(<Dashboard />, { wrapper: Wrapper });
    const toggleBtn = screen.getByRole('button', { name: /expand/i });
    expect(toggleBtn).toHaveAttribute('aria-controls', 'investor-panel');
  });

  it('does not render removed sections (tabs, statewide data, greenhouse counts)', () => {
    render(<Dashboard />, { wrapper: Wrapper });
    expect(screen.queryByRole('tab')).toBeNull();
    expect(screen.queryByText(/900,000 students fed/i)).toBeNull();
    expect(screen.queryByText(/1,200 greenhouses/i)).toBeNull();
  });
});
