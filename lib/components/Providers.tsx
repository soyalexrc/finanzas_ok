import {GestureHandlerRootView} from "react-native-gesture-handler";
import {ThemeProvider} from "@react-navigation/core";
import {DefaultTheme} from "@react-navigation/native";
import {useColorScheme} from "react-native";
import {Provider} from "react-redux";
import {store} from '@/lib/store';
import {Toaster} from 'sonner-native';
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {AuthProvider} from "@/lib/context/AuthContext";

const queryClient = new QueryClient();

export default function Providers({children}: { children: React.ReactNode }) {
    const scheme = useColorScheme();
    return (
        <AuthProvider>
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <ThemeProvider value={scheme === 'dark' ? DefaultTheme : DefaultTheme}>
                        <GestureHandlerRootView style={{flex: 1}}>
                            {children}
                            <Toaster/>
                        </GestureHandlerRootView>
                    </ThemeProvider>
                </QueryClientProvider>
            </Provider>
        </AuthProvider>

    );
}
