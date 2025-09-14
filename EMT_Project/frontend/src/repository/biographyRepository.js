import axiosInstance from "../axios/axios.js";


const biographyRepository = {
    biography: async () => {
        return await axiosInstance.get("/biography");
    },
    experiences: async () => {
        return await axiosInstance.get("/biography/experiences");
    },
    educations: async () => {
        return await axiosInstance.get("/biography/educations");
    },
    interests: async () => {
        return await axiosInstance.get("/biography/interests");
    },
    links: async () => {
        return await axiosInstance.get("/biography/links");
    },
    createBiography: async (data) => {
        return await axiosInstance.post("/biography/add", data);
    }
}

export default biographyRepository;