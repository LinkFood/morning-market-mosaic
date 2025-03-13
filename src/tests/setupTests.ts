
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(() => true),
  })),
});

// Mock ResizeObserver
class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

window.ResizeObserver = ResizeObserverMock;

// Mock IntersectionObserver
class IntersectionObserverMock {
  constructor(callback: any) {
    this.callback = callback;
  }
  callback: any;
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

window.IntersectionObserver = IntersectionObserverMock;

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock charts library
vi.mock('recharts', () => {
  return {
    ResponsiveContainer: vi.fn(({ children }: { children: any }) => children),
    LineChart: vi.fn(({ children }: { children: any }) => ({ type: 'div', props: { 'data-testid': 'line-chart', children } })),
    Line: vi.fn(() => ({ type: 'div', props: { 'data-testid': 'chart-line' } })),
    XAxis: vi.fn(() => ({ type: 'div', props: { 'data-testid': 'x-axis' } })),
    YAxis: vi.fn(() => ({ type: 'div', props: { 'data-testid': 'y-axis' } })),
    CartesianGrid: vi.fn(() => ({ type: 'div', props: { 'data-testid': 'cartesian-grid' } })),
    Tooltip: vi.fn(() => ({ type: 'div', props: { 'data-testid': 'tooltip' } })),
    Legend: vi.fn(() => ({ type: 'div', props: { 'data-testid': 'legend' } })),
    ReferenceLine: vi.fn(() => ({ type: 'div', props: { 'data-testid': 'reference-line' } })),
    Area: vi.fn(() => ({ type: 'div', props: { 'data-testid': 'area' } })),
  };
});
