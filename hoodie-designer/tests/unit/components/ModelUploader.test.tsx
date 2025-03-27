import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ModelUploader } from '../../../src/components/upload/ModelUploader';
import { ModelService } from '../../../src/services/model/ModelService';

// Mock ModelService
jest.mock('../../../src/services/model/ModelService', () => {
    return {
        // Named export must match the import in the component
        ModelService: jest.fn().mockImplementation(() => ({
            loadModel: jest.fn().mockImplementation((url) =>
                Promise.resolve({
                    id: 'mock-model-id',
                    type: 'uploaded',
                    object: {
                        isGroup: true,
                        children: [],
                        traverse: jest.fn()
                    },
                    metadata: {
                        name: 'mock-model.glb',
                        source: url,
                        createdAt: new Date(),
                        modifiedAt: new Date()
                    }
                })
            )
        }))
    };
});

describe('ModelUploader', () => {
    const mockOnUploadSuccess = jest.fn();
    const mockOnUploadError = jest.fn();
    const mockOnUploadProgress = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

        // Mock URL methods
        global.URL.createObjectURL = jest.fn(() => 'mock-object-url');
        global.URL.revokeObjectURL = jest.fn();
    });

    it('renders the uploader component', () => {
        render(
            <ModelUploader
                onUploadSuccess={mockOnUploadSuccess}
                onUploadError={mockOnUploadError}
            />
        );

        // Check for primary elements
        expect(screen.getByText(/upload model/i)).toBeInTheDocument();
        expect(screen.getByText(/drag and drop/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/upload model/i)).toBeInTheDocument();
    });

    it('shows accepted file formats', () => {
        const customFormats = ['.glb', '.gltf'];
        render(
            <ModelUploader
                onUploadSuccess={mockOnUploadSuccess}
                onUploadError={mockOnUploadError}
                allowedFormats={customFormats}
            />
        );

        expect(screen.getByText(/accepted formats/i)).toBeInTheDocument();
        expect(screen.getByText(customFormats.join(', '))).toBeInTheDocument();
    });

    it('handles file selection through input', async () => {
        render(
            <ModelUploader
                onUploadSuccess={mockOnUploadSuccess}
                onUploadError={mockOnUploadError}
                onUploadProgress={mockOnUploadProgress}
            />
        );

        // Create test file
        const file = new File(['dummy content'], 'model.glb', { type: 'model/gltf-binary' });
        const input = screen.getByLabelText(/upload model/i);

        // Trigger file selection
        fireEvent.change(input, { target: { files: [file] } });

        // Verify progress is reported
        expect(mockOnUploadProgress).toHaveBeenCalledWith(expect.any(Number));

        // Wait for upload to complete
        await waitFor(() => {
            expect(mockOnUploadSuccess).toHaveBeenCalledWith(expect.objectContaining({
                metadata: expect.objectContaining({
                    source: 'mock-object-url'
                })
            }));
        });

        // Verify URL.createObjectURL was called
        expect(global.URL.createObjectURL).toHaveBeenCalledWith(file);
    });

    it('validates file format', async () => {
        render(
            <ModelUploader
                onUploadSuccess={mockOnUploadSuccess}
                onUploadError={mockOnUploadError}
                allowedFormats={['.glb', '.gltf']}
            />
        );

        // Create a file with invalid extension
        const invalidFile = new File(['dummy content'], 'model.obj', { type: 'model/obj' });
        const input = screen.getByLabelText(/upload model/i);

        // Trigger file selection
        fireEvent.change(input, { target: { files: [invalidFile] } });

        // Wait for validation error
        await waitFor(() => {
            expect(mockOnUploadError).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: expect.stringContaining('format')
                })
            );
        });

        // Verify that loadModel was not called (validation failed)
        const mockModelServiceInstance = (ModelService as jest.Mock).mock.results[0].value;
        expect(mockModelServiceInstance.loadModel).not.toHaveBeenCalled();
    });

    it('validates file size', async () => {
        const maxSize = 10; // 10 bytes
        render(
            <ModelUploader
                onUploadSuccess={mockOnUploadSuccess}
                onUploadError={mockOnUploadError}
                maxSize={maxSize}
            />
        );

        // Create a file larger than maxSize
        const largeFile = new File(['dummy content that is larger than 10 bytes'], 'model.glb', { type: 'model/gltf-binary' });
        const input = screen.getByLabelText(/upload model/i);

        // Trigger file selection
        fireEvent.change(input, { target: { files: [largeFile] } });

        // Wait for validation error
        await waitFor(() => {
            expect(mockOnUploadError).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: expect.stringContaining('size')
                })
            );
        });
    });

    it('handles drag and drop', async () => {
        render(
            <ModelUploader
                onUploadSuccess={mockOnUploadSuccess}
                onUploadError={mockOnUploadError}
            />
        );

        const dropzone = screen.getByTestId('upload-dropzone');

        // Test dragover event
        fireEvent.dragOver(dropzone);
        expect(dropzone).toHaveClass('drag-over');

        // Test dragleave event
        fireEvent.dragLeave(dropzone);
        expect(dropzone).not.toHaveClass('drag-over');

        // Test drop event
        const file = new File(['dummy content'], 'model.glb', { type: 'model/gltf-binary' });
        fireEvent.drop(dropzone, {
            dataTransfer: {
                files: [file]
            }
        });

        // Wait for upload to complete
        await waitFor(() => {
            expect(mockOnUploadSuccess).toHaveBeenCalled();
        });
    });

    it('shows error message when present', async () => {
        // Mock ModelService to reject
        const mockLoadModel = jest.fn().mockRejectedValue(new Error('Mock loading error'));
        (ModelService as jest.Mock).mockImplementation(() => ({
            loadModel: mockLoadModel
        }));

        render(
            <ModelUploader
                onUploadSuccess={mockOnUploadSuccess}
                onUploadError={mockOnUploadError}
            />
        );

        // Create test file
        const file = new File(['dummy content'], 'model.glb', { type: 'model/gltf-binary' });
        const input = screen.getByLabelText(/upload model/i);

        // Trigger file selection
        fireEvent.change(input, { target: { files: [file] } });

        // Wait for error to be reported
        await waitFor(() => {
            expect(mockOnUploadError).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Mock loading error'
                })
            );
        });
    });

    it('resets error when new file is selected', async () => {
        // Arrange - start with an error
        const { rerender } = render(
            <ModelUploader
                onUploadSuccess={mockOnUploadSuccess}
                onUploadError={mockOnUploadError}
            />
        );

        // Create test file that will cause an error
        const invalidFile = new File(['dummy content'], 'invalid.txt', { type: 'text/plain' });
        const input = screen.getByLabelText(/upload model/i);

        // Act - trigger file selection that will cause an error
        fireEvent.change(input, { target: { files: [invalidFile] } });

        // Wait for error
        await waitFor(() => {
            expect(mockOnUploadError).toHaveBeenCalled();
        });

        // Clear mocks for next test
        jest.clearAllMocks();

        // Create valid file
        const validFile = new File(['dummy content'], 'model.glb', { type: 'model/gltf-binary' });

        // Act - trigger file selection with valid file
        fireEvent.change(input, { target: { files: [validFile] } });

        // Assert - error should be cleared and success callback called
        await waitFor(() => {
            expect(mockOnUploadSuccess).toHaveBeenCalled();
        });
    });

    it('displays the maximum file size', () => {
        const maxSize = 5 * 1024 * 1024; // 5MB
        render(
            <ModelUploader
                onUploadSuccess={mockOnUploadSuccess}
                onUploadError={mockOnUploadError}
                maxSize={maxSize}
            />
        );

        expect(screen.getByText(/maximum size/i)).toBeInTheDocument();
        expect(screen.getByText(/5 MB/i)).toBeInTheDocument();
    });

    it('handles empty file list', async () => {
        render(
            <ModelUploader
                onUploadSuccess={mockOnUploadSuccess}
                onUploadError={mockOnUploadError}
            />
        );

        const input = screen.getByLabelText(/upload model/i);

        // Trigger file selection with empty file list
        fireEvent.change(input, { target: { files: [] } });

        // Verify no callbacks were called
        expect(mockOnUploadSuccess).not.toHaveBeenCalled();
        expect(mockOnUploadError).not.toHaveBeenCalled();
    });
});