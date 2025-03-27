import React, { useState } from 'react';
import { ModelViewer } from './components/model/ModelViewer';
import { ControlPanel } from './components/controls/ControlPanel';
import { ModelUploader } from './components/upload/ModelUploader';
import { ModelProvider, useModelContext } from './stores/ModelContext';
import { TransformOptions } from './types/Model';
import './App.css';

enum ViewMode {
  STANDARD = 'standard',
  AR = 'ar'
}

const AppContent: React.FC = () => {
  const { state, actions } = useModelContext();
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.STANDARD);

  // Handle transformation changes from control panel
  const handleTransformChange = (transform: TransformOptions) => {
    actions.applyTransformation(transform);
  };

  // Handle wireframe toggle
  const handleWireframeToggle = (enabled: boolean) => {
    actions.toggleWireframe(enabled);
  };

  // Handle mode change
  const handleModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  // Handle model upload
  const handleModelUpload = (model: any) => {
    actions.clearModel(); // First clear any existing model
    actions.loadModel(model.metadata.source);
  };

  // Handle model upload error
  const handleUploadError = (error: Error) => {
    console.error('Model upload error:', error);
    // Error handling will be improved in later phases
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>3D Hoodie Designer</h1>
        <div className="app-actions">
          <button
            onClick={() => actions.createWireframe()}
            className="action-button"
          >
            Create Default Hoodie
          </button>
          <button
            onClick={() => actions.resetModel()}
            className="action-button"
            disabled={!state.currentModel}
          >
            Reset Model
          </button>
          <button
            onClick={() => actions.clearModel()}
            className="action-button"
            disabled={!state.currentModel}
          >
            Clear Model
          </button>
        </div>
      </header>

      <main className="app-main">
        <div className="model-container">
          <ModelViewer
            model={state.currentModel}
            wireframe={state.isWireframe}
            transformations={state.transformations}
          />

          <ControlPanel
            onTransformChange={handleTransformChange}
            onWireframeToggle={handleWireframeToggle}
            onModeChange={handleModeChange}
            initialTransform={state.transformations}
            initialWireframe={state.isWireframe}
            placement="right"
          />
        </div>

        {!state.currentModel && (
          <div className="upload-container">
            <h2>Get Started</h2>
            <p>Upload a 3D model or create a wireframe hoodie</p>
            <ModelUploader
              onUploadSuccess={handleModelUpload}
              onUploadError={handleUploadError}
              allowedFormats={['.glb', '.gltf']}
            />
          </div>
        )}

        {state.error && (
          <div className="error-container">
            <p>Error: {state.error.message}</p>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>3D Hoodie Designer - Phase 1</p>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ModelProvider>
      <AppContent />
    </ModelProvider>
  );
};

export default App;