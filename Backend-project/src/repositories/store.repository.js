import Store from "../models/store.model.js";
import Product from "../models/Product.js";

class StoreRepository {
    async getStores(query = {}) {
        const filter = { isActive: true };
        if (query.city) {
            filter["pickupAddress.city"] = new RegExp(`^${query.city}$`, "i");
        }
        return Store.find(filter)
            .select("name slug tagline description logo banner rating totalReviews pickupAddress deliveryOptions")
            .sort({ rating: -1, totalReviews: -1 })
            .limit(30);
    }

    async getTopRatedStores(limit = 8) {
        return Store.find({ isActive: true })
            .select("name slug tagline logo banner rating totalReviews pickupAddress deliveryOptions")
            .sort({ rating: -1, totalReviews: -1 })
            .limit(limit);
    }

    async getStoreBySlug(slug) {
        const store = await Store.findOne({ slug: slug.toLowerCase(), isActive: true })
            .populate("sellerId", "name email");

        if (!store) return null;

        const products = await Product.find({ storeId: store._id, approvalStatus: "approved" })
            .sort({ isFeatured: -1, total_reviews: -1 })
            .limit(40);

        return {
            store,
            products,
            totalProducts: products.length,
        };
    }
}

export default new StoreRepository();
