import React, { useState, useRef, useEffect } from 'react';
import { ModelService } from '../../services/model/ModelService';
import { Model } from '../../types/Model';

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
    onUploadSuccess?: (model: Model) => void;

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

interface ValidationResult {
    valid: boolean;
    error?: string;
}

export const ModelUploader: React.FC<ModelUploaderProps> = ({
    maxSize = 50 * 1024 * 1024, // 50MB default
    allowedFormats = ['.glb', '.gltf'],
    onUploadSuccess,
    onUploadError,
    onUploadProgress,
    className = '',
}) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const modelService = new ModelService();

    // Format file size for display
    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} bytes`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    // Validate file
    const validateFile = (file: File): ValidationResult => {
        // Check file size
        if (file.size > maxSize) {
            return {
                valid: false,
                error: `File size exceeds maximum of ${formatFileSize(maxSize)}`
            };
        }

        // Check file extension
        const fileName = file.name.toLowerCase();
        const hasValidExtension = allowedFormats.some(ext => fileName.endsWith(ext.toLowerCase()));

        if (!hasValidExtension) {
            return {
                valid: false,
                error: `File format not supported. Please use: ${allowedFormats.join(', ')}`
            };
        }

        return { valid: true };
    };

    // Handle file selection
    const handleFileSelect = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const file = files[0];
        setError(null);

        // Validate file
        const validation = validateFile(file);
        if (!validation.valid) {
            setError(validation.error || 'Invalid file');
            onUploadError?.(new Error(validation.error || 'Invalid file'));
            return;
        }

        // Process file
        try {
            setIsUploading(true);
            setUploadProgress(0);

            // Simulate progress for UX purposes
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    const nextProgress = Math.min(prev + 10, 90);
                    onUploadProgress?.(nextProgress);
                    return nextProgress;
                });
            }, 300);

            // Create object URL for the file
            const fileUrl = URL.createObjectURL(file);

            // Load model using ModelService
            const model = await modelService.loadModel(fileUrl);

            clearInterval(progressInterval);
            setUploadProgress(100);
            onUploadProgress?.(100);

            // Call success callback
            onUploadSuccess?.(model);
        } catch (err) {
            // Handle errors
            const error = err instanceof Error ? err : new Error('Unknown error uploading file');
            setError(error.message);
            onUploadError?.(error);
        } finally {
            setIsUploading(false);
        }
    };

    // Handle file input change
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        handleFileSelect(event.target.files);
    };

    // Handle click on upload area
    const handleUploadClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // Handle drag events
    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragOver(false);
        handleFileSelect(event.dataTransfer.files);
    };

    return (
        <div
            className={`model-uploader ${className}`}
            style={{
                width: '100%',
                maxWidth: '500px',
                margin: '0 auto'
            }}
        >
            <div
                data-testid="upload-dropzone"
                className={`upload-area ${isDragOver ? 'drag-over' : ''}`}
                style={{
                    border: `2px dashed ${isDragOver ? '#3B82F6' : '#ccc'}`,
                    borderRadius: '8px',
                    padding: '30px 20px',
                    textAlign: 'center',
                    backgroundColor: isDragOver ? 'rgba(59, 130, 246, 0.05)' : '#f9f9f9',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                }}
                onClick={handleUploadClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={allowedFormats.join(',')}
                    onChange={handleInputChange}
                    style={{ display: 'none' }}
                    aria-label="Upload model"
                />

                <div className="upload-icon" style={{ marginBottom: '15px' }}>
                    {/* Upload icon would go here */}
                    <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 15V3M12 3L7 8M12 3L17 8" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M3 15V19C3 19.5304 3.21071 20.0391 3.58579 20.4142C3.96086 20.7893 4.46957 21 5 21H19C19.5304 21 20.0391 20.7893 20.4142 20.4142C20.7893 20.0391 21 19.5304 21 19V15" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>

                <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Upload Model</h3>

                <p style={{ margin: '0 0 15px 0', color: '#666' }}>
                    Drag and drop your 3D model here, or click to browse
                </p>

                <p style={{ margin: '0', fontSize: '14px', color: '#888' }}>
                    Accepted formats: {allowedFormats.join(', ')}
                </p>

                <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#888' }}>
                    Maximum size: {formatFileSize(maxSize)}
                </p>
            </div>

            {isUploading && (
                <div className="upload-progress" style={{ marginTop: '15px' }}>
                    <div style={{ height: '4px', backgroundColor: '#eee', borderRadius: '2px', overflow: 'hidden' }}>
                        <div
                            style={{
                                height: '100%',
                                width: `${uploadProgress}%`,
                                backgroundColor: '#3B82F6',
                                transition: 'width 0.3s ease'
                            }}
                        />
                    </div>
                    <p style={{ textAlign: 'center', margin: '5px 0 0 0', color: '#666' }}>
                        Uploading... {uploadProgress}%
                    </p>
                </div>
            )}

            {error && (
                <div className="upload-error" style={{ marginTop: '15px', color: '#ef4444', textAlign: 'center' }}>
                    <p style={{ margin: '0' }}>{error}</p>
                </div>
            )}
        </div>
    );
};