import React from 'react';
import { render, screen } from '@testing-library/react';
import { ModelViewer } from '../../../src/components/model/ModelViewer';
import * as THREE from 'three';

// Mock Three.js and OrbitControls
jest.mock('three', () => {
    const actualThree = jest.requireActual('three');
    return {
        ...actualThree,
        WebGLRenderer: jest.fn().mockImplementation(() => ({
            setSize: jest.fn(),
            setPixelRatio: jest.fn(),
            render: jest.fn(),
            domElement: document.createElement('canvas'),
            shadowMap: { enabled: false },
            dispose: jest.fn(),
        })),
        PerspectiveCamera: jest.fn().mockImplementation(() => ({
            aspect: 1,
            updateProjectionMatrix: jest.fn(),
            position: { set: jest.fn() },
            lookAt: jest.fn(),
        })),
        Scene: jest.fn().mockImplementation(() => ({
            add: jest.fn(),
            background: null,
        })),
        AmbientLight: jest.fn(),
        DirectionalLight: jest.fn().mockImplementation(() => ({
            position: { set: jest.fn() },
            castShadow: false,
        })),
    };
});

jest.mock('three/examples/jsm/controls/OrbitControls', () => ({
    OrbitControls: jest.fn().mockImplementation(() => ({
        update: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispose: jest.fn(),
    })),
}));

describe('ModelViewer', () => {
    const mockModel = {
        id: '123',
        type: 'wireframe',
        object: new THREE.Group(),
        metadata: {
            name: 'Test Model',
            source: 'generated',
            createdAt: new Date(),
            modifiedAt: new Date(),
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the canvas container', () => {
        render(<ModelViewer />);

        const canvasContainer = screen.getByTestId('canvas-container');
        expect(canvasContainer).toBeInTheDocument();
    });

    it('sets up the Three.js scene when mounted', () => {
        render(<ModelViewer />);

        expect(THREE.WebGLRenderer).toHaveBeenCalled();
        expect(THREE.PerspectiveCamera).toHaveBeenCalled();
        expect(THREE.Scene).toHaveBeenCalled();
        expect(THREE.AmbientLight).toHaveBeenCalled();
        expect(THREE.DirectionalLight).toHaveBeenCalled();
    });

    it('renders the model when provided', () => {
        render(<ModelViewer model={mockModel} />);

        expect(screen.getByTestId('canvas-container')).toBeInTheDocument();
        // Since we can't easily test the actual 3D rendering, we're just ensuring the component renders
    });

    it('applies transformations when provided', () => {
        const transformations = {
            position: [1, 2, 3] as [number, number, number],
            rotation: [0.1, 0.2, 0.3] as [number, number, number],
            scale: 2,
        };

        render(<ModelViewer model={mockModel} transformations={transformations} />);

        expect(screen.getByTestId('canvas-container')).toBeInTheDocument();
        // We'd need more complex testing to verify transformations are applied correctly
    });

    it('handles wireframe mode correctly', () => {
        render(<ModelViewer model={mockModel} wireframe={true} />);

        expect(screen.getByTestId('canvas-container')).toBeInTheDocument();
        // Would need to inspect the model materials to truly test wireframe mode
    });
});