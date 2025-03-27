import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Model, TransformOptions, WireframeOptions, ModelHistoryEntry } from '../types/Model';
import { ModelService } from '../services/model/ModelService';

interface ModelState {
    /**
     * Current active model
     */
    currentModel: Model | null;

    /**
     * Model loading state
     */
    isLoading: boolean;

    /**
     * Error state
     */
    error: Error | null;

    /**
     * Current transformations
     */
    transformations: TransformOptions;

    /**
     * Wireframe rendering state
     */
    isWireframe: boolean;

    /**
     * Transformation history
     */
    history: ModelHistoryEntry[];
}

interface ModelContextActions {
    /**
     * Load a model from URL
     */
    loadModel(url: string): Promise<void>;

    /**
     * Create a wireframe model
     */
    createWireframe(options?: WireframeOptions): void;

    /**
     * Apply transformation to the current model
     */
    applyTransformation(transform: Partial<TransformOptions>): void;

    /**
     * Toggle wireframe rendering mode
     */
    toggleWireframe(enabled?: boolean): void;

    /**
     * Undo last transformation
     */
    undoTransformation(): void;

    /**
     * Reset model to default state
     */
    resetModel(): void;

    /**
     * Clear current model
     */
    clearModel(): void;
}

interface ModelContextType {
    state: ModelState;
    actions: ModelContextActions;
}

// Initial state
const initialState: ModelState = {
    currentModel: null,
    isLoading: false,
    error: null,
    transformations: {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: 1
    },
    isWireframe: false,
    history: []
};

// Action types
enum ActionType {
    SET_LOADING = 'SET_LOADING',
    SET_ERROR = 'SET_ERROR',
    SET_MODEL = 'SET_MODEL',
    CLEAR_MODEL = 'CLEAR_MODEL',
    SET_TRANSFORMATIONS = 'SET_TRANSFORMATIONS',
    SET_WIREFRAME = 'SET_WIREFRAME',
    ADD_HISTORY = 'ADD_HISTORY',
    UNDO_TRANSFORMATION = 'UNDO_TRANSFORMATION',
    RESET_MODEL = 'RESET_MODEL'
}

// Action interfaces
interface SetLoadingAction {
    type: ActionType.SET_LOADING;
    payload: boolean;
}

interface SetErrorAction {
    type: ActionType.SET_ERROR;
    payload: Error | null;
}

interface SetModelAction {
    type: ActionType.SET_MODEL;
    payload: Model;
}

interface ClearModelAction {
    type: ActionType.CLEAR_MODEL;
}

interface SetTransformationsAction {
    type: ActionType.SET_TRANSFORMATIONS;
    payload: TransformOptions;
}

interface SetWireframeAction {
    type: ActionType.SET_WIREFRAME;
    payload: boolean;
}

interface AddHistoryAction {
    type: ActionType.ADD_HISTORY;
    payload: ModelHistoryEntry;
}

interface UndoTransformationAction {
    type: ActionType.UNDO_TRANSFORMATION;
}

interface ResetModelAction {
    type: ActionType.RESET_MODEL;
}

type ModelAction =
    | SetLoadingAction
    | SetErrorAction
    | SetModelAction
    | ClearModelAction
    | SetTransformationsAction
    | SetWireframeAction
    | AddHistoryAction
    | UndoTransformationAction
    | ResetModelAction;

// Create context
const ModelContext = createContext<ModelContextType | undefined>(undefined);

// Reducer function
const modelReducer = (state: ModelState, action: ModelAction): ModelState => {
    switch (action.type) {
        case ActionType.SET_LOADING:
            return {
                ...state,
                isLoading: action.payload
            };
        case ActionType.SET_ERROR:
            return {
                ...state,
                error: action.payload,
                isLoading: false
            };
        case ActionType.SET_MODEL:
            return {
                ...state,
                currentModel: action.payload,
                isLoading: false,
                error: null
            };
        case ActionType.CLEAR_MODEL:
            return {
                ...state,
                currentModel: null,
                error: null
            };
        case ActionType.SET_TRANSFORMATIONS:
            return {
                ...state,
                transformations: action.payload
            };
        case ActionType.SET_WIREFRAME:
            return {
                ...state,
                isWireframe: action.payload
            };
        case ActionType.ADD_HISTORY:
            return {
                ...state,
                history: [...state.history, action.payload]
            };
        case ActionType.UNDO_TRANSFORMATION:
            if (state.history.length === 0) return state;

            const previousTransform = state.history[state.history.length - 1].transformations;
            const newHistory = state.history.slice(0, -1);

            return {
                ...state,
                transformations: previousTransform,
                history: newHistory
            };
        case ActionType.RESET_MODEL:
            return {
                ...state,
                transformations: {
                    position: [0, 0, 0],
                    rotation: [0, 0, 0],
                    scale: 1
                },
                history: []
            };
        default:
            return state;
    }
};

