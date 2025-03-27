import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ModelUploader } from '../../../src/components/upload/ModelUploader';

describe('ModelUploader', () => {
    const mockOnUploadSuccess = jest.fn();
    const mockOnUploadError = jest.fn();
    const mockOnUploadProgress = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the uploader component', () => {
        render(
            <ModelUploader
                onUploadSuccess={mockOnUploadSuccess}
                onUploadError={mockOnUploadError}
            />
        );

        expect(screen.getByText(/upload model/i)).toBeInTheDocument();
        expect(screen.getByText(/drag and drop/i)).toBeInTheDocument();
    });

    it('shows accepted file formats', () => {
        render(
            <ModelUploader
                onUploadSuccess={mockOnUploadSuccess}
                onUploadError={mockOnUploadError}
                allowedFormats={['.glb', '.gltf']}
            />
        );

        expect(screen.getByText(/accepted formats/i)).toBeInTheDocument();
        expect(screen.getByText(/\.glb, \.gltf/i)).toBeInTheDocument();
    });

    it('handles file selection through input', async () => {
        render(
            <ModelUploader
                onUploadSuccess={mockOnUploadSuccess}
                onUploadError={mockOnUploadError}
            />
        );

        const file = new File(['dummy content'], 'model.glb', { type: 'model/gltf-binary' });
        const input = screen.getByLabelText(/upload model/i);

        // Mock URL.createObjectURL
        URL.createObjectURL = jest.fn(() => 'mock-url');

        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            expect(mockOnUploadSuccess).toHaveBeenCalled();
        });
    });

    it('validates file format', async () => {
        render(
            <ModelUploader
                onUploadSuccess={mockOnUploadSuccess}
                onUploadError={mockOnUploadError}
                allowedFormats={['.glb', '.gltf']}
            />
        );

        const file = new File(['dummy content'], 'model.obj', { type: 'model/obj' });
        const input = screen.getByLabelText(/upload model/i);

        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            expect(mockOnUploadError).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: expect.stringContaining('format')
                })
            );
        });
    });

    it('validates file size', async () => {
        render(
            <ModelUploader
                onUploadSuccess={mockOnUploadSuccess}
                onUploadError={mockOnUploadError}
                maxSize={10} // 10 bytes
            />
        );

        // Create a file larger than 10 bytes
        const file = new File(['dummy content that is larger than 10 bytes'], 'model.glb', { type: 'model/gltf-binary' });
        const input = screen.getByLabelText(/upload model/i);

        fireEvent.change(input, { target: { files: [file] } });

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

        // Simulate drag events
        fireEvent.dragOver(dropzone);

        expect(dropzone).toHaveClass('drag-over');

        fireEvent.dragLeave(dropzone);

        expect(dropzone).not.toHaveClass('drag-over');

        // Mock URL.createObjectURL
        URL.createObjectURL = jest.fn(() => 'mock-url');

        // Simulate drop event
        const file = new File(['dummy content'], 'model.glb', { type: 'model/gltf-binary' });
        fireEvent.drop(dropzone, {
            dataTransfer: {
                files: [file]
            }
        });

        await waitFor(() => {
            expect(mockOnUploadSuccess).toHaveBeenCalled();
        });
    });
});