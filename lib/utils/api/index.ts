// src/api/axiosInstance.ts
import axios from "axios";

const api = axios.create({
    baseURL: "https://finanzas-ok-backend-589962407829.us-central1.run.app", // Replace with your API
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
    },
});

export default api;
