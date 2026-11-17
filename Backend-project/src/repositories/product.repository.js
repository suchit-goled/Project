import Product from "../models/Product.js";

class ProductRepository {

    async getProducts(query = {}, page = 1, limit = 20) {
        const rawSearch = Array.isArray(query.search) ? query.search[0] : query.search;
        const rawCategory = Array.isArray(query.category) ? query.category[0] : query.category;
        const rawSort = Array.isArray(query.sort) ? query.sort[0] : query.sort;
        const rawRating = Array.isArray(query.rating) ? query.rating[0] : query.rating;
        const rawMinDiscount = Array.isArray(query.minDiscount) ? query.minDiscount[0] : query.minDiscount;
        const rawMinPrice = Array.isArray(query.minPrice) ? query.minPrice[0] : query.minPrice;
        const rawMaxPrice = Array.isArray(query.maxPrice) ? query.maxPrice[0] : query.maxPrice;

        const filter = {};

        // Escape regex special characters to prevent ReDoS / RegExp injection
        if (rawSearch && typeof rawSearch === "string" && rawSearch.trim()) {
            const escapedSearch = rawSearch.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            filter.product_title = {
                $regex: escapedSearch,
                $options: "i"
            };
        }

        // Case-insensitive Category matching
        if (rawCategory && typeof rawCategory === "string" && rawCategory.trim() && rawCategory.trim().toLowerCase() !== "all") {
            const escapedCategory = rawCategory.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            filter.product_category = {
                $regex: `^${escapedCategory}$`,
                $options: "i"
            };
        }

        // Price Filter
        const hasMinPrice = rawMinPrice !== undefined && rawMinPrice !== "" && !isNaN(Number(rawMinPrice));
        const hasMaxPrice = rawMaxPrice !== undefined && rawMaxPrice !== "" && !isNaN(Number(rawMaxPrice));

        if (hasMinPrice || hasMaxPrice) {
            filter.discounted_price = {};
            let minVal = hasMinPrice ? Math.max(0, Number(rawMinPrice)) : null;
            let maxVal = hasMaxPrice ? Math.max(0, Number(rawMaxPrice)) : null;

            // If both provided and inverted, gracefully swap them
            if (minVal !== null && maxVal !== null && minVal > maxVal) {
                const temp = minVal;
                minVal = maxVal;
                maxVal = temp;
            }

            if (minVal !== null) {
                filter.discounted_price.$gte = minVal;
            }
            if (maxVal !== null) {
                filter.discounted_price.$lte = maxVal;
            }
        }

        // Rating Filter
        if (rawRating && !isNaN(Number(rawRating)) && Number(rawRating) > 0) {
            filter.product_rating = {
                $gte: Number(rawRating)
            };
        }

        // Minimum Discount Filter
        if (rawMinDiscount && !isNaN(Number(rawMinDiscount)) && Number(rawMinDiscount) > 0) {
            filter.discount_percentage = {
                $gte: Number(rawMinDiscount)
            };
        }

        // Sorting
        let sortOption = {};
        switch (rawSort) {
            case "priceLow":
            case "low":
                sortOption.discounted_price = 1;
                break;
            case "priceHigh":
            case "high":
                sortOption.discounted_price = -1;
                break;
            case "rating":
                sortOption.product_rating = -1;
                break;
            case "discount":
                sortOption.discount_percentage = -1;
                break;
            case "titleAsc":
            case "nameAsc":
                sortOption.product_title = 1;
                break;
            case "titleDesc":
            case "nameDesc":
                sortOption.product_title = -1;
                break;
            case "newest":
            case "latest":
            default:
                sortOption._id = -1;
        }

        const validPage = Math.max(1, Number(page) || 1);
        const validLimit = Math.max(1, Math.min(100, Number(limit) || 20));

        const total = await Product.countDocuments(filter);

        const products = await Product.find(filter)
            .sort(sortOption)
            .skip((validPage - 1) * validLimit)
            .limit(validLimit);

        return {
            products,
            total,
            page: validPage,
            totalPages: Math.ceil(total / validLimit)
        };
    }

    async getFeaturedProducts() {
        return Product.find({ isFeatured: true }).limit(10);
    }

    async getProductById(id) {
        return Product.findById(id);
    }

    async getCategories() {
        const rawCats = await Product.distinct("product_category");
        // Filter out empty or null, clean and deduplicate case-insensitively
        const cleanMap = new Map();
        for (const cat of rawCats) {
            if (cat && typeof cat === "string" && cat.trim()) {
                const trimmed = cat.trim();
                const lower = trimmed.toLowerCase();
                if (!cleanMap.has(lower)) {
                    // Standardize display name (capitalize first letter)
                    const formatted = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
                    cleanMap.set(lower, formatted);
                }
            }
        }
        return Array.from(cleanMap.values()).sort();
    }

    async getRelatedProducts(productId, limit = 4) {
        const current = await Product.findById(productId);
        if (!current) return [];

        return Product.find({
            product_category: current.product_category,
            _id: { $ne: current._id }
        })
        .limit(limit);
    }

    async createProduct(productData) {
        return await Product.create(productData);
    }

    async updateProduct(id, productData) {
        return await Product.findByIdAndUpdate(
            id,
            productData,
            { new: true, runValidators: true }
        );
    }

    async deleteProduct(id) {
        return await Product.findByIdAndDelete(id);
    }

    async getAllProducts() {
        return await Product.find().sort({ _id: -1 }).limit(100);
    }
}

export default new ProductRepository();
