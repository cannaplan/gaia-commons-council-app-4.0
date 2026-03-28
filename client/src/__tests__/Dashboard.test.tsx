import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
    Link: ({
      href,
      children,
      ...props
    }: { href: string; children?: React.ReactNode } & React.HTMLAttributes<HTMLAnchorElement>) =>
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
vi.mock('jspdf', () => ({
  default: vi.fn().mockImplementation(() => ({ addImage: vi.fn(), save: vi.fn() })),
}));

vi.mock('@/lib/theme-context', () => ({
  ThemeProvider: ({ children }: any) => children,
  useColorScheme: () => ({ colorScheme: 'default', setColorScheme: vi.fn() }),
  colorSchemes: [
    {
      id: 'default',
      name: 'Emerald',
      description: 'Fresh green theme',
      primary: '#10b981',
      accent: '#34d399',
    },
  ],
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: vi.fn() },
  }),
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

vi.mock('@/components/Header', () => ({ Header: () => null }));
vi.mock('@/components/QuickNav', () => ({ QuickNav: () => null }));
vi.mock('@/components/SocialSharing', () => ({ SocialSharing: () => null }));

// Mock ClusterBuilder to avoid deep dependency chain
vi.mock('../pages/ClusterBuilder', () => ({
  default: () => React.createElement('div', { 'data-testid': 'cluster-builder-mock' }),
}));

// Mock all hooks used by Dashboard — factory returns vi.fn() placeholders so we can
// configure return values per test via vi.mocked().mockReturnValue()
vi.mock('../hooks/use-gaia', () => ({
  useHealth: vi.fn(),
  usePilotStats: vi.fn(),
  useEndowmentStats: vi.fn(),
  useTimeline: vi.fn(),
  useScaleProjections: vi.fn(),
}));

// Import the mocked module namespace so we can call vi.mocked() on each hook
import * as gaiaHooks from '../hooks/use-gaia';

/** Reset all hooks to undefined (loading/no-data) before each test */
beforeEach(() => {
  vi.mocked(gaiaHooks.useHealth).mockReturnValue({ data: undefined } as any);
  vi.mocked(gaiaHooks.usePilotStats).mockReturnValue({ data: undefined } as any);
  vi.mocked(gaiaHooks.useEndowmentStats).mockReturnValue({ data: undefined } as any);
  vi.mocked(gaiaHooks.useTimeline).mockReturnValue({ data: undefined } as any);
  vi.mocked(gaiaHooks.useScaleProjections).mockReturnValue({ data: undefined } as any);
});

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: qc }, children);
}

/** Render a fresh Dashboard with a fresh QueryClient for each test */
async function renderDashboard() {
  const { default: Dashboard } = await import('../pages/Dashboard');
  return render(React.createElement(Dashboard), { wrapper: makeWrapper() });
}

// CollapsibleCard renders children only when open. This helper expands the card at
// the given index (0-based among all expand-buttons) so content becomes visible.
async function expandCard(index: number) {
  const user = userEvent.setup();
  const buttons = screen.getAllByRole('button', { name: /expand/i });
  await user.click(buttons[index]);
}

// Card indices (position of expand button in order of appearance in DOM):
// 0 = Overview, 1 = Statewide Scale, 2 = Investor Dashboard,
// 3 = Timeline, 4 = Greenhouse Cluster Builder
const OVERVIEW_IDX = 0;
const STATEWIDE_IDX = 1;
const TIMELINE_IDX = 3;

// ─── Tab navigation ───────────────────────────────────────────────────────────

describe('Dashboard page — tab navigation (PR fix)', () => {
  it('renders four tab buttons in a tablist', async () => {
    await renderDashboard();
    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(4);
  });

  it('tab labels are Overview, Statewide, Investor, Timeline', async () => {
    await renderDashboard();
    const labels = screen.getAllByRole('tab').map((t) => t.textContent?.trim());
    expect(labels).toContain('Overview');
    expect(labels).toContain('Statewide');
    expect(labels).toContain('Investor');
    expect(labels).toContain('Timeline');
  });

  it('Overview tab is selected by default (aria-selected="true")', async () => {
    await renderDashboard();
    expect(screen.getByRole('tab', { name: /overview/i })).toHaveAttribute('aria-selected', 'true');
  });

  it('Statewide tab button is not selected by default (aria-selected="false")', async () => {
    await renderDashboard();
    // Use exact match to avoid matching the "Statewide Scale" card heading
    expect(screen.getByRole('tab', { name: /^statewide$/i })).toHaveAttribute(
      'aria-selected',
      'false'
    );
  });

  it('Timeline tab button is not selected by default (aria-selected="false")', async () => {
    await renderDashboard();
    expect(screen.getByRole('tab', { name: /^timeline$/i })).toHaveAttribute(
      'aria-selected',
      'false'
    );
  });

  it('Investor tab button is not selected by default (aria-selected="false")', async () => {
    await renderDashboard();
    expect(screen.getByRole('tab', { name: /^investor$/i })).toHaveAttribute(
      'aria-selected',
      'false'
    );
  });

  it('all four tab elements are <button> elements', async () => {
    await renderDashboard();
    screen.getAllByRole('tab').forEach((tab) => {
      expect(tab.tagName.toLowerCase()).toBe('button');
    });
  });

  it('renders the tablist with accessible aria-label "Dashboard sections"', async () => {
    await renderDashboard();
    expect(screen.getByRole('tablist')).toHaveAttribute('aria-label', 'Dashboard sections');
  });
});

