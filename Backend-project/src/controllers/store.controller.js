import storeService from "../services/store.service.js";
import ApiResponse from "../utils/apiResponse.js";

class StoreController {
    async getStores(req, res, next) {
        try {
            const data = await storeService.getStores(req.query);
            return ApiResponse.success(res, data, "Stores fetched successfully.");
        } catch (error) {
            next(error);
        }
    }

    async getTopRatedStores(req, res, next) {
        try {
            const limit = Number(req.query.limit) || 8;
            const data = await storeService.getTopRatedStores(limit);
            return ApiResponse.success(res, data, "Top stores fetched successfully.");
        } catch (error) {
            next(error);
        }
    }

    async getStoreBySlug(req, res, next) {
        try {
            const { slug } = req.params;
            const data = await storeService.getStoreBySlug(slug);
            if (!data) {
                return ApiResponse.error(res, "Store not found", 404);
            }
            return ApiResponse.success(res, data, "Store details fetched successfully.");
        } catch (error) {
            next(error);
        }
    }
}

export default new StoreController();
