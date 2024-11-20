import {Tabs, useRouter} from 'expo-router';
import React from 'react';

import Feather from '@expo/vector-icons/Feather';

import {Alert, Platform, Text, TouchableOpacity, useColorScheme, View} from "react-native";
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
                    height: 60,
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
                        <Feather name="clock" size={28} color={color}/>
                    ),
                }}
            />
            <Tabs.Screen
                name="paymentScheduling"
                options={{
                    title: '',
                    headerShown: false,
                    tabBarIcon: ({color}) => (
                        <Entypo name="calendar" size={28} color={color}/>
                    )
                }}
            />
            <Tabs.Screen
                name="action"
                options={{
                    title: '',
                    tabBarIcon: () => (
                        <TouchableOpacity onPress={onPressNewTransaction}
                            style={{
                                backgroundColor: theme.color10?.val,
                                width: 40,
                                height: 40,
                                borderRadius: 25,
                                justifyContent: 'center',
                                alignItems: 'center',
                                position: 'absolute',
                                // bottom: 5,
                                // zIndex: 100,
                                // shadowColor: '#000',
                                // shadowOffset: {
                                //     width: 0,
                                //     height: 2,
                                // },
                                // shadowOpacity: 0.25,
                                // shadowRadius: 3.84,
                                // elevation: 5,
                            }}
                        >
                            <Feather name="plus" size={20} color="white"/>
                        </TouchableOpacity>
                    )
                }}
                listeners={() => ({
                    tabPress: e => {
                        e.preventDefault();
                    }
                })}
            />
            <Tabs.Screen
                name="wallet"
                options={{
                    title: '',
                    headerShown: false,
                    tabBarIcon: ({color}) => (
                        <Entypo name="wallet" size={28} color={color}/>
                    )
                }}
            />
            <Tabs.Screen
                name="(reports)"
                options={{
                    headerShown: false,
                    title: '',
                    tabBarItemStyle: {
                        display: 'none'
                    },
                    tabBarIcon: ({color, focused}) => (
                        <Feather name="bar-chart" size={28} color={color}/>
                    ),
                }}
                listeners={() => ({
                    tabPress: e => {
                        e.preventDefault();
                        Alert.alert(t('COMMON.WARNING'), t('COMMON.MESSAGES.SCREEN_UNDER_DEVELOPMENT'))
                    }
                })}
            />
            <Tabs.Screen
                name="(settings)"
                options={{
                    title: '',
                    headerShown: false,
                    tabBarIcon: ({color, focused}) => (
                        <Feather name="settings" size={28} color={color}/>
                    ),
                }}
            />
        </Tabs>
    );
}
