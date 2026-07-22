import homeService from "../services/home.service.js";
import ApiResponse from "../utils/apiResponse.js";

class HomeController {
    async getHome(req, res, next) {
        try {
            const homeData = await homeService.getHomePageData();

            ApiResponse.success(
    res,
    homeData,
    "Home page loaded successfully."
);
        } catch (error) {
            next(error);
        }
    }
}

export default new HomeController();