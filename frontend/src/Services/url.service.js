import axios from "axios";

const apiurl = `${import.meta.env.VITE_BACKEND_URL}/api/`;

const axiosInstance = axios.create({
    baseURL: apiurl,
    withCredentials: true,
});

export default axiosInstance;