// ─── Overview section content ─────────────────────────────────────────────────
// Content is inside CollapsibleCard — must expand card first

describe('Dashboard page — Overview section content (PR fix)', () => {
  it('shows static "900,000 Students Fed" text after expanding Overview card', async () => {
    await renderDashboard();
    await expandCard(OVERVIEW_IDX);
    expect(screen.getByText(/900,000 Students Fed/i)).toBeInTheDocument();
  });

  it('shows static "1,200 Greenhouses" text after expanding Overview card', async () => {
    await renderDashboard();
    await expandCard(OVERVIEW_IDX);
    expect(screen.getByText(/1,200 Greenhouses/i)).toBeInTheDocument();
  });

  it('shows "unknown" health status fallback when no health data', async () => {
    vi.mocked(gaiaHooks.useHealth).mockReturnValue({ data: undefined } as any);
    await renderDashboard();
    await expandCard(OVERVIEW_IDX);
    expect(screen.getByText('unknown')).toBeInTheDocument();
  });

  it('shows actual health status when health data is provided', async () => {
    vi.mocked(gaiaHooks.useHealth).mockReturnValue({ data: { status: 'ok' } } as any);
    await renderDashboard();
    await expandCard(OVERVIEW_IDX);
    expect(screen.getByText('ok')).toBeInTheDocument();
  });

  it('renders a nested stats grid inside the Overview card', async () => {
    await renderDashboard();
    await expandCard(OVERVIEW_IDX);
    // All three static stats should appear
    expect(screen.getByText(/900,000 Students Fed/i)).toBeInTheDocument();
    expect(screen.getByText(/1,200 Greenhouses/i)).toBeInTheDocument();
    // static "statewide" label
    expect(screen.getByText('statewide')).toBeInTheDocument();
  });
});

// ─── Statewide Scale section ──────────────────────────────────────────────────

describe('Dashboard page — Statewide Scale section (PR fix)', () => {
  it('renders the Statewide Scale CollapsibleCard heading', async () => {
    await renderDashboard();
    expect(screen.getByRole('heading', { name: /statewide scale/i })).toBeInTheDocument();
  });

  it('Scale label is visible after expanding the Statewide Scale card', async () => {
    await renderDashboard();
    await expandCard(STATEWIDE_IDX);
    expect(screen.getByText(/Scale:/)).toBeInTheDocument();
  });

  it('shows "statewide" fallback when no projection data after expanding', async () => {
    vi.mocked(gaiaHooks.useScaleProjections).mockReturnValue({ data: undefined } as any);
    await renderDashboard();
    await expandCard(STATEWIDE_IDX);
    // The Scale field renders: "Scale: statewide" (the <strong> contains "statewide")
    expect(screen.getAllByText('statewide').length).toBeGreaterThan(0);
  });

  it('shows actual numeric data when statewide projection is provided', async () => {
    vi.mocked(gaiaHooks.useScaleProjections).mockReturnValue({
      data: [
        {
          scale: 'statewide',
          students: 900000,
          greenhouses: 1200,
          schools: 800,
          sqft: 12000000,
          mealsPerDay: 1800000,
          co2TonsAnnual: 50000,
        },
      ],
    } as any);
    await renderDashboard();
    await expandCard(STATEWIDE_IDX);

    expect(screen.getByText('900,000')).toBeInTheDocument();
    expect(screen.getByText('1,200')).toBeInTheDocument();
    expect(screen.getByText('800')).toBeInTheDocument();
  });

  it('shows em-dash (—) for undefined numeric fields via formatNumber', async () => {
    vi.mocked(gaiaHooks.useScaleProjections).mockReturnValue({
      data: [{ scale: 'statewide', students: undefined, greenhouses: undefined }],
    } as any);
    await renderDashboard();
    await expandCard(STATEWIDE_IDX);

    // formatNumber(undefined) → "—"
    const dashes = screen.getAllByText('—');
    expect(dashes.length).toBeGreaterThan(0);
  });
});

