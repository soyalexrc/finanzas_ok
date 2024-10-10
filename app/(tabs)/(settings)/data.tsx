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
    const db = useSQLiteContext();
    const isIos = Platform.OS === 'ios';
    const headerHeight = useHeaderHeight();

    async function exportDB() {
        if (!isIos) {
            const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
            if (permissions.granted) {
                const base64 = await FileSystem.readAsStringAsync(
                    FileSystem.documentDirectory + 'SQLite/finanzas_ok.db',
                    {encoding: FileSystem.EncodingType.Base64}
                );
                await FileSystem.StorageAccessFramework.createFileAsync(FileSystem.documentDirectory + 'SQLite/finanzas_ok.db', 'finanzas_ok.db', 'application/octet-stream')
                    .then(async (uri) => {
                        await FileSystem.writeAsStringAsync(uri, base64, {encoding: FileSystem.EncodingType.Base64})
                    })
                    .catch((err) => {
                        console.error(err)
                    });
            } else {
                console.error('No permissions')
            }

        } else {
            await Sharing.shareAsync(FileSystem.documentDirectory + 'SQLite/finanzas_ok.db');

        }
    }

    async function importDB() {
        try {
            let result = await DocumentPicker.getDocumentAsync({
                copyToCacheDirectory: true
            })

            if (result.assets && result.assets[0].uri) {
                // db.closeSync();
                await FileSystem.copyAsync({
                    from: result.assets[0].uri,
                    to: FileSystem.documentDirectory + 'SQLite/finanzas_ok.db'
                });

                // console.log('here')

                // if (!(await FileSystem.getInfoAsync(FileSystem.documentDirectory + 'SQLite')).exists) {
                //     await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'SQLite');
                // }
                //
                // const base64 = await FileSystem.readAsStringAsync(
                //     result.assets[0].uri,
                //     {encoding: FileSystem.EncodingType.Base64}
                // );
                //
                //
                // console.log(base64)
                // await FileSystem.writeAsStringAsync(
                //     FileSystem.documentDirectory + 'SQLite/finanzas_ok.db',
                //     base64,
                //     {encoding: FileSystem.EncodingType.Base64}
                // );
                //
                // console.log('here')
                openDatabaseSync('finanzas_ok.db');
                // await migrateDbIfNeeded(db);



                //     close open db

            }
        } catch (err) {
            console.error(err)
        }

    }


    return (
        <ScrollView flex={1} backgroundColor="$color1" showsVerticalScrollIndicator={false}
                    paddingTop={isIos ? headerHeight + 20 : headerHeight}>
            <Button onPress={exportDB}>Export db</Button>
            <Button onPress={importDB}>Import db</Button>
        </ScrollView>
    )
}
