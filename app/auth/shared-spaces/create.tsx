import { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    View,
    TextInput,
    Text,
    Image,
    TouchableOpacity,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

export default function Screen() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState<string | null>(null);
    const [email, setEmail] = useState("");
    const [emails, setEmails] = useState<string[]>([]);

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

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Image Placeholder */}
            <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
                {image ? (
                    <Image source={{ uri: image }} style={styles.image} />
                ) : (
                    <Text style={styles.imagePlaceholder}>Tap to select an image</Text>
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
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9f9f9",
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
});
