import Product from "../models/Product.js";

class ProductRepository {

    async getProducts(query, page = 1, limit = 20) {
        const {
            search,
            category,
            minPrice,
            maxPrice,
            rating,
            sort,
            minDiscount
        } = query;

        const filter = {};

        // Escape regex special characters to prevent ReDoS / RegExp injection
        if (search && typeof search === "string" && search.trim()) {
            const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            filter.product_title = {
                $regex: escapedSearch,
                $options: "i"
            };
        }

        // Case-insensitive Category matching
        if (category && typeof category === "string" && category.trim() && category.trim().toLowerCase() !== "all") {
            const escapedCategory = category.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            filter.product_category = {
                $regex: `^${escapedCategory}$`,
                $options: "i"
            };
        }

        // Price Filter
        if (minPrice || maxPrice) {
            filter.discounted_price = {};
            if (minPrice && !isNaN(Number(minPrice))) {
                filter.discounted_price.$gte = Number(minPrice);
            }
            if (maxPrice && !isNaN(Number(maxPrice))) {
                filter.discounted_price.$lte = Number(maxPrice);
            }
        }

        // Rating Filter
        if (rating && !isNaN(Number(rating)) && Number(rating) > 0) {
            filter.product_rating = {
                $gte: Number(rating)
            };
        }

        // Minimum Discount Filter
        if (minDiscount && !isNaN(Number(minDiscount)) && Number(minDiscount) > 0) {
            filter.discount_percentage = {
                $gte: Number(minDiscount)
            };
        }

        // Sorting
        let sortOption = {};
        switch (sort) {
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
