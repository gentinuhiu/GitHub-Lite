import axiosInstance from "../axios/axios.js";

const authRepository = {
    register: async (data) => {
        return await axiosInstance.post("/auth/register", data);
    },
    login: async (data) => {
        return await axiosInstance.post("/auth/login", data);
    },
    logout: async () => {
        return await axiosInstance.get("/auth/logout");
    },
    forgotPassword: async (data)  => {
        return await axiosInstance.post("/auth/forgot-password", data);
    },
    resetPassword: async (data) => {
        return await axiosInstance.post("/auth/reset-password", data);
    },
    getUser: async () => {
        return await axiosInstance.get("/auth");
    }
};

export default authRepository;
