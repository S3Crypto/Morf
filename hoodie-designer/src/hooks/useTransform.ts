import { useState, useCallback } from 'react';
import * as THREE from 'three';
import { TransformOptions } from '../types/Model';
import { ModelService } from '../services/model/ModelService';

/**
 * Custom hook for managing 3D transformations
 */
export const useTransform = (initialTransform?: TransformOptions) => {
    const [transform, setTransform] = useState<TransformOptions>(
        initialTransform || {
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            scale: 1
        }
    );

    const modelService = new ModelService();

    /**
     * Apply transformation to a model
     */
    const applyTransform = useCallback((model: THREE.Group, newTransform: TransformOptions) => {
        modelService.applyTransform(model, newTransform);
        setTransform(newTransform);
    }, [modelService]);

    /**
     * Set position of the model
     */
    const setPosition = useCallback((model: THREE.Group, position: [number, number, number]) => {
        const newTransform = {
            ...transform,
            position
        };

        modelService.applyTransform(model, { position });
        setTransform(newTransform);

        return newTransform;
    }, [transform, modelService]);

    /**
     * Set rotation of the model
     */
    const setRotation = useCallback((model: THREE.Group, rotation: [number, number, number]) => {
        const newTransform = {
            ...transform,
            rotation
        };

        modelService.applyTransform(model, { rotation });
        setTransform(newTransform);

        return newTransform;
    }, [transform, modelService]);

    /**
     * Set scale of the model
     */
    const setScale = useCallback((model: THREE.Group, scale: number | [number, number, number]) => {
        const newTransform = {
            ...transform,
            scale
        };

        modelService.applyTransform(model, { scale });
        setTransform(newTransform);

        return newTransform;
    }, [transform, modelService]);

    /**
     * Reset transformation to default
     */
    const resetTransform = useCallback((model: THREE.Group) => {
        const defaultTransform: TransformOptions = {
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            scale: 1
        };

        modelService.applyTransform(model, defaultTransform);
        setTransform(defaultTransform);

        return defaultTransform;
    }, [modelService]);

    return {
        transform,
        applyTransform,
        setPosition,
        setRotation,
        setScale,
        resetTransform
    };
};