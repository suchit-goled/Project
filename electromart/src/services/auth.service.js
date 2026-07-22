import api from "../api/axios";

const AuthService = {

    async signup(userData) {

        const response = await api.post(
            "/auth/register",
            userData
        );

        return response.data;

    },

    async login(credentials) {

        const response = await api.post(
            "/auth/login",
            credentials
        );

        return response.data;

    }

};

export default AuthService;