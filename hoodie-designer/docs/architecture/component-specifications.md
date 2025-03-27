# Component Specifications

This document provides detailed specifications for the key components of the 3D Hoodie Designer application.

## Core Services

### ModelService

**Purpose:** Manages 3D model loading, creation, and manipulation.

**File:** `src/services/model/ModelService.ts`

**Dependencies:**
- Three.js
- GLTFLoader

**Interface:**
```typescript
interface ModelService {
  /**
   * Load a 3D model from a URL
   * @param url URL to GLTF or GLB model
   * @returns Promise resolving to loaded model
   */
  loadModel(url: string): Promise<THREE.Group>;
  
  /**
   * Create a procedural wireframe hoodie model
   * @param options Configuration options for the model
   * @returns Generated 3D model
   */
  createWireframeModel(options?: WireframeOptions): THREE.Group;
  
  /**
   * Apply transformations to a 3D model
   * @param model Model to transform
   * @param transform Transformation parameters
   */
  applyTransform(model: THREE.Group, transform: TransformOptions): void;
  
  /**
   * Set wireframe rendering mode for a model
   * @param model Target model
   * @param enabled Whether wireframe mode should be enabled
   */
  setWireframe(model: THREE.Group, enabled: boolean): void;
  
  /**
   * Export a model to a specified format
   * @param model Model to export
   * @param format Target export format
   * @returns Promise resolving to file blob
   */
  exportModel(model: THREE.Group, format: 'glb' | 'gltf'): Promise<Blob>;
  
  /**
   * Normalize a model to consistent scale and orientation
   * @param model Model to normalize
   */
  normalizeModel(model: THREE.Group): void;
}
```

**Implementation Details:**
- Uses GLTFLoader for model loading
- Implements procedural geometry generation for wireframe models
- Applies matrix transformations for model manipulation
- Traverses scene graph to modify material properties

**Unit Tests:**
- Test model loading with valid and invalid URLs
- Validate wireframe model generation with different parameters
- Test transformation operations for accuracy
- Ensure wireframe mode correctly modifies materials

### ARService

**Purpose:** Manages WebXR sessions and AR visualization.

**File:** `src/services/ar/ARService.ts`

**Dependencies:**
- WebXR API
- Three.js
- BodyTrackingService

**Interface:**
```typescript
interface ARService {
  /**
   * Check if WebXR AR is supported in the current browser
   * @returns Promise resolving to support status
   */
  isSupported(): Promise<boolean>;
  
  /**
   * Start an AR session
   * @param renderer Three.js renderer to use
   * @param scene Scene to render in AR
   * @param camera Camera to use for AR view
   * @returns Promise resolving to session start success
   */
  startSession(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera
  ): Promise<boolean>;
  
  /**
   * End the current AR session
   */
  endSession(): void;
  
  /**
   * Place a 3D model on the detected body
   * @param model Model to position
   * @param bodyData Body tracking data
   */
  placeModelOnBody(model: THREE.Group, bodyData: BodyData): void;
  
  /**
   * Get the current tracking quality
   * @returns Tracking quality assessment
   */
  getTrackingQuality(): TrackingQuality;
  
  /**
   * Add event listener for AR events
   * @param event Event type
   * @param callback Event handler
   */
  addEventListener(event: AREventType, callback: Function): void;
  
  /**
   * Remove event listener
   * @param event Event type
   * @param callback Event handler
   */
  removeEventListener(event: AREventType, callback: Function): void;
}

enum AREventType {
  SESSION_START = 'session_start',
  SESSION_END = 'session_end',
  TRACKING_CHANGED = 'tracking_changed',
  ERROR = 'error'
}

enum TrackingQuality {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
  LOST = 'lost'
}
```

**Implementation Details:**
- Manages WebXR session lifecycle
- Integrates with BodyTrackingService for pose detection
- Implements hit testing for surface detection
- Provides events for AR session state changes

**Unit Tests:**
- Test WebXR support detection
- Validate session startup/teardown
- Test model placement with mock body data
- Verify event system functionality

### BodyTrackingService

**Purpose:** Detects and tracks body pose from camera feed.

**File:** `src/services/ar/BodyTrackingService.ts`

