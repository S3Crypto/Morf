# Test-Driven Development Plan

This document outlines the Test-Driven Development (TDD) approach for the 3D Hoodie Designer application. It provides guidelines, methodologies, and best practices for implementing TDD throughout the development process.

## Testing Philosophy

The 3D Hoodie Designer application follows a comprehensive test-driven development (TDD) approach. Our testing philosophy is guided by the following principles:

1. **Tests First**: Write tests before implementing features
2. **Red-Green-Refactor**: Follow the TDD cycle rigorously
3. **Comprehensive Coverage**: Test business logic, UI interactions, and edge cases
4. **Test Isolation**: Ensure tests are independent and deterministic
5. **Maintainable Tests**: Create readable, maintainable test code

## TDD Workflow

### 1. Write a Failing Test

- Start by writing a test that defines the expected behavior
- Ensure the test fails initially ("Red" phase)
- Focus on the interface, not the implementation
- Keep tests small and focused on a single behavior

### 2. Implement Minimum Code

- Write just enough code to make the test pass
- Do not implement features beyond what's needed for the test
- Focus on correctness rather than optimization
- Celebrate when the test passes ("Green" phase)

### 3. Refactor Code

- Improve code quality while keeping tests passing
- Eliminate duplication and improve design
- Follow clean code principles
- Run tests frequently during refactoring

### 4. Repeat

- Continue the cycle for each feature or behavior
- Build up functionality incrementally
- Maintain a comprehensive test suite

## Test Categories and Strategies

The 3D Hoodie Designer application requires different testing approaches for its various components. Here's how we'll address each type:

### Unit Tests

**Focus**: Individual functions, components, and classes in isolation

**Tools**: Jest, React Testing Library

**Strategy**:
- Test pure functions thoroughly with various inputs
- Mock external dependencies
- Focus on business logic and edge cases
- Aim for high code coverage

**Example TDD Cycle**:

```typescript
// 1. Write a failing test
test('should normalize model scale to fit within bounds', () => {
  // Arrange
  const oversizedModel = createMockModel({ scale: [10, 10, 10] });
  const boundingBox = new THREE.Box3(
    new THREE.Vector3(-1, -1, -1),
    new THREE.Vector3(1, 1, 1)
  );
  
  // Act
  const normalized = ModelService.normalizeModelScale(oversizedModel, boundingBox);
  
  // Assert
  expect(normalized.scale.x).toBeLessThanOrEqual(1);
  expect(normalized.scale.y).toBeLessThanOrEqual(1);
  expect(normalized.scale.z).toBeLessThanOrEqual(1);
  // Verify model integrity is maintained
  expect(normalized.children.length).toEqual(oversizedModel.children.length);
});

// 2. Implement minimum code to pass
function normalizeModelScale(model, boundingBox) {
  const modelBox = new THREE.Box3().setFromObject(model);
  const modelSize = new THREE.Vector3();
  modelBox.getSize(modelSize);
  
  const boxSize = new THREE.Vector3();
  boundingBox.getSize(boxSize);
  
  const scaleFactor = Math.min(
    boxSize.x / modelSize.x,
    boxSize.y / modelSize.y,
    boxSize.z / modelSize.z
  );
  
  if (scaleFactor < 1) {
    model.scale.multiplyScalar(scaleFactor);
  }
  
  return model;
}

// 3. Refactor
function normalizeModelScale(model, boundingBox) {
  const modelBox = new THREE.Box3().setFromObject(model);
  const modelSize = modelBox.getSize(new THREE.Vector3());
  const boxSize = boundingBox.getSize(new THREE.Vector3());
  
  const scaleFactor = Math.min(
    boxSize.x / modelSize.x,
    boxSize.y / modelSize.y,
    boxSize.z / modelSize.z,
    1 // Only scale down, never up
  );
  
  model.scale.multiplyScalar(scaleFactor);
  
  return model;
}
```

### Component Tests

**Focus**: React components and their interactions

**Tools**: React Testing Library, Jest

**Strategy**:
- Test component rendering and user interactions
- Focus on behavior, not implementation details
- Test accessibility and keyboard navigation
- Verify correct state updates and UI changes

**Example TDD Cycle**:

