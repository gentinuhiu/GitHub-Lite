// import axios from "axios";
//
// const axiosInstance = axios.create({
//     baseURL: "http://localhost:8080/api",
//     headers: {
//         "Content-Type": "application/json",
//     },
// });
//
// axiosInstance.interceptors.request.use(
//     (config) => {
//         const jwtToken = localStorage.getItem("token");
//         if (jwtToken) {
//             config.headers.Authorization = `Bearer ${jwtToken}`;
//         }
//         return config;
//     },
//     (error) => {
//         if (error.response.status === 401 || error.response.status === 403) {
//             console.log("Invalid token");
//             localStorage.removeItem("token");
//             window.location.href = "/login";
//         }
//         return Promise.reject(error);
//     },
// );
//
// export default axiosInstance;
import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "http://localhost:8080/api",
    // 👇 Do NOT set a global Content-Type here
    // headers: { "Content-Type": "application/json" },
});

// Add JWT + set Content-Type conditionally
axiosInstance.interceptors.request.use((config) => {
    const jwtToken = localStorage.getItem("token");
    if (jwtToken) {
        config.headers.Authorization = `Bearer ${jwtToken}`;
    }

    const isFormData = typeof FormData !== "undefined" && config.data instanceof FormData;
    const isBlob = typeof Blob !== "undefined" && config.data instanceof Blob;
    const isPlainObject =
        config.data &&
        Object.prototype.toString.call(config.data) === "[object Object]";

    if (isFormData || isBlob) {
        // Let the browser/axios set multipart boundary
        if (typeof config.headers?.delete === "function") {
            config.headers.delete("Content-Type");
        } else {
            delete config.headers["Content-Type"];
        }
    } else if (isPlainObject && !config.headers["Content-Type"]) {
        // JSON only for plain objects
        config.headers["Content-Type"] = "application/json";
    }

    return config;
});

// Handle 401/403 on responses (not request errors)
axiosInstance.interceptors.response.use(
    (res) => res,
    (error) => {
        const status = error?.response?.status;
        if (status === 401 || status === 403) {
            console.log("Invalid token");
            localStorage.removeItem("token");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