**Dependencies:**
- TensorFlow.js
- PoseNet/MoveNet models

**Interface:**
```typescript
interface BodyTrackingService {
  /**
   * Initialize the body tracking system
   * @param modelType Pose detection model to use
   * @returns Promise resolving to initialization success
   */
  initialize(modelType?: PoseModelType): Promise<boolean>;
  
  /**
   * Detect pose from video element
   * @param video Video element with camera feed
   * @returns Promise resolving to detected body data
   */
  detectPose(video: HTMLVideoElement): Promise<BodyData | null>;
  
  /**
   * Extract body measurements from pose data
   * @param pose Detected pose data
   * @returns Body measurements
   */
  getBodyMeasurements(pose: PoseData): BodyMeasurements;
  
  /**
   * Apply temporal smoothing to pose data
   * @param current Current frame pose data
   * @param previous Previous frame pose data
   * @returns Smoothed pose data
   */
  smoothPose(current: PoseData, previous?: PoseData): PoseData;
  
  /**
   * Get estimated tracking quality
   * @returns Tracking quality assessment
   */
  getTrackingQuality(): TrackingQuality;
  
  /**
   * Set detection resolution
   * @param resolution Resolution level
   */
  setDetectionResolution(resolution: 'low' | 'medium' | 'high'): void;
  
  /**
   * Clean up resources
   */
  dispose(): void;
}

enum PoseModelType {
  MOVENET_LIGHTNING = 'movenet_lightning',
  MOVENET_THUNDER = 'movenet_thunder',
  POSENET = 'posenet',
  BLAZEPOSE = 'blazepose'
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
  timestamp: number;
}

interface BodyMeasurements {
  shoulderWidth: number;
  torsoLength: number;
  hipWidth: number;
  estimatedHeight: number;
}
```

**Implementation Details:**
- Integrates TensorFlow.js for pose detection
- Implements temporal filtering for stable tracking
- Extracts key body points for hoodie positioning
- Calculates body measurements for model sizing

**Unit Tests:**
- Test model initialization with different model types
- Validate pose detection with sample images
- Test body measurements calculation accuracy
- Verify smoothing algorithm effectiveness

## UI Components

### ModelViewer

**Purpose:** Renders 3D models using Three.js.

**File:** `src/components/model/ModelViewer.tsx`

**Dependencies:**
- React
- Three.js
- ModelService

**Props Interface:**
```typescript
interface ModelViewerProps {
  /**
   * URL to load a custom model (optional)
   */
  modelUrl?: string;
  
  /**
   * Whether to display model in wireframe mode
   */
  wireframe?: boolean;
  
  /**
   * Model transformation parameters
   */
  transformations?: TransformOptions;
  
  /**
   * Camera position configuration
   */
  cameraOptions?: CameraOptions;
  
  /**
   * Event callbacks
   */
  onLoadComplete?: () => void;
  onLoadError?: (error: Error) => void;
  onTransformChange?: (transform: TransformOptions) => void;
  
  /**
   * Additional class names
   */
  className?: string;
}

interface TransformOptions {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
}

interface CameraOptions {
  position?: [number, number, number];
  target?: [number, number, number];
  fov?: number;
}
```

**Component Structure:**
- Canvas container with Three.js renderer
- Controls for model manipulation
- Loading indicators and error states
- Camera controls integration

**Lifecycle:**
1. Initialize Three.js scene on mount
2. Set up camera and lighting
3. Load model from URL or create wireframe
4. Set up animation loop
5. Clean up resources on unmount

**State Management:**
- Track loading state for models
- Maintain reference to current model
- Store error state for error handling
- Track canvas dimensions for responsive sizing

**Unit Tests:**
- Test component rendering with and without model URL
- Validate wireframe mode toggle functionality
- Test transformation prop changes
- Verify cleanup on unmount

### ARViewer

**Purpose:** Provides AR visualization with body tracking.

**File:** `src/components/ar/ARViewer.tsx`

**Dependencies:**
- React
- Three.js
- ARService
- BodyTrackingService