```typescript
// 1. Write a failing test
test('ModelControls should update rotation when sliders change', () => {
  // Arrange
  const handleChange = jest.fn();
  render(<ModelControls onTransformChange={handleChange} />);
  
  // Act
  const rotateYSlider = screen.getByLabelText(/rotate y/i);
  fireEvent.change(rotateYSlider, { target: { value: '45' } });
  
  // Assert
  expect(handleChange).toHaveBeenCalledWith(
    expect.objectContaining({
      rotation: expect.arrayContaining([0, 45, 0])
    })
  );
});

// 2. Implement minimum code to pass
function ModelControls({ onTransformChange }) {
  const [rotation, setRotation] = useState([0, 0, 0]);
  
  const handleRotateY = (event) => {
    const newRotation = [...rotation];
    newRotation[1] = parseInt(event.target.value, 10);
    setRotation(newRotation);
    onTransformChange({ rotation: newRotation });
  };
  
  return (
    <div>
      <label>
        Rotate Y
        <input
          type="range"
          min="0"
          max="360"
          value={rotation[1]}
          onChange={handleRotateY}
        />
      </label>
    </div>
  );
}

// 3. Refactor
function ModelControls({ onTransformChange }) {
  const [transform, setTransform] = useState({
    rotation: [0, 0, 0],
    position: [0, 0, 0],
    scale: 1
  });
  
  const handleTransformChange = (axis, index, value) => {
    const newTransform = {
      ...transform,
      [axis]: [...transform[axis]]
    };
    newTransform[axis][index] = value;
    setTransform(newTransform);
    onTransformChange(newTransform);
  };
  
  return (
    <div className="model-controls">
      <RotationControls
        rotation={transform.rotation}
        onChange={(index, value) => handleTransformChange('rotation', index, value)}
      />
      {/* Other controls */}
    </div>
  );
}
```

### Integration Tests

**Focus**: Interactions between multiple components and services

**Tools**: Jest, React Testing Library

**Strategy**:
- Test flows that span multiple components
- Verify state management works correctly across components
- Test context providers and consumers together
- Limit mocking to external services only

**Example Test**:

```typescript
test('uploading a model should display it in the viewer', async () => {
  // Arrange
  const mockFile = new File(['mock content'], 'model.glb', { type: 'model/gltf-binary' });
  const mockModel = createMockThreeJsModel();
  
  // Mock the service but let components interact normally
  jest.spyOn(ModelService, 'loadModelFromFile').mockResolvedValue(mockModel);
  
  render(
    <ModelProvider>
      <ModelUploader />
      <ModelViewer />
    </ModelProvider>
  );
  
  // Act
  const fileInput = screen.getByLabelText(/upload model/i);
  fireEvent.change(fileInput, { target: { files: [mockFile] } });
  
  // Assert
  // Wait for the model to be loaded and displayed
  await waitFor(() => {
    expect(screen.getByTestId('model-viewer-canvas')).toBeInTheDocument();
    expect(ModelService.loadModelFromFile).toHaveBeenCalledWith(mockFile);
    expect(screen.queryByText(/uploading/i)).not.toBeInTheDocument();
  });
});
```

### Three.js Component Tests

**Focus**: Components that interact with Three.js

**Tools**: Jest, React Testing Library, custom test utilities

**Strategy**:
- Create specialized mocks for Three.js objects
- Test scene composition and object properties
- Verify 3D transformations and rendering logic
- Focus on high-level behavior rather than pixels

**Example Test Utilities**:

```typescript
// Mock Three.js objects for testing
export function createMockRenderer() {
  return {
    setSize: jest.fn(),
    setPixelRatio: jest.fn(),
    render: jest.fn(),
    domElement: document.createElement('canvas'),
    dispose: jest.fn(),
    shadowMap: {
      enabled: false
    }
  };
}

export function createMockScene() {
  return {
    add: jest.fn(),
    remove: jest.fn(),
    children: [],
    traverse: jest.fn(callback => {
      // Mock traverse to call callback on the scene
      callback(mockScene);
    })
  };
}

// Helper to inspect Three.js scene
export function findObjectByName(scene, name) {
  let found = null;
  scene.traverse((object) => {
    if (object.name === name) {
      found = object;
    }
  });
  return found;
}
```

