
/**
 * Jest setup file
 * This file runs before each test file
 */

// Mock matchMedia
window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {},
    addEventListener: function() {},
    removeEventListener: function() {},
    dispatchEvent: function() {
      return true;
    },
  };
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock Intersection Observer
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};
