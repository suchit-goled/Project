import HomeSettings from "../models/HomeSettings.js";

class HomeRepository {
    async getHomeSettings() {
        try {
            let settings = await HomeSettings.findOne()
                .populate("featuredProducts")
                .populate("trendingProducts");

            if (!settings) {
                settings = {
                    hero: {
                        badge: "PREMIUM ELECTRONICS",
                        title: "Experience Technology",
                        highlight: "Without Limits.",
                        description: "Discover premium electronics curated for creators, professionals and gamers.",
                        primaryButton: "Shop Collection",
                        secondaryButton: "Explore Deals"
                    },
                    featuredProducts: [],
                    trendingProducts: []
                };
            }

            return settings;
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
                trendingProducts: []
            };
        }
    }
}

export default new HomeRepository();