### WebXR and AR Tests

**Focus**: AR functionality and WebXR integration

**Tools**: Jest, custom WebXR mocks

**Strategy**:
- Create comprehensive WebXR mock implementation
- Test AR session lifecycle (init, update, end)
- Verify correct handling of tracking states
- Test body tracking with mock pose data

**Example WebXR Mocks**:

```typescript
// Mock WebXR API for testing
export function mockWebXR() {
  // Mock navigator.xr
  const mockXRSystem = {
    isSessionSupported: jest.fn().mockResolvedValue(true),
    requestSession: jest.fn().mockResolvedValue({
      updateRenderState: jest.fn(),
      requestReferenceSpace: jest.fn().mockResolvedValue({
        getOffsetReferenceSpace: jest.fn()
      }),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      end: jest.fn()
    })
  };
  
  // Attach to navigator
  Object.defineProperty(global.navigator, 'xr', {
    value: mockXRSystem,
    writable: true
  });
  
  return mockXRSystem;
}

// Example test with mock WebXR
test('ARService should initialize WebXR session when supported', async () => {
  // Arrange
  const mockXR = mockWebXR();
  const arService = new ARService();
  const mockRenderer = createMockRenderer();
  const mockScene = createMockScene();
  const mockCamera = createMockCamera();
  
  // Act
  const result = await arService.startSession(mockRenderer, mockScene, mockCamera);
  
  // Assert
  expect(result).toBe(true);
  expect(mockXR.isSessionSupported).toHaveBeenCalledWith('immersive-ar');
  expect(mockXR.requestSession).toHaveBeenCalledWith(
    'immersive-ar',
    expect.objectContaining({
      requiredFeatures: expect.arrayContaining(['hit-test'])
    })
  );
});
```

### End-to-End Tests

**Focus**: Complete user flows and application behavior

**Tools**: Cypress, Percy (for visual regression)

**Strategy**:
- Test critical user journeys end-to-end
- Verify application works as a whole
- Test real browser behavior and WebGL rendering
- Include visual regression tests for UI

**Example Cypress Test**:

```typescript
describe('Model Upload Flow', () => {
  beforeEach(() => {
    cy.visit('/');
    // Intercept and mock file upload API if needed
    cy.intercept('POST', '/api/upload', {
      statusCode: 200,
      body: { url: '/models/test-hoodie.glb' }
    }).as('uploadModel');
  });
  
  it('should allow uploading a 3D model and manipulating it', () => {
    // Prepare test file
    cy.fixture('test-hoodie.glb', 'base64').then(fileContent => {
      // Convert to blob for upload
      const blob = Cypress.Blob.base64StringToBlob(fileContent, 'model/gltf-binary');
      const file = new File([blob], 'test-hoodie.glb', { type: 'model/gltf-binary' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      
      // Upload model
      cy.get('[data-cy=upload-dropzone]').selectFile(file, { force: true });
      
      // Verify model is loaded
      cy.get('[data-cy=model-viewer]').should('be.visible');
      cy.get('[data-cy=loading-indicator]').should('not.exist');
      
      // Test model manipulation
      cy.get('[data-cy=rotate-y-slider]').invoke('val', 90).trigger('input');
      
      // Verify model rotated
      // For this we would need custom commands that can interact with and verify Three.js state
      cy.get('[data-cy=model-viewer]').should('have.attr', 'data-rotation-y', '90');
    });
  });
});
```

## Testing Three.js and WebXR

### Three.js Testing Strategies

Testing Three.js components presents unique challenges due to the graphics-heavy nature and browser dependencies. We'll address these with specialized strategies:

#### Mock Three.js Objects

Create lightweight mocks for Three.js objects that focus on the API rather than rendering:

