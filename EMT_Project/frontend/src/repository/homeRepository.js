import axiosInstance from "../axios/axios.js";

const homeRepository = {
    index: async () => {
        return await axiosInstance.get("/home");
    },
    search: async (data) => {
        return await axiosInstance.post("/home/search", data);
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

export default homeRepository;
