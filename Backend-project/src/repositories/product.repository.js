import Product from "../models/Product.js";

class ProductRepository {

    async getProducts(query, page = 1, limit = 20) {
        const {
            search,
            category,
            minPrice,
            maxPrice,
            rating,
            sort
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

        // Filter by category
        if (category && typeof category === "string" && category.trim()) {
            filter.product_category = category.trim();
        }

        // Filter by price
        if (minPrice || maxPrice) {
            filter.discounted_price = {};
            if (minPrice && !isNaN(Number(minPrice))) {
                filter.discounted_price.$gte = Number(minPrice);
            }
            if (maxPrice && !isNaN(Number(maxPrice))) {
                filter.discounted_price.$lte = Number(maxPrice);
            }
        }

        // Filter by rating
        if (rating && !isNaN(Number(rating))) {
            filter.product_rating = {
                $gte: Number(rating)
            };
        }

        // Sorting
        let sortOption = {};
        switch (sort) {
            case "priceLow":
                sortOption.discounted_price = 1;
                break;
            case "priceHigh":
                sortOption.discounted_price = -1;
                break;
            case "rating":
                sortOption.product_rating = -1;
                break;
            case "latest":
                sortOption.createdAt = -1;
                break;
            default:
                sortOption.createdAt = -1;
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
        return Product.find({ isFeatured: true }).limit(8);
    }

    async getProductById(id) {
        return Product.findById(id);
    }

    async createProduct(productData) {
        return await Product.create(productData);
    }

    async updateProduct(id, productData) {
        return await Product.findByIdAndUpdate(
            id,
            productData,
            {
                new: true,
                runValidators: true,
            }
        );
    }

    async deleteProduct(id) {
        return await Product.findByIdAndDelete(id);
    }

    async getAllProducts() {
        return await Product.find().sort({ createdAt: -1 });
    }
}

export default new ProductRepository();