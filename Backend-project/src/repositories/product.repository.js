import mongoose from "mongoose";
import Product from "../models/Product.js";
import Store from "../models/store.model.js";
import Category from "../models/category.model.js";
import Brand from "../models/brand.model.js";

class ProductRepository {

    async getProducts(query = {}, page = 1, limit = 20) {
        const rawSearch = Array.isArray(query.search) ? query.search[0] : query.search;
        const rawCategory = Array.isArray(query.category) ? query.category[0] : query.category;
        const rawBrand = Array.isArray(query.brand) ? query.brand[0] : query.brand;
        const rawStoreId = Array.isArray(query.storeId) ? query.storeId[0] : query.storeId;
        const rawSort = Array.isArray(query.sort) ? query.sort[0] : query.sort;
        const rawRating = Array.isArray(query.rating) ? query.rating[0] : query.rating;
        const rawMinDiscount = Array.isArray(query.minDiscount) ? query.minDiscount[0] : query.minDiscount;
        const rawMinPrice = Array.isArray(query.minPrice) ? query.minPrice[0] : query.minPrice;
        const rawMaxPrice = Array.isArray(query.maxPrice) ? query.maxPrice[0] : query.maxPrice;

        const filter = {};

        // Escape regex special characters to prevent ReDoS / RegExp injection
        if (rawSearch && typeof rawSearch === "string" && rawSearch.trim()) {
            const escapedSearch = rawSearch.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            filter.$or = [
                { product_title: { $regex: escapedSearch, $options: "i" } },
                { brand: { $regex: escapedSearch, $options: "i" } },
                { description: { $regex: escapedSearch, $options: "i" } },
            ];
        }

        // Case-insensitive Category matching
        if (rawCategory && typeof rawCategory === "string" && rawCategory.trim() && rawCategory.trim().toLowerCase() !== "all") {
            const escapedCategory = rawCategory.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            filter.product_category = {
                $regex: `^${escapedCategory}$`,
                $options: "i"
            };
        }

        // Brand matching
        if (rawBrand && typeof rawBrand === "string" && rawBrand.trim() && rawBrand.trim().toLowerCase() !== "all") {
            const escapedBrand = rawBrand.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            filter.brand = {
                $regex: `^${escapedBrand}$`,
                $options: "i"
            };
        }

        // Store matching
        if (rawStoreId && mongoose.isValidObjectId(rawStoreId)) {
            filter.storeId = rawStoreId;
        }

        // Seller matching
        if (query.sellerId && mongoose.isValidObjectId(query.sellerId)) {
            filter.sellerId = query.sellerId;
        }

        // In Stock filter
        if (query.inStock === "true" || query.inStock === true) {
            filter.stock = { $gt: 0 };
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
            case "price_asc":
            case "low":
                sortOption.discounted_price = 1;
                break;
            case "priceHigh":
            case "price_desc":
            case "high":
                sortOption.discounted_price = -1;
                break;
            case "popularity":
            case "popular":
                sortOption.total_reviews = -1;
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

        let queryBuilder = Product.find(filter)
            .sort(sortOption)
            .skip((validPage - 1) * validLimit)
            .limit(validLimit);

        if (queryBuilder && typeof queryBuilder.populate === "function") {
            try {
                const pop1 = queryBuilder.populate("storeId", "name slug rating totalReviews pickupAddress logo deliveryOptions");
                if (pop1 && typeof pop1.populate === "function") {
                    queryBuilder = pop1.populate("sellerId", "name");
                } else if (pop1) {
                    queryBuilder = pop1;
                }
            } catch (err) {}
        }

        const products = await queryBuilder;

        return {
            products,
            total,
            page: validPage,
            totalPages: Math.ceil(total / validLimit)
        };
    }

    async getFeaturedProducts() {
        let query = Product.find({ isFeatured: true }).limit(10);
        if (query && typeof query.populate === "function") {
            try {
                query = query.populate("storeId", "name slug rating totalReviews pickupAddress logo deliveryOptions");
            } catch (err) {}
        }
        return await query;
    }

    async getProductById(id) {
        let query = Product.findById(id);
        if (query && typeof query.populate === "function") {
            try {
                const pop1 = query.populate("storeId", "name slug tagline description rating totalReviews pickupAddress logo banner deliveryOptions returnPolicy");
                if (pop1 && typeof pop1.populate === "function") {
                    query = pop1.populate("sellerId", "name email role");
                } else if (pop1) {
                    query = pop1;
                }
            } catch (err) {}
        }
        return await query;
    }

    async getOtherSellerOffers(productId) {
        const product = await Product.findById(productId);
        if (!product) return [];

        // Search for matching products sold by other stores/sellers
        const baseTitle = product.product_title?.split("-")[0]?.trim() || "";
        const escapedTitle = baseTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        let query = Product.find({
            _id: { $ne: product._id },
            product_title: { $regex: new RegExp(`^${escapedTitle}`, "i") },
            approvalStatus: { $ne: "rejected" }
        });

        if (query && typeof query.populate === "function") {
            try {
                query = query.populate("storeId", "name slug rating totalReviews pickupAddress logo deliveryOptions");
            } catch (err) {}
        }

        return await query.sort({ discounted_price: 1 }).limit(10);
    }

    async getSuggestions(keyword) {
        if (!keyword || typeof keyword !== "string" || !keyword.trim()) {
            return { products: [], categories: [], brands: [] };
        }

        const escaped = keyword.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(escaped, "i");

        let prodQuery = Product.find({ product_title: { $regex: regex } });
        if (prodQuery && typeof prodQuery.select === "function") {
            prodQuery = prodQuery.select("product_title discounted_price original_price discount_percentage product_image_url product_category brand");
        }
        if (prodQuery && typeof prodQuery.limit === "function") {
            prodQuery = prodQuery.limit(6);
        }

        let catQuery = Category.find({ name: { $regex: regex } });
        if (catQuery && typeof catQuery.select === "function") {
            catQuery = catQuery.select("name slug icon");
        }
        if (catQuery && typeof catQuery.limit === "function") {
            catQuery = catQuery.limit(4);
        }

        let brandQuery = Brand.find({ name: { $regex: regex } });
        if (brandQuery && typeof brandQuery.select === "function") {
            brandQuery = brandQuery.select("name slug logo");
        }
        if (brandQuery && typeof brandQuery.limit === "function") {
            brandQuery = brandQuery.limit(4);
        }

        const [products, matchingCategories, matchingBrands] = await Promise.all([
            Promise.resolve(prodQuery),
            Promise.resolve(catQuery),
            Promise.resolve(brandQuery),
        ]);

        return {
            products: Array.isArray(products) ? products : [],
            categories: Array.isArray(matchingCategories) ? matchingCategories : [],
            brands: Array.isArray(matchingBrands) ? matchingBrands : [],
        };
    }

    async getDeals(limit = 12) {
        let query = Product.find({ discount_percentage: { $gte: 12 } });
        if (query && typeof query.populate === "function") {
            try {
                query = query.populate("storeId", "name slug rating totalReviews pickupAddress");
            } catch (err) {}
        }
        return query.sort({ discount_percentage: -1, total_reviews: -1 }).limit(limit);
    }

    async getBrands() {
        try {
            const brandDocs = await Brand.find({ isActive: true }).sort({ name: 1 });
            if (brandDocs && brandDocs.length > 0) {
                return brandDocs;
            }
        } catch (err) {}

        try {
            const distinctBrands = await Product.distinct("brand");
            return distinctBrands.filter(Boolean).sort().map(name => ({ name, slug: name.toLowerCase() }));
        } catch (err) {
            return [];
        }
    }

    async getCategories() {
        try {
            const rawCats = await Product.distinct("product_category");
            if (Array.isArray(rawCats) && rawCats.length > 0) {
                const cleanMap = new Map();
                for (const cat of rawCats) {
                    if (cat && typeof cat === "string" && cat.trim()) {
                        const trimmed = cat.trim();
                        const lower = trimmed.toLowerCase();
                        if (!cleanMap.has(lower)) {
                            const formatted = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
                            cleanMap.set(lower, formatted);
                        }
                    }
                }
                return Array.from(cleanMap.values()).sort();
            }

            const catDocs = await Category.find({ isActive: true }).sort({ displayOrder: 1, name: 1 });
            return catDocs.map(c => c.name);
        } catch (err) {
            return [];
        }
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
