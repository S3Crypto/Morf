import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { TransformOptions } from '../../types/Model';
import { ThreeUtils } from '../../utils/ThreeUtils';

export interface ModelLoadOptions {
    /**
     * Apply transformations to the model
     */
    transform?: TransformOptions;
    
    /**
     * Enable wireframe mode
     */
    wireframe?: boolean;
    
    /**
     * Material options
     */
    material?: {
        color?: string;
        opacity?: number;
        metalness?: number;
        roughness?: number;
    };
}

export interface ModelLoadResult {
    /**
     * The loaded model object
     */
    model: THREE.Object3D;
    
    /**
     * Any materials applied to the model
     */
    materials: THREE.Material[];
    
    /**
     * Bounding box of the model
     */
    boundingBox: THREE.Box3;
}

export class ModelService {
    private gltfLoader: GLTFLoader;
    private objLoader: OBJLoader;
    private stlLoader: STLLoader;
    private threeUtils: ThreeUtils;

    constructor() {
        this.gltfLoader = new GLTFLoader();
        this.objLoader = new OBJLoader();
        this.stlLoader = new STLLoader();
        this.threeUtils = new ThreeUtils();
    }

    /**
     * Load a 3D model from a URL
     * @param url URL of the model file
     * @param fileType Type of the model file (gltf, obj, stl)
     * @param options Loading options
     * @returns Promise resolving to the loaded model
     */
    async loadModelFromUrl(
        url: string,
        fileType: 'gltf' | 'obj' | 'stl',
        options: ModelLoadOptions = {}
    ): Promise<ModelLoadResult> {
        let model: THREE.Object3D;
        const materials: THREE.Material[] = [];

        switch (fileType) {
            case 'gltf':
                model = await this.loadGLTF(url);
                break;
            case 'obj':
                model = await this.loadOBJ(url);
                break;
            case 'stl':
                const result = await this.loadSTL(url, options);
                model = result.model;
                materials.push(result.material);
                break;
            default:
                throw new Error(`Unsupported file type: ${fileType}`);
        }

        // Apply transformations
        if (options.transform) {
            this.applyTransform(model, options.transform);
        }

        // Apply wireframe if requested
        if (options.wireframe) {
            this.setWireframe(model, true);
        }

        // Apply material options if provided
        if (options.material) {
            this.applyMaterialOptions(model, options.material);
        }

        // Calculate bounding box
        const boundingBox = new THREE.Box3().setFromObject(model);

        return {
            model,
            materials,
            boundingBox
        };
    }

    /**
     * Load a 3D model from a File object
     * @param file File object containing the model data
     * @param fileType Type of the model file (gltf, obj, stl)
     * @param options Loading options
     * @returns Promise resolving to the loaded model
     */
    async loadModelFromFile(
        file: File,
        fileType: 'gltf' | 'obj' | 'stl',
        options: ModelLoadOptions = {}
    ): Promise<ModelLoadResult> {
        // Create a URL from the file
        const url = URL.createObjectURL(file);
        
        try {
            // Load the model using the URL
            return await this.loadModelFromUrl(url, fileType, options);
        } finally {
            // Clean up the URL
            URL.revokeObjectURL(url);
        }
    }

    /**
     * Apply transformations to a model
     * @param model Model to transform
     * @param transform Transformation options
     */
    applyTransform(model: THREE.Object3D, transform: TransformOptions): void {
        if (transform.position) {
            model.position.set(
                transform.position[0],
                transform.position[1],
                transform.position[2]
            );
        }

        if (transform.rotation) {
            model.rotation.set(
                transform.rotation[0],
                transform.rotation[1],
                transform.rotation[2]
            );
        }

        if (transform.scale !== undefined) {
            if (typeof transform.scale === 'number') {
                model.scale.set(transform.scale, transform.scale, transform.scale);
            } else {
                model.scale.set(
                    transform.scale[0],
                    transform.scale[1],
                    transform.scale[2]
                );
            }
        }
    }

    /**
     * Set wireframe mode on a model
     * @param model Model to modify
     * @param enabled Whether wireframe mode should be enabled
     */
    setWireframe(model: THREE.Object3D, enabled: boolean): void {
        model.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(material => {
                        material.wireframe = enabled;
                    });
                } else {
                    child.material.wireframe = enabled;
                }
            }
        });
    }

    /**
     * Apply material options to a model
     * @param model Model to modify
     * @param options Material options
     */
    private applyMaterialOptions(
        model: THREE.Object3D,
        options: ModelLoadOptions['material']
    ): void {
        if (!options) return;

        model.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material) {
                const materials = Array.isArray(child.material) 
                    ? child.material 
                    : [child.material];

                materials.forEach(material => {
                    if (options.color !== undefined && material instanceof THREE.MeshStandardMaterial) {
                        material.color.set(options.color);
                    }
                    
                    if (options.opacity !== undefined) {
                        material.opacity = options.opacity;
                        material.transparent = options.opacity < 1;
                    }
                    
                    if (options.metalness !== undefined && material instanceof THREE.MeshStandardMaterial) {
                        material.metalness = options.metalness;
                    }
                    
                    if (options.roughness !== undefined && material instanceof THREE.MeshStandardMaterial) {
                        material.roughness = options.roughness;
                    }
                });
            }
        });
    }

    /**
     * Load a GLTF model
     * @param url URL of the GLTF file
     * @returns Promise resolving to the loaded model
     */
    private loadGLTF(url: string): Promise<THREE.Object3D> {
        return new Promise((resolve, reject) => {
            this.gltfLoader.load(
                url,
                (gltf) => {
                    resolve(gltf.scene);
                },
                undefined,
                (error) => {
                    reject(new Error(`Error loading GLTF model: ${error.message}`));
                }
            );
        });
    }

    /**
     * Load an OBJ model
     * @param url URL of the OBJ file
     * @returns Promise resolving to the loaded model
     */
    private loadOBJ(url: string): Promise<THREE.Object3D> {
        return new Promise((resolve, reject) => {
            this.objLoader.load(
                url,
                (obj) => {
                    resolve(obj);
                },
                undefined,
                (error) => {
                    reject(new Error(`Error loading OBJ model: ${error.message}`));
                }
            );
        });
    }

    /**
     * Load an STL model
     * @param url URL of the STL file
     * @param options Loading options
     * @returns Promise resolving to the loaded model and its material
     */
    private loadSTL(
        url: string,
        options: ModelLoadOptions = {}
    ): Promise<{ model: THREE.Object3D; material: THREE.Material }> {
        return new Promise((resolve, reject) => {
            this.stlLoader.load(
                url,
                (geometry) => {
                    const material = new THREE.MeshStandardMaterial({
                        color: options.material?.color || 0xcccccc,
                        metalness: options.material?.metalness || 0.2,
                        roughness: options.material?.roughness || 0.8,
                        wireframe: options.wireframe || false
                    });
                    
                    const mesh = new THREE.Mesh(geometry, material);
                    resolve({ model: mesh, material });
                },
                undefined,
                (error) => {
                    reject(new Error(`Error loading STL model: ${error.message}`));
                }
            );
        });
    }

    /**
     * Create a default material
     * @param options Material options
     * @returns New material instance
     */
    createDefaultMaterial(options: ModelLoadOptions['material'] = {}): THREE.Material {
        return new THREE.MeshStandardMaterial({
            color: options.color || 0xcccccc,
            metalness: options.metalness || 0.2,
            roughness: options.roughness || 0.8,
            transparent: options.opacity !== undefined && options.opacity < 1,
            opacity: options.opacity || 1.0
        });
    }
}
