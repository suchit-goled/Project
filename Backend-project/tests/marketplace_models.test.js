import { test, describe } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";

// Import new models
import User from "../src/models/user.model.js";
import Product from "../src/models/Product.js";
import Order from "../src/models/order.model.js";
import Seller from "../src/models/seller.model.js";
import Store from "../src/models/store.model.js";
import SellerOrder from "../src/models/sellerOrder.model.js";
import Category from "../src/models/category.model.js";
import Brand from "../src/models/brand.model.js";
import Commission from "../src/models/commission.model.js";
import Payout from "../src/models/payout.model.js";
import Shipment from "../src/models/shipment.model.js";
import Coupon from "../src/models/coupon.model.js";
import AuditLog from "../src/models/auditLog.model.js";

describe("Phase 2: Multi-Vendor Marketplace Database Models & Business Rules", () => {

    test("User model supports new roles ('customer', 'seller', 'superadmin') and sellerStatus", async () => {
        const sellerUser = new User({
            name: "Apex Retail Pvt Ltd",
            email: "apex.test@example.com",
            password: "hashedPassword123",
            role: "seller",
            sellerStatus: "approved",
            phone: "+91 98450 11221",
        });

        await assert.doesNotReject(async () => {
            await sellerUser.validate();
        });
        assert.equal(sellerUser.role, "seller");
        assert.equal(sellerUser.sellerStatus, "approved");

        // Reject invalid role
        const invalidUser = new User({
            name: "Hacker",
            email: "hacker@example.com",
            password: "hashedPassword123",
            role: "unauthorized_role",
        });
        await assert.rejects(async () => {
            await invalidUser.validate();
        }, /`unauthorized_role` is not a valid enum value/);
    });

    test("Seller model validates required fields for business and individual sellers", async () => {
        const dummyUserId = new mongoose.Types.ObjectId();

        const businessSeller = new Seller({
            userId: dummyUserId,
            sellerType: "business",
            legalName: "Apex Retail Solutions Private Limited",
            displayName: "Apex Electronics",
            contactEmail: "apex.retail@example.com",
            contactPhone: "+91 98450 11221",
            gstin: "29AABCA1234D1ZM",
            pan: "AABCA1234D",
            businessAddress: {
                addressLine: "45/2, 100ft Road, Indiranagar",
                city: "Bengaluru",
                state: "Karnataka",
                pincode: "560038",
                country: "India",
            },
            bankDetails: {
                accountNumber: "50200088123411",
                ifscCode: "HDFC0000053",
                bankName: "HDFC Bank",
                accountHolderName: "Apex Retail Solutions Pvt Ltd",
            },
            status: "approved",
            commissionRateOverride: 4.5,
        });

        await assert.doesNotReject(async () => {
            await businessSeller.validate();
        });
        assert.equal(businessSeller.sellerType, "business");
        assert.equal(businessSeller.commissionRateOverride, 4.5);
    });

    test("Store model enforces name, slug, and pickup address structure", async () => {
        const dummySellerId = new mongoose.Types.ObjectId();

        const store = new Store({
            sellerId: dummySellerId,
            name: "Apex Electronics Hub",
            slug: "apex-electronics-hub",
            tagline: "Bengaluru's Premium Gadgets",
            pickupAddress: {
                addressLine: "45/2, 100ft Road",
                city: "Bengaluru",
                state: "Karnataka",
                pincode: "560038",
                phone: "+91 98450 11221",
            },
            deliveryOptions: {
                supportsSellerDelivery: true,
                supportsPlatformDelivery: true,
            },
        });

        await assert.doesNotReject(async () => {
            await store.validate();
        });
        assert.equal(store.slug, "apex-electronics-hub");
        assert.equal(store.deliveryOptions.supportsPlatformDelivery, true);
    });

    test("Product model includes multi-vendor extensions without breaking legacy fields", async () => {
        const dummySellerId = new mongoose.Types.ObjectId();
        const dummyStoreId = new mongoose.Types.ObjectId();

        const product = new Product({
            product_title: "Apple iPhone 15 Pro (128GB) - Natural Titanium",
            product_category: "Smartphones",
            brand: "Apple",
            discounted_price: 124900,
            original_price: 134900,
            discount_percentage: 7,
            product_rating: 4.8,
            total_reviews: 420,
            stock: 35,
            sku: "APL-IP15P-128-NT",
            sellerId: dummySellerId,
            storeId: dummyStoreId,
            images: [
                "https://example.com/img1.jpg",
                "https://example.com/img2.jpg"
            ],
            specifications: [
                { key: "Display", value: "6.1-inch OLED 120Hz" },
                { key: "Processor", value: "A17 Pro" },
            ],
            approvalStatus: "approved",
            deliveryOptions: {
                supportsSellerDelivery: true,
                supportsPlatformDelivery: true,
                estimatedDeliveryDays: 2,
            },
        });

        await assert.doesNotReject(async () => {
            await product.validate();
        });
        assert.equal(product.stock, 35);
        assert.equal(product.approvalStatus, "approved");
        assert.equal(product.specifications.length, 2);
    });

    test("Category and Brand models validate correctly", async () => {
        const category = new Category({
            name: "Smartphones",
            slug: "smartphones",
            commissionRate: 4.5,
            isActive: true,
        });
        await assert.doesNotReject(async () => {
            await category.validate();
        });

        const brand = new Brand({
            name: "Apple",
            slug: "apple",
            isActive: true,
        });
        await assert.doesNotReject(async () => {
            await brand.validate();
        });
    });

    test("Multi-Seller Order decomposition correctly calculates commission and seller earnings", async () => {
        const customerId = new mongoose.Types.ObjectId();
        const sellerAId = new mongoose.Types.ObjectId();
        const storeAId = new mongoose.Types.ObjectId();
        const sellerBId = new mongoose.Types.ObjectId();
        const storeBId = new mongoose.Types.ObjectId();
        const parentOrderId = new mongoose.Types.ObjectId();

        // Seller A: Laptop (₹50,000, 5% commission)
        const itemASubtotal = 50000;
        const commissionRateA = 5.0;
        const commissionAmountA = itemASubtotal * (commissionRateA / 100); // ₹2,500
        const sellerEarningsA = itemASubtotal - commissionAmountA; // ₹47,500

        const sellerOrderA = new SellerOrder({
            sellerOrderNumber: "EN-2026-1001-A",
            parentOrderId,
            parentOrderNumber: "EN-2026-1001",
            customerId,
            sellerId: sellerAId,
            storeId: storeAId,
            products: [
                {
                    productId: new mongoose.Types.ObjectId(),
                    title: "Dell XPS 15",
                    price: 50000,
                    quantity: 1,
                },
            ],
            subtotal: itemASubtotal,
            shippingCharge: 0,
            tax: 0,
            total: itemASubtotal,
            commissionRate: commissionRateA,
            commissionAmount: commissionAmountA,
            sellerEarnings: sellerEarningsA,
            deliveryMethod: "seller",
            orderStatus: "Packed",
            paymentStatus: "Paid",
        });

        await assert.doesNotReject(async () => {
            await sellerOrderA.validate();
        });
        assert.equal(sellerOrderA.commissionAmount, 2500);
        assert.equal(sellerOrderA.sellerEarnings, 47500);
        assert.equal(sellerOrderA.deliveryMethod, "seller");

        // Seller B: Smartphone (₹30,000, 4% commission)
        const itemBSubtotal = 30000;
        const commissionRateB = 4.0;
        const commissionAmountB = itemBSubtotal * (commissionRateB / 100); // ₹1,200
        const sellerEarningsB = itemBSubtotal - commissionAmountB; // ₹28,800

        const sellerOrderB = new SellerOrder({
            sellerOrderNumber: "EN-2026-1001-B",
            parentOrderId,
            parentOrderNumber: "EN-2026-1001",
            customerId,
            sellerId: sellerBId,
            storeId: storeBId,
            products: [
                {
                    productId: new mongoose.Types.ObjectId(),
                    title: "OnePlus 12 5G",
                    price: 30000,
                    quantity: 1,
                },
            ],
            subtotal: itemBSubtotal,
            shippingCharge: 0,
            tax: 0,
            total: itemBSubtotal,
            commissionRate: commissionRateB,
            commissionAmount: commissionAmountB,
            sellerEarnings: sellerEarningsB,
            deliveryMethod: "platform",
            orderStatus: "In Transit",
            paymentStatus: "Paid",
        });

        await assert.doesNotReject(async () => {
            await sellerOrderB.validate();
        });
        assert.equal(sellerOrderB.commissionAmount, 1200);
        assert.equal(sellerOrderB.sellerEarnings, 28800);
        assert.equal(sellerOrderB.orderStatus, "In Transit");

        // Parent Order combines them
        const parentOrder = new Order({
            parentOrderNumber: "EN-2026-1001",
            userId: customerId.toString(),
            shippingAddress: {
                fullName: "Arjun Verma",
                address: "Flat 502, Orchid Heights",
                city: "Gurugram",
                state: "Haryana",
                pincode: "122011",
            },
            sellerOrders: [sellerOrderA._id, sellerOrderB._id],
            subtotal: itemASubtotal + itemBSubtotal, // ₹80,000
            total: itemASubtotal + itemBSubtotal,
            commissionTotal: commissionAmountA + commissionAmountB, // ₹3,700
            isMultiSeller: true,
            orderStatus: "Confirmed",
            paymentStatus: "Paid",
        });

        await assert.doesNotReject(async () => {
            await parentOrder.validate();
        });
        assert.equal(parentOrder.total, 80000);
        assert.equal(parentOrder.commissionTotal, 3700);
        assert.equal(parentOrder.isMultiSeller, true);
    });

    test("Payout ledger verifies gross sales, commission deduction and net amount", async () => {
        const dummySellerId = new mongoose.Types.ObjectId();
        const dummyStoreId = new mongoose.Types.ObjectId();

        const grossSales = 150000;
        const commissionDeducted = 7500;
        const netAmount = grossSales - commissionDeducted; // 142500

        const payout = new Payout({
            payoutNumber: "PAY-2026-001",
            sellerId: dummySellerId,
            storeId: dummyStoreId,
            grossSales,
            commissionDeducted,
            netAmount,
            periodStart: new Date("2026-10-01"),
            periodEnd: new Date("2026-10-15"),
            status: "Completed",
            bankDetails: {
                accountNumber: "50200088123411",
                ifscCode: "HDFC0000053",
                bankName: "HDFC Bank",
                accountHolderName: "Apex Retail Solutions Pvt Ltd",
            },
            transactionReference: "UTR-NEFT-9928192847",
        });

        await assert.doesNotReject(async () => {
            await payout.validate();
        });
        assert.equal(payout.netAmount, 142500);
        assert.equal(payout.status, "Completed");
    });

    test("Shipment model validates tracking, status progression, and timeline events", async () => {
        const dummySellerOrderId = new mongoose.Types.ObjectId();
        const dummyParentOrderId = new mongoose.Types.ObjectId();

        const shipment = new Shipment({
            sellerOrderId: dummySellerOrderId,
            parentOrderId: dummyParentOrderId,
            carrier: "ElectroNova Logistics",
            trackingNumber: "TRK-EN10010",
            deliveryMethod: "platform",
            currentStatus: "In Transit",
            events: [
                {
                    status: "Manifest Created",
                    location: "Bengaluru",
                    description: "Courier assigned",
                },
                {
                    status: "Departed Sorting Hub",
                    location: "Bengaluru Air Cargo",
                    description: "Dispatched to Delhi NCR",
                },
            ],
        });

        await assert.doesNotReject(async () => {
            await shipment.validate();
        });
        assert.equal(shipment.currentStatus, "In Transit");
        assert.equal(shipment.events.length, 2);
    });

    test("AuditLog records critical platform events with actor and target context", async () => {
        const adminId = new mongoose.Types.ObjectId();

        const audit = new AuditLog({
            actorId: adminId,
            actorEmail: "admin@electronova.com",
            actorRole: "superadmin",
            action: "COMMISSION_RATE_UPDATED",
            targetType: "Commission",
            targetId: "category-smartphones",
            details: { previousRate: 5.0, newRate: 4.5 },
            ipAddress: "127.0.0.1",
        });

        await assert.doesNotReject(async () => {
            await audit.validate();
        });
        assert.equal(audit.action, "COMMISSION_RATE_UPDATED");
        assert.equal(audit.details.newRate, 4.5);
    });

});
