import adminRepository from "../repositories/admin.repository.js";

class AdminService {

    async getDashboardStats() {
        return await adminRepository.getDashboardStats();
    }

}

export default new AdminService();