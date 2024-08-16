import {Stack, useRouter} from "expo-router";
import React from "react";
import {Button, Text, useTheme} from "tamagui";
import {TouchableOpacity, useColorScheme} from "react-native";
import {Feather} from "@expo/vector-icons";
import {useAppDispatch} from "@/lib/store/hooks";
import {updateAccountCreateUpdate} from "@/lib/store/features/accounts/accountsSlice";

export default function SettingsLayout() {
    const theme = useTheme();
    const schemeColor = useColorScheme();
    const dispatch = useAppDispatch();
    const router = useRouter();

    function onPressCreateAccount() {
        dispatch(updateAccountCreateUpdate({
            id: 0,
            icon: '📬',
            title: '',
            positive_status: 1,
            balance: 0
        }));
        router.push('/createEditAccount')
    }

    return (
        <Stack screenOptions={{headerBackTitle: 'Back'}}>
            <Stack.Screen
                name="index"
                options={{headerShown: false}}
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
