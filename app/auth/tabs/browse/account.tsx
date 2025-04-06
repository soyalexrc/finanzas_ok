import {SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {Entypo} from "@expo/vector-icons";
import {useAuth} from "@/lib/context/AuthContext";
import api from "@/lib/utils/api";
import { Passkey, PasskeyCreateResult } from 'react-native-passkey';
import {toast} from "sonner-native";

export default function Screen() {
    const { user } = useAuth();

    async function startRegistration() {
        try {
            const email = user.email;

            const {data} = await api.post("/auth/start-registration", {
                email
            });

            const result = await Passkey.create(data);

            console.log('result', result);
        } catch (error: any) {
            console.log("Error starting registration:", error);
            toast.error(error.message);
        }

    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.container}>
                <View style={[styles.option]}>
                    <Entypo name="key" size={20} color="#555" />
                    <Text style={styles.optionText}>Llaves de acceso (pass keys)</Text>
                </View>
                <TouchableOpacity style={styles.button} onPress={startRegistration}>
                    <Text style={styles.buttonText}>Crear llave de acceso</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    option: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 15,
        paddingHorizontal: 10
    },
    withBorder: {
        borderBottomWidth: 1,
        borderBottomColor: "#E8E8E8",
    },
    optionText: {
        fontSize: 16,
        marginLeft: 15,
        color: "#333",
    },
    button: {
        backgroundColor: "#007AFF",
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 20,
        marginTop: 20,
        alignSelf: "center",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center",
    },
})
