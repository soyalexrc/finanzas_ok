import {Tabs} from 'expo-router';
import React, {Suspense, useEffect} from 'react';

import Feather from '@expo/vector-icons/Feather';

import {Platform, Text, View} from "react-native";
import CustomBottomBar from "@/lib/components/ui/CustomBottomBar";
import {useTheme} from "tamagui";
import {getCurrentWeek} from "@/lib/helpers/date";
import {
    getAllAccounts,
    getAllCategories,
    getTransactions,
    getTransactionsGroupedAndFiltered,
    migrateDbIfNeeded
} from "@/lib/db";
import {SQLiteProvider} from "expo-sqlite";

export default function TabLayout() {
    const theme = useTheme()
    const isIos = Platform.OS === 'ios';

    return (
        <Suspense fallback={<Fallback/>}>
            <SQLiteProvider databaseName="finanzas_ok.db" onInit={migrateDbIfNeeded}>
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
                        name="(settings)"
                        options={{
                            headerShown: false,
                            title: '',
                            tabBarIcon: ({color, focused}) => (
                                <Feather name="settings" size={28} color={color}/>
                            ),
                        }}
                    />
                </Tabs>
            </SQLiteProvider>
        </Suspense>
    );
}

function Fallback() {
    return (
        <View>
            <Text>Loading...</Text>
        </View>
    )
}
