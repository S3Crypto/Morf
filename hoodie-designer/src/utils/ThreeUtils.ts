import * as THREE from 'three';

export class ThreeUtils {
    /**
     * Create a new Three.js scene with default settings
     * @returns New scene instance
     */
    static createScene(): THREE.Scene {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf0f0f0);
        return scene;
    }

    /**
     * Create a perspective camera with default settings
     * @param aspectRatio Aspect ratio (width/height)
     * @returns New camera instance
     */
    static createCamera(aspectRatio: number = 1): THREE.PerspectiveCamera {
        const camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
        camera.position.z = 5;
        return camera;
    }

    /**
     * Create a WebGL renderer with default settings
     * @param width Renderer width
     * @param height Renderer height
     * @returns New renderer instance
     */
    static createRenderer(width: number, height: number): THREE.WebGLRenderer {
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        return renderer;
    }

    /**
     * Create default lighting for a scene
     * @param scene Scene to add lights to
     */
    static setupLighting(scene: THREE.Scene): void {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        // Directional light (simulates sunlight)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);

        // Additional light from the opposite direction
        const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
        backLight.position.set(-1, -1, -1);
        scene.add(backLight);
    }

    /**
     * Create a grid helper for the scene
     * @param size Grid size
     * @param divisions Number of divisions
     * @returns Grid helper object
     */
    static createGrid(size: number = 10, divisions: number = 10): THREE.GridHelper {
        return new THREE.GridHelper(size, divisions);
    }

    /**
     * Create axes helper for the scene
     * @param size Size of the axes
     * @returns Axes helper object
     */
    static createAxes(size: number = 5): THREE.AxesHelper {
        return new THREE.AxesHelper(size);
    }

    /**
     * Center a model in the scene
     * @param model Model to center
     */
    static centerModel(model: THREE.Object3D): void {
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        
        model.position.x = model.position.x - center.x;
        model.position.y = model.position.y - center.y;
        model.position.z = model.position.z - center.z;
    }

    /**
     * Scale a model to fit within a given size
     * @param model Model to scale
     * @param maxSize Maximum size in any dimension
     */
    static scaleModelToFit(model: THREE.Object3D, maxSize: number = 5): void {
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        
        const maxDimension = Math.max(size.x, size.y, size.z);
        if (maxDimension > maxSize) {
            const scale = maxSize / maxDimension;
            model.scale.multiplyScalar(scale);
        }
    }

    /**
     * Create a simple animation loop
     * @param renderer Renderer to use
     * @param scene Scene to render
     * @param camera Camera to use
     * @param animationCallback Optional callback for custom animations
     * @returns Animation frame ID (can be used with cancelAnimationFrame)
     */
    static startAnimationLoop(
        renderer: THREE.WebGLRenderer,
        scene: THREE.Scene,
        camera: THREE.Camera,
        animationCallback?: (time: number) => void
    ): number {
        let animationId: number;

        const animate = (time: number) => {
            animationId = requestAnimationFrame(animate);
            
            if (animationCallback) {
                animationCallback(time);
            }
            
            renderer.render(scene, camera);
        };

        animationId = requestAnimationFrame(animate);
        return animationId;
    }

    /**
     * Create a simple orbit control setup
     * @param camera Camera to control
     * @param renderer Renderer DOM element
     * @returns Orbit controls instance
     */
    static createOrbitControls(
        camera: THREE.Camera,
        rendererElement: HTMLElement
    ): any {
        // This is a simplified version - in a real app, you'd import OrbitControls
        // and return a properly typed instance
        console.warn('OrbitControls implementation would go here');
        return null;
    }
}