// Provider component
export const ModelProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(modelReducer, initialState);
    const modelService = new ModelService();

    // Action implementations
    const actions: ModelContextActions = {
        async loadModel(url: string) {
            try {
                dispatch({ type: ActionType.SET_LOADING, payload: true });

                const model = await modelService.loadModel(url);

                dispatch({ type: ActionType.SET_MODEL, payload: model });

                // Add current transform to history
                dispatch({
                    type: ActionType.ADD_HISTORY,
                    payload: {
                        transformations: { ...state.transformations },
                        timestamp: Date.now()
                    }
                });
            } catch (err) {
                const error = err instanceof Error ? err : new Error('Unknown error loading model');
                dispatch({ type: ActionType.SET_ERROR, payload: error });
            }
        },

        createWireframe(options) {
            try {
                dispatch({ type: ActionType.SET_LOADING, payload: true });

                const model = modelService.createWireframeModel(options);

                dispatch({ type: ActionType.SET_MODEL, payload: model });
                dispatch({ type: ActionType.SET_WIREFRAME, payload: true });

                // Reset transformations and history
                dispatch({
                    type: ActionType.SET_TRANSFORMATIONS,
                    payload: {
                        position: [0, 0, 0],
                        rotation: [0, 0, 0],
                        scale: 1
                    }
                });

                // Add initial transform to history
                dispatch({
                    type: ActionType.ADD_HISTORY,
                    payload: {
                        transformations: {
                            position: [0, 0, 0],
                            rotation: [0, 0, 0],
                            scale: 1
                        },
                        timestamp: Date.now()
                    }
                });
            } catch (err) {
                const error = err instanceof Error ? err : new Error('Unknown error creating wireframe');
                dispatch({ type: ActionType.SET_ERROR, payload: error });
            }
        },

        applyTransformation(transform) {
            if (!state.currentModel) return;

            try {
                // Create new transformation by merging current with new
                const newTransform: TransformOptions = {
                    ...state.transformations
                };

                if (transform.position) {
                    newTransform.position = transform.position;
                }

                if (transform.rotation) {
                    newTransform.rotation = transform.rotation;
                }

                if (transform.scale !== undefined) {
                    newTransform.scale = transform.scale;
                }

                // Apply to current model
                modelService.applyTransform(state.currentModel.object, newTransform);

                // Update state
                dispatch({ type: ActionType.SET_TRANSFORMATIONS, payload: newTransform });

                // Add to history
                dispatch({
                    type: ActionType.ADD_HISTORY,
                    payload: {
                        transformations: { ...newTransform },
                        timestamp: Date.now()
                    }
                });
            } catch (err) {
                const error = err instanceof Error ? err : new Error('Unknown error applying transformation');
                dispatch({ type: ActionType.SET_ERROR, payload: error });
            }
        },

        toggleWireframe(enabled) {
            if (!state.currentModel) return;

            try {
                // If enabled is provided, use it, otherwise toggle current state
                const newWireframeState = enabled !== undefined ? enabled : !state.isWireframe;

                modelService.setWireframe(state.currentModel.object, newWireframeState);

                dispatch({ type: ActionType.SET_WIREFRAME, payload: newWireframeState });
            } catch (err) {
                const error = err instanceof Error ? err : new Error('Unknown error toggling wireframe');
                dispatch({ type: ActionType.SET_ERROR, payload: error });
            }
        },

        undoTransformation() {
            if (!state.currentModel || state.history.length <= 1) return;

            try {
                dispatch({ type: ActionType.UNDO_TRANSFORMATION });

                // Apply previous transformation from history
                const previousTransform = state.history[state.history.length - 2].transformations;
                modelService.applyTransform(state.currentModel.object, previousTransform);
            } catch (err) {
                const error = err instanceof Error ? err : new Error('Unknown error undoing transformation');
                dispatch({ type: ActionType.SET_ERROR, payload: error });
            }
        },

        resetModel() {
            if (!state.currentModel) return;

            try {
                const defaultTransform: TransformOptions = {
                    position: [0, 0, 0],
                    rotation: [0, 0, 0],
                    scale: 1
                };

                modelService.applyTransform(state.currentModel.object, defaultTransform);

                dispatch({ type: ActionType.RESET_MODEL });
                dispatch({ type: ActionType.SET_TRANSFORMATIONS, payload: defaultTransform });

                // Add reset transform to history
                dispatch({
                    type: ActionType.ADD_HISTORY,
                    payload: {
                        transformations: { ...defaultTransform },
                        timestamp: Date.now()
                    }
                });
            } catch (err) {
                const error = err instanceof Error ? err : new Error('Unknown error resetting model');
                dispatch({ type: ActionType.SET_ERROR, payload: error });
            }
        },

        clearModel() {
            dispatch({ type: ActionType.CLEAR_MODEL });
            dispatch({ type: ActionType.RESET_MODEL });
        }
    };

    return (
        <ModelContext.Provider value={{ state, actions }}>
            {children}
        </ModelContext.Provider>
    );
};

// Custom hook for using the context
export const useModelContext = (): ModelContextType => {
    const context = useContext(ModelContext);

    if (context === undefined) {
        throw new Error('useModelContext must be used within a ModelProvider');
    }

    return context;
};

export { ModelContext };