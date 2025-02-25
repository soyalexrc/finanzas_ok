import {
    ActivityIndicator, Alert,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import {Image} from 'expo-image';
import {Stack} from "expo-router";
import React, {useState} from "react";
import {Ionicons} from "@expo/vector-icons";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import * as ImagePicker from 'expo-image-picker';
import {Colors} from "@/lib/constants/colors";
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import * as DocumentPicker from "expo-document-picker";
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import {
    addDocumentToCurrentTransaction,
    addImageToCurrentTransaction,
    selectDocumentsFromCurrentTransaction, selectImagesFromCurrentTransaction
} from "@/lib/store/features/transactions/transactions.slice";
import {textShortener} from "@/lib/helpers/string";
import SegmentedControl from "@react-native-segmented-control/segmented-control";

const blurhash =
    '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

export default function Screen() {
    const images = useAppSelector(selectImagesFromCurrentTransaction);
    const documents = useAppSelector(selectDocumentsFromCurrentTransaction);
    const dispatch = useAppDispatch();
    const {bottom} = useSafeAreaInsets();
    const [loadingImage, setLoadingImage] = useState<boolean>(false);
    const [loadingDocument, setLoadingDocument] = useState<boolean>(false);
    const evidencesPath = `evidencias/${auth().currentUser?.uid}`;
    const [tab, setTab] = useState<number>(0);

    // Función para elegir entre cámara o galería
    const pickImage = async () => {
        const options = [
            {text: "Tomar foto", action: "camera"},
            {text: "Elegir de galería", action: "gallery"},
            {text: "Elegir documento", action: "document"},
            {text: "Cancelar", action: "cancel"},
        ];

        Alert.alert("Selecciona una opción", "", options.map(({text, action}) => ({
            text,
            onPress: () => handleImagePick(action),
        })));
    };

    // Función para manejar la selección
    const handleImagePick = async (action: string) => {
        let result;

        if (action === "camera") {
            result = await ImagePicker.launchCameraAsync({
                allowsEditing: false,
                quality: 1,
            });
        } else if (action === "gallery") {
            result = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: false,
                quality: 1,
            });
        } else if (action === "document") {
            result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true,
                multiple: true
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setTab(1)
                setLoadingDocument(true);

                // make a await for of
                for (const document of result.assets) {
                    const reference = storage().ref(`${evidencesPath}/documentos/${document.name}`);
                    await reference.putFile(document.uri);
                    const url = await reference.getDownloadURL();
                    dispatch(addDocumentToCurrentTransaction({url, title: document.name}));
                }

                setLoadingDocument(false);
            }
        }

        if (!result?.canceled && action !== 'document' && action !== 'cancel') {
            setLoadingImage(true)
            setTab(0)
            const selectedImage = result?.assets[0].uri;
            // @ts-ignore
            const reference = storage().ref(`${evidencesPath}/imagenes/${result?.assets[0].fileName}`);
            await reference.putFile(selectedImage!);
            const url = await reference.getDownloadURL();
            dispatch(addImageToCurrentTransaction(url));
            setLoadingImage(false)
        }
    };


    return (
        <View style={[styles.container, {paddingBottom: bottom + 50}]}>
            <Stack.Screen
                options={{
                    title: 'Evidencias',
                    headerBackTitle: 'Atras',
                    headerShadowVisible: false,
                    headerRight: () => (
                        <TouchableOpacity onPress={pickImage} disabled={loadingImage || loadingDocument}>
                            {
                                (loadingImage || loadingDocument) ? (
                                        <ActivityIndicator/>
                                    ) :
                                    <Ionicons name="add" size={30} color={Colors.primary}/>

                            }
                        </TouchableOpacity>
                    )
                }}
            />

            <SegmentedControl
                values={['Imagenes', 'Documentos']}
                selectedIndex={tab}
                style={{marginBottom: 10, marginTop: 20}}
                onChange={(event) => setTab(event.nativeEvent.selectedSegmentIndex)}
            />


            {
                tab === 0 &&
                <FlatList
                    data={images}
                    numColumns={3}
                    showsHorizontalScrollIndicator={false}
                    renderItem={({item, index}) => (
                        <Pressable>
                            <Image
                                source={item}
                                placeholder={{blurhash}}
                                transition={400}
                                style={{borderRadius: 10, width: 120, height: 120}}
                            />
                        </Pressable>
                    )}
                    contentContainerStyle={{ alignItems: "center", gap: 10 }} // Centers & adds vertical gap
                    columnWrapperStyle={{ gap: 10 }} // Adds horizontal gap between columns
                    keyExtractor={(item, index) => index.toString()}
                    ItemSeparatorComponent={() => <View style={{width: 10}}/>} // Adds a 10px wide separator
                />
            }

            {
                tab === 1 &&
                <FlatList
                    data={documents}
                    numColumns={3}
                    showsHorizontalScrollIndicator={false}
                    renderItem={({item}) => (
                        <Pressable style={styles.documentButton}>
                            <Ionicons name="document-text" size={50} color="black"/>
                            <Text style={{maxWidth: 120}}>{textShortener(item.title, 25)}</Text>
                        </Pressable>
                    )}
                    contentContainerStyle={{ alignItems: "center", gap: 10 }} // Centers & adds vertical gap
                    columnWrapperStyle={{ gap: 10 }} // Adds horizontal gap between columns
                    keyExtractor={(_, index) => index.toString()}
                    ItemSeparatorComponent={() => <View style={{width: 10}}/>} // Adds a 10px wide separator
                />
            }
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
    },
    cameraContainer: {
        flex: 1,
        alignItems: 'center'
    },
    camera: {
        marginTop: 20,
        width: 250,
        height: 250,
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 20,
        flexDirection: 'row',
        gap: 10,
    },
    button: {
        flex: 1,
        alignSelf: 'flex-end',
        alignItems: 'center',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    addButton: {
        width: 100,
        height: 120,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        marginHorizontal: 10,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        padding: 10,
    },
    cameraButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: Colors.primary,
        padding: 10,
        borderRadius: 6
    },
    cameraButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold'
    },
    documentButton: {
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stylishButton: {
        backgroundColor: 'linear-gradient(45deg, #6b8e23, #3cb371)',
        padding: 20,
        borderRadius: 50,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
