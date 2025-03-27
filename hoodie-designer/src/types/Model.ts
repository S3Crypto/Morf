import * as THREE from 'three';

export interface WireframeOptions {
    width?: number;
    height?: number;
    depth?: number;
    sleeveLength?: number;
    hoodSize?: number;
    color?: string;
    shoulderWidth?: number;
    includeHood?: boolean;
    detachableSleeves?: boolean;
}

export interface TransformOptions {
    position?: [number, number, number];
    rotation?: [number, number, number];
    scale?: number | [number, number, number];
}

export enum ExportFormat {
    GLB = 'glb',
    GLTF = 'gltf'
}

export interface Model {
    id: string;
    type: 'wireframe' | 'uploaded';
    object: THREE.Group;
    metadata: ModelMetadata;
}

export interface ModelMetadata {
    name: string;
    source: string; // URL or 'generated'
    fileSize?: number;
    format?: 'glb' | 'gltf';
    createdAt: Date;
    modifiedAt: Date;
}

export interface ModelHistoryEntry {
    transformations: TransformOptions;
    timestamp: number;
}