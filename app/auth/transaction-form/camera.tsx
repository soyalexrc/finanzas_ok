import {Button, FlatList, Image, Linking, Pressable, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {Stack} from "expo-router";
import {useRef, useState} from "react";
import {CameraType, CameraView, useCameraPermissions} from "expo-camera";
import {Ionicons, MaterialIcons} from "@expo/vector-icons";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import * as ImagePicker from 'expo-image-picker';

export default function Screen() {
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const [showCamera, setShowCamera] = useState<boolean>(false);
    const [images, setImages] = useState<any[]>([])
    const cameraRef = useRef<CameraView>(null)
    const { bottom } = useSafeAreaInsets();

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

    if (!permission.granted) {
        // Camera permissions are not granted yet.
        return (
            <View style={styles.container}>
                <Text style={styles.message}>We need your permission to show the camera</Text>
                <Button onPress={handleRequestPermissions} title="grant permission"/>
            </View>
        );
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
            const photo = await cameraRef.current.takePictureAsync();
            const imgs = [...images];
            imgs.push(photo?.uri);
            setImages(imgs);
        }
    }

    async function openImagePicker() {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            const selectedImage = result.assets[0].uri;
            const imgs = [...images];
            imgs.push(selectedImage);
            setImages(imgs);
        }
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
                { showCamera && <CameraView ref={cameraRef} style={styles.camera} facing={facing} />  }

                {
                    !showCamera &&
                    <TouchableOpacity onPress={() => setShowCamera(true)} style={[styles.camera, { backgroundColor: 'lightgray', justifyContent: 'center', alignItems: 'center' }]}>
                        <Text>Tomar Fotografia</Text>
                    </TouchableOpacity>
                }

            </View>

            <View style={{ flex: 1, flexDirection: 'row' }}>
                <TouchableOpacity style={styles.addButton} onPress={openImagePicker}>
                    <MaterialIcons name="add" size={24} />
                    <Text style={{ fontWeight: 'bold' }}>Agregar</Text>
                </TouchableOpacity>
                <FlatList
                    horizontal={true}
                    data={images}
                    showsHorizontalScrollIndicator={false}
                    renderItem={({item, index}) => (
                        <Pressable>
                            <Image source={{uri: item}} width={120} height={120} style={{ borderRadius: 10 }}/>
                        </Pressable>
                    )}
                    keyExtractor={(item, index) => index.toString()}
                    ItemSeparatorComponent={() => <View style={{width: 10}} />} // Adds a 10px wide separator
                />
            </View>



            {
                showCamera &&
                <View style={styles.buttonContainer}>
                    <View style={styles.button}>
                        <TouchableOpacity style={{ backgroundColor: 'lightgray', padding: 20, borderRadius: 100 }} onPress={toggleCameraFacing}>
                            <MaterialIcons name="flip-camera-ios" size={40} color="black" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.button}>
                        <TouchableOpacity style={{ backgroundColor: 'lightgray', padding: 20, borderRadius: 100 }}  onPress={takePicture}>
                            <MaterialIcons name="camera" size={40} color="black" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.button}>
                        <TouchableOpacity style={{ backgroundColor: 'lightgray', padding: 20, borderRadius: 100 }}  onPress={unmountCamera}>
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
        borderRadius: 12,
    },
    buttonContainer: {
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
        width: 80,
        height: 120,
        backgroundColor: 'lightgray',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        marginRight: 10,
    }
});
