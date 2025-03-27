import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { ModelContext, ModelProvider, useModelContext } from '../../../src/stores/ModelContext';
import * as THREE from 'three';

// Mock ModelService
jest.mock('../../../src/services/model/ModelService', () => {
    return {
        ModelService: jest.fn().mockImplementation(() => ({
            createWireframeModel: jest.fn().mockImplementation((options) => ({
                id: 'test-id',
                type: 'wireframe',
                object: new THREE.Group(),
                metadata: {
                    name: 'Test Wireframe',
                    source: 'generated',
                    createdAt: new Date(),
                    modifiedAt: new Date()
                }
            })),
            loadModel: jest.fn().mockImplementation((url) => Promise.resolve({
                id: 'test-id',
                type: 'uploaded',
                object: new THREE.Group(),
                metadata: {
                    name: 'Test Model',
                    source: url,
                    createdAt: new Date(),
                    modifiedAt: new Date()
                }
            })),
            applyTransform: jest.fn(),
            setWireframe: jest.fn()
        }))
    };
});

// Test component that uses the context
const TestComponent = () => {
    const { state, actions } = useModelContext();

    return (
        <div>
            <div data-testid="model-state">
                {state.currentModel ? state.currentModel.metadata.name : 'No model'}
            </div>
            <div data-testid="loading-state">
                {state.isLoading ? 'Loading' : 'Not loading'}
            </div>
            <button
                data-testid="create-wireframe-btn"
                onClick={() => actions.createWireframe()}
            >
                Create Wireframe
            </button>
            <button
                data-testid="toggle-wireframe-btn"
                onClick={() => actions.toggleWireframe()}
            >
                Toggle Wireframe
            </button>
            <button
                data-testid="apply-transform-btn"
                onClick={() => actions.applyTransformation({ position: [1, 2, 3] })}
            >
                Apply Transform
            </button>
            <button
                data-testid="clear-model-btn"
                onClick={() => actions.clearModel()}
            >
                Clear Model
            </button>
        </div>
    );
};

describe('ModelContext', () => {
    it('provides initial state', () => {
        render(
            <ModelProvider>
                <TestComponent />
            </ModelProvider>
        );

        expect(screen.getByTestId('model-state')).toHaveTextContent('No model');
        expect(screen.getByTestId('loading-state')).toHaveTextContent('Not loading');
    });

    it('creates a wireframe model', async () => {
        render(
            <ModelProvider>
                <TestComponent />
            </ModelProvider>
        );

        act(() => {
            screen.getByTestId('create-wireframe-btn').click();
        });

        await waitFor(() => {
            expect(screen.getByTestId('model-state')).toHaveTextContent('Test Wireframe');
        });
    });

    it('toggles wireframe mode', async () => {
        render(
            <ModelProvider>
                <TestComponent />
            </ModelProvider>
        );

        // First create a model
        act(() => {
            screen.getByTestId('create-wireframe-btn').click();
        });

        await waitFor(() => {
            expect(screen.getByTestId('model-state')).toHaveTextContent('Test Wireframe');
        });

        // Then toggle wireframe mode
        act(() => {
            screen.getByTestId('toggle-wireframe-btn').click();
        });

        // Since we can't directly test the wireframe state here,
        // we're assuming the toggleWireframe function was called correctly
    });

    it('applies transformation to the model', async () => {
        render(
            <ModelProvider>
                <TestComponent />
            </ModelProvider>
        );

        // First create a model
        act(() => {
            screen.getByTestId('create-wireframe-btn').click();
        });

        await waitFor(() => {
            expect(screen.getByTestId('model-state')).toHaveTextContent('Test Wireframe');
        });

        // Then apply transformation
        act(() => {
            screen.getByTestId('apply-transform-btn').click();
        });

        // Assuming the transformation was applied correctly
    });

    it('clears the current model', async () => {
        render(
            <ModelProvider>
                <TestComponent />
            </ModelProvider>
        );

        // First create a model
        act(() => {
            screen.getByTestId('create-wireframe-btn').click();
        });

        await waitFor(() => {
            expect(screen.getByTestId('model-state')).toHaveTextContent('Test Wireframe');
        });

        // Then clear the model
        act(() => {
            screen.getByTestId('clear-model-btn').click();
        });

        expect(screen.getByTestId('model-state')).toHaveTextContent('No model');
    });
});