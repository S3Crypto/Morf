import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Model, TransformOptions } from '../../types/Model';
import { ModelService } from '../../services/model/ModelService';

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
     * Camera position configuration
     */
    cameraPosition?: [number, number, number];

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

export const ModelViewer: React.FC<ModelViewerProps> = ({
    model,
    wireframe = false,
    transformations,
    cameraPosition = [0, 0, 100],
    onLoadComplete,
    onLoadError,
    className = '',
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const frameIdRef = useRef<number>(0);
    const modelRef = useRef<THREE.Group | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const modelService = new ModelService();

    // Initialize Three.js scene
    useEffect(() => {
        if (!containerRef.current) return;

        // Create renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        containerRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Create scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf0f0f0);
        sceneRef.current = scene;

        // Create camera
        const aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
        const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
        camera.position.set(...cameraPosition);
        camera.lookAt(0, 0, 0);
        cameraRef.current = camera;

        // Set up lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);

        // Set up controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.update();
        controlsRef.current = controls;

        // Handle window resize
        const handleResize = () => {
            if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;

            const width = containerRef.current.clientWidth;
            const height = containerRef.current.clientHeight;

            cameraRef.current.aspect = width / height;
            cameraRef.current.updateProjectionMatrix();

            rendererRef.current.setSize(width, height);
        };

        window.addEventListener('resize', handleResize);

        // Animation loop
        const animate = () => {
            if (!sceneRef.current || !cameraRef.current || !rendererRef.current || !controlsRef.current) return;

            frameIdRef.current = requestAnimationFrame(animate);
            controlsRef.current.update();
            rendererRef.current.render(sceneRef.current, cameraRef.current);
        };

        animate();

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(frameIdRef.current);

            if (controlsRef.current) {
                controlsRef.current.dispose();
            }

            if (rendererRef.current) {
                if (containerRef.current) {
                    containerRef.current.removeChild(rendererRef.current.domElement);
                }
                rendererRef.current.dispose();
            }
        };
    }, [cameraPosition]);

    // Handle model changes
    useEffect(() => {
        if (!sceneRef.current) return;

        // Remove previous model
        if (modelRef.current) {
            sceneRef.current.remove(modelRef.current);
            modelRef.current = null;
        }

        // Add new model
        if (model && model.object) {
            try {
                modelRef.current = model.object;
                sceneRef.current.add(modelRef.current);

                // Apply transformations if provided
                if (transformations) {
                    modelService.applyTransform(modelRef.current, transformations);
                }

                // Apply wireframe setting
                modelService.setWireframe(modelRef.current, wireframe);

                onLoadComplete?.();
            } catch (err) {
                const error = err instanceof Error ? err : new Error('Unknown error loading model');
                setError(error);
                onLoadError?.(error);
            }
        }

        return () => {
            if (modelRef.current && sceneRef.current) {
                sceneRef.current.remove(modelRef.current);
                modelRef.current = null;
            }
        };
    }, [model, onLoadComplete, onLoadError, modelService]);

    // Handle transformation changes
    useEffect(() => {
        if (!modelRef.current || !transformations) return;
        modelService.applyTransform(modelRef.current, transformations);
    }, [transformations, modelService]);

    // Handle wireframe changes
    useEffect(() => {
        if (!modelRef.current) return;
        modelService.setWireframe(modelRef.current, wireframe);
    }, [wireframe, modelService]);

    return (
        <div
            ref={containerRef}
            data-testid="canvas-container"
            className={`model-viewer ${className}`}
            style={{
                width: '100%',
                height: '400px',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {isLoading && (
                <div className="loading-indicator">
                    <p>Loading model...</p>
                </div>
            )}

            {error && (
                <div className="error-message">
                    <p>Error loading model: {error.message}</p>
                </div>
            )}
        </div>
    );
};