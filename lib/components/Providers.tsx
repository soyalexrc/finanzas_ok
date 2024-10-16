import {Provider} from "react-redux";
import {store} from "@/lib/store";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import {useColorScheme} from "@/lib/hooks/useColorScheme";
import {SQLiteProvider} from "expo-sqlite";
import {migrateDbIfNeeded} from "@/lib/db";
import {TamaguiProvider} from "tamagui";
import tamaguiConfig from "@/lib/styles/tamagui.config";
import {ClerkLoaded, ClerkProvider} from "@clerk/clerk-expo";
import * as SecureStore from 'expo-secure-store'


export default function Providers({children}: { children: React.ReactNode }) {
    const colorScheme = useColorScheme();
    const tokenCache = {
        async getToken(key: string) {
            try {
                const item = await SecureStore.getItemAsync(key)
                if (item) {
                    console.log(`${key} was used 🔐 \n`)
                } else {
                    console.log('No values stored under key: ' + key)
                }
                return item
            } catch (error) {
                console.error('SecureStore get item error: ', error)
                await SecureStore.deleteItemAsync(key)
                return null
            }
        },
        async saveToken(key: string, value: string) {
            try {
                return SecureStore.setItemAsync(key, value)
            } catch (err) {
                return
            }
        },
    }
    const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!

    if (!publishableKey) {
        throw new Error(
            'Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env',
        )
    }
    // TODO manejar i18n
    // TODO export e impport data
    // TODO erase data and restore full app data functionality
    // TODO rate app link
    // TODO notificaciones con timer
    // TODO contactar developer mail functionality
    // TODO Share app functionality
    // TODO support developer payments functionality
    // TODO support logout from settings

    return (
        <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
            <ClerkLoaded>
                <Provider store={store}>
                    <TamaguiProvider config={tamaguiConfig} defaultTheme={colorScheme === 'light' ? 'light' : 'dark'}>
                        <SQLiteProvider databaseName="finanzas_ok.db" onInit={migrateDbIfNeeded}>
                            <GestureHandlerRootView>
                                {children}
                            </GestureHandlerRootView>
                        </SQLiteProvider>
                    </TamaguiProvider>
                </Provider>
            </ClerkLoaded>
        </ClerkProvider>
    )
}
