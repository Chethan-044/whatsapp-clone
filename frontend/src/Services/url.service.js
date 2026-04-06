import axios from 'axios';

const  apiurl = `${process.env.REACT_APP_BACKEND_URL}/api/`;


const axiosInstance = axios.create({
    baseURL: apiurl,
    withCredentials: true,

})

export default axiosInstance;