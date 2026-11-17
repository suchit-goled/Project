import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import env from "../config/env.js";

// Models
import User from "../models/user.model.js";
import Product from "../models/Product.js";
import Order from "../models/order.model.js";
import Seller from "../models/seller.model.js";
import Store from "../models/store.model.js";
import SellerOrder from "../models/sellerOrder.model.js";
import Category from "../models/category.model.js";
import Brand from "../models/brand.model.js";
import Commission from "../models/commission.model.js";
import Payout from "../models/payout.model.js";
import Shipment from "../models/shipment.model.js";
import Coupon from "../models/coupon.model.js";
import Review from "../models/review.model.js";
import AuditLog from "../models/auditLog.model.js";

// Data
import {
    categoriesData,
    brandsData,
    sellersData,
    storesData,
    sampleCustomersData,
    sampleCouponsData,
} from "./marketplaceData.js";
import { generateFullMarketplaceCatalog } from "./productCatalogData.js";

export async function seedMarketplace({ silent = false } = {}) {
    const log = (...args) => {
        if (!silent) console.log(...args);
    };

    log("==================================================");
    log("🚀 Starting ElectroNova Marketplace Data Seeding...");
    log("==================================================");

    const defaultPasswordHash = await bcrypt.hash("Marketplace@123", 10);

    // 1. Seed or update Super Admin
    let adminUser = await User.findOne({ email: "admin@electronova.com" });
    if (!adminUser) {
        adminUser = await User.create({
            name: "ElectroNova Super Admin",
            email: "admin@electronova.com",
            password: defaultPasswordHash,
            role: "superadmin",
            phone: "+91 98000 00001",
            city: "New Delhi",
            state: "Delhi",
            pincode: "110001",
            address: "ElectroNova HQ, Barakhamba Road, Connaught Place",
        });
        log("✅ Super Admin created: admin@electronova.com");
    } else {
        if (adminUser.role !== "superadmin" && adminUser.role !== "admin") {
            adminUser.role = "superadmin";
            await adminUser.save();
        }
        log("ℹ️ Super Admin found: admin@electronova.com");
    }

    // 2. Seed Categories (14 Categories)
    log("\n📦 Seeding 14 Product Categories...");
    const categoryMap = new Map();
    for (const cat of categoriesData) {
        const doc = await Category.findOneAndUpdate(
            { slug: cat.slug },
            { $set: cat },
            { upsert: true, returnDocument: "after" }
        );
        categoryMap.set(cat.name, doc);
    }
    log(`✅ ${categoryMap.size} Categories synchronized.`);

    // 3. Seed Brands (20 Brands)
    log("\n🏷️ Seeding 20 Electronics Brands...");
    const brandMap = new Map();
    for (const b of brandsData) {
        const doc = await Brand.findOneAndUpdate(
            { slug: b.slug },
            { $set: b },
            { upsert: true, returnDocument: "after" }
        );
        brandMap.set(b.name, doc);
    }
    log(`✅ ${brandMap.size} Brands synchronized.`);

    // 4. Seed Platform Commission Configuration
    log("\n💰 Configuring Marketplace Commission Hierarchy...");
    const categoryRates = categoriesData.map(c => ({
        category: c.name,
        rate: c.commissionRate,
    }));
    let commissionConfig = await Commission.findOne();
    if (!commissionConfig) {
        commissionConfig = await Commission.create({
            defaultRate: 5.0,
            categoryRates,
            sellerRates: [],
            updatedBy: adminUser._id,
            notes: "Platform default commission: 5.0%, with specific category margins.",
        });
        log("✅ Commission configuration initialized.");
    } else {
        commissionConfig.categoryRates = categoryRates;
        await commissionConfig.save();
        log("ℹ️ Commission configuration updated.");
    }

    // 5. Seed 20 Fictional Sellers (12 Business, 8 Individual)
    log("\n👥 Seeding 20 Fictional Sellers (12 Business, 8 Individual)...");
    const sellerUserMap = new Map();
    const sellerProfileMap = new Map();

    for (const s of sellersData) {
        // Create or find User account
        let user = await User.findOne({ email: s.email });
        if (!user) {
            user = await User.create({
                name: s.name,
                email: s.email,
                password: defaultPasswordHash,
                role: "seller",
                sellerStatus: "approved",
                phone: s.contactPhone,
                address: s.businessAddress.addressLine,
                city: s.businessAddress.city,
                state: s.businessAddress.state,
                pincode: s.businessAddress.pincode,
            });
        } else {
            user.role = "seller";
            user.sellerStatus = "approved";
            await user.save();
        }

        // Create or update Seller Profile
        const sellerProfileData = {
            userId: user._id,
            sellerType: s.sellerType,
            legalName: s.legalName,
            displayName: s.displayName,
            contactEmail: s.email,
            contactPhone: s.contactPhone,
            gstin: s.gstin || "",
            pan: s.pan || "",
            idProofUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400",
            businessAddress: s.businessAddress,
            bankDetails: s.bankDetails,
            status: "approved",
            approvedAt: new Date(),
            approvedBy: adminUser._id,
            commissionRateOverride: s.commissionRateOverride,
            isVerified: true,
        };

        const sellerDoc = await Seller.findOneAndUpdate(
            { userId: user._id },
            { $set: sellerProfileData },
            { upsert: true, returnDocument: "after" }
        );

        user.sellerProfile = sellerDoc._id;
        await user.save();

        sellerUserMap.set(s.email, user);
        sellerProfileMap.set(s.email, sellerDoc);
    }
    log(`✅ ${sellerUserMap.size} Seller accounts & profiles synchronized.`);

    // 6. Seed 25 Fictional Stores + 1 Direct Flagship Store
    log("\n🏪 Seeding 25 Marketplace Stores + 1 Flagship Direct Store...");
    const storeList = [];

    for (const st of storesData) {
        let ownerUser = null;
        if (st.sellerEmail === "admin@electronova.com") {
            ownerUser = adminUser;
        } else {
            ownerUser = sellerUserMap.get(st.sellerEmail);
        }

        if (!ownerUser) continue;

        const storeProfile = sellerProfileMap.get(st.sellerEmail);

        const storePayload = {
            sellerId: ownerUser._id,
            sellerProfileId: storeProfile?._id,
            name: st.name,
            slug: st.slug,
            tagline: st.tagline,
            description: st.description,
            logo: st.logo,
            banner: st.banner,
            pickupAddress: st.pickupAddress,
            rating: st.rating,
            totalReviews: st.totalReviews,
            isActive: true,
            deliveryOptions: st.deliveryOptions,
        };

        const storeDoc = await Store.findOneAndUpdate(
            { slug: st.slug },
            { $set: storePayload },
            { upsert: true, returnDocument: "after" }
        );

        storeList.push(storeDoc);
    }
    log(`✅ ${storeList.length} Stores active.`);

    const directStore = storeList.find(s => s.slug === "electronova-direct") || storeList[0];

    // 7. Seed 250+ Electronics Products with Multi-Seller Listings
    log("\n⚡ Generating 250+ Multi-Vendor Products across 14 Categories...");
    const marketplaceCatalog = generateFullMarketplaceCatalog(storeList, directStore._id);

    let createdProductCount = 0;
    const seededProducts = [];

    for (const p of marketplaceCatalog) {
        const productDoc = await Product.findOneAndUpdate(
            { sku: p.sku },
            { $set: p },
            { upsert: true, returnDocument: "after" }
        );
        seededProducts.push(productDoc);
        createdProductCount++;
    }
    log(`✅ ${createdProductCount} Products seeded and linked to stores & sellers.`);

    // 8. Seed Sample Customer Accounts
    log("\n👤 Seeding Sample Customers...");
    const customerList = [];
    for (const c of sampleCustomersData) {
        let cust = await User.findOne({ email: c.email });
        if (!cust) {
            cust = await User.create({
                name: c.name,
                email: c.email,
                password: defaultPasswordHash,
                role: "customer",
                phone: c.phone,
                address: c.address,
                city: c.city,
                state: c.state,
                pincode: c.pincode,
            });
        }
        customerList.push(cust);
    }
    log(`✅ ${customerList.length} Sample customers ready.`);

    // 9. Seed Sample Coupons
    log("\n🎟️ Seeding Marketplace Promotional Coupons...");
    for (const c of sampleCouponsData) {
        await Coupon.findOneAndUpdate(
            { code: c.code },
            { $set: c },
            { upsert: true, returnDocument: "after" }
        );
    }
    log(`✅ ${sampleCouponsData.length} Promotional coupons ready.`);

    // 10. Seed Realistic Multi-Seller Orders (Decomposed into SellerOrders)
    log("\n🛒 Creating Sample Multi-Seller Parent Orders & Decomposed Seller Orders...");

    const customer = customerList[0]; // Arjun Verma
    // Select 3 products from 3 distinct sellers
    const distinctSellerProducts = [];
    const usedSellerIds = new Set();

    for (const prod of seededProducts) {
        const sId = prod.sellerId?.toString();
        if (sId && !usedSellerIds.has(sId)) {
            usedSellerIds.add(sId);
            distinctSellerProducts.push(prod);
            if (distinctSellerProducts.length === 3) break;
        }
    }

    if (distinctSellerProducts.length === 3) {
        const orderNumber = "EN-2026-1001";
        let parentOrder = await Order.findOne({ parentOrderNumber: orderNumber });

        if (!parentOrder) {
            const shippingAddress = {
                fullName: customer.name,
                phone: customer.phone,
                address: customer.address,
                city: customer.city,
                state: customer.state,
                pincode: customer.pincode,
            };

            const sellerOrderIds = [];
            let parentSubtotal = 0;
            let parentCommissionTotal = 0;
            const parentOrderProducts = [];

            const letters = ["A", "B", "C"];

            // Create temporary parent order to get its _id
            parentOrder = new Order({
                parentOrderNumber: orderNumber,
                userId: customer._id.toString(),
                shippingAddress,
                paymentMethod: "Razorpay Online",
                orderStatus: "Confirmed",
                paymentStatus: "Paid",
                razorpayOrderId: "order_demo_1001",
                razorpayPaymentId: "pay_demo_1001",
                isMultiSeller: true,
                products: [],
                subtotal: 0,
                shippingCharge: 0,
                tax: 0,
                total: 0,
            });
            await parentOrder.save();

            for (let i = 0; i < 3; i++) {
                const prod = distinctSellerProducts[i];
                const sellerUser = await User.findById(prod.sellerId);
                const sellerStore = await Store.findById(prod.storeId);
                const itemQty = 1;
                const itemPrice = prod.discounted_price;
                const itemSubtotal = itemPrice * itemQty;

                // Commission resolution: category default or 5%
                const catDoc = categoryMap.get(prod.product_category);
                const commRate = catDoc?.commissionRate || 5.0;
                const commAmount = Math.round(itemSubtotal * (commRate / 100));
                const sellerEarnings = itemSubtotal - commAmount;

                parentSubtotal += itemSubtotal;
                parentCommissionTotal += commAmount;

                parentOrderProducts.push({
                    productId: prod._id,
                    title: prod.product_title,
                    image: prod.product_image_url,
                    quantity: itemQty,
                    price: itemPrice,
                });

                const subOrderNumber = `${orderNumber}-${letters[i]}`;
                const sellerOrder = await SellerOrder.create({
                    sellerOrderNumber: subOrderNumber,
                    parentOrderId: parentOrder._id,
                    parentOrderNumber: orderNumber,
                    customerId: customer._id,
                    sellerId: prod.sellerId,
                    storeId: prod.storeId,
                    products: [
                        {
                            productId: prod._id,
                            title: prod.product_title,
                            image: prod.product_image_url,
                            price: itemPrice,
                            quantity: itemQty,
                            sku: prod.sku,
                            brand: prod.brand,
                        },
                    ],
                    subtotal: itemSubtotal,
                    shippingCharge: 0,
                    tax: 0,
                    total: itemSubtotal,
                    commissionRate: commRate,
                    commissionAmount: commAmount,
                    sellerEarnings: sellerEarnings,
                    deliveryMethod: i === 0 ? "seller" : "platform",
                    orderStatus: i === 0 ? "Packed" : "In Transit",
                    paymentStatus: "Paid",
                    trackingNumber: `TRK-EN${10010 + i}`,
                    courierPartner: i === 0 ? "Seller Express" : "ElectroNova Logistics",
                    shippingAddress,
                    shipmentTimeline: [
                        {
                            status: "Order Placed",
                            timestamp: new Date(Date.now() - 36 * 3600 * 1000),
                            note: "Payment received via Razorpay.",
                        },
                        {
                            status: "Confirmed",
                            timestamp: new Date(Date.now() - 30 * 3600 * 1000),
                            note: `Order accepted by ${sellerStore.name}.`,
                        },
                        {
                            status: i === 0 ? "Packed" : "Dispatched",
                            timestamp: new Date(Date.now() - 12 * 3600 * 1000),
                            note: i === 0 ? "Package sealed and ready for courier pickup." : "Package handed over to Blue Dart Express.",
                            location: sellerStore.pickupAddress.city,
                        },
                    ],
                });

                sellerOrderIds.push(sellerOrder._id);

                // Create Modular Shipment record
                await Shipment.create({
                    sellerOrderId: sellerOrder._id,
                    parentOrderId: parentOrder._id,
                    carrier: sellerOrder.courierPartner,
                    trackingNumber: sellerOrder.trackingNumber,
                    deliveryMethod: sellerOrder.deliveryMethod,
                    originAddress: sellerStore.pickupAddress,
                    destinationAddress: shippingAddress,
                    currentStatus: i === 0 ? "Picked Up" : "In Transit",
                    estimatedDelivery: new Date(Date.now() + 48 * 3600 * 1000),
                    events: [
                        {
                            status: "Manifest Created",
                            location: sellerStore.pickupAddress.city,
                            timestamp: new Date(Date.now() - 20 * 3600 * 1000),
                            description: "Courier partner assigned.",
                        },
                        {
                            status: i === 0 ? "Package Received" : "Departed Sorting Facility",
                            location: sellerStore.pickupAddress.city,
                            timestamp: new Date(Date.now() - 10 * 3600 * 1000),
                            description: "Package in transit to hub.",
                        },
                    ],
                });
            }

            parentOrder.sellerOrders = sellerOrderIds;
            parentOrder.products = parentOrderProducts;
            parentOrder.subtotal = parentSubtotal;
            parentOrder.total = parentSubtotal;
            parentOrder.commissionTotal = parentCommissionTotal;
            await parentOrder.save();

            log(`✅ Multi-Seller Parent Order ${orderNumber} created with 3 Seller Orders:`);
            log(`   - Total Value: ₹${parentSubtotal.toLocaleString("en-IN")}`);
            log(`   - Platform Commission: ₹${parentCommissionTotal.toLocaleString("en-IN")}`);
            log(`   - Decomposed Sub-Orders: ${letters.map(l => `${orderNumber}-${l}`).join(", ")}`);
        } else {
            log(`ℹ️ Multi-Seller Parent Order ${orderNumber} already present.`);
        }
    }

    // 11. Seed Sample Payout Record
    log("\n💳 Seeding Payout Ledger Records...");
    const sampleSeller = sellerUserMap.get("seller.biz.1@electronova.demo");
    const sampleStore = storeList.find(s => s.slug === "apex-electronics-hub");
    if (sampleSeller && sampleStore) {
        await Payout.findOneAndUpdate(
            { payoutNumber: "PAY-2026-001" },
            {
                $set: {
                    payoutNumber: "PAY-2026-001",
                    sellerId: sampleSeller._id,
                    storeId: sampleStore._id,
                    grossSales: 185000,
                    commissionDeducted: 9250,
                    netAmount: 175750,
                    orderCount: 4,
                    periodStart: new Date(Date.now() - 14 * 24 * 3600 * 1000),
                    periodEnd: new Date(Date.now() - 7 * 24 * 3600 * 1000),
                    status: "Completed",
                    bankDetails: {
                        accountNumber: "50200088123411",
                        ifscCode: "HDFC0000053",
                        bankName: "HDFC Bank",
                        accountHolderName: "Apex Retail Solutions Pvt Ltd",
                    },
                    transactionReference: "UTR-NEFT-9928192847",
                    processedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000),
                    processedBy: adminUser._id,
                    remarks: "Bi-weekly seller settlement paid in full.",
                },
            },
            { upsert: true, returnDocument: "after" }
        );
        log("✅ Sample completed payout record recorded.");
    }

    // 12. Seed Sample Audit Log
    log("\n📝 Writing Initial Audit Log...");
    await AuditLog.create({
        actorId: adminUser._id,
        actorEmail: adminUser.email,
        actorRole: "superadmin",
        action: "MARKETPLACE_INITIALIZED",
        targetType: "Platform",
        targetId: "ElectroNova-Platform",
        details: {
            categoriesSeeded: categoriesData.length,
            brandsSeeded: brandsData.length,
            sellersSeeded: sellersData.length,
            storesSeeded: storesData.length,
            productsSeeded: createdProductCount,
        },
        ipAddress: "127.0.0.1",
        userAgent: "ElectroNova-Seeder/3.0.0",
    });
    log("✅ Audit log recorded.");

    log("\n==================================================");
    log("🎉 ElectroNova Marketplace Data Seeding COMPLETE!");
    log("==================================================");
}

// Auto-run when executed directly via CLI
if (process.argv[1] && process.argv[1].replace(/\\/g, "/").endsWith("src/seeders/marketplaceSeeder.js")) {
    (async () => {
        try {
            console.log(`Connecting to MongoDB: ${env.mongo_uri.replace(/:([^:@]+)@/, ":****@")}`);
            await mongoose.connect(env.mongo_uri);
            console.log("Connected to MongoDB successfully.");
            await seedMarketplace();
            await mongoose.disconnect();
            console.log("Database connection closed.");
            process.exit(0);
        } catch (err) {
            console.error("❌ Marketplace seeding failed:", err);
            process.exit(1);
        }
    })();
}
