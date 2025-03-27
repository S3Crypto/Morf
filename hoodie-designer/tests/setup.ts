import '@testing-library/jest-dom';

// Mock requestAnimationFrame and cancelAnimationFrame
global.requestAnimationFrame = (callback) => setTimeout(callback, 0);
global.cancelAnimationFrame = (id) => clearTimeout(id);

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
};

// Mock window.URL.createObjectURL and revokeObjectURL
if (typeof window !== 'undefined') {
    window.URL.createObjectURL = jest.fn(() => 'mock-object-url');
    window.URL.revokeObjectURL = jest.fn();
}