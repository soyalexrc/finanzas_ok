import {SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {Entypo} from "@expo/vector-icons";
import {useAuth} from "@/lib/context/AuthContext";
import api from "@/lib/utils/api";
import {Passkey} from 'react-native-passkey';
import {toast} from "sonner-native";
import {useEffect, useState} from "react";
import PressableCard from "@/lib/components/ui/PressableCard";

export default function Screen() {
    const {user} = useAuth();
    const [passkeys, setPasskeys] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    console.log(user._id);

    async function getPassKeysByUser() {
        setLoading(true);
        try {
            const {data} = await api.get(`/auth/getPasskeysByUserId?userId=${user._id}`);
            setPasskeys(data);
        } catch (error: any) {
            console.log("Error fetching passkeys:", error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    }


    async function startRegistration() {
        try {
            const email = user.email;

            const {data} = await api.post("/auth/start-registration", {
                email
            });

            console.log('data', data);

            const result = await Passkey.create(data);

            console.log('result', result);

            if (result.id) {
                const {data: completeData} = await api.post("/auth/complete-registration", {
                    email,
                    registrationResponse: result,
                    challenge: data.challenge
                });

                console.log('completeData', completeData);

                if (completeData) {
                    toast.success('Llave de acceso creada correctamente');
                    await getPassKeysByUser();
                } else {
                    toast.error('Error al crear la llave de acceso');
                }
            }
        } catch (error: any) {
            console.log("Error starting registration:", error);
            toast.error(error.message);
        }

    }

    async function startAuthentication() {
        try {
            const email = user.email;

            const {data} = await api.post("/auth/start-authentication", {
                email
            });

            const result = await Passkey.get(data);

            console.log('result', result);

            if (result.id) {
                const {data: completeData} = await api.post("/auth/complete-authentication", {
                    email,
                    authenticationResponse: result,
                    challenge: data.challenge
                });

                console.log('completeData', completeData);

                if (completeData) {
                    toast.success('Autenticacion correcta');
                } else {
                    toast.error('Error al autenticar');
                }
            }
        } catch (error: any) {
            console.log("Error starting authentication:", error);
            toast.error(error.message);
        }
    }

    useEffect(() => {
        getPassKeysByUser()
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.container}>
                <View style={[styles.option]}>
                    <Entypo name="key" size={20} color="#555" />
                    <Text style={styles.optionText}>Llaves de acceso (pass keys)</Text>
                </View>

                {
                    loading &&
                    <View style={[styles.option, styles.withBorder]}>
                        <Text style={styles.optionText}>Cargando...</Text>
                    </View>
                }

                {
                    !loading && passkeys.length > 0 &&
                        passkeys.map((item, index) => (
                            <PressableCard
                                key={index}
                                extraStyles={[styles.option, styles.withBorder]}
                                shadow={true}
                                onPress={startAuthentication}
                            >
                                <Text style={styles.optionText}>{item._id}</Text>
                            </PressableCard>
                        ))
                }

                {
                    !loading && passkeys.length === 0 &&
                    <View style={[styles.option, styles.withBorder]}>
                        <Text style={styles.optionText}>No hay llaves de acceso</Text>
                    </View>
                }

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
