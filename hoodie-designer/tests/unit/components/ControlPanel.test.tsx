import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ControlPanel } from '../../../src/components/controls/ControlPanel';

describe('ControlPanel', () => {
    const mockTransformChange = jest.fn();
    const mockWireframeToggle = jest.fn();
    const mockModeChange = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders control panel with transform controls', () => {
        render(
            <ControlPanel
                onTransformChange={mockTransformChange}
                onWireframeToggle={mockWireframeToggle}
                onModeChange={mockModeChange}
            />
        );

        expect(screen.getByText(/rotation/i)).toBeInTheDocument();
        expect(screen.getByText(/position/i)).toBeInTheDocument();
        expect(screen.getByText(/scale/i)).toBeInTheDocument();
    });

    it('triggers transform change when rotation is adjusted', () => {
        render(
            <ControlPanel
                onTransformChange={mockTransformChange}
                onWireframeToggle={mockWireframeToggle}
                onModeChange={mockModeChange}
            />
        );

        const rotateYInput = screen.getByLabelText(/rotate y/i);
        fireEvent.change(rotateYInput, { target: { value: '45' } });

        expect(mockTransformChange).toHaveBeenCalledWith(
            expect.objectContaining({
                rotation: expect.arrayContaining([expect.any(Number), 45 * (Math.PI / 180), expect.any(Number)])
            })
        );
    });

    it('triggers transform change when position is adjusted', () => {
        render(
            <ControlPanel
                onTransformChange={mockTransformChange}
                onWireframeToggle={mockWireframeToggle}
                onModeChange={mockModeChange}
            />
        );

        const positionXInput = screen.getByLabelText(/position x/i);
        fireEvent.change(positionXInput, { target: { value: '10' } });

        expect(mockTransformChange).toHaveBeenCalledWith(
            expect.objectContaining({
                position: expect.arrayContaining([10, expect.any(Number), expect.any(Number)])
            })
        );
    });

    it('triggers transform change when scale is adjusted', () => {
        render(
            <ControlPanel
                onTransformChange={mockTransformChange}
                onWireframeToggle={mockWireframeToggle}
                onModeChange={mockModeChange}
            />
        );

        const scaleInput = screen.getByLabelText(/scale/i);
        fireEvent.change(scaleInput, { target: { value: '2' } });

        expect(mockTransformChange).toHaveBeenCalledWith(
            expect.objectContaining({
                scale: 2
            })
        );
    });

    it('triggers wireframe toggle when checkbox is clicked', () => {
        render(
            <ControlPanel
                onTransformChange={mockTransformChange}
                onWireframeToggle={mockWireframeToggle}
                onModeChange={mockModeChange}
            />
        );

        const wireframeCheckbox = screen.getByLabelText(/wireframe/i);
        fireEvent.click(wireframeCheckbox);

        expect(mockWireframeToggle).toHaveBeenCalledWith(true);
    });

    it('should respect initial values when provided', () => {
        const initialTransform = {
            position: [5, 10, 15],
            rotation: [30 * (Math.PI / 180), 45 * (Math.PI / 180), 60 * (Math.PI / 180)],
            scale: 1.5
        };

        render(
            <ControlPanel
                onTransformChange={mockTransformChange}
                onWireframeToggle={mockWireframeToggle}
                onModeChange={mockModeChange}
                initialTransform={initialTransform}
                initialWireframe={true}
            />
        );

        // We would check the input values here
        expect(screen.getByLabelText(/position x/i)).toHaveValue('5');
        expect(screen.getByLabelText(/position y/i)).toHaveValue('10');
        expect(screen.getByLabelText(/position z/i)).toHaveValue('15');

        // Convert radians to degrees for the UI
        expect(screen.getByLabelText(/rotate x/i)).toHaveValue('30');
        expect(screen.getByLabelText(/rotate y/i)).toHaveValue('45');
        expect(screen.getByLabelText(/rotate z/i)).toHaveValue('60');

        expect(screen.getByLabelText(/scale/i)).toHaveValue('1.5');
        expect(screen.getByLabelText(/wireframe/i)).toBeChecked();
    });
});