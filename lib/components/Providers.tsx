import {Provider} from "react-redux";
import {store} from "@/lib/store";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import {useColorScheme} from "@/lib/hooks/useColorScheme";
import {SQLiteProvider} from "expo-sqlite";
import {migrateDbIfNeeded} from "@/lib/db";
import {Suspense} from "react";
import {Text, View} from "react-native";
import {TamaguiProvider} from "tamagui";
import tamaguiConfig from "@/lib/styles/tamagui.config";
import {ClerkLoaded, ClerkProvider} from "@clerk/clerk-expo";
import {tokenCache} from "@/lib/helpers/auth";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!

export default function Providers({children}: { children: React.ReactNode }) {
    const colorScheme = useColorScheme();

    // TODO manejar i18n
    // TODO export e impport data
    // TODO erase data and restore full app data functionality
    // TODO rate app link
    // TODO notificaciones con timer
    // TODO contactar developer mail functionality
    // TODO Share app functionality
    // TODO support developer payments functionality
    if (!publishableKey) {
        throw new Error(
            'Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env',
        )
    }

    return (
        <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
            <ClerkLoaded>
                <Provider store={store}>
                    <TamaguiProvider config={tamaguiConfig} defaultTheme={colorScheme === 'light' ? 'light' : 'dark'}>
                        <SQLiteProvider databaseName="finanzas_ok.db">
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
