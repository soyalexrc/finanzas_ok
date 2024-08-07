import {Tabs} from 'expo-router';
import React from 'react';

import Feather from '@expo/vector-icons/Feather';

import {Platform} from "react-native";
import CustomBottomBar from "@/lib/components/ui/CustomBottomBar";
import {useTheme} from "tamagui";

export default function TabLayout() {
    const theme = useTheme()
    const isIos = Platform.OS === 'ios';
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: theme.color10.val,
                tabBarStyle: isIos ? { position: 'absolute' } : {},
                tabBarItemStyle: {
                    height: 50,
                    marginTop: 2,
                },
                tabBarBackground: () => <CustomBottomBar />
            }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: '',
                    headerShown: false,
                    tabBarIcon: ({color, focused}) => (
                        <Feather name="inbox" size={28} color={color}/>
                    ),
                }}
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
                name="settings"
                options={{
                    title: '',
                    tabBarIcon: ({color, focused}) => (
                        <Feather name="settings" size={28} color={color}/>
                    ),
                }}
            />
        </Tabs>
    );
}
