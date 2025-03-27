import { FileService } from '../../../src/services/file/FileService';

describe('FileService', () => {
    let fileService: FileService;

    beforeEach(() => {
        fileService = new FileService();

        // Mock URL functions
        global.URL.createObjectURL = jest.fn(() => 'mock-object-url');
        global.URL.revokeObjectURL = jest.fn();
    });

    describe('validateFile', () => {
        it('should validate file with no constraints', () => {
            const file = new File(['test content'], 'test.txt', { type: 'text/plain' });

            const result = fileService.validateFile(file);

            expect(result.valid).toBe(true);
            expect(result.errors.length).toBe(0);
        });

        it('should validate file size', () => {
            const file = new File(['test content'], 'test.txt', { type: 'text/plain' });

            // File too large
            const resultTooLarge = fileService.validateFile(file, { maxSize: 5 });
            expect(resultTooLarge.valid).toBe(false);
            expect(resultTooLarge.errors.length).toBe(1);
            expect(resultTooLarge.errors[0]).toContain('size exceeds maximum');

            // File size acceptable
            const resultAcceptable = fileService.validateFile(file, { maxSize: 20 });
            expect(resultAcceptable.valid).toBe(true);
            expect(resultAcceptable.errors.length).toBe(0);
        });

        it('should validate file type', () => {
            const file = new File(['test content'], 'test.txt', { type: 'text/plain' });

            // Incorrect type
            const resultWrongType = fileService.validateFile(file, {
                allowedTypes: ['application/json', 'application/xml']
            });
            expect(resultWrongType.valid).toBe(false);
            expect(resultWrongType.errors.length).toBe(1);
            expect(resultWrongType.errors[0]).toContain('type');

            // Correct type
            const resultCorrectType = fileService.validateFile(file, {
                allowedTypes: ['text/plain', 'text/html']
            });
            expect(resultCorrectType.valid).toBe(true);
            expect(resultCorrectType.errors.length).toBe(0);
        });

        it('should validate file extension', () => {
            const file = new File(['test content'], 'test.txt', { type: 'text/plain' });

            // Incorrect extension
            const resultWrongExtension = fileService.validateFile(file, {
                allowedExtensions: ['.json', '.xml']
            });
            expect(resultWrongExtension.valid).toBe(false);
            expect(resultWrongExtension.errors.length).toBe(1);
            expect(resultWrongExtension.errors[0]).toContain('extension');

            // Correct extension
            const resultCorrectExtension = fileService.validateFile(file, {
                allowedExtensions: ['.txt', '.html']
            });
            expect(resultCorrectExtension.valid).toBe(true);
            expect(resultCorrectExtension.errors.length).toBe(0);
        });

        it('should validate multiple constraints', () => {
            const file = new File(['test content'], 'test.txt', { type: 'text/plain' });

            const result = fileService.validateFile(file, {
                maxSize: 5, // Too small
                allowedTypes: ['text/plain'], // Correct
                allowedExtensions: ['.json'] // Incorrect
            });

            expect(result.valid).toBe(false);
            expect(result.errors.length).toBe(2);
            expect(result.errors[0]).toContain('size');
            expect(result.errors[1]).toContain('extension');
        });
    });

    describe('URL handling', () => {
        it('should create object URL', () => {
            const file = new File(['test content'], 'test.txt', { type: 'text/plain' });

            const url = fileService.createObjectURL(file);

            expect(url).toBe('mock-object-url');
            expect(global.URL.createObjectURL).toHaveBeenCalledWith(file);
        });

        it('should revoke object URL', () => {
            fileService.revokeObjectURL('test-url');

            expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('test-url');
        });
    });

    describe('file reading', () => {
        it('should read file as data URL', async () => {
            const file = new File(['test content'], 'test.txt', { type: 'text/plain' });

            // Mock FileReader
            const mockDataUrl = 'data:text/plain;base64,dGVzdCBjb250ZW50';
            const mockFileReader = {
                onload: null as any,
                onerror: null as any,
                readAsDataURL: jest.fn().mockImplementation(function (this: any, blob) {
                    setTimeout(() => {
                        this.result = mockDataUrl;
                        this.onload();
                    }, 0);
                }),
            };

            // @ts-ignore
            global.FileReader = jest.fn(() => mockFileReader);

            const result = await fileService.readAsDataURL(file);

            expect(result).toBe(mockDataUrl);
        });

        it('should read file as array buffer', async () => {
            const file = new File(['test content'], 'test.txt', { type: 'text/plain' });

            // Mock FileReader
            const mockArrayBuffer = new ArrayBuffer(8);
            const mockFileReader = {
                onload: null as any,
                onerror: null as any,
                readAsArrayBuffer: jest.fn().mockImplementation(function (this: any, blob) {
                    setTimeout(() => {
                        this.result = mockArrayBuffer;
                        this.onload();
                    }, 0);
                }),
            };

            // @ts-ignore
            global.FileReader = jest.fn(() => mockFileReader);

            const result = await fileService.readAsArrayBuffer(file);

            expect(result).toBe(mockArrayBuffer);
        });

        it('should handle file reading errors', async () => {
            const file = new File(['test content'], 'test.txt', { type: 'text/plain' });

            // Mock FileReader with error
            const mockFileReader = {
                onload: null as any,
                onerror: null as any,
                readAsDataURL: jest.fn().mockImplementation(function (this: any, blob) {
                    setTimeout(() => {
                        this.onerror(new Error('Mock reading error'));
                    }, 0);
                }),
            };

            // @ts-ignore
            global.FileReader = jest.fn(() => mockFileReader);

            await expect(fileService.readAsDataURL(file)).rejects.toThrow('Error reading file');
        });
    });
});