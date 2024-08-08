import ResumeDropDown from "@/lib/components/ResumeDropDown";
import React, {useState} from "react";
import {Platform, StyleSheet, Text, TouchableOpacity, useColorScheme} from "react-native";
import HomeResumeItems from "@/lib/components/HomeResumeItems";
import {Button, useThemeName, View, ScrollView} from 'tamagui';
import HeaderDropDownMenu from "@/lib/components/layout/AccountSelectDropdown";
import {Feather} from "@expo/vector-icons";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {useRouter} from "expo-router";
import {resetCurrentTransaction} from "@/lib/store/features/transactions/transactionsSlice";
import {useAppDispatch} from "@/lib/store/hooks";
import CustomHeader from "@/lib/components/ui/CustomHeader";
import {colorScheme} from "vite-plugin-entry-shaking-debugger/.storybook/theming";


export default function HomeScreen() {
    const router = useRouter();
    const schemeColor = useColorScheme()
    const isIos = Platform.OS === 'ios';
    const dispatch = useAppDispatch();
    const insets = useSafeAreaInsets()
    // const colors = useTheme().colors;
    const themeName = useThemeName();

    console.log(themeName);

    function onPressNewTransaction() {
        dispatch(resetCurrentTransaction());
        router.push('/transactionCreateUpdate');
    }

    return (
        <View flex={1} backgroundColor="$color2">
            <CustomHeader style={{paddingTop: insets.top}}>
                <HeaderDropDownMenu/>
                <Button onPress={onPressNewTransaction} size="$2" borderRadius="$12">
                    <Feather name="plus" size={20} color={schemeColor === 'light' ? 'black' : 'white'}/>
                </Button>
            </CustomHeader>
            <ScrollView showsVerticalScrollIndicator={false} paddingTop={isIos ? insets.top + 50 : 0}>
                <ResumeDropDown/>

                {/*    Lista de items por semana, mes y cada dia como separator con el total*/}
                <HomeResumeItems/>
                <View style={{height: 200}}/>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    createButton: {
        borderRadius: 100,
        padding: 3
    }
})

