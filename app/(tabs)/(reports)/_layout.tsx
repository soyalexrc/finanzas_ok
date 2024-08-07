import {Stack, useRouter} from "expo-router";
import React from "react";
import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {BlurView} from "expo-blur";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function ReportsLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    headerShown: false,
                    // header: () => <HomeHeader />,
                    // headerTransparent: true,
                    // headerBlurEffect: 'light'

                }}
            />
            <Stack.Screen
                name="detailGroup"
                options={{
                    header: () => <CustomHeader />
                }}
            />
        </Stack>
    )
}

function CustomHeader() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    return (
        <BlurView intensity={100} tint='prominent' style={[styles.header, { paddingTop: insets.top }]}>
            <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialCommunityIcons name="chevron-left" size={30} color="gray" />
                <Text style={{ fontSize: 18, color: 'gray' }}>Back</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 18 }}>Snacks - S/ 70.00</Text>
        </BlurView>
    )
}


const styles = StyleSheet.create({
    header: {
        position: 'absolute',
        top: 0,
        right: 0,
        left: 0,
        zIndex: 100,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingBottom: 10,
    }
});

