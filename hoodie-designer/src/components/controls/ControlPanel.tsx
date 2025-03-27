import React, { useState, useEffect } from 'react';
import { TransformOptions } from '../../types/Model';

enum ViewMode {
    STANDARD = 'standard',
    AR = 'ar'
}

interface ControlPanelProps {
    /**
     * Transform change handler
     */
    onTransformChange?: (transform: TransformOptions) => void;

    /**
     * Mode change handler
     */
    onModeChange?: (mode: ViewMode) => void;

    /**
     * Wireframe toggle handler
     */
    onWireframeToggle?: (enabled: boolean) => void;

    /**
     * Control panel placement
     */
    placement?: 'left' | 'right' | 'top' | 'bottom';

    /**
     * Whether the panel is expanded
     */
    expanded?: boolean;

    /**
     * Initial transform values
     */
    initialTransform?: TransformOptions;

    /**
     * Initial wireframe state
     */
    initialWireframe?: boolean;

    /**
     * Additional class names
     */
    className?: string;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
    onTransformChange,
    onModeChange,
    onWireframeToggle,
    placement = 'right',
    expanded = true,
    initialTransform,
    initialWireframe = false,
    className = '',
}) => {
    // Initialize with default or provided values
    const [position, setPosition] = useState<[number, number, number]>(
        initialTransform?.position || [0, 0, 0]
    );

    const [rotation, setRotation] = useState<[number, number, number]>(
        initialTransform?.rotation ?
            [
                // Convert from radians to degrees for UI
                initialTransform.rotation[0] * (180 / Math.PI),
                initialTransform.rotation[1] * (180 / Math.PI),
                initialTransform.rotation[2] * (180 / Math.PI)
            ] :
            [0, 0, 0]
    );

    const [scale, setScale] = useState<number>(
        typeof initialTransform?.scale === 'number' ?
            initialTransform.scale :
            (Array.isArray(initialTransform?.scale) ? initialTransform.scale[0] : 1)
    );

    const [wireframe, setWireframe] = useState<boolean>(initialWireframe);
    const [isPanelExpanded, setIsPanelExpanded] = useState<boolean>(expanded);
    const [activeControl, setActiveControl] = useState<string>('rotation');

    // Handle transform changes
    const handleTransformChange = () => {
        if (onTransformChange) {
            onTransformChange({
                position,
                // Convert from degrees to radians for Three.js
                rotation: [
                    rotation[0] * (Math.PI / 180),
                    rotation[1] * (Math.PI / 180),
                    rotation[2] * (Math.PI / 180)
                ],
                scale
            });
        }
    };

    // Effect to trigger transform change callback
    useEffect(() => {
        handleTransformChange();
    }, [position, rotation, scale]);

    // Handle position change
    const handlePositionChange = (axis: 'x' | 'y' | 'z', value: number) => {
        const newPosition = [...position] as [number, number, number];

        if (axis === 'x') newPosition[0] = value;
        if (axis === 'y') newPosition[1] = value;
        if (axis === 'z') newPosition[2] = value;

        setPosition(newPosition);
    };

    // Handle rotation change
    const handleRotationChange = (axis: 'x' | 'y' | 'z', value: number) => {
        const newRotation = [...rotation] as [number, number, number];

        if (axis === 'x') newRotation[0] = value;
        if (axis === 'y') newRotation[1] = value;
        if (axis === 'z') newRotation[2] = value;

        setRotation(newRotation);
    };

    // Handle scale change
    const handleScaleChange = (value: number) => {
        setScale(value);
    };

    // Handle wireframe toggle
    const handleWireframeToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = event.target.checked;
        setWireframe(isChecked);

        if (onWireframeToggle) {
            onWireframeToggle(isChecked);
        }
    };

    // Handle mode change
    const handleModeChange = (mode: ViewMode) => {
        if (onModeChange) {
            onModeChange(mode);
        }
    };

    // Handle panel toggle
    const togglePanel = () => {
        setIsPanelExpanded(!isPanelExpanded);
    };

    return (
        <div
            className={`control-panel control-panel-${placement} ${isPanelExpanded ? 'expanded' : 'collapsed'} ${className}`}
            style={{
                position: 'absolute',
                top: placement === 'top' ? '0' : placement === 'bottom' ? 'auto' : '10px',
                right: placement === 'right' ? '0' : 'auto',
                bottom: placement === 'bottom' ? '0' : 'auto',
                left: placement === 'left' ? '0' : 'auto',
                width: (placement === 'left' || placement === 'right') && isPanelExpanded ? '250px' : 'auto',
                height: (placement === 'top' || placement === 'bottom') && isPanelExpanded ? 'auto' : 'auto',
                backgroundColor: '#f0f0f0',
                padding: '10px',
                borderRadius: '5px',
                boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
                zIndex: 10,
                transition: 'all 0.3s ease'
            }}
        >
            <div className="panel-header">
                <h3>3D Controls</h3>
                <button onClick={togglePanel}>
                    {isPanelExpanded ? 'Collapse' : 'Expand'}
                </button>
            </div>

            {isPanelExpanded && (
                <div className="panel-content">
                    <div className="control-tabs">
                        <button
                            className={activeControl === 'rotation' ? 'active' : ''}
                            onClick={() => setActiveControl('rotation')}
                        >
                            Rotation
                        </button>
                        <button
                            className={activeControl === 'position' ? 'active' : ''}
                            onClick={() => setActiveControl('position')}
                        >
                            Position
                        </button>
                        <button
                            className={activeControl === 'scale' ? 'active' : ''}
                            onClick={() => setActiveControl('scale')}
                        >
                            Scale
                        </button>
                    </div>

                    {activeControl === 'rotation' && (
                        <div className="rotation-controls">
                            <div className="control-group">
                                <label htmlFor="rotateX">Rotate X:</label>
                                <input
                                    id="rotateX"
                                    type="range"
                                    min="-180"
                                    max="180"
                                    value={rotation[0]}
                                    onChange={(e) => handleRotationChange('x', parseFloat(e.target.value))}
                                />
                                <input
                                    type="number"
                                    value={rotation[0]}
                                    onChange={(e) => handleRotationChange('x', parseFloat(e.target.value))}
                                    min="-180"
                                    max="180"
                                    aria-label="Rotate X"
                                />
                            </div>

                            <div className="control-group">
                                <label htmlFor="rotateY">Rotate Y:</label>
                                <input
                                    id="rotateY"
                                    type="range"
                                    min="-180"
                                    max="180"
                                    value={rotation[1]}
                                    onChange={(e) => handleRotationChange('y', parseFloat(e.target.value))}
                                />
                                <input
                                    type="number"
                                    value={rotation[1]}
                                    onChange={(e) => handleRotationChange('y', parseFloat(e.target.value))}
                                    min="-180"
                                    max="180"
                                    aria-label="Rotate Y"
                                />
                            </div>

                            <div className="control-group">
                                <label htmlFor="rotateZ">Rotate Z:</label>
                                <input
                                    id="rotateZ"
                                    type="range"
                                    min="-180"
                                    max="180"
                                    value={rotation[2]}
                                    onChange={(e) => handleRotationChange('z', parseFloat(e.target.value))}
                                />
                                <input
                                    type="number"
                                    value={rotation[2]}
                                    onChange={(e) => handleRotationChange('z', parseFloat(e.target.value))}
                                    min="-180"
                                    max="180"
                                    aria-label="Rotate Z"
                                />
                            </div>
                        </div>
                    )}

                    {activeControl === 'position' && (
                        <div className="position-controls">
                            <div className="control-group">
                                <label htmlFor="positionX">Position X:</label>
                                <input
                                    id="positionX"
                                    type="range"
                                    min="-50"
                                    max="50"
                                    value={position[0]}
                                    onChange={(e) => handlePositionChange('x', parseFloat(e.target.value))}
                                />
                                <input
                                    type="number"
                                    value={position[0]}
                                    onChange={(e) => handlePositionChange('x', parseFloat(e.target.value))}
                                    min="-50"
                                    max="50"
                                    aria-label="Position X"
                                />
                            </div>

                            <div className="control-group">
                                <label htmlFor="positionY">Position Y:</label>
                                <input
                                    id="positionY"
                                    type="range"
                                    min="-50"
                                    max="50"
                                    value={position[1]}
                                    onChange={(e) => handlePositionChange('y', parseFloat(e.target.value))}
                                />
                                <input
                                    type="number"
                                    value={position[1]}
                                    onChange={(e) => handlePositionChange('y', parseFloat(e.target.value))}
                                    min="-50"
                                    max="50"
                                    aria-label="Position Y"
                                />
                            </div>

                            <div className="control-group">
                                <label htmlFor="positionZ">Position Z:</label>
                                <input
                                    id="positionZ"
                                    type="range"
                                    min="-50"
                                    max="50"
                                    value={position[2]}
                                    onChange={(e) => handlePositionChange('z', parseFloat(e.target.value))}
                                />
                                <input
                                    type="number"
                                    value={position[2]}
                                    onChange={(e) => handlePositionChange('z', parseFloat(e.target.value))}
                                    min="-50"
                                    max="50"
                                    aria-label="Position Z"
                                />
                            </div>
                        </div>
                    )}

                    {activeControl === 'scale' && (
                        <div className="scale-controls">
                            <div className="control-group">
                                <label htmlFor="scale">Scale:</label>
                                <input
                                    id="scale"
                                    type="range"
                                    min="0.1"
                                    max="3"
                                    step="0.1"
                                    value={scale}
                                    onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
                                />
                                <input
                                    type="number"
                                    value={scale}
                                    onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
                                    min="0.1"
                                    max="3"
                                    step="0.1"
                                    aria-label="Scale"
                                />
                            </div>
                        </div>
                    )}

                    <div className="display-options">
                        <div className="control-group">
                            <label htmlFor="wireframeToggle">
                                <input
                                    id="wireframeToggle"
                                    type="checkbox"
                                    checked={wireframe}
                                    onChange={handleWireframeToggle}
                                    aria-label="Wireframe"
                                />
                                Wireframe
                            </label>
                        </div>
                    </div>

                    <div className="mode-controls">
                        <button
                            className={`mode-button ${activeControl === 'standard' ? 'active' : ''}`}
                            onClick={() => handleModeChange(ViewMode.STANDARD)}
                        >
                            Standard Mode
                        </button>
                        <button
                            className={`mode-button ${activeControl === 'ar' ? 'active' : ''}`}
                            onClick={() => handleModeChange(ViewMode.AR)}
                            disabled={true} // AR mode will be enabled in Phase 2
                        >
                            AR Mode (Coming Soon)
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};