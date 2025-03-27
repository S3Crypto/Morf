# Technical Specifications

This document outlines the technical specifications for the 3D Hoodie Designer application, including architecture details, component specifications, and technical requirements.

## 1. System Architecture

### 1.1 High-Level Architecture

The application follows a layered architecture with clear separation of concerns:

```
┌───────────────────────────────────────────────────────┐
│                  Presentation Layer                    │
│                                                        │
│  ┌─────────────┐  ┌────────────┐  ┌───────────────┐   │
│  │ ModelViewer │  │ ARViewer   │  │ ControlPanel  │   │
│  └─────────────┘  └────────────┘  └───────────────┘   │
└───────────────────────────────────────────────────────┘
                        ▲
                        │
                        ▼
┌───────────────────────────────────────────────────────┐
│                 Business Logic Layer                   │
│                                                        │
│  ┌─────────────┐  ┌────────────┐  ┌───────────────┐   │
│  │ModelService │  │ ARService  │  │BodyTracking   │   │
│  └─────────────┘  └────────────┘  └───────────────┘   │
└───────────────────────────────────────────────────────┘
                        ▲
                        │
                        ▼
┌───────────────────────────────────────────────────────┐
│                     Data Layer                         │
│                                                        │
│  ┌─────────────┐  ┌────────────┐                      │
│  │StorageService│  │StateManager│                      │
│  └─────────────┘  └────────────┘                      │
└───────────────────────────────────────────────────────┘
```

### 1.2 Component Interaction

Key interactions between components:

1. **Model Loading Flow:**
   - User uploads model → ModelUploader → ModelService → ModelViewer
   - Default model creation → ModelService → ModelViewer

2. **AR Visualization Flow:**
   - AR mode activation → ARService → BodyTrackingService → ModelMappingService → ARViewer
   - Camera feed → BodyTrackingService → Pose Detection → Model Positioning

3. **User Interaction Flow:**
   - UI Controls → ControlPanel → ModelContext → ModelService → ModelViewer
   - AR Controls → ARControls → ARContext → ARService → ARViewer

## 2. Component Specifications

### 2.1 Core Services

#### 2.1.1 ModelService

**Purpose:** Manages 3D model loading, creation, and manipulation.

**Key Functions:**
- `loadModel(url: string): Promise<THREE.Group>` - Loads GLTF/GLB models
- `createWireframeModel(options): THREE.Group` - Creates parametric hoodie model
- `applyTransform(model, transform): void` - Applies transformations to models
- `setWireframe(model, enabled): void` - Toggles wireframe rendering mode

**Dependencies:**
- Three.js
- GLTFLoader

#### 2.1.2 ARService

**Purpose:** Manages WebXR sessions and AR visualization.

**Key Functions:**
- `isSupported(): Promise<boolean>` - Checks WebXR support
- `startSession(renderer, scene, camera): Promise<boolean>` - Initializes AR session
- `endSession(): void` - Terminates AR session
- `placeModelOnBody(model, bodyData): void` - Positions model on detected body

**Dependencies:**
- WebXR API
- Three.js
- BodyTrackingService

#### 2.1.3 BodyTrackingService

**Purpose:** Detects and tracks body pose from camera feed.

**Key Functions:**
- `initialize(modelType): Promise<boolean>` - Initializes TensorFlow.js models
- `detectPose(video): Promise<BodyData>` - Performs pose detection
- `getBodyMeasurements(pose): BodyMeasurements` - Extracts body dimensions
- `smoothPose(current, previous): BodyData` - Applies temporal smoothing

**Dependencies:**
- TensorFlow.js
- PoseNet/MoveNet models

### 2.2 UI Components

#### 2.2.1 ModelViewer

**Purpose:** Renders 3D models using Three.js.

**Props:**
- `modelUrl?: string` - URL to load custom model
- `wireframe?: boolean` - Toggle wireframe mode
- `transformations?: TransformOptions` - Model transformations
- `onLoadComplete?: () => void` - Load completion callback

**State:**
- `isLoading: boolean` - Model loading state
- `error: Error | null` - Loading error state
- `model: THREE.Group | null` - Loaded 3D model

#### 2.2.2 ARViewer

**Purpose:** Provides AR visualization with body tracking.

**Props:**
- `model: THREE.Group` - 3D model to display in AR
- `onTrackingUpdate?: (quality: TrackingQuality) => void` - Tracking status callback
- `guidesEnabled?: boolean` - Toggle alignment guides

