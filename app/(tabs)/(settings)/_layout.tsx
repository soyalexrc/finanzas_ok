import {Stack, useRouter} from "expo-router";
import React from "react";
import {Button, Text, useTheme} from "tamagui";
import {TouchableOpacity, useColorScheme} from "react-native";
import {Feather} from "@expo/vector-icons";
import {useAppDispatch} from "@/lib/store/hooks";
import {resetAccountCreateUpdate} from "@/lib/store/features/accounts/accountsSlice";

export default function SettingsLayout() {
    const theme = useTheme();
    const schemeColor = useColorScheme();
    const dispatch = useAppDispatch();
    const router = useRouter();

    function onPressCreateAccount() {
        dispatch(resetAccountCreateUpdate());
        router.push('/createEditAccount')
    }

    return (
        <Stack screenOptions={{headerBackTitle: 'Back'}}>
            <Stack.Screen
                name="index"
                options={{
                    title: 'Settings',
                    headerBlurEffect: 'prominent',
                    headerTransparent: true,
                    headerTintColor: theme.color12.val,
                }}
            />
            <Stack.Screen name="appearance" options={{
                headerBlurEffect: 'prominent',
                headerTransparent: true,
                headerTintColor: theme.color12.val
            }}/>

            <Stack.Screen name="accounts" options={{
                headerBlurEffect: 'prominent',
                headerTransparent: true,
                headerTintColor: theme.color12.val,
                headerRight: () => (
                    <Button size="$2" borderRadius="$12" onPress={onPressCreateAccount}>
                        <Feather name="plus" size={20} color={schemeColor === 'light' ? 'black' : 'white'}/>
                    </Button>
                )
            }}/>

            <Stack.Screen
                name="createEditAccount"
                options={{presentation: 'modal', gestureEnabled: false, headerShown: false}}
            />
        </Stack>
    )
}
