import {Provider} from "react-redux";
import {store} from "@/lib/store";
import {DarkTheme, ThemeProvider} from "@react-navigation/native";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import {useColorScheme} from "@/lib/hooks/useColorScheme";
import {SQLiteProvider} from "expo-sqlite";
import {migrateDbIfNeeded} from "@/lib/db";
import {Suspense} from "react";
import {Text, View} from "react-native";
import {defaultTheme} from "@/lib/styles/theme";
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

    // TODO hacer wrapper context para guardar el valor de thema seleccionado para usar abajo y no el colorscheme directamente... tambien manejar color de iconos basado en ese wrapper
    return (
        <Provider store={store}>
            <TamaguiProvider config={tamaguiConfig} defaultTheme={colorScheme === 'light' ? 'light' : 'dark'}>
                <Suspense fallback={<Fallback/>}>
                    <SQLiteProvider databaseName="lsm_expense_tracker.db" onInit={migrateDbIfNeeded}>
                        <GestureHandlerRootView>
                            {children}
                        </GestureHandlerRootView>
                    </SQLiteProvider>
                </Suspense>
            </TamaguiProvider>
        </Provider>
    )
}

function Fallback() {
    return (
        <View>
            <Text>Loading...</Text>
        </View>
    )
}