**State:**
- `arSessionActive: boolean` - AR session status
- `trackingQuality: TrackingQuality` - Current tracking quality
- `bodyData: BodyData | null` - Detected body pose data

#### 2.2.3 ControlPanel

**Purpose:** Provides UI controls for model manipulation.

**Props:**
- `onTransformChange: (transform: TransformOptions) => void` - Transform change handler
- `onModeChange: (mode: ViewMode) => void` - Mode change handler
- `onWireframeToggle: (enabled: boolean) => void` - Wireframe toggle handler

**State:**
- `activeControl: ControlType` - Currently active control
- `transformValues: TransformValues` - Current transformation values

### 2.3 Context Providers

#### 2.3.1 ModelContext

**Purpose:** Manages 3D model state across components.

**State:**
- `currentModel: Model | null` - Active 3D model
- `isWireframe: boolean` - Wireframe rendering state
- `transformations: TransformOptions` - Current transformations
- `modelHistory: ModelHistoryEntry[]` - Transformation history

**Actions:**
- `loadModel(url: string): Promise<void>`
- `createWireframe(options): void`
- `applyTransformation(transform: Partial<TransformOptions>): void`
- `toggleWireframe(): void`

#### 2.3.2 ARContext

**Purpose:** Manages AR state across components.

**State:**
- `isSupported: boolean` - WebXR support status
- `isSessionActive: boolean` - AR session status
- `bodyData: BodyData | null` - Detected body data
- `trackingQuality: TrackingQuality` - Tracking quality level

**Actions:**
- `checkSupport(): Promise<void>`
- `startARSession(): Promise<boolean>`
- `endARSession(): void`
- `updateBodyData(data: BodyData): void`

## 3. Technical Requirements

### 3.1 Browser Compatibility

The application shall support the following browsers:
- Chrome 90+
- Edge 90+
- Firefox 90+ (with flags enabled for WebXR)
- Safari 15.4+ (with limited WebXR support)

### 3.2 Hardware Requirements

For AR functionality:
- MacBook with camera (1080p recommended)
- WebGL 2.0 capable GPU
- 4GB+ RAM
- Multi-core CPU recommended

For basic 3D visualization:
- WebGL 1.0 capable GPU
- 2GB+ RAM

### 3.3 Performance Requirements

1. **Rendering Performance:**
   - Maintain 30+ FPS during standard 3D visualization
   - Maintain 20+ FPS during AR visualization

2. **Loading Performance:**
   - Initial application load < 3 seconds on broadband
   - Model loading indicator for files > 1MB
   - Progress tracking for large model files

3. **AR Performance:**
   - Body detection latency < 200ms
   - Pose update frequency ≥ 15 FPS
   - Smooth transitions between poses

### 3.4 Security Requirements

1. **Data Handling:**
   - No server storage of uploaded models
   - Local processing of all camera data
   - No transmission of sensitive data

2. **Permission Handling:**
   - Explicit camera permission requests
   - Clear privacy notification for AR features
   - Ability to revoke permissions at any time

## 4. API Specifications

### 4.1 External APIs

#### 4.1.1 WebXR Device API

**Usage:** AR session management and spatial tracking.

**Key Endpoints:**
- `navigator.xr.isSessionSupported()`
- `navigator.xr.requestSession()`

**Documentation:** [WebXR Device API](https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API)

#### 4.1.2 TensorFlow.js

**Usage:** Body pose detection and tracking.

**Key Modules:**
- `@tensorflow/tfjs`
- `@tensorflow-models/pose-detection`

