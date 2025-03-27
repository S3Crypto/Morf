import * as THREE from 'three';

/**
 * Utility functions for Three.js operations
 */
export class ThreeUtils {
    /**
     * Create a standard Three.js scene with lighting
     * @returns Scene with lights
     */
    static createScene(): THREE.Scene {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf0f0f0);

        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        // Add directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        directionalLight.castShadow = true;
        scene.add(directionalLight);

        return scene;
    }

    /**
     * Create a perspective camera with standard parameters
     * @param aspect Aspect ratio
     * @returns Configured camera
     */
    static createCamera(aspect: number = 1): THREE.PerspectiveCamera {
        const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
        camera.position.set(0, 0, 100);
        camera.lookAt(0, 0, 0);

        return camera;
    }

    /**
     * Create a WebGL renderer with standard configuration
     * @param width Canvas width
     * @param height Canvas height
     * @returns Configured renderer
     */
    static createRenderer(width: number, height: number): THREE.WebGLRenderer {
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;

        return renderer;
    }

    /**
     * Find an object by name in the scene graph
     * @param parent Parent object to search from
     * @param name Name of object to find
     * @returns Found object or null
     */
    static findObjectByName(parent: THREE.Object3D, name: string): THREE.Object3D | null {
        if (parent.name === name) {
            return parent;
        }

        for (const child of parent.children) {
            const found = this.findObjectByName(child, name);
            if (found) {
                return found;
            }
        }

        return null;
    }

    /**
     * Calculate bounding box for an object
     * @param object Object to calculate bounds for
     * @returns Bounding box
     */
    static calculateBoundingBox(object: THREE.Object3D): THREE.Box3 {
        const boundingBox = new THREE.Box3().setFromObject(object);
        return boundingBox;
    }

    /**
     * Get dimensions of an object
     * @param object Object to measure
     * @returns Object dimensions as Vector3
     */
    static getObjectDimensions(object: THREE.Object3D): THREE.Vector3 {
        const boundingBox = this.calculateBoundingBox(object);
        const dimensions = new THREE.Vector3();
        boundingBox.getSize(dimensions);

        return dimensions;
    }

    /**
     * Center an object at the origin
     * @param object Object to center
     */
    static centerObject(object: THREE.Object3D): void {
        const boundingBox = this.calculateBoundingBox(object);
        const center = new THREE.Vector3();
        boundingBox.getCenter(center);

        object.position.sub(center);
    }

    /**
     * Scale an object to fit within maximum dimensions
     * @param object Object to scale
     * @param maxSize Maximum size
     * @returns Scaling factor applied
     */
    static scaleToFit(object: THREE.Object3D, maxSize: number): number {
        const dimensions = this.getObjectDimensions(object);
        const maxDimension = Math.max(dimensions.x, dimensions.y, dimensions.z);

        if (maxDimension > maxSize) {
            const scale = maxSize / maxDimension;
            object.scale.multiplyScalar(scale);
            return scale;
        }

        return 1.0;
    }

    /**
     * Convert hex color to Three.js Color
     * @param hex Hex color string
     * @returns Three.js Color
     */
    static hexToColor(hex: string): THREE.Color {
        return new THREE.Color(hex);
    }
}