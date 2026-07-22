import api from "../api/axios";

class HomeService {
    async getHomePage() {
        const response = await api.get("/home");
        return response.data.data;
    }
}

export default new HomeService();