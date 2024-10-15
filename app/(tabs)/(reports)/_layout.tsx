import {Stack, useRouter} from "expo-router";
import React from "react";
import {Text, View} from 'tamagui';
import {Platform, StyleSheet, TouchableOpacity} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {BlurView} from "expo-blur";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {useAppSelector} from "@/lib/store/hooks";
import {selectDetailGroup} from "@/lib/store/features/transactions/reportSlice";
import {calculateTotalTransactions} from "@/lib/helpers/operations";
import {selectSettings} from "@/lib/store/features/settings/settingsSlice";
import {useTranslation} from "react-i18next";

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
                    animation: 'slide_from_right',
                    header: () => <CustomHeader />
                }}
            />
        </Stack>
    )
}

function CustomHeader() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const detailGroup = useAppSelector(selectDetailGroup);
    const {hidden_feature_flag} = useAppSelector(selectSettings)
    const {t} = useTranslation()
    const isIos = Platform.OS === 'ios';

    if (isIos) {
        return (
            <BlurView intensity={100} tint='prominent' style={[styles.header, { paddingTop: insets.top }]}>
                <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialCommunityIcons name="chevron-left" size={30} color="gray" />
                    <Text fontSize={16} color="$gray10Dark">{t('COMMON.BACK')}</Text>
                </TouchableOpacity>
                <Text fontSize="$7" fontWeight="bold">{detailGroup.category.title}:  {detailGroup.account.currency_symbol} {calculateTotalTransactions(detailGroup.transactions, hidden_feature_flag)}</Text>
            </BlurView>
        )
    } else {
        return (
            <View backgroundColor="$color1" style={[styles.headerAndroid, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialCommunityIcons name="chevron-left" size={30} color="gray" />
                    <Text fontSize={16} color="$gray10Dark">{t('COMMON.BACK')}</Text>
                </TouchableOpacity>
                <Text fontSize="$7" fontWeight="bold">{detailGroup.category.title}:  {detailGroup.account.currency_symbol} {calculateTotalTransactions(detailGroup.transactions, hidden_feature_flag)}</Text>
            </View>
        )
    }
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
    },
    headerAndroid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingBottom: 10,
    }
});

