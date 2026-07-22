import HomeSettings from "../models/HomeSettings.js";

class HomeRepository {
    async getHomeSettings() {
        return HomeSettings.findOne()
            .populate("featuredCategories")
            .populate("featuredProducts")
            .populate("trendingProducts")
            .populate("featuredBrands");
    }
}

export default new HomeRepository();