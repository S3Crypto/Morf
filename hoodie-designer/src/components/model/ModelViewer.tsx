import React from 'react';
import { ModelViewer as ModelViewerService } from '../../services/model/ModelViewer';
import { Model, TransformOptions } from '../../types/Model';

interface ModelViewerProps {
    /**
     * 3D model to display
     */
    model?: Model;

    /**
     * Whether to display model in wireframe mode
     */
    wireframe?: boolean;

    /**
     * Model transformation parameters
     */
    transformations?: TransformOptions;

    /**
     * Event callbacks
     */
    onLoadComplete?: () => void;
    onLoadError?: (error: Error) => void;

    /**
     * Additional class names
     */
    className?: string;
}

/**
 * Component for displaying 3D models
 */
export const ModelViewer: React.FC<ModelViewerProps> = (props) => {
    return <ModelViewerService {...props} />;
};
