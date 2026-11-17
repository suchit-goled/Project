import storeRepository from "../repositories/store.repository.js";

class StoreService {
    async getStores(query) {
        return await storeRepository.getStores(query);
    }

    async getTopRatedStores(limit) {
        return await storeRepository.getTopRatedStores(limit);
    }

    async getStoreBySlug(slug) {
        return await storeRepository.getStoreBySlug(slug);
    }
}

export default new StoreService();
