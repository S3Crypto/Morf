module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
    moduleNameMapper: {
        // Mock CSS modules
        '\\.css$': 'identity-obj-proxy',
        // Mock static assets
        '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/tests/mocks/fileMock.js',
        // Mock Three.js and GLTFLoader
        'three/examples/jsm/loaders/GLTFLoader': '<rootDir>/tests/mocks/GLTFLoaderMock.js',
        // Path aliases
        '^@/(.*)$': '<rootDir>/src/$1'
    },
    transform: {
        '^.+\\.tsx?$': ['ts-jest'],
        '^.+\\.jsx?$': ['babel-jest', { presets: ['@babel/preset-env', '@babel/preset-react'] }]
    },
    // This is crucial - we need to transform node_modules to handle ESM
    transformIgnorePatterns: [
        'node_modules/(?!(three|uuid)/)'
    ],
    testMatch: [
        "<rootDir>/tests/**/*.test.{ts,tsx}"
    ],
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/tests/**/*',
        '!src/index.tsx',
        '!src/vite-env.d.ts'
    ],
    coverageThreshold: {
        global: {
            statements: 80,
            branches: 75,
            functions: 80,
            lines: 80
        }
    }
};