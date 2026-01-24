import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.PROD 
        ? "https://agaciro.onrender.com" 
        : "http://localhost:3000",
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
        // @ts-ignore allow assignment in case of readonly types in some axios versions
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Only set Content-Type if not FormData (multipart will set it automatically)
    if (!(config.data instanceof FormData) && !config.headers["Content-Type"]) {
        config.headers["Content-Type"] = "application/json";
    }
    
    return config;
});

export default api;