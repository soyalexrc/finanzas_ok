import {Stack, useRouter} from "expo-router";
import React from "react";
import {Button, Text, useTheme, View} from "tamagui";
import {Platform, TouchableOpacity, useColorScheme} from "react-native";
import {Feather} from "@expo/vector-icons";
import {useAppDispatch} from "@/lib/store/hooks";
import {resetAccountCreateUpdate} from "@/lib/store/features/accounts/accountsSlice";
import {resetCategoryCreateUpdate} from "@/lib/store/features/categories/categoriesSlice";
import {useTranslation} from "react-i18next";

export default function SettingsLayout() {
    const theme = useTheme();
    const schemeColor = useColorScheme();
    const dispatch = useAppDispatch();
    const router = useRouter();
    const isIos = Platform.OS === 'ios';
    const {t} = useTranslation()

    function onPressCreateAccount() {
        dispatch(resetAccountCreateUpdate());
        router.push('/createEditAccount')
    }

    function onPressCreateCategory() {
        dispatch(resetCategoryCreateUpdate());
        router.push('/createEditCategory')
    }

    return (
        <Stack screenOptions={{headerBackTitle: t('COMMON.BACK')}}>
            <Stack.Screen
                name="index"
                options={{
                    title: t('SETTINGS.TITLE'),
                    headerBlurEffect: 'prominent',
                    headerTransparent: isIos,
                    headerTintColor: theme.color12.val,
                    headerStyle: {
                        backgroundColor: theme.color1.val,
                    }
                }}
            />
            <Stack.Screen name="appearance" options={{
                title: t('SETTINGS.APPEARANCE.TITLE'),
                headerBlurEffect: 'prominent',
                headerTransparent: isIos,
                headerTintColor: theme.color12.val,
                headerStyle: {
                    backgroundColor: theme.color1.val,
                },
            }}/>

            <Stack.Screen name="privacy" options={{
                title: t('SETTINGS.PRIVACY.TITLE'),
                headerBlurEffect: 'prominent',
                headerTransparent: isIos,
                headerTintColor: theme.color12.val,
                headerStyle: {
                    backgroundColor: theme.color1.val,
                },
            }}/>

            <Stack.Screen name="other" options={{
                title: t('SETTINGS.OTHER.TITLE'),
                headerBlurEffect: 'prominent',
                headerTransparent: isIos,
                headerTintColor: theme.color12.val,
                headerStyle: {
                    backgroundColor: theme.color1.val,
                },
            }}/>

            <Stack.Screen name="language" options={{
                title: t('SETTINGS.LANGUAGE.TITLE'),
                headerBlurEffect: 'prominent',
                headerTransparent: isIos,
                headerTintColor: theme.color12.val,
                headerStyle: {
                    backgroundColor: theme.color1.val,
                },
            }}/>

            <Stack.Screen name="accounts" options={{
                title: t('SETTINGS.ACCOUNTS.TITLE'),
                headerBlurEffect: 'prominent',
                headerTransparent: isIos,
                headerTintColor: theme.color12.val,
                headerStyle: {
                    backgroundColor: theme.color1.val,
                },
                headerRight: () => (
                    <Button size="$2" borderRadius="$12" onPress={onPressCreateAccount}>
                        <Feather name="plus" size={20} color={schemeColor === 'light' ? 'black' : 'white'}/>
                    </Button>
                )
            }}/>

            <Stack.Screen name="categories" options={{
                headerBlurEffect: 'prominent',
                headerTransparent: isIos,
                title: t('SETTINGS.CATEGORIES.TITLE'),
                headerTintColor: theme.color12.val,
                headerStyle: {
                    backgroundColor: theme.color1.val,
                },
                headerRight: () => (
                    <Button size="$2" borderRadius="$12" onPress={onPressCreateCategory}>
                        <Feather name="plus" size={20} color={schemeColor === 'light' ? 'black' : 'white'}/>
                    </Button>
                )
            }}/>

            <Stack.Screen name="data" options={{
                headerBlurEffect: 'prominent',
                headerTransparent: isIos,
                title: t('SETTINGS.DATA_MANAGEMENT.TITLE'),
                headerTintColor: theme.color12.val,
                headerStyle: {
                    backgroundColor: theme.color1.val,
                },
            }}/>

            <Stack.Screen
                name="createEditAccount"
                options={{presentation: 'modal', gestureEnabled: false, headerShown: false}}
            />

            <Stack.Screen
                name="createEditCategory"
                options={{presentation: 'modal', gestureEnabled: false, headerShown: false}}
            />
        </Stack>
    )
}
