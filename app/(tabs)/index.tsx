import ResumeDropDown from "@/lib/components/ResumeDropDown";
import React, {useState} from "react";
import {Platform, ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View} from "react-native";
import HomeResumeItems from "@/lib/components/HomeResumeItems";
import {BlurView} from "expo-blur";
import HeaderDropDownMenu from "@/lib/components/layout/AccountSelectDropdown";
import {Feather} from "@expo/vector-icons";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {useRouter} from "expo-router";
import {resetCurrentTransaction} from "@/lib/store/features/transactions/transactionsSlice";
import {useAppDispatch} from "@/lib/store/hooks";
import {useTheme} from "@react-navigation/native";
import CustomHeader from "@/lib/components/ui/CustomHeader";



export default function HomeScreen() {
    const router = useRouter();
    const schemeColor = useColorScheme()
    const isIos = Platform.OS === 'ios';
    const dispatch = useAppDispatch();
    const insets = useSafeAreaInsets()
    const colors = useTheme().colors;

    function onPressNewTransaction() {
        dispatch(resetCurrentTransaction());
        router.push('/transactionCreateUpdate');
    }

    return (
        <View style={styles.container}>
            <CustomHeader style={{ paddingTop: insets.top }}>
                <HeaderDropDownMenu />
                <TouchableOpacity onPress={onPressNewTransaction} style={[{backgroundColor: colors.text}, styles.createButton]}>
                    <Feather name="plus" size={20} color={colors.background} />
                </TouchableOpacity>
            </CustomHeader>
            <ScrollView showsVerticalScrollIndicator={false} style={[styles.container, { backgroundColor: schemeColor === 'light' ? 'white' : 'black', paddingTop: isIos ? insets.top + 50 : 0 }]}>
                <ResumeDropDown />

                {/*    Lista de items por semana, mes y cada dia como separator con el total*/}
                <Text>This is from update OTA</Text>
                <HomeResumeItems />
                <View style={{ height: 200 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    createButton: {
        borderRadius: 100,
        padding: 3
    }
})

