import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { ThreeUtils } from '../../utils/ThreeUtils';
import { Model, TransformOptions } from '../../types/Model';
import './ModelViewer.css';

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

export const ModelViewer: React.FC<ModelViewerProps> = ({
    model,
    wireframe = false,
    transformations,
    onLoadComplete,
    onLoadError,
    className = '',
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const modelRef = useRef<THREE.Object3D | null>(null);

    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    // Initialize Three.js scene
    useEffect(() => {
        if (!containerRef.current) return;

        // Get container dimensions
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;

        // Create scene
        const scene = ThreeUtils.createScene();
        sceneRef.current = scene;

        // Create camera
        const camera = ThreeUtils.createCamera(width / height);
        camera.position.set(0, 5, 10);
        camera.lookAt(0, 0, 0);
        cameraRef.current = camera;

        // Create renderer
        const renderer = ThreeUtils.createRenderer(width, height);
        containerRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Add lighting
        ThreeUtils.setupLighting(scene);

        // Add grid and axes helpers
        const grid = ThreeUtils.createGrid();
        scene.add(grid);

        const axes = ThreeUtils.createAxes();
        scene.add(axes);

        // Create orbit controls
        const controls = ThreeUtils.createOrbitControls(camera, renderer.domElement);
        controlsRef.current = controls;

        // Animation loop
        const animate = () => {
            if (!renderer || !scene || !camera || !controls) return;
            
            controls.update();
            renderer.render(scene, camera);
            animationFrameRef.current = requestAnimationFrame(animate);
        };
        
        animate();

        // Handle window resize
        const handleResize = () => {
            if (!containerRef.current || !renderer || !camera) return;
            
            const width = containerRef.current.clientWidth;
            const height = containerRef.current.clientHeight;
            
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            
            renderer.setSize(width, height);
        };
        
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            
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
    }, []);

    // Handle model changes
    useEffect(() => {
        if (!sceneRef.current || !model) return;

        // Remove previous model if it exists
        if (modelRef.current) {
            sceneRef.current.remove(modelRef.current);
            modelRef.current = null;
        }

        try {
            // Add new model to scene
            const modelObject = model.object.clone();
            sceneRef.current.add(modelObject);
            modelRef.current = modelObject;

            // Center and scale model
            ThreeUtils.centerModel(modelObject);
            ThreeUtils.scaleModelToFit(modelObject);

            // Apply transformations if provided
            if (transformations) {
                const { position, rotation, scale } = transformations;
                
                if (position) {
                    modelObject.position.set(position[0], position[1], position[2]);
                }
                
                if (rotation) {
                    modelObject.rotation.set(rotation[0], rotation[1], rotation[2]);
                }
                
                if (scale) {
                    modelObject.scale.set(scale, scale, scale);
                }
            }

            setIsLoaded(true);
            if (onLoadComplete) onLoadComplete();
        } catch (err) {
            console.error('Error loading model:', err);
            setError(err instanceof Error ? err : new Error('Unknown error loading model'));
            if (onLoadError) onLoadError(err instanceof Error ? err : new Error('Unknown error loading model'));
        }
    }, [model, transformations, onLoadComplete, onLoadError]);

    // Handle wireframe mode changes
    useEffect(() => {
        if (!modelRef.current) return;

        modelRef.current.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(mat => {
                            mat.wireframe = wireframe;
                        });
                    } else {
                        child.material.wireframe = wireframe;
                    }
                }
            }
        });
    }, [wireframe]);

    return (
        <div 
            ref={containerRef} 
            className={`model-viewer ${className}`}
            data-testid="canvas-container"
        >
            {error && (
                <div className="error-message">
                    Error loading model: {error.message}
                </div>
            )}
        </div>
    );
};