```typescript
// src/tests/mocks/ThreeJsMocks.ts
export const mockVector3 = {
  set: jest.fn().mockReturnThis(),
  copy: jest.fn().mockReturnThis(),
  add: jest.fn().mockReturnThis(),
  sub: jest.fn().mockReturnThis(),
  multiplyScalar: jest.fn().mockReturnThis(),
  length: jest.fn().mockReturnValue(1),
  normalize: jest.fn().mockReturnThis()
};

export function createMockObject3D() {
  return {
    position: { ...mockVector3 },
    rotation: { 
      x: 0, y: 0, z: 0,
      set: jest.fn()
    },
    scale: { ...mockVector3 },
    quaternion: {
      setFromEuler: jest.fn(),
      slerp: jest.fn()
    },
    matrix: {
      compose: jest.fn(),
      decompose: jest.fn()
    },
    matrixWorld: {
      compose: jest.fn(),
      decompose: jest.fn()
    },
    children: [],
    parent: null,
    add: jest.fn(function(child) {
      this.children.push(child);
      child.parent = this;
      return this;
    }),
    remove: jest.fn(function(child) {
      const index = this.children.indexOf(child);
      if (index !== -1) {
        this.children.splice(index, 1);
        child.parent = null;
      }
      return this;
    }),
    traverse: jest.fn(function(callback) {
      callback(this);
      this.children.forEach(child => {
        if (child.traverse) {
          child.traverse(callback);
        }
      });
    }),
    updateMatrixWorld: jest.fn(),
    getWorldPosition: jest.fn().mockReturnValue({ ...mockVector3 }),
    clone: jest.fn(function() {
      return createMockObject3D();
    })
  };
}
```

#### Scene Graph Testing

Verify correct scene composition and hierarchy:

```typescript
test('createHoodieModel should create correct hierarchy', () => {
  // Act
  const hoodieModel = ModelService.createHoodieModel();
  
  // Assert
  expect(hoodieModel.children.length).toBeGreaterThan(0);
  
  // Verify body part exists
  const body = hoodieModel.children.find(child => child.name === 'body');
  expect(body).toBeDefined();
  
  // Verify sleeves exist
  const leftSleeve = hoodieModel.children.find(child => child.name === 'leftSleeve');
  const rightSleeve = hoodieModel.children.find(child => child.name === 'rightSleeve');
  expect(leftSleeve).toBeDefined();
  expect(rightSleeve).toBeDefined();
  
  // Verify hood exists
  const hood = hoodieModel.children.find(child => child.name === 'hood');
  expect(hood).toBeDefined();
});
```

#### Canvas Testing

Test canvas setup and rendering initialization:

```typescript
test('ModelViewer should initialize canvas correctly', () => {
  // Mock the DOM
  document.body.innerHTML = '<div id="container"></div>';
  const container = document.getElementById('container');
  
  // Mock requestAnimationFrame
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
    cb(0);
    return 0;
  });
  
  // Initialize viewer
  const viewer = new ModelViewer(container);
  viewer.initialize();
  
  // Assert
  expect(container.querySelector('canvas')).not.toBeNull();
  expect(viewer.renderer.setSize).toHaveBeenCalled();
  expect(viewer.scene.add).toHaveBeenCalledTimes(expect.any(Number)); // Lights added
  expect(window.requestAnimationFrame).toHaveBeenCalled();
  
  // Clean up
  viewer.dispose();
});
```

### WebXR Testing Strategies

Testing WebXR functionality requires specialized mocks since the API is only available in supported browsers and requires user activation:

#### Mock WebXR API

Create a comprehensive WebXR mock for testing:

