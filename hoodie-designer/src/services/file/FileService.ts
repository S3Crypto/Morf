export interface FileValidationOptions {
    maxSize?: number;
    allowedTypes?: string[];
    allowedExtensions?: string[];
}

export interface FileValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}

export class FileService {
    /**
     * Validate file against constraints
     * @param file File to validate
     * @param options Validation options
     * @returns Validation result
     */
    validateFile(
        file: File,
        options: FileValidationOptions = {}
    ): FileValidationResult {
        const result: FileValidationResult = {
            valid: true,
            errors: [],
            warnings: []
        };

        // Check file size
        if (options.maxSize && file.size > options.maxSize) {
            result.valid = false;
            result.errors.push(`File size exceeds maximum of ${this.formatFileSize(options.maxSize)}`);
        }

        // Check mime type
        if (options.allowedTypes && options.allowedTypes.length > 0) {
            const mimeType = file.type.toLowerCase();
            if (!options.allowedTypes.some(type => mimeType === type.toLowerCase())) {
                result.valid = false;
                result.errors.push(`File type ${file.type} is not allowed. Allowed types: ${options.allowedTypes.join(', ')}`);
            }
        }

        // Check file extension
        if (options.allowedExtensions && options.allowedExtensions.length > 0) {
            const fileName = file.name.toLowerCase();
            const hasValidExtension = options.allowedExtensions.some(ext =>
                fileName.endsWith(ext.toLowerCase())
            );

            if (!hasValidExtension) {
                result.valid = false;
                result.errors.push(`File extension is not allowed. Allowed extensions: ${options.allowedExtensions.join(', ')}`);
            }
        }

        return result;
    }

    /**
     * Create object URL from file
     * @param file File to create URL for
     * @returns Object URL
     */
    createObjectURL(file: File): string {
        return URL.createObjectURL(file);
    }

    /**
     * Revoke object URL
     * @param url URL to revoke
     */
    revokeObjectURL(url: string): void {
        URL.revokeObjectURL(url);
    }

    /**
     * Read file as data URL
     * @param file File to read
     * @returns Promise resolving to data URL
     */
    readAsDataURL(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = () => {
                if (typeof reader.result === 'string') {
                    resolve(reader.result);
                } else {
                    reject(new Error('Failed to read file as data URL'));
                }
            };

            reader.onerror = () => {
                reject(new Error('Error reading file'));
            };

            reader.readAsDataURL(file);
        });
    }

    /**
     * Read file as array buffer
     * @param file File to read
     * @returns Promise resolving to array buffer
     */
    readAsArrayBuffer(file: File): Promise<ArrayBuffer> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = () => {
                if (reader.result instanceof ArrayBuffer) {
                    resolve(reader.result);
                } else {
                    reject(new Error('Failed to read file as array buffer'));
                }
            };

            reader.onerror = () => {
                reject(new Error('Error reading file'));
            };

            reader.readAsArrayBuffer(file);
        });
    }

    /**
     * Format file size for display
     * @param bytes File size in bytes
     * @returns Formatted file size string
     */
    private formatFileSize(bytes: number): string {
        if (bytes < 1024) {
            return `${bytes} bytes`;
        } else if (bytes < 1024 * 1024) {
            return `${(bytes / 1024).toFixed(2)} KB`;
        } else if (bytes < 1024 * 1024 * 1024) {
            return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
        } else {
            return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
        }
    }
}