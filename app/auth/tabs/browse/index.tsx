import {Alert, Button, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import auth from "@react-native-firebase/auth";
import {Stack, useRouter} from "expo-router";
import {remove} from "@/lib/utils/storage";
import {Image} from "expo-image";
import PressableCard from "@/lib/components/ui/PressableCard";
import {Ionicons} from "@expo/vector-icons";
import {toast} from "sonner-native";

export default function Screen() {
    const router = useRouter();

    const signOut = async () => {
        await remove('access_token')
        await remove('user');
        router.replace('/')
    }

    async function handleSignOut() {
        Alert.alert('Cerrar sesion', 'Seguro que quiere cerrar sesion?, debera ingresar sus credenciales nuevamente', [
            {
                style: 'cancel',
                text: 'Cancelar',
                isPreferred: true
            },
            {
                style: 'destructive',
                text: 'Continuar',
                onPress: async () => {
                    await signOut()
                }
            }
        ])
    }

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen
                options={{
                    headerRight: () => (
                        <TouchableOpacity onPress={handleSignOut}>
                            <Ionicons name="exit" size={24} color="black" />
                        </TouchableOpacity>
                    )
                }}
            />
            <ScrollView style={{flex: 1, padding: 10}}>
                <PressableCard onPress={() => {
                    // toast.info('Esta accion estara disponible proximamente!', {
                    //     className: 'bg-green-500',
                    //     duration: 6000,
                    //     icon: <Ionicons name="information-circle" size={24} color="#f79f07"/>,
                    // })
                    router.push('/auth/shared-spaces')
                }} shadow={true}>
                    <View>
                        <View style={{justifyContent: 'center', alignItems: 'center',}}>
                            <Image source={require('@/assets/images/shared-expenses.png')}
                                   style={{width: 200, height: 200}}/>
                        </View>
                        <View style={{
                            paddingBottom: 20,
                            paddingHorizontal: 20
                        }}>
                            <Text style={styles.cardTitle}>Espacio compartido</Text>
                            <Text style={styles.cardBody}>Espacio Compartido te permite gestionar gastos en grupo de
                                forma
                                transparente y organizada. Ideal para parejas, viajes con amigos y gastos familiares.
                                ¡Finanzas en equipo, más fácil que nunca! 💰✨ </Text>
                        </View>
                    </View>
                </PressableCard>

                <View style={styles.optionsWrapper}>
                    <TouchableOpacity style={[styles.option, styles.withBorder]} onPress={() => router.push('/auth/(settings)/account')}>
                        <Ionicons name="person-outline" size={20} color="#555" />
                        <Text style={styles.optionText}>Cuenta</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.option, styles.withBorder]}>
                        <Ionicons name="notifications-outline" size={20} color="#555" />
                        <Text style={styles.optionText}>Notificaciones</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.option, styles.withBorder]}>
                        <Ionicons name="lock-closed-outline" size={20} color="#555" />
                        <Text style={styles.optionText}>Privacidad</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.option}>
                        <Ionicons name="help-circle-outline" size={20} color="#555" />
                        <Text style={styles.optionText}>Ayuda y Soporte</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    cardTitle: {
        fontSize: 26,
        fontWeight: 'bold',
    },
    cardBody: {
        fontSize: 14,
        marginVertical: 10
    },
    optionsWrapper: {
        backgroundColor: "#fff",
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 5,
        marginTop: 50,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
    },
    option: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 15,
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
})
