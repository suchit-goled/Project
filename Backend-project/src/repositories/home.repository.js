import HomeSettings from "../models/HomeSettings.js";
import Product from "../models/Product.js";
import Store from "../models/store.model.js";
import Category from "../models/category.model.js";
import Brand from "../models/brand.model.js";

class HomeRepository {
    async getHomeSettings() {
        try {
            let settings = await HomeSettings.findOne()
                .populate("featuredProducts")
                .populate("trendingProducts");

            const hero = settings?.hero || {
                badge: "PREMIUM MULTI-VENDOR MARKETPLACE",
                title: "Experience Technology",
                highlight: "Without Limits.",
                description: "Shop directly from verified Indian sellers and brand stores with guaranteed authenticity.",
                primaryButton: "Explore Marketplace",
                secondaryButton: "Today's Deals"
            };

            const [
                featuredProducts,
                deals,
                bestSellers,
                categories,
                topStores,
                brands
            ] = await Promise.all([
                Product.find({ isFeatured: true })
                    .populate("storeId", "name slug rating totalReviews pickupAddress")
                    .limit(8),
                Product.find({ discount_percentage: { $gte: 15 } })
                    .populate("storeId", "name slug rating totalReviews pickupAddress")
                    .sort({ discount_percentage: -1 })
                    .limit(8),
                Product.find()
                    .populate("storeId", "name slug rating totalReviews pickupAddress")
                    .sort({ total_reviews: -1, product_rating: -1 })
                    .limit(8),
                Category.find({ isActive: true })
                    .sort({ displayOrder: 1, name: 1 })
                    .limit(14),
                Store.find({ isActive: true })
                    .select("name slug tagline description logo banner rating totalReviews pickupAddress deliveryOptions")
                    .sort({ rating: -1, totalReviews: -1 })
                    .limit(6),
                Brand.find({ isActive: true })
                    .select("name slug logo")
                    .limit(12)
            ]);

            const banners = [
                {
                    id: "banner-1",
                    title: "Mega Electronics Carnival",
                    subtitle: "Up to 40% Off on Laptops, Flagship Phones & Audio",
                    badge: "LIMITED TIME SALE",
                    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80",
                    link: "/deals",
                    cta: "Shop Deals Now",
                },
                {
                    id: "banner-2",
                    title: "Next-Gen Gaming & Workstations",
                    subtitle: "RTX 40-Series Laptops & Mechanical Keyboards",
                    badge: "PRO GAMER PICKS",
                    image: "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=1200&auto=format&fit=crop&q=80",
                    link: "/products?category=Gaming%20Accessories",
                    cta: "Explore Gaming",
                },
                {
                    id: "banner-3",
                    title: "Audiophile Sound & Noise Cancelling",
                    subtitle: "Sony, Bose, Marshall & Apple Studio Audio",
                    badge: "HI-RES AUDIO",
                    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=80",
                    link: "/products?category=Headphones",
                    cta: "Listen Now",
                },
            ];

            return {
                hero,
                featuredProducts: featuredProducts.length > 0 ? featuredProducts : (settings?.featuredProducts || []),
                trendingProducts: bestSellers.length > 0 ? bestSellers : (settings?.trendingProducts || []),
                deals,
                bestSellers,
                categories,
                topStores,
                brands,
                banners,
            };
        } catch (error) {
            console.error("HomeRepository getHomeSettings error:", error.message);
            return {
                hero: {
                    badge: "PREMIUM ELECTRONICS",
                    title: "Experience Technology",
                    highlight: "Without Limits.",
                    description: "Discover premium electronics curated for creators, professionals and gamers.",
                    primaryButton: "Shop Collection",
                    secondaryButton: "Explore Deals"
                },
                featuredProducts: [],
                trendingProducts: [],
                deals: [],
                bestSellers: [],
                categories: [],
                topStores: [],
                brands: [],
                banners: [],
            };
        }
    }
}

export default new HomeRepository();