```typescript
// src/tests/mocks/WebXRMock.ts
export class MockXRFrame {
  constructor(session, time = 0) {
    this.session = session;
    this.predictedDisplayTime = time;
  }
  
  getPose(space1, space2) {
    return {
      transform: {
        position: { x: 0, y: 0, z: -0.5 },
        orientation: { x: 0, y: 0, z: 0, w: 1 }
      }
    };
  }
  
  getViewerPose(referenceSpace) {
    return {
      transform: {
        position: { x: 0, y: 1.6, z: 0 },
        orientation: { x: 0, y: 0, z: 0, w: 1 }
      },
      views: [
        // Mock XRView for left eye
        {
          eye: 'left',
          projectionMatrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
          transform: {
            position: { x: -0.03, y: 1.6, z: 0 },
            orientation: { x: 0, y: 0, z: 0, w: 1 }
          }
        },
        // Mock XRView for right eye
        {
          eye: 'right',
          projectionMatrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
          transform: {
            position: { x: 0.03, y: 1.6, z: 0 },
            orientation: { x: 0, y: 0, z: 0, w: 1 }
          }
        }
      ]
    };
  }
}

export function setupWebXRMock() {
  const mockXRSession = {
    updateRenderState: jest.fn(),
    requestReferenceSpace: jest.fn().mockResolvedValue({
      getOffsetReferenceSpace: jest.fn(offset => ({})),
      onreset: null
    }),
    requestAnimationFrame: jest.fn(callback => {
      callback(performance.now(), new MockXRFrame(mockXRSession));
      return 1;
    }),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    end: jest.fn().mockResolvedValue(undefined)
  };
  
  const mockXR = {
    isSessionSupported: jest.fn().mockResolvedValue(true),
    requestSession: jest.fn().mockResolvedValue(mockXRSession)
  };
  
  // Attach to navigator
  Object.defineProperty(global.navigator, 'xr', {
    value: mockXR,
    writable: true
  });
  
  return { mockXR, mockXRSession };
}
```

#### Test AR Session Lifecycle

Verify AR session initialization and cleanup:

```typescript
test('ARService should manage XR session lifecycle', async () => {
  // Arrange
  const { mockXR, mockXRSession } = setupWebXRMock();
  const arService = new ARService();
  
  // Act - Start session
  const started = await arService.startSession();
  
  // Assert - Session started
  expect(started).toBe(true);
  expect(mockXR.requestSession).toHaveBeenCalledWith(
    'immersive-ar',
    expect.any(Object)
  );
  expect(mockXRSession.requestReferenceSpace).toHaveBeenCalledWith('local');
  
  // Act - End session
  await arService.endSession();
  
  // Assert - Session ended
  expect(mockXRSession.end).toHaveBeenCalled();
});
```

#### Test AR Pose Detection Integration

Test the integration between WebXR and body tracking:

```typescript
test('should position model correctly based on body tracking', async () => {
  // Arrange
  const { mockXRSession } = setupWebXRMock();
  const arService = new ARService();
  const bodyTrackingService = new BodyTrackingService();
  const model = createMockObject3D();
  
  // Mock body tracking result
  const mockBodyData = {
    shoulders: {
      left: { x: -0.2, y: 1.5, z: 0 },
      right: { x: 0.2, y: 1.5, z: 0 }
    },
    chest: { x: 0, y: 1.4, z: 0 },
    hips: { x: 0, y: 1.0, z: 0 },
    confidence: 0.95
  };
  
  jest.spyOn(bodyTrackingService, 'detectPose').mockResolvedValue(mockBodyData);
  
  // Initialize AR
  await arService.startSession();
  arService.setBodyTrackingService(bodyTrackingService);
  
  // Act
  await arService.updateBodyTracking();
  arService.placeModelOnBody(model);
  
  // Assert
  expect(model.position.set).toHaveBeenCalledWith(0, 1.4, 0);
  // Verify other transformations like scaling and rotation
});
```

## Testing Matrix: Component vs. Test Type

| Component/Feature          | Unit Tests | Component Tests | Integration Tests | E2E Tests |
|----------------------------|------------|----------------|-------------------|-----------|
| ModelService               | ✅          | -               | ✅                | -         |
| ARService                  | ✅          | -               | ✅                | ✅         |
| BodyTrackingService        | ✅          | -               | ✅                | -         |
| ModelViewer                | ✅          | ✅              | ✅                | ✅         |
| ARViewer                   | ✅          | ✅              | ✅                | ✅         |
| ControlPanel               | ✅          | ✅              | ✅                | ✅         |
| ModelUploader              | ✅          | ✅              | ✅                | ✅         |
| ModelContext               | ✅          | -               | ✅                | -         |
| ARContext                  | ✅          | -               | ✅                | -         |
| Wireframe Generation       | ✅          | ✅              | -                 | -         |
| Model Transformation       | ✅          | ✅              | ✅                | ✅         |
| File Upload                | ✅          | ✅              | ✅                | ✅         |
| AR Session Management      | ✅          | -               | ✅                | ✅         |
| Body Tracking              | ✅          | -               | ✅                | -         |
| Model-to-Body Mapping      | ✅          | -               | ✅                | -         |
| Accessibility              | -           | ✅              | -                 | ✅         |
| Performance                | -           | -               | -                 | ✅         |

