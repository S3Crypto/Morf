import { ModelService } from '../../../src/services/model/ModelService';

// Test to verify that ModelService can be properly instantiated
describe('ModelService instantiation', () => {
    it('should be able to create a ModelService instance', () => {
        const modelService = new ModelService();
        expect(modelService).toBeInstanceOf(ModelService);
    });
});