// ─── Timeline section ─────────────────────────────────────────────────────────

describe('Dashboard page — Timeline section', () => {
  it('renders the Timeline CollapsibleCard heading', async () => {
    await renderDashboard();
    expect(screen.getByRole('heading', { name: /^timeline$/i })).toBeInTheDocument();
  });

  it('shows "No timeline events available." when timeline is an empty array', async () => {
    vi.mocked(gaiaHooks.useTimeline).mockReturnValue({ data: [] } as any);
    await renderDashboard();
    await expandCard(TIMELINE_IDX);
    expect(screen.getByText(/no timeline events available/i)).toBeInTheDocument();
  });

  it('shows "No timeline events available." when timeline data is undefined', async () => {
    vi.mocked(gaiaHooks.useTimeline).mockReturnValue({ data: undefined } as any);
    await renderDashboard();
    await expandCard(TIMELINE_IDX);
    expect(screen.getByText(/no timeline events available/i)).toBeInTheDocument();
  });

  it('renders timeline events when data is provided', async () => {
    vi.mocked(gaiaHooks.useTimeline).mockReturnValue({
      data: [
        { id: 1, year: 2024, event: 'Pilot launch in St. Paul' },
        { id: 2, year: 2025, event: 'Statewide expansion begins' },
      ],
    } as any);
    await renderDashboard();
    await expandCard(TIMELINE_IDX);

    expect(screen.getByText(/pilot launch in st\. paul/i)).toBeInTheDocument();
    expect(screen.getByText(/statewide expansion begins/i)).toBeInTheDocument();
  });

  it('renders at most 5 events when more than 5 are provided (slice boundary)', async () => {
    const events = Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      year: 2020 + i,
      event: `Event number ${i + 1}`,
    }));
    vi.mocked(gaiaHooks.useTimeline).mockReturnValue({ data: events } as any);
    await renderDashboard();
    await expandCard(TIMELINE_IDX);

    for (let i = 1; i <= 5; i++) {
      expect(screen.getByText(new RegExp(`Event number ${i}`))).toBeInTheDocument();
    }
    // Events 6–8 must NOT appear
    expect(screen.queryByText(/Event number 6/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Event number 7/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Event number 8/)).not.toBeInTheDocument();
  });

  it('uses item.id as React key when present', async () => {
    vi.mocked(gaiaHooks.useTimeline).mockReturnValue({
      data: [{ id: 99, year: 2030, event: 'Key event by id' }],
    } as any);
    await renderDashboard();
    await expandCard(TIMELINE_IDX);
    expect(screen.getByText(/Key event by id/i)).toBeInTheDocument();
  });
});

// ─── General rendering ────────────────────────────────────────────────────────

describe('Dashboard page — general rendering', () => {
  it('renders without crashing', async () => {
    await renderDashboard();
  });

  it('renders the "Gaia Dashboard" h1 heading', async () => {
    await renderDashboard();
    expect(screen.getByRole('heading', { level: 1, name: /gaia dashboard/i })).toBeInTheDocument();
  });

  it('renders all four CollapsibleCard section headings', async () => {
    await renderDashboard();
    expect(screen.getByRole('heading', { name: /^overview$/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /statewide scale/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /investor dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^timeline$/i })).toBeInTheDocument();
  });

  it('all CollapsibleCard sections are collapsed by default', async () => {
    await renderDashboard();
    screen.getAllByRole('button', { name: /expand/i }).forEach((btn) => {
      expect(btn).toHaveAttribute('aria-expanded', 'false');
    });
  });

  it('clicking an expand button sets aria-expanded to "true"', async () => {
    await renderDashboard();
    const user = userEvent.setup();
    const [firstBtn] = screen.getAllByRole('button', { name: /expand/i });
    await user.click(firstBtn);
    expect(firstBtn).toHaveAttribute('aria-expanded', 'true');
  });

  it('expand button label changes to "Collapse" after clicking', async () => {
    await renderDashboard();
    const user = userEvent.setup();
    const [firstBtn] = screen.getAllByRole('button', { name: /expand/i });
    await user.click(firstBtn);
    expect(screen.getAllByRole('button', { name: /collapse/i }).length).toBeGreaterThan(0);
  });

  it('clicking the same button again collapses the card (toggle)', async () => {
    await renderDashboard();
    const user = userEvent.setup();
    const [firstBtn] = screen.getAllByRole('button', { name: /expand/i });
    await user.click(firstBtn); // open
    await user.click(firstBtn); // close
    expect(firstBtn).toHaveAttribute('aria-expanded', 'false');
  });
});