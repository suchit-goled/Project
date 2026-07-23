import Product from "../models/Product.js";

class ProductRepository {

    async getProducts(query, page, limit) {

    console.log("Database:", Product.db.name);
    console.log("Collection:", Product.collection.collectionName);

    const count = await Product.countDocuments({});
    console.log("Products count:", count);

    const first = await Product.findOne();
    console.log("First product:", first);

    const {
      search,
      category,
      minPrice,
      maxPrice,
      rating,
      sort
    } = query;

    const filter = {};
    // Search by product title
    if (search) {
        filter.product_title = {
            $regex: search,
            $options: "i"
        };
    }

    // Filter by category
    if (category) {
        filter.product_category = category;
    }

    // Filter by price
    if (minPrice || maxPrice) {
        filter.discounted_price = {};

        if (minPrice) {
            filter.discounted_price.$gte = Number(minPrice);
        }

        if (maxPrice) {
            filter.discounted_price.$lte = Number(maxPrice);
        }
    }

    // Filter by rating
    if (rating) {
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

    const total = await Product.countDocuments(filter);

    const products = await Product.find(filter)
        .sort(sortOption)
        .skip((page - 1) * limit)
        .limit(limit);

    return {
        products,
        total,
        page,
        totalPages: Math.ceil(total / limit)
    };
}

 
    async getFeaturedProducts() {
        return Product.find({ isFeatured: true }).limit(5);
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