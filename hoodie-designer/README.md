# 3D Hoodie Designer with AR

A web-based 3D hoodie design tool that allows users to upload their 3D models or generate wireframe 3D models directly in the browser. The tool also enables AR visualization using the MacBook camera via WebAR.

## Features

- Create wireframe models of hoodies using Three.js
- Upload custom 3D hoodie models in GLTF/GLB format
- Visualize hoodies in AR using the MacBook camera
- Interact with 3D models (rotate, scale, move)
- Body tracking for AR fitting

## Technology Stack

- **Frontend**: React, TypeScript, Vite
- **3D Rendering**: Three.js
- **AR**: WebXR, AR.js (fallback)
- **Testing**: Jest, React Testing Library, Cypress

## Project Structure

The project follows a modular architecture with clear separation of concerns:

- `/src/components`: React components for UI elements
- `/src/services`: Core business logic and services
- `/src/hooks`: Custom React hooks for shared functionality
- `/src/utils`: Utility functions
- `/docs`: Documentation including architectural decisions
- `/tests`: Test suites organized by testing type

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- Modern web browser with WebXR support

### Installation

```bash
# Clone the repository
git clone [repository-url]
cd hoodie-designer

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Development

See the [Developer Guide](./docs/guides/developer-guide.md) for detailed information on development workflows and practices.

## Architecture

For detailed architecture information, see the [Architecture Overview](./docs/architecture-overview.md).

## Testing

This project follows Test-Driven Development (TDD) principles. See the [Testing Guide](./docs/guides/testing-guide.md) for more information.

## License

[MIT License](LICENSE)