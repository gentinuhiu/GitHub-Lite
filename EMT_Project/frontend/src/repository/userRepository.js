import axiosInstance from "../axios/axios.js";

const userRepository = {
    profile: async (data) => {
        return await axiosInstance.post(`/user/${encodeURIComponent(data)}`);
    },
    search: async (data) => {
        return await axiosInstance.post("/user", data);
    }
    // register: async (data) => {
    //     return await axiosInstance.post("/auth/register", data);
    // },
    // login: async (data) => {
    //     return await axiosInstance.post("/auth/login", data);
    // },
    // logout: async () => {
    //     return await axiosInstance.get("/auth/logout");
    // },
    // forgotPassword: async (data)  => {
    //     return await axiosInstance.post("/auth/forgot-password", data);
    // },
    // resetPassword: async (data) => {
    //     return await axiosInstance.post("/auth/reset-password", data);
    // }
};

export default userRepository;