// Mock implementation of Three.js GLTFLoader
export class GLTFLoader {
    constructor() { }

    load(url, onLoad, onProgress, onError) {
        // Simulate successful loading with a mock scene
        setTimeout(() => {
            onLoad({
                scene: {
                    isGroup: true,
                    children: [],
                    traverse: jest.fn()
                }
            });
        }, 0);

        return this;
    }
}