**Documentation:** [TensorFlow.js](https://www.tensorflow.org/js)

### 4.2 Internal APIs

#### 4.2.1 ModelService API

```typescript
interface ModelService {
  loadModel(url: string): Promise<THREE.Group>;
  createWireframeModel(options?: WireframeOptions): THREE.Group;
  applyTransform(model: THREE.Group, transform: TransformOptions): void;
  setWireframe(model: THREE.Group, enabled: boolean): void;
  exportModel(model: THREE.Group, format: ExportFormat): Promise<Blob>;
}

interface WireframeOptions {
  width?: number;
  height?: number;
  depth?: number;
  sleeveLength?: number;
  hoodSize?: number;
  color?: string;
}

interface TransformOptions {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
}

enum ExportFormat {
  GLB = 'glb',
  GLTF = 'gltf'
}
```

#### 4.2.2 ARService API

```typescript
interface ARService {
  isSupported(): Promise<boolean>;
  startSession(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera
  ): Promise<boolean>;
  endSession(): void;
  placeModelOnBody(model: THREE.Group, bodyData: BodyData): void;
  getTrackingQuality(): TrackingQuality;
}

interface BodyData {
  shoulders: {
    left: THREE.Vector3;
    right: THREE.Vector3;
  };
  chest: THREE.Vector3;
  hips: THREE.Vector3;
  neck?: THREE.Vector3;
  head?: THREE.Vector3;
  confidence: number;
}

enum TrackingQuality {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
  LOST = 'lost'
}
```

## 5. Data Models

### 5.1 Model Data

```typescript
interface Model {
  id: string;
  type: 'wireframe' | 'uploaded';
  object: THREE.Group;
  metadata: ModelMetadata;
  transformations: TransformOptions;
}

interface ModelMetadata {
  name: string;
  source: string; // URL or 'generated'
  fileSize?: number;
  format?: 'glb' | 'gltf';
  createdAt: Date;
  modifiedAt: Date;
}
```

### 5.2 Body Tracking Data

```typescript
interface PoseData {
  keypoints: Keypoint[];
  score: number;
  timestamp: number;
}

interface Keypoint {
  name: string; // e.g., 'nose', 'left_shoulder'
  position: {
    x: number; // Normalized 0-1
    y: number; // Normalized 0-1
    z?: number; // Optional depth
  };
  score: number; // Confidence 0-1
}

interface BodyMeasurements {
  shoulderWidth: number;
  torsoLength: number;
  hipWidth: number;
  estimatedHeight: number;
}
```

### 5.3 Application State

```typescript
interface AppState {
  model: ModelState;
  ui: UIState;
  ar: ARState;
}

interface ModelState {
  currentModel: Model | null;
  isLoading: boolean;
  error: Error | null;
  transformations: TransformOptions;
  isWireframe: boolean;
  history: ModelHistoryEntry[];
}

interface UIState {
  activeMode: 'standard' | 'ar';
  activeControl: 'rotate' | 'scale' | 'move' | null;
  isSidebarOpen: boolean;
  activePanel: string | null;
  notifications: Notification[];
}

interface ARState {
  isSupported: boolean;
  isSessionActive: boolean;
  trackingQuality: TrackingQuality;
  bodyData: BodyData | null;
  cameraPermissionGranted: boolean;
}
```

## 6. Error Handling

### 6.1 Error Types

```typescript
enum ErrorType {
  // Model Errors
  MODEL_LOAD_FAILED = 'model_load_failed',
  MODEL_PARSE_ERROR = 'model_parse_error',
  MODEL_TOO_LARGE = 'model_too_large',
  
  // AR Errors
  AR_NOT_SUPPORTED = 'ar_not_supported',
  AR_PERMISSION_DENIED = 'ar_permission_denied',
  AR_SESSION_FAILED = 'ar_session_failed',
  
  // Tracking Errors
  BODY_TRACKING_FAILED = 'body_tracking_failed',
  POSE_DETECTION_ERROR = 'pose_detection_error',
  
  // General Errors
  BROWSER_INCOMPATIBLE = 'browser_incompatible',
  WEBGL_NOT_SUPPORTED = 'webgl_not_supported'
}
```

### 6.2 Error Handling Strategy

1. **User-Facing Errors:**
   - Clear error messages with recovery options
   - Contextual help for common errors
   - Non-technical language for general users

2. **Developer Errors:**
   - Detailed console logging
   - Error context preservation
   - Stack traces in development mode

3. **Recovery Strategies:**
   - Automatic retries for transient errors
   - Fallback mechanisms for missing features
   - Graceful degradation for performance issues

## 7. Performance Optimization

### 7.1 Rendering Optimizations

1. **Level of Detail (LOD):**
   - Simplified models for distant viewing
   - Detail reduction during motion
   - Adaptive polygon count based on device capability

2. **Texture Management:**
   - Mipmap generation for textures
   - Texture compression for large assets
   - Lazy loading for high-resolution textures

3. **Render Loop:**
   - Request animation frame throttling
   - Render priority for active components
   - Scene graph optimization

### 7.2 AR Optimizations

1. **Camera Processing:**
   - Resolution scaling based on device capability
   - Frame rate limiting for pose detection
   - Background thread processing where available

2. **Pose Detection:**
   - Model switching based on performance needs
   - Detection frequency adaptation
   - Keypoint subset processing for specific needs

3. **Model Overlay:**
   - Simplified shadows for performance
   - Efficient object picking and hit testing
   - Optimized shader usage