import homeRepository from "../repositories/home.repository.js";

class HomeService {
    async getHomePageData() {
        return await homeRepository.getHomeSettings();
    }
}

export default new HomeService();