import {Stack, useRouter, useSegments} from "expo-router";
import {ActivityIndicator, View} from "react-native";
import {useEffect, useState} from "react";
// import auth, {FirebaseAuthTypes} from "@react-native-firebase/auth";
import usePlatform from "@/lib/hooks/usePlatform";
import Providers from "@/lib/components/Providers";
import {load, loadString} from "@/lib/utils/storage";
import {useAuth} from "@/lib/context/AuthContext";

function InitialLayout() {
    const router = useRouter();
    const segments = useSegments();
    const platform = usePlatform();


    // const onAuthStateChanged = (user: FirebaseAuthTypes.User | null) => {
    //     setUser(user);
    //     if (initializing) setInitializing(false);
    // }

    // const onAuthStateChanged = async () => {
    //     const accessToken = await loadString('access_token');
    //     const user = await load('user');
    //
    //     if (accessToken) {
    //         //     TODO validar el token si es aun valido.
    //         console.log({user, accessToken})
    //         setUser(user)
    //     }
    //     if (initializing) setInitializing(false);
    // }


    // useEffect(() => {
    // const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    //
    // return subscriber;

    // onAuthStateChanged();
    // }, []);

    // useEffect(() => {
    // if (initializing) return;

    // const inAuthGroup = segments[0] === 'auth';
    //
    // if (user && !inAuthGroup) {
    //     router.replace('/auth/tabs/resume');
    // } else if (!user && inAuthGroup) {
    //     router.replace('/');
    // }
    // }, [user, initializing]);

    // if (initializing) {
    //     return (
    //         <View
    //             style={{
    //                 flex: 1,
    //                 justifyContent: "center",
    //                 alignItems: "center",
    //             }}
    //         >
    //             <ActivityIndicator/>
    //         </View>
    //     )
    // }

    return (

        <Stack>
            <Stack.Screen name="index" options={{headerShown: false}}/>
            <Stack.Screen name="auth" options={{headerShown: false}}/>
            <Stack.Screen name="login" options={{presentation: 'modal',}}/>
        </Stack>

    )
}

export default function RootLayout() {
    return (
        <Providers>
            <InitialLayout/>
        </Providers>
    )
}
