import { test, describe } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../src/app.js";
import Store from "../src/models/store.model.js";
import Category from "../src/models/category.model.js";
import Brand from "../src/models/brand.model.js";
import Product from "../src/models/Product.js";

describe("Phase 3: Customer Storefront APIs & Marketplace Discovery", () => {
    const origStoreFind = Store.find;
    const origCategoryFind = Category.find;
    const origBrandFind = Brand.find;
    const origProductFind = Product.find;

    test.before(() => {
        Store.find = () => ({
            select: () => ({
                sort: () => ({
                    limit: () => Promise.resolve([
                        {
                            _id: "store-1",
                            name: "Apex Electronics Hub",
                            slug: "apex-electronics-hub",
                            rating: 4.8,
                            totalReviews: 120,
                            pickupAddress: { city: "Bengaluru" }
                        }
                    ])
                })
            }),
            sort: () => ({
                limit: () => Promise.resolve([
                    {
                        _id: "store-1",
                        name: "Apex Electronics Hub",
                        slug: "apex-electronics-hub",
                        rating: 4.8,
                        totalReviews: 120,
                        pickupAddress: { city: "Bengaluru" }
                    }
                ])
            })
        });

        Category.find = () => ({
            select: () => ({
                limit: () => Promise.resolve([
                    { name: "Smartphones", slug: "smartphones", icon: "smartphone" },
                    { name: "Laptops", slug: "laptops", icon: "laptop" }
                ])
            }),
            sort: () => Promise.resolve([
                { name: "Smartphones", slug: "smartphones", icon: "smartphone" },
                { name: "Laptops", slug: "laptops", icon: "laptop" }
            ])
        });

        Brand.find = () => ({
            select: () => ({
                limit: () => Promise.resolve([
                    { name: "Apple", slug: "apple" },
                    { name: "Sony", slug: "sony" }
                ])
            }),
            sort: () => Promise.resolve([
                { name: "Apple", slug: "apple" },
                { name: "Sony", slug: "sony" }
            ])
        });

        Product.find = () => ({
            select: () => ({
                limit: () => Promise.resolve([
                    {
                        product_title: "Apple iPhone 15 Pro",
                        discounted_price: 124900,
                        product_category: "Smartphones",
                        brand: "Apple"
                    }
                ])
            }),
            populate: () => ({
                sort: () => ({
                    limit: () => Promise.resolve([])
                })
            }),
            sort: () => ({
                skip: () => ({
                    limit: () => Promise.resolve([])
                }),
                limit: () => Promise.resolve([])
            })
        });
    });

    test.after(() => {
        Store.find = origStoreFind;
        Category.find = origCategoryFind;
        Brand.find = origBrandFind;
        Product.find = origProductFind;
    });

    test("POST /api/delivery/check rejects invalid or non-6-digit PIN codes", async () => {
        const res1 = await request(app)
            .post("/api/delivery/check")
            .send({ pincode: "123" });
        assert.equal(res1.status, 400);
        assert.equal(res1.body.success, false);

        const res2 = await request(app)
            .post("/api/delivery/check")
            .send({ pincode: "012345" }); // Indian PIN codes never start with 0
        assert.equal(res2.status, 400);
    });

    test("POST /api/delivery/check returns serviceability and delivery timeline for valid PIN code", async () => {
        const res = await request(app)
            .post("/api/delivery/check")
            .send({ pincode: "560038" }); // Bengaluru

        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
        assert.equal(res.body.data.pincode, "560038");
        assert.equal(res.body.data.city, "Bengaluru");
        assert.equal(res.body.data.state, "Karnataka");
        assert.ok(res.body.data.estimatedDays >= 1);
        assert.ok(res.body.data.estimatedDeliveryDate);
        assert.equal(res.body.data.serviceable, true);
    });

    test("GET /api/products/suggestions returns search suggestions for partial query", async () => {
        const res = await request(app).get("/api/products/suggestions?q=phone");
        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
        assert.ok(Array.isArray(res.body.data.products));
        assert.ok(Array.isArray(res.body.data.categories));
        assert.ok(Array.isArray(res.body.data.brands));
    });

    test("GET /api/products/deals returns top discounted products", async () => {
        const res = await request(app).get("/api/products/deals?limit=5");
        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
        assert.ok(Array.isArray(res.body.data));
    });

    test("GET /api/products/brands returns marketplace brands", async () => {
        const res = await request(app).get("/api/products/brands");
        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
        assert.ok(Array.isArray(res.body.data));
    });

    test("GET /api/stores returns list of active marketplace stores", async () => {
        const res = await request(app).get("/api/stores");
        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
        assert.ok(Array.isArray(res.body.data));
    });

    test("GET /api/stores/top-rated returns top verified seller stores", async () => {
        const res = await request(app).get("/api/stores/top-rated?limit=4");
        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
        assert.ok(Array.isArray(res.body.data));
    });

    test("GET /api/categories returns active marketplace categories", async () => {
        const res = await request(app).get("/api/categories");
        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
        assert.ok(Array.isArray(res.body.data));
    });

    test("GET /api/home returns enriched marketplace homepage data", async () => {
        const res = await request(app).get("/api/home");
        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
        assert.ok(res.body.data.hero);
        assert.ok(Array.isArray(res.body.data.banners));
        assert.ok(Array.isArray(res.body.data.deals));
        assert.ok(Array.isArray(res.body.data.topStores));
    });

});
