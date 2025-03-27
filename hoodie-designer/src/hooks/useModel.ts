import { useState, useCallback } from 'react';
import { Model, WireframeOptions } from '../types/Model';
import { ModelService } from '../services/model/ModelService';

/**
 * Custom hook for managing 3D model operations
 */
export const useModel = () => {
    const [model, setModel] = useState<Model | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const modelService = new ModelService();

    /**
     * Load a model from URL
     */
    const loadModel = useCallback(async (url: string) => {
        try {
            setIsLoading(true);
            setError(null);

            const loadedModel = await modelService.loadModel(url);
            setModel(loadedModel);

            return loadedModel;
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Unknown error loading model');
            setError(error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [modelService]);

    /**
     * Create a wireframe model
     */
    const createWireframeModel = useCallback((options?: WireframeOptions) => {
        try {
            setIsLoading(true);
            setError(null);

            const wireframeModel = modelService.createWireframeModel(options);
            setModel(wireframeModel);

            return wireframeModel;
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Unknown error creating wireframe model');
            setError(error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [modelService]);

    /**
     * Clear the current model
     */
    const clearModel = useCallback(() => {
        setModel(null);
        setError(null);
    }, []);

    /**
     * Set model wireframe mode
     */
    const setWireframe = useCallback((enabled: boolean) => {
        if (!model) return;

        try {
            modelService.setWireframe(model.object, enabled);
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Unknown error setting wireframe mode');
            setError(error);
        }
    }, [model, modelService]);

    return {
        model,
        isLoading,
        error,
        loadModel,
        createWireframeModel,
        clearModel,
        setWireframe
    };
};