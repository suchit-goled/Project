import api from "../api/axios";

const ProfileService = {

    async getProfile() {
        const response = await api.get("/users/profile");
        return response.data;
    },

    async updateProfile(data) {
        const response = await api.put("/users/profile", data);
        return response.data;
    },

};

export default ProfileService;