import {Tabs} from 'expo-router';
import React from 'react';

import Feather from '@expo/vector-icons/Feather';

import {Platform, View} from "react-native";
import {BlurView} from "expo-blur";
import {useColorScheme} from "@/lib/hooks/useColorScheme";
import {Colors} from "@/lib/constants/Colors";
import CustomBottomBar from "@/lib/components/ui/CustomBottomBar";

export default function TabLayout() {
    const colorScheme = useColorScheme();
    const isIos = Platform.OS === 'ios';
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
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
