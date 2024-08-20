import {Provider} from "react-redux";
import {store} from "@/lib/store";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import {useColorScheme} from "@/lib/hooks/useColorScheme";
import {SQLiteProvider} from "expo-sqlite";
import {migrateDbIfNeeded} from "@/lib/db";
import {TamaguiProvider} from "tamagui";
import tamaguiConfig from "@/lib/styles/tamagui.config";


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
    // TODO support logout from settings

    return (
        <Provider store={store}>
            <TamaguiProvider config={tamaguiConfig} defaultTheme={colorScheme === 'light' ? 'light' : 'dark'}>
                <SQLiteProvider databaseName="finanzas_ok.db" onInit={migrateDbIfNeeded}>
                    <GestureHandlerRootView>
                        {children}
                    </GestureHandlerRootView>
                </SQLiteProvider>
            </TamaguiProvider>
        </Provider>
    )
}
