import React, {useEffect, useState} from 'react';
import { Button, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import {DocumentPickerAsset} from "expo-document-picker";
import {useNavigation} from "expo-router";
import {Colors} from "@/lib/constants/colors";

export default function Screen() {
    const [documents, setDocuments] = useState<DocumentPickerAsset[]>([]);
    const navigation = useNavigation();

    async function openDocumentPicker() {
        const result = await DocumentPicker.getDocumentAsync({
            type: '*/*',
            copyToCacheDirectory: true,
            multiple: true
        });


        if (result.assets && result.assets.length > 0) {
            const docs = [...documents, ...result.assets];
            setDocuments(docs);
        }
    }

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity onPress={openDocumentPicker}>
                    <Text style={styles.buttonText}>Seleccionar</Text>
                </TouchableOpacity>
            )
        })
    }, []);

    return (
        <View style={styles.container}>
            <FlatList
                data={documents}
                keyExtractor={(item) => item.uri}
                renderItem={({ item }) => (
                    <View style={styles.documentItem}>
                        <Text>{item.name}</Text>
                    </View>
                )}
            />

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#fff',
    },
    documentItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    buttonText: {
        color: Colors.primary,
        fontWeight: 'bold',
        fontSize: 18,
    },
});
