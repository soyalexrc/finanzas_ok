// src/api/axiosInstance.ts
import axios from "axios";
import {Alert} from "react-native";
import {remove} from "@/lib/utils/storage";
import {AUTH_DATA} from "@/lib/enums/auth";
import {router} from "expo-router";

let isAlertShown = false; // Prevent multiple alerts

// Logout function
const logoutUser = async () => {
    try {
        await remove(AUTH_DATA.USER); // Remove stored token
        await remove(AUTH_DATA.TOKEN); // Remove stored token
        isAlertShown = false; // Reset flag when user logs out
        // Redirect to login screen
        router.replace('/')
    } catch (error) {
        console.error("Error logging out:", error);
    }
};

const api = axios.create({
    baseURL: "https://finanzas-ok-backend-589962407829.us-central1.run.app", // Replace with your API
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
    },
});
console.log('isAlertShown', isAlertShown)

// Axios interceptor to catch 401 errors
api.interceptors.response.use(
    response => response,
    async error => {
        console.log(error.response);
        if (error.response?.status === 401 && !isAlertShown) {
            isAlertShown = true; // Set flag to prevent multiple alerts
            Alert.alert('Su sesion ha vencido', 'por favor inicie sesion nuevamente', [
                {
                    text: 'Ok', onPress: async () => await logoutUser()
                }
            ])

            // logoutUser()
            // await logoutUser();
        }
        return Promise.reject(error);
    }
);

export default api;
