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

export default function Providers({children}: { children: React.ReactNode }) {
    const colorScheme = useColorScheme();
    return (
        <Provider store={store}>
            <Suspense fallback={<Fallback />}>
                <SQLiteProvider databaseName="lsm_expense_tracker.db" onInit={migrateDbIfNeeded}>
                    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : defaultTheme}>
                        <GestureHandlerRootView>
                            {children}
                        </GestureHandlerRootView>
                    </ThemeProvider>
                </SQLiteProvider>
            </Suspense>
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
