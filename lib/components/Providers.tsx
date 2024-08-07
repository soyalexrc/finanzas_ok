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
