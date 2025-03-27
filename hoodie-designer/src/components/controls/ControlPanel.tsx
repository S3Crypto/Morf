import React, { useState, useEffect } from 'react';
import './ControlPanel.css';

interface TransformData {
    position: [number, number, number];
    rotation: [number, number, number];
    scale: number;
}

interface ControlPanelProps {
    onTransformChange: (transform: TransformData) => void;
    onWireframeToggle: (enabled: boolean) => void;
    onModeChange?: (mode: string) => void;
    initialTransform?: TransformData;
    initialWireframe?: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
    onTransformChange,
    onWireframeToggle,
    onModeChange,
    initialTransform,
    initialWireframe = false
}) => {
    // Default values
    const defaultPosition: [number, number, number] = [0, 0, 0];
    const defaultRotation: [number, number, number] = [0, 0, 0];
    const defaultScale = 1;

    // State
    const [position, setPosition] = useState<[number, number, number]>(
        initialTransform?.position || defaultPosition
    );
    const [rotation, setRotation] = useState<[number, number, number]>(
        initialTransform?.rotation || defaultRotation
    );
    const [scale, setScale] = useState<number>(
        initialTransform?.scale || defaultScale
    );
    const [wireframe, setWireframe] = useState<boolean>(initialWireframe);
    const [mode, setMode] = useState<string>('translate');

    // Convert radians to degrees for UI
    const radToDeg = (rad: number) => Math.round(rad * (180 / Math.PI));
    const degToRad = (deg: number) => deg * (Math.PI / 180);

    const rotationDegrees: [number, number, number] = [
        radToDeg(rotation[0]),
        radToDeg(rotation[1]),
        radToDeg(rotation[2])
    ];

    // Handle changes
    const handlePositionChange = (axis: 'x' | 'y' | 'z', value: number) => {
        const newPosition = [...position] as [number, number, number];
        const index = axis === 'x' ? 0 : axis === 'y' ? 1 : 2;
        newPosition[index] = value;
        setPosition(newPosition);
        onTransformChange({ position: newPosition, rotation, scale });
    };

    const handleRotationChange = (axis: 'x' | 'y' | 'z', degrees: number) => {
        const newRotation = [...rotation] as [number, number, number];
        const index = axis === 'x' ? 0 : axis === 'y' ? 1 : 2;
        newRotation[index] = degToRad(degrees);
        setRotation(newRotation);
        onTransformChange({ position, rotation: newRotation, scale });
    };

    const handleScaleChange = (value: number) => {
        setScale(value);
        onTransformChange({ position, rotation, scale: value });
    };

    const handleWireframeToggle = (checked: boolean) => {
        setWireframe(checked);
        onWireframeToggle(checked);
    };

    const handleModeChange = (newMode: string) => {
        setMode(newMode);
        if (onModeChange) {
            onModeChange(newMode);
        }
    };

    // Apply initial values when they change
    useEffect(() => {
        if (initialTransform) {
            setPosition(initialTransform.position);
            setRotation(initialTransform.rotation);
            setScale(initialTransform.scale);
        }
    }, [initialTransform]);

    useEffect(() => {
        setWireframe(initialWireframe);
    }, [initialWireframe]);

    return (
        <div className="control-panel">
            <div className="control-section">
                <h3>Transform Controls</h3>
                
                <div className="control-group">
                    <h4>Rotation</h4>
                    <div className="control-row">
                        <div className="control-item">
                            <label htmlFor="rotate-x">X:</label>
                            <input
                                id="rotate-x"
                                type="number"
                                min="-180"
                                max="180"
                                value={rotationDegrees[0]}
                                onChange={(e) => handleRotationChange('x', parseInt(e.target.value))}
                                aria-label="Rotate X"
                            />
                        </div>
                        <div className="control-item">
                            <label htmlFor="rotate-y">Y:</label>
                            <input
                                id="rotate-y"
                                type="number"
                                min="-180"
                                max="180"
                                value={rotationDegrees[1]}
                                onChange={(e) => handleRotationChange('y', parseInt(e.target.value))}
                                aria-label="Rotate Y"
                            />
                        </div>
                        <div className="control-item">
                            <label htmlFor="rotate-z">Z:</label>
                            <input
                                id="rotate-z"
                                type="number"
                                min="-180"
                                max="180"
                                value={rotationDegrees[2]}
                                onChange={(e) => handleRotationChange('z', parseInt(e.target.value))}
                                aria-label="Rotate Z"
                            />
                        </div>
                    </div>
                </div>
                
                <div className="control-group">
                    <h4>Position</h4>
                    <div className="control-row">
                        <div className="control-item">
                            <label htmlFor="position-x">X:</label>
                            <input
                                id="position-x"
                                type="number"
                                step="0.1"
                                value={position[0]}
                                onChange={(e) => handlePositionChange('x', parseFloat(e.target.value))}
                                aria-label="Position X"
                            />
                        </div>
                        <div className="control-item">
                            <label htmlFor="position-y">Y:</label>
                            <input
                                id="position-y"
                                type="number"
                                step="0.1"
                                value={position[1]}
                                onChange={(e) => handlePositionChange('y', parseFloat(e.target.value))}
                                aria-label="Position Y"
                            />
                        </div>
                        <div className="control-item">
                            <label htmlFor="position-z">Z:</label>
                            <input
                                id="position-z"
                                type="number"
                                step="0.1"
                                value={position[2]}
                                onChange={(e) => handlePositionChange('z', parseFloat(e.target.value))}
                                aria-label="Position Z"
                            />
                        </div>
                    </div>
                </div>
                
                <div className="control-group">
                    <h4>Scale</h4>
                    <div className="control-row">
                        <div className="control-item">
                            <label htmlFor="scale-uniform">Uniform:</label>
                            <input
                                id="scale-uniform"
                                type="number"
                                min="0.1"
                                step="0.1"
                                value={scale}
                                onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
                                aria-label="Scale"
                            />
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="control-section">
                <h3>Display Options</h3>
                <div className="control-row">
                    <div className="control-item checkbox">
                        <input
                            id="wireframe-toggle"
                            type="checkbox"
                            checked={wireframe}
                            onChange={(e) => handleWireframeToggle(e.target.checked)}
                            aria-label="Wireframe"
                        />
                        <label htmlFor="wireframe-toggle">Wireframe</label>
                    </div>
                </div>
            </div>
            
            <div className="control-section">
                <h3>Transform Mode</h3>
                <div className="control-row">
                    <div className="control-item radio">
                        <input
                            id="mode-translate"
                            type="radio"
                            name="transform-mode"
                            value="translate"
                            checked={mode === 'translate'}
                            onChange={() => handleModeChange('translate')}
                        />
                        <label htmlFor="mode-translate">Translate</label>
                    </div>
                    <div className="control-item radio">
                        <input
                            id="mode-rotate"
                            type="radio"
                            name="transform-mode"
                            value="rotate"
                            checked={mode === 'rotate'}
                            onChange={() => handleModeChange('rotate')}
                        />
                        <label htmlFor="mode-rotate">Rotate</label>
                    </div>
                    <div className="control-item radio">
                        <input
                            id="mode-scale"
                            type="radio"
                            name="transform-mode"
                            value="scale"
                            checked={mode === 'scale'}
                            onChange={() => handleModeChange('scale')}
                        />
                        <label htmlFor="mode-scale">Scale</label>
                    </div>
                </div>
            </div>
        </div>
    );
};
