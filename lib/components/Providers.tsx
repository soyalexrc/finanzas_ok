import {GestureHandlerRootView} from "react-native-gesture-handler";
import {ThemeProvider} from "@react-navigation/core";
import {DefaultTheme} from "@react-navigation/native";
import {useColorScheme} from "react-native";

export default function Providers({ children }: { children: React.ReactNode }) {
    const scheme = useColorScheme();
    return (
        <ThemeProvider value={scheme === 'dark' ? DefaultTheme : DefaultTheme}>
            <GestureHandlerRootView style={{ flex: 1 }}>
                {children}
            </GestureHandlerRootView>
        </ThemeProvider>
    );
}