**Props Interface:**
```typescript
interface ARViewerProps {
  /**
   * 3D model to display in AR
   */
  model: THREE.Group;
  
  /**
   * Whether to enable body tracking
   */
  bodyTrackingEnabled?: boolean;
  
  /**
   * Whether to show alignment guides
   */
  guidesEnabled?: boolean;
  
  /**
   * Callback for tracking quality updates
   */
  onTrackingUpdate?: (quality: TrackingQuality) => void;
  
  /**
   * Callback for AR session state changes
   */
  onSessionStateChange?: (active: boolean) => void;
  
  /**
   * Callback for errors
   */
  onError?: (error: Error) => void;
  
  /**
   * Additional class names
   */
  className?: string;
}
```

**Component Structure:**
- Camera feed display
- Three.js scene overlay
- AR status indicators
- Tracking quality visualization
- Guidance elements for optimal positioning

**Lifecycle:**
1. Check AR support on mount
2. Initialize body tracking
3. Set up camera access and video processing
4. Start AR session when activated
5. Begin pose detection loop
6. Clean up resources on unmount

**State Management:**
- Track AR session state
- Monitor tracking quality
- Store detected body data
- Track permission states
- Manage error conditions

**Unit Tests:**
- Test component rendering
- Validate AR session lifecycle
- Test permission handling
- Verify body tracking integration

### ControlPanel

**Purpose:** Provides UI controls for model manipulation.

**File:** `src/components/controls/ControlPanel.tsx`

**Dependencies:**
- React
- ModelContext
- UIContext

**Props Interface:**
```typescript
interface ControlPanelProps {
  /**
   * Transform change handler
   */
  onTransformChange?: (transform: TransformOptions) => void;
  
  /**
   * Mode change handler
   */
  onModeChange?: (mode: ViewMode) => void;
  
  /**
   * Wireframe toggle handler
   */
  onWireframeToggle?: (enabled: boolean) => void;
  
  /**
   * Control panel placement
   */
  placement?: 'left' | 'right' | 'top' | 'bottom';
  
  /**
   * Whether the panel is expanded
   */
  expanded?: boolean;
  
  /**
   * Additional class names
   */
  className?: string;
}

enum ViewMode {
  STANDARD = 'standard',
  AR = 'ar'
}
```

**Component Structure:**
- Collapsible panel container
- Transform control groups (position, rotation, scale)
- Mode switching buttons
- Wireframe toggle
- File upload integration

**State Management:**
- Track active control type
- Store current transformation values
- Track control panel expanded state
- Manage control focus states

**Unit Tests:**
- Test component rendering in different placements
- Validate control interactions
- Test callbacks for value changes
- Verify keyboard accessibility

### ModelUploader

**Purpose:** Handles file selection and validation for 3D models.

**File:** `src/components/upload/ModelUploader.tsx`

**Dependencies:**
- React
- ModelService
- ModelContext

**Props Interface:**
```typescript
interface ModelUploaderProps {
  /**
   * Maximum file size in bytes
   */
  maxSize?: number;
  
  /**
   * Allowed file formats
   */
  allowedFormats?: string[];
  
  /**
   * Upload success handler
   */
  onUploadSuccess?: (model: THREE.Group) => void;
  
  /**
   * Upload error handler
   */
  onUploadError?: (error: Error) => void;
  
  /**
   * Upload progress handler
   */
  onUploadProgress?: (progress: number) => void;
  
  /**
   * Additional class names
   */
  className?: string;
}
```

**Component Structure:**
- File input with drag-and-drop support
- File validation feedback
- Upload progress indicator
- Error state visualization
- Format guidance information

**State Management:**
- Track selected file
- Monitor upload progress
- Store validation status
- Manage error states

**Unit Tests:**
- Test component rendering
- Validate file selection handling
- Test file validation logic
- Verify upload progress tracking

## Context Providers

### ModelContext

**Purpose:** Manages 3D model state across components.

**File:** `src/stores/ModelContext.tsx`

**State Interface:**
```typescript
interface ModelState {
  /**
   * Current active model
   */
  currentModel: Model | null;
  
  /**
   * Model loading state
   */
  isLoading: boolean;
  
  /**
   * Error state
   */
  error: Error | null;
  
  /**
   * Current transformations
   */
  transformations: TransformOptions;
  
  /**
   * Wireframe rendering state
   */
  isWireframe: boolean;
  
  /**
   * Transformation history
   */
  history: ModelHistoryEntry[];
}

interface Model {
  id: string;
  type: 'wireframe' | 'uploaded';
  object: THREE.Group;
  metadata: ModelMetadata;
}

interface ModelMetadata {
  name: string;
  source: string;
  fileSize?: number;
  format?: 'glb' | 'gltf';
  createdAt: Date;
  modifiedAt: Date;
}

interface ModelHistoryEntry {
  transformations: TransformOptions;
  timestamp: number;
}
```

