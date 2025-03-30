import {Fragment, useState} from "react";
import {
    ScrollView,
    StyleSheet,
    View,
    TextInput,
    Text,
    Image,
    TouchableOpacity, Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import {Stack, useRouter} from "expo-router";
import {SharedSpaceCreatePayload} from "@/lib/types/shared-spaces";
import api from "@/lib/utils/api";
import firestore from "@react-native-firebase/firestore";
import {useAuth} from "@/lib/context/AuthContext";
import {Timestamp} from "@firebase/firestore";
import {toast} from "sonner-native";
import {Colors} from "@/lib/constants/colors";

export default function Screen() {
    const {token, user} = useAuth();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState<string | null>(null);
    const [email, setEmail] = useState("");
    const [emails, setEmails] = useState<string[]>([]);
    const router = useRouter();

    // Pick an image from the gallery
    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    // Add email to the list when pressing Enter
    const handleAddEmail = () => {
        if (email.trim() && !emails.includes(email)) {
            setEmails([...emails, email.trim()]);
            setEmail("");
        }
    };

    // Remove email from the list when tapping the chip
    const handleRemoveEmail = (emailToRemove: string) => {
        setEmails(emails.filter((e) => e !== emailToRemove));
    };

    async function onCreate() {

        if (!title) {
            toast.error("El nombre del espacio es obligatorio");
            return;
        }

        if (emails.length === 0) {
            toast.error("Agrega al menos un email");
            return;
        }
        // Create a new shared space
        const payload: SharedSpaceCreatePayload = {
            title,
            description,
            poster: image ?? '',
            participants: [],
            participantsDetail: [],
            status: "active",
            totals: [],
            authorId: user._id,
            created: new Date()
        };

        try {
            const response = await api.post('/user/checkUsersByEmail', { emails }, {
                headers: {
                    authorization: `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                const { message, participants, participantsDetail, notFoundEmails } = response.data;
                payload.participants = participants;
                payload.participantsDetail = participantsDetail;

                if (message) {
                    Alert.alert("¿Quieres continuar?", message, [
                        {
                            text: "Cancelar",
                            style: "cancel",
                        },
                        {
                            text: "Continuar",
                            onPress: async () => {
                                // Send notification for invite

                                if (!payload.participants.includes(user._id)) {
                                    payload.participants.push(user._id);
                                }

                                if (!payload.participantsDetail.some((participant: any) => participant._id === user._id)) {
                                    payload.participantsDetail.push({
                                        id: user._id,
                                        name: `${user.firstname} ${user.lastname}`,
                                        email: user.email,
                                        photoUrl: user.photoUrl,
                                        pushToken: user.pushToken ?? '',
                                    });
                                }

                                await firestore()
                                    .collection('shared-spaces')
                                    .add(payload)

                                toast.success("Espacio compartido creado con éxito");
                                router.back()

                            },
                        }
                    ])
                } else {
                    // Send notification for invite

                    if (!payload.participants.includes(user._id)) {
                        payload.participants.push(user._id);
                    }

                    if (!payload.participantsDetail.some((participant: any) => participant._id === user._id)) {
                        payload.participantsDetail.push({
                            id: user._id,
                            name: `${user.firstname} ${user.lastname}`,
                            email: user.email,
                            photoUrl: user.photoUrl,
                            pushToken: user.pushToken ?? '',
                        });
                    }

                    await firestore()
                        .collection('shared-spaces')
                        .add(payload)

                    toast.success("Espacio compartido creado con éxito");
                    router.back()
                }
            }
        } catch (error) {
            console.error("Error creating shared space:", error);
        }

        // Send the payload to the server
        // await axios.post("/shared-spaces", payload);
    }

    return (
        <Fragment>
            <Stack.Screen
                options={{
                    title: 'Crear espacio',
                    headerRight: () => (
                        <TouchableOpacity style={styles.doneButton} onPress={onCreate}>
                            <Text style={styles.doneButtonText}>Guardar</Text>
                        </TouchableOpacity>
                    )
                }}
            />
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                {/* Image Placeholder */}
                <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
                    {image ? (
                        <Image source={{uri: image}} style={styles.image}/>
                    ) : (
                        <Text style={styles.imagePlaceholder}>Presiona para seleccionar imagen</Text>
                    )}
                </TouchableOpacity>

                {/* Title Input */}
                <TextInput
                    style={styles.input}
                    placeholder="Nombre de espacio"
                    placeholderTextColor="#aaa"
                    value={title}
                    onChangeText={setTitle}
                />

                {/* Description Input */}
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Descripcion breve"
                    placeholderTextColor="#aaa"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                />

                {/* Email Input */}
                <TextInput
                    style={styles.input}
                    placeholder="Agregar email y presiona Enter"
                    placeholderTextColor="#aaa"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onSubmitEditing={handleAddEmail}
                />

                {/* Email Chips (Wrapped) */}
                <View style={styles.chipContainer}>
                    {emails.map((item) => (
                        <TouchableOpacity
                            key={item}
                            onPress={() => handleRemoveEmail(item)}
                            style={styles.chip}
                        >
                            <Text style={styles.chipText}>{item} ✕</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </Fragment>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        padding: 20,
        alignItems: "center",
    },
    imageContainer: {
        width: 150,
        height: 150,
        borderRadius: 10,
        backgroundColor: "#ddd",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        marginBottom: 20,
    },
    image: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    imagePlaceholder: {
        color: "#777",
        textAlign: "center",
        fontSize: 14,
    },
    input: {
        width: "100%",
        padding: 14,
        borderRadius: 8,
        backgroundColor: "#fff",
        fontSize: 16,
        color: "#333",
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#ddd",
    },
    textArea: {
        height: 120,
        textAlignVertical: "top",
    },
    chipContainer: {
        flexDirection: "row",
        flexWrap: "wrap", // Enables wrapping to new lines
        gap: 6, // Spacing between chips
        marginTop: 10,
        width: "100%",
    },
    chip: {
        backgroundColor: "#ddd",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    chipText: {
        color: "#333",
        fontSize: 14,
    },
    doneButton: {
        backgroundColor: Colors.primary,
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 4,
    },
    doneButtonText: {
        color: "#fff",
        fontWeight: 'bold',
        fontSize: 18,
    },
});
