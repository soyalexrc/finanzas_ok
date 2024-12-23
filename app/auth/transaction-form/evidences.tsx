import {
    ActivityIndicator,
    FlatList,
    Linking,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { Image } from 'expo-image';
import {Stack, useNavigation} from "expo-router";
import {useRef, useState} from "react";
import {CameraType, CameraView, useCameraPermissions} from "expo-camera";
import {Ionicons, MaterialIcons} from "@expo/vector-icons";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import * as ImagePicker from 'expo-image-picker';
import {Colors} from "@/lib/constants/colors";
import * as Haptics from 'expo-haptics';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import * as DocumentPicker from "expo-document-picker";
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import {
    addDocumentToCurrentTransaction,
    addImageToCurrentTransaction,
    selectCurrentTransaction, selectDocumentsFromCurrentTransaction, selectImagesFromCurrentTransaction
} from "@/lib/store/features/transactions/transactions.slice";
import {textShortener} from "@/lib/helpers/string";

const blurhash =
    '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

export default function Screen() {
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const [showCamera, setShowCamera] = useState<boolean>(false);
    const images = useAppSelector(selectImagesFromCurrentTransaction);
    const documents = useAppSelector(selectDocumentsFromCurrentTransaction);
    const dispatch = useAppDispatch();
    const cameraRef = useRef<CameraView>(null)
    const { bottom } = useSafeAreaInsets();
    const [loadingImage, setLoadingImage] = useState<boolean>(false);
    const [loadingDocument, setLoadingDocument] = useState<boolean>(false);
    const evidencesPath = `evidencias/${auth().currentUser?.uid}`;

    async function openDocumentPicker() {
        const result = await DocumentPicker.getDocumentAsync({
            type: '*/*',
            copyToCacheDirectory: true,
            multiple: true
        });


        if (result.assets && result.assets.length > 0) {
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

    async function handleRequestPermissions() {
        const {status} = await requestPermission()
        if (status === 'denied') {
            await Linking.openSettings();
        }
    }


    if (!permission) {
        // Camera permissions are still loading.
        return <View/>;
    }

    function toggleCameraFacing() {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    }

    function unmountCamera() {
        if (cameraRef.current) {
            cameraRef.current?.pausePreview();
            setShowCamera(false);
        }
    }


    async function takePicture() {
        if (cameraRef.current) {
            setLoadingImage(true)
            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.5,
                imageType: 'jpg',
            });
            const photoName = `photo-${Date.now()}.jpg`;

            const reference = storage().ref(`${evidencesPath}/imagenes/${photoName}`);
            await reference.putFile(photo!.uri);
            const url = await reference.getDownloadURL();
            dispatch(addImageToCurrentTransaction(url));
            setLoadingImage(false)
        }
    }

    async function openImagePicker() {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.5,
        });

        if (!result.canceled) {
            setLoadingImage(true)
            const selectedImage = result.assets[0].uri;
            const reference = storage().ref(`${evidencesPath}/imagenes/${result.assets[0].fileName}`);
            await reference.putFile(selectedImage);
            const url = await reference.getDownloadURL();
            dispatch(addImageToCurrentTransaction(url));
            setLoadingImage(false)
        }
    }


    async function activateCamera() {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        setShowCamera(true)
    }

    return (
        <View style={[styles.container, { paddingBottom: bottom + 50 }]}>
            <Stack.Screen
                options={{
                    title: 'Evidencias',
                    headerBackTitle: 'Atras',
                }}
            />
            <View style={styles.cameraContainer}>
                {
                    !permission.granted &&
                    <View style={ { flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Pressable style={styles.cameraButton} onPress={handleRequestPermissions}>
                            <Text style={styles.cameraButtonText}>Dar acceso para usar la camara.</Text>
                        </Pressable>
                    </View>
                }
                { permission.granted && showCamera && <CameraView ref={cameraRef} style={styles.camera} facing={facing} />  }
                {
                    permission.granted && !showCamera &&
                    <View style={[styles.camera, { justifyContent: 'center', alignItems: 'center' }]}>
                        <Pressable disabled={loadingImage} style={styles.cameraButton} onPress={activateCamera}>
                            { loadingImage ? <ActivityIndicator size={24} color="white" /> : <Ionicons name="camera" size={24} color="white" /> }
                            <Text style={styles.cameraButtonText}>Usar la camara</Text>
                        </Pressable>
                    </View>
                }
            </View>

            <View style={{ flex: 1, gap: 30 }}>
                <View style={{  flexDirection: 'row' }}>
                    <TouchableOpacity disabled={loadingImage} style={styles.addButton} onPress={openImagePicker}>
                        { loadingImage ? <ActivityIndicator size={24} />  : <Ionicons name="add" size={24} /> }
                        <Text style={{ fontWeight: 'bold', color: loadingImage ? '#989898' : '#000' }}>Imagen</Text>
                    </TouchableOpacity>
                    <FlatList
                        horizontal={true}
                        data={images}
                        showsHorizontalScrollIndicator={false}
                        renderItem={({item, index}) => (
                            <Pressable>
                                <Image
                                    source={item}
                                    placeholder={{ blurhash }}
                                    transition={400}
                                    style={{ borderRadius: 10, width: 120, height: 120 }}
                                />
                            </Pressable>
                        )}
                        keyExtractor={(item, index) => index.toString()}
                        ItemSeparatorComponent={() => <View style={{width: 10}} />} // Adds a 10px wide separator
                    />
                </View>

                <View style={{flexDirection: 'row' }}>
                    <TouchableOpacity disabled={loadingDocument} style={styles.addButton} onPress={openDocumentPicker}>
                        { loadingDocument ? <ActivityIndicator size={24} />  : <Ionicons name="add" size={24} /> }
                        <Text style={{ fontWeight: 'bold', color: loadingDocument ? '#989898' : '#000' }}>Documento</Text>
                    </TouchableOpacity>
                    <FlatList
                        horizontal={true}
                        data={documents}
                        showsHorizontalScrollIndicator={false}
                        renderItem={({item}) => (
                            <Pressable style={styles.documentButton}>
                                <Ionicons name="document-text" size={50} color="black" />
                                <Text style={{ maxWidth: 120 }}>{textShortener(item.title, 25)}</Text>
                            </Pressable>
                        )}
                        keyExtractor={(_, index) => index.toString()}
                        ItemSeparatorComponent={() => <View style={{width: 10}} />} // Adds a 10px wide separator
                    />
                </View>
            </View>



            {
                showCamera &&
                <View style={styles.buttonContainer}>
                    <View style={styles.button}>
                        <TouchableOpacity style={styles.stylishButton} onPress={toggleCameraFacing}>
                            <MaterialIcons name="flip-camera-ios" size={40} color="black" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.button}>
                        <TouchableOpacity style={styles.stylishButton}  onPress={takePicture}>
                            <MaterialIcons name="camera" size={40} color="black" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.button}>
                        <TouchableOpacity style={styles.stylishButton}  onPress={unmountCamera}>
                            <Ionicons name="close" size={40} color="black" />
                        </TouchableOpacity>
                    </View>
                </View>
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
        shadowOffset: { width: 0, height: 2 },
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
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