**Actions:**
```typescript
interface ModelContextActions {
  /**
   * Load a model from URL
   */
  loadModel(url: string): Promise<void>;
  
  /**
   * Create a wireframe model
   */
  createWireframe(options?: WireframeOptions): void;
  
  /**
   * Apply transformation to the current model
   */
  applyTransformation(transform: Partial<TransformOptions>): void;
  
  /**
   * Toggle wireframe rendering mode
   */
  toggleWireframe(enabled?: boolean): void;
  
  /**
   * Undo last transformation
   */
  undoTransformation(): void;
  
  /**
   * Reset model to default state
   */
  resetModel(): void;
  
  /**
   * Clear current model
   */
  clearModel(): void;
}
```

**Implementation Details:**
- Uses React Context API for state management
- Implements useReducer for state transitions
- Provides action creators for model operations
- Manages transformation history with undo capability

**Usage Example:**
```tsx
function ModelControls() {
  const { state, actions } = useModelContext();
  
  const handleRotate = (axis: 'x' | 'y' | 'z', value: number) => {
    const rotation = [...(state.transformations.rotation || [0, 0, 0])];
    
    if (axis === 'x') rotation[0] = value;
    if (axis === 'y') rotation[1] = value;
    if (axis === 'z') rotation[2] = value;
    
    actions.applyTransformation({ rotation });
  };
  
  return (
    <div>
      <button onClick={() => actions.toggleWireframe()}>
        {state.isWireframe ? 'Disable' : 'Enable'} Wireframe
      </button>
      
      {/* Rotation controls */}
      {/* ... */}
    </div>
  );
}
```

### ARContext

**Purpose:** Manages AR state across components.

**File:** `src/stores/ARContext.tsx`

**State Interface:**
```typescript
interface ARState {
  /**
   * WebXR support status
   */
  isSupported: boolean;
  
  /**
   * AR session active state
   */
  isSessionActive: boolean;
  
  /**
   * Detected body data
   */
  bodyData: BodyData | null;
  
  /**
   * Tracking quality assessment
   */
  trackingQuality: TrackingQuality;
  
  /**
   * Camera permission state
   */
  cameraPermissionGranted: boolean;
  
  /**
   * Error state
   */
  error: Error | null;
}
```

**Actions:**
```typescript
interface ARContextActions {
  /**
   * Check WebXR support
   */
  checkSupport(): Promise<void>;
  
  /**
   * Start AR session
   */
  startARSession(): Promise<boolean>;
  
  /**
   * End AR session
   */
  endARSession(): void;
  
  /**
   * Update body tracking data
   */
  updateBodyData(data: BodyData): void;
  
  /**
   * Set tracking quality
   */
  setTrackingQuality(quality: TrackingQuality): void;
  
  /**
   * Check camera permissions
   */
  checkCameraPermission(): Promise<boolean>;
  
  /**
   * Request camera permissions
   */
  requestCameraPermission(): Promise<boolean>;
}
```

**Implementation Details:**
- Uses React Context API for state management
- Implements useReducer for state transitions
- Integrates with ARService for session management
- Handles permission requests and status tracking

**Usage Example:**
```tsx
function ARControls() {
  const { state, actions } = useARContext();
  
  const handleARToggle = async () => {
    if (state.isSessionActive) {
      actions.endARSession();
    } else {
      if (!state.cameraPermissionGranted) {
        const granted = await actions.requestCameraPermission();
        if (!granted) return;
      }
      
      await actions.startARSession();
    }
  };
  
  return (
    <div>
      <button 
        onClick={handleARToggle}
        disabled={!state.isSupported}
      >
        {state.isSessionActive ? 'Exit AR' : 'Enter AR'}
      </button>
      
      {state.isSessionActive && (
        <div className="tracking-indicator">
          Tracking Quality: {state.trackingQuality}
        </div>
      )}
    </div>
  );
}
```

