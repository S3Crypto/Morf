# 3D Hoodie Designer

A web-based 3D hoodie design tool that allows users to upload their 3D models or generate wireframe models directly in the browser. This project is currently in Phase 1, focusing on the foundation and core 3D functionality.

## Features (Phase 1)

- Create wireframe hoodie models using Three.js
- Upload custom 3D hoodie models in GLTF/GLB format
- Manipulate 3D models (rotate, scale, move)
- Toggle wireframe rendering mode
- Responsive design for various screen sizes

## Technology Stack

- **Frontend**: React, TypeScript, Vite
- **3D Rendering**: Three.js
- **Testing**: Jest, React Testing Library

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- Modern web browser (Chrome/Edge recommended)

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

The application will be available at `http://localhost:3000`.

## Development

### Project Structure

```
hoodie-designer/
├── src/
│   ├── components/       # React components
│   │   ├── model/        # 3D model components
│   │   ├── controls/     # UI controls
│   │   └── upload/       # File upload components
│   ├── services/         # Core business logic
│   │   ├── model/        # Model handling
│   │   └── file/         # File operations
│   ├── hooks/            # Custom React hooks
│   ├── stores/           # State management
│   ├── types/            # TypeScript types
│   ├── utils/            # Utility functions
│   ├── App.tsx           # Main application component
│   └── index.tsx         # Entry point
├── tests/                # Test suites
│   ├── unit/             # Unit tests
│   ├── integration/      # Integration tests
│   └── e2e/              # End-to-end tests
└── public/               # Static assets
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production version
- `npm run preview` - Preview production build
- `npm test` - Run tests
- `npm run lint` - Run linting

## Testing

This project follows Test-Driven Development (TDD) principles. Tests are organized into:

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test interactions between components
- **End-to-End Tests**: Test complete user flows

Run tests with:

```bash
npm test
```

## Roadmap

The project is divided into three phases:

1. **Phase 1 (Current)**: Foundation and Core 3D Functionality
   - Basic 3D rendering
   - Model manipulation
   - File upload/download

2. **Phase 2**: AR Integration
   - WebXR integration
   - Body tracking
   - AR visualization

3. **Phase 3**: UI Refinement and Testing
   - Improved user interface
   - Comprehensive testing
   - Cross-browser compatibility

## License

This project is licensed under the MIT License - see the LICENSE file for details.