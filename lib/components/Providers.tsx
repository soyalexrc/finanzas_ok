import {Provider} from "react-redux";
import {store} from "@/lib/store";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import {useColorScheme} from "react-native";
import {SQLiteProvider} from "expo-sqlite";
import {migrateDbIfNeeded} from "@/lib/db";
import {TamaguiProvider} from "tamagui";
import dynamicTamaguiConfig from "@/lib/styles/tamagui.config";
import {ClerkLoaded, ClerkProvider} from "@clerk/clerk-expo";
import {useAppSelector} from "@/lib/store/hooks";
import {selectCurrentCustomTheme} from "@/lib/store/features/ui/uiSlice";
import {NotificationProvider} from "@/lib/context/NotificationsContext";
import * as Notifications from "expo-notifications";
import {useEffect} from "react";
import Purchases, {LOG_LEVEL} from "react-native-purchases";
import {Alert, Platform} from "react-native";
import {tokenCache} from "@/lib/helpers/auth";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
});


export default function Providers({children}: { children: React.ReactNode }) {
    const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!

    useEffect(() => {
        Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

        if (Platform.OS === 'ios') {
            if (!process.env.EXPO_PUBLIC_RC_IOS_KEY) {
                Alert.alert('Error configuring key', 'no revenue cat key found for ios.')
                return;
            } else {
                Purchases.configure({apiKey: process.env.EXPO_PUBLIC_RC_IOS_KEY});
            }
        } else if (Platform.OS === 'android') {
            if (!process.env.EXPO_PUBLIC_RC_ANDROID_KEY) {
                Alert.alert('Error configuring key', 'no revenue cat key found for android.')
                return;
            } else {
                Purchases.configure({apiKey: process.env.EXPO_PUBLIC_RC_ANDROID_KEY});
            }
        }

        // Purchases.getOfferings().then(console.log)

    }, [])

    if (!publishableKey) {
        throw new Error(
            'Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env',
        )
    }
    // TODO export e impport data
    // TODO use more .android and .ios extensions for platform specific components
    // TODO rate app link
    // TODO notificaciones con timer
    // TODO Share app functionality

    return (
        <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
            <ClerkLoaded>
                <Provider store={store}>
                    <SQLiteProvider databaseName="finanzas_ok.db" onInit={migrateDbIfNeeded}>
                        <GestureHandlerRootView>
                            <ThemeHandler children={children}/>
                        </GestureHandlerRootView>
                    </SQLiteProvider>
                </Provider>
            </ClerkLoaded>
        </ClerkProvider>
    )
}

function ThemeHandler({children}: { children: React.ReactNode }) {
    const currentTheme = useAppSelector(selectCurrentCustomTheme);
    const colorScheme = useColorScheme();

    return (
        <TamaguiProvider config={dynamicTamaguiConfig(currentTheme)}
                         defaultTheme={colorScheme === 'light' ? 'light' : 'dark'}>
            <NotificationProvider>
                {children}
            </NotificationProvider>
        </TamaguiProvider>
    )
}
