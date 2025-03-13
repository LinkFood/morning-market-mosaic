
import '@testing-library/jest-dom';

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(() => true),
  })),
});

// Mock ResizeObserver
class ResizeObserverMock {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

window.ResizeObserver = ResizeObserverMock;

// Mock IntersectionObserver
class IntersectionObserverMock implements IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '0px';
  readonly thresholds: ReadonlyArray<number> = [0];
  
  constructor(private readonly callback: IntersectionObserverCallback) {}
  
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
  takeRecords = jest.fn().mockReturnValue([]);
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: IntersectionObserverMock
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock charts library
jest.mock('recharts', () => {
  return {
    ResponsiveContainer: jest.fn(({ children }: { children: any }) => children),
    LineChart: jest.fn(({ children }: { children: any }) => ({ type: 'div', props: { 'data-testid': 'line-chart', children } })),
    Line: jest.fn(() => ({ type: 'div', props: { 'data-testid': 'chart-line' } })),
    XAxis: jest.fn(() => ({ type: 'div', props: { 'data-testid': 'x-axis' } })),
    YAxis: jest.fn(() => ({ type: 'div', props: { 'data-testid': 'y-axis' } })),
    CartesianGrid: jest.fn(() => ({ type: 'div', props: { 'data-testid': 'cartesian-grid' } })),
    Tooltip: jest.fn(() => ({ type: 'div', props: { 'data-testid': 'tooltip' } })),
    Legend: jest.fn(() => ({ type: 'div', props: { 'data-testid': 'legend' } })),
    ReferenceLine: jest.fn(() => ({ type: 'div', props: { 'data-testid': 'reference-line' } })),
    Area: jest.fn(() => ({ type: 'div', props: { 'data-testid': 'area' } })),
  };
});
