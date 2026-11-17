import sellerRepository from "../repositories/seller.repository.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";

export const sellerController = {
    // Register as seller
    async register(req, res) {
        try {
            const {
                sellerType = "business",
                legalName,
                displayName,
                contactPhone,
                contactEmail,
                gstin,
                pan,
                businessAddress,
                bankDetails,
                storeName,
                storeDescription,
                pickupAddress,
                deliveryOptions,
            } = req.body;

            if (!legalName || !legalName.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Legal business or individual name is required."
                });
            }

            if (!contactPhone || !contactPhone.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Contact phone number is required."
                });
            }

            const email = (contactEmail && contactEmail.trim()) || req.user.email;

            const sellerData = {
                sellerType: sellerType === "individual" ? "individual" : "business",
                legalName: legalName.trim(),
                displayName: displayName ? displayName.trim() : legalName.trim(),
                contactPhone: contactPhone.trim(),
                contactEmail: email.toLowerCase(),
                gstin: gstin ? gstin.trim().toUpperCase() : "",
                pan: pan ? pan.trim().toUpperCase() : "",
                businessAddress: businessAddress || {},
                bankDetails: bankDetails || {},
            };

            const storeData = {
                name: (storeName && storeName.trim()) || sellerData.displayName || "ElectroNova Store",
                description: storeDescription || "Electronics verified store on ElectroNova.",
                pickupAddress: pickupAddress || businessAddress || {},
                deliveryOptions: deliveryOptions || {
                    supportsSellerDelivery: true,
                    supportsPlatformDelivery: true,
                },
            };

            const result = await sellerRepository.registerSeller({
                userId: req.user._id,
                sellerData,
                storeData,
            });

            return res.status(201).json({
                success: true,
                message: "Seller registration successful. Store is now activated on ElectroNova.",
                data: result,
            });
        } catch (err) {
            console.error("Seller registration error:", err);
            return res.status(500).json({
                success: false,
                message: err.message || "Failed to register seller profile."
            });
        }
    },

    // Get current seller profile and store
    async getProfile(req, res) {
        try {
            const seller = await sellerRepository.getSellerByUserId(req.user._id);
            const store = await sellerRepository.getStoreBySellerUserId(req.user._id);

            if (!seller) {
                return res.status(404).json({
                    success: false,
                    message: "No seller profile found for this account."
                });
            }

            return res.status(200).json({
                success: true,
                data: {
                    seller,
                    store,
                },
            });
        } catch (err) {
            console.error("Get seller profile error:", err);
            return res.status(500).json({
                success: false,
                message: "Failed to load seller profile."
            });
        }
    },

    // Update store profile
    async updateStore(req, res) {
        try {
            if (!req.store) {
                return res.status(404).json({
                    success: false,
                    message: "Store profile not found."
                });
            }

            const updatedStore = await sellerRepository.updateStore(
                req.store._id,
                req.user._id,
                req.body
            );

            return res.status(200).json({
                success: true,
                message: "Store profile updated successfully.",
                data: updatedStore,
            });
        } catch (err) {
            console.error("Update store error:", err);
            return res.status(500).json({
                success: false,
                message: "Failed to update store profile."
            });
        }
    },

    // Get seller dashboard analytics
    async getDashboard(req, res) {
        try {
            const metrics = await sellerRepository.getDashboardMetrics(
                req.user._id,
                req.store?._id
            );

            return res.status(200).json({
                success: true,
                data: {
                    ...metrics,
                    store: req.store,
                    seller: req.seller,
                },
            });
        } catch (err) {
            console.error("Seller dashboard error:", err);
            return res.status(500).json({
                success: false,
                message: "Failed to load seller dashboard metrics."
            });
        }
    },

    // Get seller sub-orders
    async getOrders(req, res) {
        try {
            const { status, search, page = 1, limit = 15 } = req.query;

            const result = await sellerRepository.getSellerOrders(req.user._id, {
                status,
                search,
                page,
                limit,
            });

            return res.status(200).json({
                success: true,
                data: result,
            });
        } catch (err) {
            console.error("Get seller orders error:", err);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch seller orders."
            });
        }
    },

    // Get single sub-order details
    async getOrderById(req, res) {
        try {
            const order = await sellerRepository.getSellerOrderById(
                req.params.id,
                req.user._id
            );

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: "Order not found or you do not have permission to view this order."
                });
            }

            return res.status(200).json({
                success: true,
                data: order,
            });
        } catch (err) {
            console.error("Get seller order by id error:", err);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch order details."
            });
        }
    },

    // Update order fulfillment status
    async updateOrderStatus(req, res) {
        try {
            const { status, note, trackingNumber, carrier } = req.body;

            const allowedStatuses = ["Pending", "Confirmed", "Processing", "Packed", "Dispatched", "Delivered", "Cancelled"];
            if (!status || !allowedStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid order status. Allowed: ${allowedStatuses.join(", ")}`
                });
            }

            const updatedOrder = await sellerRepository.updateSellerOrderStatus(
                req.params.id,
                req.user._id,
                status,
                { note, trackingNumber, carrier }
            );

            if (!updatedOrder) {
                return res.status(404).json({
                    success: false,
                    message: "Order not found or unauthorized to update this order."
                });
            }

            return res.status(200).json({
                success: true,
                message: `Order status successfully updated to ${status}.`,
                data: updatedOrder,
            });
        } catch (err) {
            console.error("Update seller order status error:", err);
            return res.status(500).json({
                success: false,
                message: "Failed to update order status."
            });
        }
    },

    // Get seller financial earnings and payouts
    async getEarnings(req, res) {
        try {
            const earnings = await sellerRepository.getSellerEarnings(req.user._id);

            return res.status(200).json({
                success: true,
                data: earnings,
            });
        } catch (err) {
            console.error("Get seller earnings error:", err);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch earnings ledger."
            });
        }
    },

    // Get seller's own products with pagination, search & filters
    async getProducts(req, res) {
        try {
            const page = Math.max(1, parseInt(req.query.page) || 1);
            const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 20));
            const { search, category, status } = req.query;

            const filter = { sellerId: req.user._id };

            if (search && typeof search === "string" && search.trim()) {
                const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                filter.$or = [
                    { product_title: { $regex: escaped, $options: "i" } },
                    { brand: { $regex: escaped, $options: "i" } },
                    { sku: { $regex: escaped, $options: "i" } },
                ];
            }

            if (category && category !== "all" && category.trim()) {
                filter.product_category = { $regex: `^${category.trim()}$`, $options: "i" };
            }

            if (status && status !== "all") {
                filter.approvalStatus = status;
            }

            const total = await Product.countDocuments(filter);
            const products = await Product.find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit);

            return res.status(200).json({
                success: true,
                data: {
                    products,
                    total,
                    page,
                    pages: Math.ceil(total / limit) || 1,
                },
            });
        } catch (err) {
            console.error("Seller get products error:", err);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch seller products."
            });
        }
    },

    // Create a new marketplace product
    async createProduct(req, res) {
        try {
            const {
                title,
                product_title,
                category,
                product_category,
                brand,
                price,
                discounted_price,
                original_price,
                stock,
                countInStock,
                sku,
                image,
                product_image_url,
                images,
                specifications,
                deliveryOptions,
            } = req.body;

            const finalTitle = (product_title || title || "").trim();
            if (!finalTitle) {
                return res.status(400).json({
                    success: false,
                    message: "Product title is required."
                });
            }

            const finalPrice = Number(discounted_price ?? price);
            if (isNaN(finalPrice) || finalPrice <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "A valid positive selling price is required."
                });
            }

            const origPrice = Number(original_price ?? finalPrice);
            const discountPct = origPrice > finalPrice
                ? Math.round(((origPrice - finalPrice) / origPrice) * 100)
                : 0;

            const finalCategory = (product_category || category || "Electronics").trim();
            const primaryImg = product_image_url || image || (Array.isArray(images) && images[0]) || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80";

            const newProduct = await Product.create({
                product_title: finalTitle,
                product_category: finalCategory,
                brand: (brand || "").trim(),
                discounted_price: finalPrice,
                original_price: origPrice,
                discount_percentage: discountPct,
                stock: Math.max(0, Number(stock ?? countInStock ?? 10)),
                sku: sku || `SKU-${Date.now().toString(36).toUpperCase()}`,
                product_image_url: primaryImg,
                images: Array.isArray(images) && images.length > 0 ? images : [primaryImg],
                specifications: Array.isArray(specifications) ? specifications : [],
                sellerId: req.user._id,
                storeId: req.store?._id,
                approvalStatus: "approved",
                deliveryOptions: deliveryOptions || req.store?.deliveryOptions || {
                    supportsSellerDelivery: true,
                    supportsPlatformDelivery: true,
                    estimatedDeliveryDays: 3,
                },
            });

            return res.status(201).json({
                success: true,
                message: "Product successfully listed on ElectroNova marketplace.",
                data: newProduct,
            });
        } catch (err) {
            console.error("Seller create product error:", err);
            return res.status(500).json({
                success: false,
                message: err.message || "Failed to create product listing."
            });
        }
    },

    // Update existing product listing (Tenant Isolation Guarded)
    async updateProduct(req, res) {
        try {
            if (!mongoose.isValidObjectId(req.params.id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid product ID format."
                });
            }

            const product = await Product.findOne({
                _id: req.params.id,
                sellerId: req.user._id,
            });

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "Product listing not found or unauthorized to edit this item."
                });
            }

            const {
                title,
                product_title,
                category,
                product_category,
                brand,
                price,
                discounted_price,
                original_price,
                stock,
                countInStock,
                sku,
                image,
                product_image_url,
                images,
                specifications,
                deliveryOptions,
            } = req.body;

            if (product_title !== undefined || title !== undefined) {
                product.product_title = (product_title || title).trim();
            }
            if (discounted_price !== undefined || price !== undefined) {
                product.discounted_price = Number(discounted_price ?? price);
            }
            if (original_price !== undefined) {
                product.original_price = Number(original_price);
            }
            if (product.original_price > product.discounted_price) {
                product.discount_percentage = Math.round(
                    ((product.original_price - product.discounted_price) / product.original_price) * 100
                );
            }
            if (product_category !== undefined || category !== undefined) {
                product.product_category = (product_category || category).trim();
            }
            if (brand !== undefined) product.brand = brand.trim();
            if (stock !== undefined || countInStock !== undefined) {
                product.stock = Math.max(0, Number(stock ?? countInStock));
            }
            if (sku !== undefined) product.sku = sku.trim();
            if (product_image_url !== undefined || image !== undefined) {
                product.product_image_url = product_image_url || image;
            }
            if (Array.isArray(images)) product.images = images;
            if (Array.isArray(specifications)) product.specifications = specifications;
            if (deliveryOptions) product.deliveryOptions = deliveryOptions;

            await product.save();

            return res.status(200).json({
                success: true,
                message: "Product listing updated successfully.",
                data: product,
            });
        } catch (err) {
            console.error("Seller update product error:", err);
            return res.status(500).json({
                success: false,
                message: "Failed to update product listing."
            });
        }
    },

    // Delete product listing (Tenant Isolation Guarded)
    async deleteProduct(req, res) {
        try {
            if (!mongoose.isValidObjectId(req.params.id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid product ID format."
                });
            }

            const deleted = await Product.findOneAndDelete({
                _id: req.params.id,
                sellerId: req.user._id,
            });

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found or unauthorized to delete this item."
                });
            }

            return res.status(200).json({
                success: true,
                message: "Product listing successfully removed.",
                data: { id: req.params.id },
            });
        } catch (err) {
            console.error("Seller delete product error:", err);
            return res.status(500).json({
                success: false,
                message: "Failed to delete product listing."
            });
        }
    },
};

export default sellerController;