## Utilities

### FileUtils

**Purpose:** Provides utilities for file handling and validation.

**File:** `src/utils/file/FileUtils.ts`

**Interface:**
```typescript
interface FileUtils {
  /**
   * Validate file against constraints
   * @param file File to validate
   * @param options Validation options
   * @returns Validation result
   */
  validateFile(
    file: File, 
    options?: FileValidationOptions
  ): FileValidationResult;
  
  /**
   * Create object URL from file
   * @param file File to create URL for
   * @returns Object URL
   */
  createObjectURL(file: File): string;
  
  /**
   * Revoke object URL
   * @param url URL to revoke
   */
  revokeObjectURL(url: string): void;
  
  /**
   * Read file as data URL
   * @param file File to read
   * @returns Promise resolving to data URL
   */
  readAsDataURL(file: File): Promise<string>;
  
  /**
   * Read file as array buffer
   * @param file File to read
   * @returns Promise resolving to array buffer
   */
  readAsArrayBuffer(file: File): Promise<ArrayBuffer>;
}

interface FileValidationOptions {
  maxSize?: number;
  allowedTypes?: string[];
  allowedExtensions?: string[];
}

interface FileValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
```

**Implementation Details:**
- Wraps browser file APIs with error handling
- Provides consistent validation across the application
- Implements memory management for object URLs
- Creates type-safe interfaces for file operations

### PerformanceMonitor

**Purpose:** Monitors and optimizes application performance.

**File:** `src/utils/performance/PerformanceMonitor.ts`

**Interface:**
```typescript
interface PerformanceMonitor {
  /**
   * Start performance monitoring
   */
  start(): void;
  
  /**
   * Stop performance monitoring
   */
  stop(): void;
  
  /**
   * Get current FPS
   * @returns Current frames per second
   */
  getFPS(): number;
  
  /**
   * Get recommended quality level
   * @returns Quality level (0-4)
   */
  getRecommendedQualityLevel(): number;
  
  /**
   * Set target FPS
   * @param fps Target frames per second
   */
  setTargetFPS(fps: number): void;
  
  /**
   * Register callback for performance updates
   * @param callback Performance update handler
   */
  onUpdate(callback: (stats: PerformanceStats) => void): void;
}

interface PerformanceStats {
  fps: number;
  frameTime: number;
  memoryUsage?: {
    totalJSHeapSize: number;
    usedJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
  gpuInfo?: string;
  recommendedQuality: number;
}
```

**Implementation Details:**
- Tracks frame rate using requestAnimationFrame
- Monitors memory usage when available
- Detects device capabilities for quality recommendations
- Provides optimization suggestions based on performance data

### AccessibilityUtils

**Purpose:** Provides utilities for accessibility features.

**File:** `src/utils/accessibility/AccessibilityUtils.ts`

**Interface:**
```typescript
interface AccessibilityUtils {
  /**
   * Announce message to screen readers
   * @param message Message to announce
   * @param priority Priority level
   */
  announce(message: string, priority?: 'polite' | 'assertive'): void;
  
  /**
   * Register keyboard shortcut
   * @param key Key or key combination
   * @param callback Shortcut handler
   * @param options Additional options
   */
  registerShortcut(
    key: string, 
    callback: () => void, 
    options?: ShortcutOptions
  ): void;
  
  /**
   * Unregister keyboard shortcut
   * @param key Key or key combination
   */
  unregisterShortcut(key: string): void;
  
  /**
   * Focus first element in container
   * @param container Container element
   */
  focusFirstElement(container: HTMLElement): void;
  
  /**
   * Create focus trap
   * @param container Container element
   * @returns Functions to activate/deactivate trap
   */
  createFocusTrap(container: HTMLElement): {
    activate: () => void;
    deactivate: () => void;
  };
}

interface ShortcutOptions {
  global?: boolean;
  preventDefault?: boolean;
  allowInInput?: boolean;
  description?: string;
}
```

**Implementation Details:**
- Manages ARIA live regions for announcements
- Implements keyboard shortcut system
- Provides focus management utilities
- Creates accessibility-friendly UI interactions