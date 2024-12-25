import {Stack, useRouter, useSegments} from "expo-router";
import {ActivityIndicator, View} from "react-native";
import {useEffect, useState} from "react";
import auth, {FirebaseAuthTypes} from "@react-native-firebase/auth";
import usePlatform from "@/lib/hooks/usePlatform";
import Providers from "@/lib/components/Providers";

export default function RootLayout() {
    const [initializing, setInitializing] = useState(true);
    const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
    const router = useRouter();
    const segments = useSegments();
    const platform = usePlatform();

    const onAuthStateChanged = (user: FirebaseAuthTypes.User | null) => {
        setUser(user);
        if (initializing) setInitializing(false);
    }

    useEffect(() => {
        const subscriber = auth().onAuthStateChanged(onAuthStateChanged);

        return subscriber;
    }, []);

    useEffect(() => {
        if (initializing) return;

        const inAuthGroup = segments[0] === 'auth';

        if (user && !inAuthGroup) {
            router.replace('/auth/tabs/resume');
        } else if (!user && inAuthGroup) {
            router.replace('/');
        }

    }, [user, initializing]);

    if (initializing) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <ActivityIndicator/>
            </View>
        )
    }

    return (
        <Providers>
            <Stack>
                <Stack.Screen name="index" options={{headerShown: false}}/>
                <Stack.Screen name="auth" options={{headerShown: false}}/>
                <Stack.Screen name="login" options={{
                    presentation: platform === 'android' ? 'modal' : 'formSheet',
                    sheetAllowedDetents: [0.6, 1],
                    sheetGrabberVisible: true,
                    sheetCornerRadius: 20,
                    sheetExpandsWhenScrolledToEdge: true,
                }}/>
            </Stack>
        </Providers>
    )
}
