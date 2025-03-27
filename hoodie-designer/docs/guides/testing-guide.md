# Testing Guide

This project follows Test-Driven Development (TDD) principles to ensure high code quality and reliability. This guide outlines our testing approach, tools, and practices.

## Testing Philosophy

We adopt a comprehensive testing strategy with the following layers:

1. **Unit Tests**: Test individual functions and components in isolation
2. **Integration Tests**: Test interactions between multiple components
3. **End-to-End Tests**: Test complete user flows in a browser environment

## Test-Driven Development Workflow

1. Write a failing test that defines the expected behavior
2. Implement the minimum code required to pass the test
3. Refactor the code while ensuring tests continue to pass
4. Repeat for new features or bug fixes

## Testing Tools

- **Jest**: JavaScript testing framework for unit and integration tests
- **React Testing Library**: For testing React components
- **Cypress**: For end-to-end testing
- **Three.js Testing Utilities**: Custom utilities for testing 3D rendering
- **Mock Service Worker**: For mocking API requests

## Test Organization

Tests are organized in a directory structure that mirrors the source code:

- `/tests/unit/`: Unit tests for individual functions and components
- `/tests/integration/`: Integration tests for component interactions
- `/tests/e2e/`: End-to-end tests for user flows

## Testing 3D Components

Testing 3D components with Three.js requires special considerations:

1. Use snapshot testing for rendered output when appropriate
2. Create mock implementations of Three.js objects
3. Test transformation logic separately from rendering
4. Use helper functions to inspect the 3D scene graph

Example unit test for a 3D component:

```typescript
describe('ModelViewer', () => {
  it('should render a 3D scene with the provided model', () => {
    // Arrange
    const mockModel = createMockModel();
    
    // Act
    render(<ModelViewer model={mockModel} />);
    
    // Assert
    expect(screen.getByTestId('canvas-container')).toBeInTheDocument();
    expect(mockAddToSceneFn).toHaveBeenCalledWith(mockModel);
  });
});
```

## Testing AR Components

AR components are particularly challenging to test:

1. Create mock implementations of WebXR API
2. Use dependency injection to substitute real camera input with test fixtures
3. Test AR initialization and error handling logic
4. Use visual regression testing for AR overlay positioning

Example mock for WebXR testing:

```typescript
// Mock WebXR API
const mockXRSystem = {
  isSessionSupported: jest.fn().mockResolvedValue(true),
  requestSession: jest.fn().mockResolvedValue(mockXRSession)
};

// Inject mock into component
render(<ARViewer xrSystem={mockXRSystem} />);
```

## Test Coverage Goals

- Minimum 80% line coverage for core functionality
- 100% coverage for critical components (model transformation, AR integration)
- Focus on behavioral coverage, not just line coverage

## Running Tests

```bash
# Run all tests
npm test

# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run e2e tests
npm run test:e2e

# Run tests with coverage report
npm run test:coverage
```

## Continuous Integration

All tests are run automatically on pull requests and before merging to main. Pull requests cannot be merged if tests are failing.

## Test Fixtures

Test fixtures, including sample 3D models and camera inputs, are stored in `/tests/fixtures/`.

## Best Practices

1. Test behavior, not implementation details
2. Use descriptive test names that explain the expected behavior
3. Follow the Arrange-Act-Assert pattern
4. Keep tests independent and idempotent
5. Avoid test interdependencies
6. Mock external dependencies
7. Simulate user interactions for component tests
8. Test error states and edge cases

## Example Test Structure

```typescript
// Unit test for ModelService
describe('ModelService', () => {
  describe('loadModel', () => {
    it('should load a GLTF model from URL', async () => {
      // Arrange
      const url = 'models/test-hoodie.glb';
      const mockLoader = { load: jest.fn() };
      
      // Act
      const result = await modelService.loadModel(url);
      
      // Assert
      expect(result).toBeDefined();
      expect(mockLoader.load).toHaveBeenCalledWith(url, expect.any(Function));
    });
    
    it('should handle loading errors', async () => {
      // Test error handling
    });
  });
});
```