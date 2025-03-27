# Developer Guide

This guide provides information for developers working on the 3D Hoodie Designer project.

## Development Environment Setup

### Prerequisites

- Node.js (v18+)
- npm or yarn
- Git
- Modern web browser (Chrome/Edge recommended for WebXR development)
- Code editor (VS Code recommended with suggested extensions)

### Recommended VS Code Extensions

- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Three.js Snippets
- WebGL GLSL Editor

### Initial Setup

```bash
# Clone the repository
git clone [repository-url]
cd hoodie-designer

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Development Workflow

### Branch Strategy

- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: Individual feature branches
- `bugfix/*`: Bug fix branches

### Pull Request Process

1. Create a feature/bugfix branch from `develop`
2. Implement changes following TDD approach
3. Ensure all tests pass
4. Submit PR to `develop`
5. Address code review feedback
6. Merge after approval

### Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting, missing semicolons, etc
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `test`: Adding or updating tests
- `chore`: Updating build tasks, package manager configs, etc

## Key Development Areas

### 3D Model Handling

The application uses Three.js for 3D model rendering and manipulation. Key files:

- `/src/services/model/ModelService.ts`: Core model loading and management
- `/src/components/model/ModelViewer.tsx`: React component for 3D visualization
- `/src/hooks/useModel.ts`: Custom hook for model operations

### AR Integration

AR functionality is implemented using WebXR with fallback to AR.js:

- `/src/services/ar/ARService.ts`: Core AR functionality
- `/src/services/ar/BodyTrackingService.ts`: Body tracking implementation
- `/src/components/ar/ARViewer.tsx`: Main AR viewing component

### User Interface

The UI is built with React components:

- `/src/components/controls/`: UI controls for model manipulation
- `/src/components/shared/`: Reusable UI components

## Testing

We follow a Test-Driven Development (TDD) approach:

1. Write a failing test
2. Implement the minimal code to make it pass
3. Refactor while keeping tests passing

Run tests with:

```bash
# Run all tests
npm test

# Watch mode for development
npm test -- --watch

# Generate coverage report
npm test -- --coverage
```

See the [Testing Guide](../testing-guide.md) for more details.

## Performance Considerations

3D rendering and AR can be resource-intensive. Follow these guidelines:

- Use `useMemo` and `useCallback` for expensive computations
- Implement level-of-detail (LOD) for complex models
- Optimize textures and model complexity
- Monitor frame rate using built-in performance tools
- Test on various devices to ensure broad compatibility

## Debugging

### Three.js Debugging

- Use Three.js Inspector Chrome extension
- Add `scene.add(new THREE.AxesHelper(5))` for orientation debugging
- Check for memory leaks with Chrome's Performance tab

### WebXR Debugging

- Use Chrome's WebXR tab in Dev Tools
- Test on real devices frequently
- Use `navigator.xr.isSessionSupported()` to check capabilities

## Build and Deployment

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

The build output will be in the `dist/` directory, ready for deployment to any static file hosting service.