## Test Coverage Goals

We aim for the following code coverage targets:

- **Unit Tests**: 90% coverage for utilities and service classes
- **Component Tests**: 85% coverage for UI components
- **Integration Tests**: Coverage of all critical user flows
- **E2E Tests**: Coverage of all main application features

More important than numeric coverage is ensuring that we test the right things. We prioritize:

1. Core business logic
2. Error handling and edge cases
3. User interactions and flows
4. Critical performance aspects

## Continuous Integration Testing

All tests will be integrated into our CI/CD pipeline:

1. **Pull Request Validation**:
   - Run unit tests and component tests
   - Run linting and type checking
   - Generate coverage report

2. **Merge to Development**:
   - Run all tests including integration tests
   - Run accessibility checks
   - Verify bundle size and performance metrics

3. **Release Candidate**:
   - Run complete test suite including E2E tests
   - Perform visual regression testing
   - Run cross-browser compatibility tests

## Testing Tools and Setup

### Core Testing Tools

- **Jest**: Primary test runner for unit and integration tests
- **React Testing Library**: Testing React components
- **Cypress**: End-to-end testing
- **Percy**: Visual regression testing
- **jest-axe**: Accessibility testing

### Test Configuration

#### Jest Configuration (jest.config.js)

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
  moduleNameMapper: {
    // Mock CSS modules
    '\\.css$': 'identity-obj-proxy',
    // Mock static assets
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/src/tests/mocks/fileMock.js',
    // Path aliases
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/tests/**/*',
    '!src/index.tsx',
    '!src/serviceWorker.ts'
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80
    }
  }
};
```

#### Cypress Configuration (cypress.config.js)

```javascript
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 800,
    setupNodeEvents(on, config) {
      // Implement node event listeners here
      on('task', {
        // Custom tasks for file operations, etc.
      });
    }
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite'
    }
  }
});
```

### Test Organization

```
/tests
  /unit                    # Unit tests
    /services              # Service tests
    /utils                 # Utility function tests
    /hooks                 # Custom hook tests
  /integration             # Integration tests
    /model                 # Model handling tests
    /ar                    # AR functionality tests
  /e2e                     # End-to-end tests
    /flows                 # User flow tests
  /mocks                   # Mock implementations
    ThreeJsMocks.ts        # Three.js mocks
    WebXRMock.ts           # WebXR API mocks
  /fixtures                # Test data
    models/                # Sample 3D models
    images/                # Sample images
  setup.ts                 # Jest setup file
  testUtils.ts             # Common test utilities
```

## Best Practices and Guidelines

### General Testing Guidelines

1. **Keep tests simple and focused**
   - Test one concept per test
   - Use descriptive test names that explain the expected behavior
   - Follow the Arrange-Act-Assert pattern

2. **Make tests deterministic**
   - Avoid relying on timing or external services
   - Mock external dependencies
   - Reset state between tests

3. **Test behavior, not implementation**
   - Focus on what the code does, not how it does it
   - Avoid testing private implementation details
   - Tests should survive refactoring

4. **Write maintainable tests**
   - DRY principle applies to test code too
   - Extract common setup to helper functions
   - Keep assertions clear and readable

### TDD Anti-patterns to Avoid

1. **Testing too much in one test**
   - Creates brittle tests that are hard to maintain
   - Makes failures hard to diagnose
   - Solution: Split into multiple focused tests

2. **Testing implementation details**
   - Creates tests coupled to implementation
   - Breaks when implementation changes
   - Solution: Test public API and observable behavior

3. **Excessive mocking**
   - Creates tests that don't verify real integration
   - Gives false confidence
   - Solution: Use real objects where possible, mock boundaries

4. **Insufficient testing of edge cases**
   - Misses bugs in error handling and boundary conditions
   - Solution: Explicitly test error paths and edge cases

## Appendix: Test Templates

### Unit Test Template

```typescript
import { functionUnderTest } from '../path/to/module';

