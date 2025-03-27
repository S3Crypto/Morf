import { ModelService } from '../../../src/services/model/ModelService';
import * as THREE from 'three';

// Mock Three.js objects
jest.mock('three', () => {
    const actualThree = jest.requireActual('three');
    return {
        ...actualThree,
        Group: jest.fn().mockImplementation(() => ({
            add: jest.fn(),
            children: [],
            position: { set: jest.fn() },
            rotation: { set: jest.fn() },
            scale: { set: jest.fn() }
        })),
        BoxGeometry: jest.fn(),
        CylinderGeometry: jest.fn(),
        MeshBasicMaterial: jest.fn().mockImplementation(() => ({
            wireframe: false,
            color: { set: jest.fn() }
        })),
        Mesh: jest.fn().mockImplementation(() => ({
            material: { wireframe: false },
            position: { set: jest.fn() },
            rotation: { set: jest.fn() },
            name: ''
        })),
        Vector3: jest.fn().mockImplementation(() => ({
            set: jest.fn(),
            multiplyScalar: jest.fn()
        })),
        Box3: jest.fn().mockImplementation(() => ({
            setFromObject: jest.fn().mockReturnThis(),
            getSize: jest.fn(),
            getCenter: jest.fn()
        })),
        Color: jest.fn()
    };
});

// Mock GLTFLoader
jest.mock('three/examples/jsm/loaders/GLTFLoader', () => ({
    GLTFLoader: jest.fn().mockImplementation(() => ({
        load: jest.fn((url, onLoad, onProgress, onError) => {
            onLoad({ scene: new THREE.Group() });
        })
    }))
}));

describe('ModelService', () => {
    let modelService: ModelService;

    beforeEach(() => {
        modelService = new ModelService();
        jest.clearAllMocks();
    });

    describe('createWireframeModel', () => {
        it('should create a wireframe model with default options', () => {
            const model = modelService.createWireframeModel();

            expect(model).toBeDefined();
            expect(model.type).toBe('wireframe');
            expect(model.object).toBeInstanceOf(THREE.Group);
            expect(model.metadata.name).toBe('Wireframe Hoodie');
            expect(model.metadata.source).toBe('generated');
        });

        it('should use provided options when creating wireframe', () => {
            const options = {
                width: 50,
                height: 70,
                color: '#FF0000',
                includeHood: true
            };

            const model = modelService.createWireframeModel(options);

            expect(model).toBeDefined();
            expect(THREE.BoxGeometry).toHaveBeenCalledWith(
                expect.any(Number),
                expect.any(Number),
                expect.any(Number)
            );
            expect(THREE.MeshBasicMaterial).toHaveBeenCalledWith(
                expect.objectContaining({
                    wireframe: true,
                    color: expect.any(THREE.Color)
                })
            );
        });
    });

    describe('applyTransform', () => {
        it('should apply position transformation to a model', () => {
            const mockGroup = new THREE.Group();
            const transform = { position: [1, 2, 3] as [number, number, number] };

            modelService.applyTransform(mockGroup, transform);

            expect(mockGroup.position.set).toHaveBeenCalledWith(1, 2, 3);
        });

        it('should apply rotation transformation to a model', () => {
            const mockGroup = new THREE.Group();
            const transform = { rotation: [0.1, 0.2, 0.3] as [number, number, number] };

            modelService.applyTransform(mockGroup, transform);

            expect(mockGroup.rotation.set).toHaveBeenCalledWith(0.1, 0.2, 0.3);
        });

        it('should apply scale transformation to a model with number', () => {
            const mockGroup = new THREE.Group();
            const transform = { scale: 2 };

            modelService.applyTransform(mockGroup, transform);

            expect(mockGroup.scale.set).toHaveBeenCalledWith(2, 2, 2);
        });

        it('should apply scale transformation to a model with vector', () => {
            const mockGroup = new THREE.Group();
            const transform = { scale: [2, 3, 4] as [number, number, number] };

            modelService.applyTransform(mockGroup, transform);

            expect(mockGroup.scale.set).toHaveBeenCalledWith(2, 3, 4);
        });
    });

    describe('loadModel', () => {
        it('should load a model from URL', async () => {
            const url = 'test-model.glb';
            const model = await modelService.loadModel(url);

            expect(model).toBeDefined();
            expect(model.type).toBe('uploaded');
            expect(model.object).toBeInstanceOf(THREE.Group);
            expect(model.metadata.source).toBe(url);
        });
    });

    describe('setWireframe', () => {
        it('should set wireframe mode on all materials', () => {
            const mockMesh = new THREE.Mesh();
            const mockGroup = new THREE.Group();
            mockGroup.children = [mockMesh];

            mockMesh.traverse = jest.fn((callback) => callback(mockMesh));

            modelService.setWireframe(mockGroup, true);

            expect(mockMesh.traverse).toHaveBeenCalled();
        });
    });
});