import {GestureHandlerRootView} from "react-native-gesture-handler";
import {ThemeProvider} from "@react-navigation/core";
import {DefaultTheme} from "@react-navigation/native";
import {useColorScheme} from "react-native";
import {Provider} from "react-redux";
import {store} from '@/lib/store';
import {Toaster} from 'sonner-native';

export default function Providers({children}: { children: React.ReactNode }) {
    const scheme = useColorScheme();
    return (
        <Provider store={store}>
            <ThemeProvider value={scheme === 'dark' ? DefaultTheme : DefaultTheme}>
                <GestureHandlerRootView style={{flex: 1}}>
                    {children}
                    <Toaster/>
                </GestureHandlerRootView>
            </ThemeProvider>
        </Provider>
    );
}