describe('functionUnderTest', () => {
  // Setup common test variables
  let testInput;
  
  beforeEach(() => {
    // Initialize test data before each test
    testInput = { /* ... */ };
  });
  
  afterEach(() => {
    // Clean up after each test if needed
    jest.clearAllMocks();
  });
  
  it('should handle normal case correctly', () => {
    // Arrange
    const expected = { /* ... */ };
    
    // Act
    const result = functionUnderTest(testInput);
    
    // Assert
    expect(result).toEqual(expected);
  });
  
  it('should handle edge case correctly', () => {
    // Arrange
    const edgeInput = { /* ... */ };
    const expected = { /* ... */ };
    
    // Act
    const result = functionUnderTest(edgeInput);
    
    // Assert
    expect(result).toEqual(expected);
  });
  
  it('should throw error for invalid input', () => {
    // Arrange
    const invalidInput = null;
    
    // Act & Assert
    expect(() => {
      functionUnderTest(invalidInput);
    }).toThrow(/expected error message/i);
  });
});
```

### Component Test Template

```typescript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ComponentUnderTest from '../path/to/component';

describe('ComponentUnderTest', () => {
  // Setup common test variables
  const mockProps = {
    onAction: jest.fn()
  };
  
  beforeEach(() => {
    // Initialize before each test
  });
  
  afterEach(() => {
    // Clean up after each test
    jest.clearAllMocks();
  });
  
  it('should render correctly with default props', () => {
    // Arrange & Act
    render(<ComponentUnderTest {...mockProps} />);
    
    // Assert
    expect(screen.getByText(/expected text/i)).toBeInTheDocument();
    // More rendering assertions...
  });
  
  it('should handle user interaction correctly', () => {
    // Arrange
    render(<ComponentUnderTest {...mockProps} />);
    
    // Act
    fireEvent.click(screen.getByRole('button', { name: /action button/i }));
    
    // Assert
    expect(mockProps.onAction).toHaveBeenCalledTimes(1);
    expect(mockProps.onAction).toHaveBeenCalledWith(expect.any(Object));
  });
  
  it('should update UI when props change', () => {
    // Arrange
    const { rerender } = render(
      <ComponentUnderTest {...mockProps} value="initial" />
    );
    
    // Act
    rerender(
      <ComponentUnderTest {...mockProps} value="updated" />
    );
    
    // Assert
    expect(screen.getByText(/updated/i)).toBeInTheDocument();
  });
  
  it('should be accessible', () => {
    // Arrange & Act
    const { container } = render(<ComponentUnderTest {...mockProps} />);
    
    // Assert (using jest-axe in actual implementation)
    expect(container).toBeAccessible();
  });
});
```

### End-to-End Test Template

```typescript
// cypress/e2e/feature.cy.ts
describe('Feature name', () => {
  beforeEach(() => {
    // Common setup for all tests
    cy.visit('/');
    
    // Optional: mock API responses
    cy.intercept('GET', '/api/data', { fixture: 'testData.json' }).as('getData');
  });
  
  it('should complete the primary user flow', () => {
    // Arrange - additional setup if needed
    cy.get('[data-cy=feature-button]').should('be.visible');
    
    // Act - perform the user flow
    cy.get('[data-cy=feature-button]').click();
    cy.get('[data-cy=input-field]').type('test input');
    cy.get('[data-cy=submit-button]').click();
    
    // Wait for any async operations
    cy.wait('@getData');
    
    // Assert - verify the expected outcome
    cy.get('[data-cy=result-container]').should('contain', 'Success');
    cy.get('[data-cy=item-list]').should('have.length.at.least', 1);
    
    // Visual verification (with Percy in actual implementation)
    cy.percySnapshot('Feature completed state');
  });
  
  it('should handle error conditions gracefully', () => {
    // Arrange - setup error condition
    cy.intercept('GET', '/api/data', {
      statusCode: 500,
      body: { error: 'Server error' }
    }).as('getDataError');
    
    // Act
    cy.get('[data-cy=feature-button]').click();
    cy.wait('@getDataError');
    
    // Assert
    cy.get('[data-cy=error-message]').should('be.visible');
    cy.get('[data-cy=retry-button]').should('exist');
  });
});
```