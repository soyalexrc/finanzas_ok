import * as SecureStore from "expo-secure-store";

export default function useSecureStorage<T>() {
    const getValue = async (key: string) => {
        const data = await SecureStore.getItemAsync(key);
        return data ?? '';
    }

    const setValue = async (key: string, data: string) => {
        await SecureStore.setItemAsync(key, data);
    }

    return {getValue, setValue};
}
