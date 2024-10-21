import {Button, ScrollView} from "tamagui";
import React from "react";
import {Platform} from "react-native";
import {useHeaderHeight} from "@react-navigation/elements";
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from "expo-document-picker";
import * as Sharing from "expo-sharing";
import {openDatabaseAsync, openDatabaseSync, useSQLiteContext} from "expo-sqlite";
import {getAllAccounts, migrateDbIfNeeded} from "@/lib/db";

export default function Screen() {
    const isIos = Platform.OS === 'ios';
    const headerHeight = useHeaderHeight();

    return (
        <ScrollView flex={1} backgroundColor="$color1" showsVerticalScrollIndicator={false}
                    paddingTop={isIos ? headerHeight + 20 : headerHeight}>
        </ScrollView>
    )
}
