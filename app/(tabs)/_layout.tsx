import {Tabs, useRouter} from 'expo-router';
import React from 'react';

import Feather from '@expo/vector-icons/Feather';

import {Alert, Platform, Text, useColorScheme, View} from "react-native";
import CustomBottomBar from "@/lib/components/ui/CustomBottomBar";
import {Button, useTheme} from "tamagui";
import {resetCurrentTransaction} from "@/lib/store/features/transactions/transactionsSlice";
import {useAppDispatch} from "@/lib/store/hooks";
import {AntDesign, Entypo} from "@expo/vector-icons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import * as Haptics from "expo-haptics";
import {useTranslation} from "react-i18next";

export default function TabLayout() {
    const theme = useTheme()
    const isIos = Platform.OS === 'ios';
    const router = useRouter();
    const schemeColor = useColorScheme();
    const dispatch = useAppDispatch();
    const {t} = useTranslation();

    async function onPressNewTransaction() {
        await Haptics.selectionAsync();
        dispatch(resetCurrentTransaction());
        router.push('/transactionCreateUpdate');
    }

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: theme.color10.val,
                tabBarStyle: isIos ? {
                    position: 'absolute',
                    borderTopWidth: 0,
                    paddingHorizontal: 30
                } : {borderTopWidth: 0, elevation: 0, paddingHorizontal: 30},
                tabBarItemStyle: {
                    height: 50,
                    marginTop: 2,
                },
                tabBarBackground: () => <CustomBottomBar/>
            }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: '',
                    headerShown: false,
                    tabBarIcon: ({color, focused}) => (
                        <AntDesign name="clockcircle" size={28} color={color}/>
                    ),
                }}
            />
            <Tabs.Screen
                name="scheduledTransactions"
                options={{
                    title: '',
                    tabBarIcon: ({color}) => (
                        <FontAwesome6 style={{ transform: 'rotate(280deg)' }} name="arrow-rotate-right" size={28} color={color}/>
                    )
                }}
                listeners={() => ({
                    tabPress: e => {
                        e.preventDefault();
                        Alert.alert(t('COMMON.WARNING'), t('COMMON.MESSAGES.SCREEN_UNDER_DEVELOPMENT'))
                    }
                })}
            />
            <Tabs.Screen
                name="action"
                options={{
                    title: '',
                    tabBarIcon: () => (
                        <Button onPress={onPressNewTransaction} size="$2.5" borderRadius="$12">
                            <Feather name="plus" size={20} color={schemeColor === 'light' ? 'black' : 'white'}/>
                        </Button>
                    )
                }}
                listeners={() => ({
                    tabPress: e => {
                        e.preventDefault();
                    }
                })}
            />
            <Tabs.Screen
                name="(reports)"
                options={{
                    headerShown: false,
                    title: '',
                    tabBarIcon: ({color, focused}) => (
                        <Feather name="bar-chart" size={28} color={color}/>
                    ),
                }}
            />
            <Tabs.Screen
                name="(settings)"
                options={{
                    title: '',
                    headerShown: false,
                    tabBarIcon: ({color, focused}) => (
                        <Entypo name="dots-three-horizontal" size={28} color={color}/>
                    ),
                }}
            />
        </Tabs>
    );
}
