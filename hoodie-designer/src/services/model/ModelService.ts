import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { v4 as uuidv4 } from 'uuid';
import { TransformOptions, WireframeOptions, Model, ModelMetadata, ExportFormat } from '../../types/Model';

// Export as named class (changes default export style)
export class ModelService {
    private loader: GLTFLoader;

    constructor() {
        this.loader = new GLTFLoader();
    }

    /**
     * Load a 3D model from a URL
     * @param url URL to GLTF or GLB model
     * @returns Promise resolving to loaded model
     */
    async loadModel(url: string): Promise<Model> {
        return new Promise((resolve, reject) => {
            this.loader.load(
                url,
                (gltf) => {
                    const model: Model = {
                        id: uuidv4(),
                        type: 'uploaded',
                        object: gltf.scene,
                        metadata: {
                            name: this.extractFilenameFromUrl(url),
                            source: url,
                            format: this.getFormatFromUrl(url),
                            createdAt: new Date(),
                            modifiedAt: new Date()
                        }
                    };

                    this.normalizeModel(model.object);
                    resolve(model);
                },
                undefined,
                (error) => {
                    reject(new Error(`Error loading model: ${error.message}`));
                }
            );
        });
    }

    // Rest of the class implementation remains the same...
    // ...

    /**
     * Create a procedural wireframe hoodie model
     * @param options Configuration options for the model
     * @returns Generated 3D model
     */
    createWireframeModel(options: WireframeOptions = {}): Model {
        const {
            width = 40,
            height = 60,
            depth = 20,
            sleeveLength = 30,
            hoodSize = 15,
            shoulderWidth = 45,
            color = '#FFFFFF',
            includeHood = true,
            detachableSleeves = false
        } = options;

        const group = new THREE.Group();

        // Create body (main torso)
        const bodyGeometry = new THREE.BoxGeometry(width, height, depth);
        const bodyMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color(color),
            wireframe: true
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.set(0, 0, 0);
        body.name = 'body';
        group.add(body);

        // Create sleeves and other parts...

        const model: Model = {
            id: uuidv4(),
            type: 'wireframe',
            object: group,
            metadata: {
                name: 'Wireframe Hoodie',
                source: 'generated',
                createdAt: new Date(),
                modifiedAt: new Date()
            }
        };

        return model;
    }

    /**
     * Apply transformations to a 3D model
     * @param model Model to transform
     * @param transform Transformation parameters
     */
    applyTransform(model: THREE.Group, transform: TransformOptions): void {
        if (transform.position) {
            model.position.set(...transform.position);
        }

        if (transform.rotation) {
            model.rotation.set(...transform.rotation);
        }

        if (transform.scale !== undefined) {
            if (typeof transform.scale === 'number') {
                model.scale.set(transform.scale, transform.scale, transform.scale);
            } else {
                model.scale.set(...transform.scale);
            }
        }
    }

    /**
     * Set wireframe rendering mode for a model
     * @param model Target model
     * @param enabled Whether wireframe mode should be enabled
     */
    setWireframe(model: THREE.Group, enabled: boolean): void {
        model.traverse((object) => {
            if (object instanceof THREE.Mesh && object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => {
                        material.wireframe = enabled;
                    });
                } else {
                    object.material.wireframe = enabled;
                }
            }
        });
    }

    /**
     * Helper to extract filename from URL
     */
    private extractFilenameFromUrl(url: string): string {
        const parts = url.split('/');
        return parts[parts.length - 1].split('?')[0];
    }

    /**
     * Helper to determine format from URL
     */
    private getFormatFromUrl(url: string): 'glb' | 'gltf' | undefined {
        const filename = this.extractFilenameFromUrl(url).toLowerCase();
        if (filename.endsWith('.glb')) return 'glb';
        if (filename.endsWith('.gltf')) return 'gltf';
        return undefined;
    }

    /**
     * Normalize a model to consistent scale and orientation
     */
    normalizeModel(model: THREE.Group): void {
        // Basic implementation
        model.scale.set(1, 1, 1);
        model.rotation.set(0, 0, 0);
        model.position.set(0, 0, 0);
    }
}