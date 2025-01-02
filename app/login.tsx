import {View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert} from "react-native";
import {useNavigation, useRouter} from "expo-router";
import {useEffect, useLayoutEffect, useRef, useState} from "react";
import * as Haptics from 'expo-haptics';
import LottieView from "lottie-react-native";
import auth from '@react-native-firebase/auth';
import {FirebaseError} from 'firebase/app';
import firestore from "@react-native-firebase/firestore";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import {load, loadArray, remove, save} from "@/lib/utils/storage";


export default function Screen() {
    const navigation = useNavigation();
    const animation = useRef<LottieView>(null);
    const router = useRouter();
    const [isRegister, setIsRegister] = useState(false);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(true);

    async function onChangeFormType() {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setIsRegister(!isRegister)
    }

    async function onSubmit() {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setLoading(true);
        try {
            if (remember) {
                const storedEmails: {e: string; p: string}[] = await loadArray('userEmails');
                if (!storedEmails.find(storedEmail => storedEmail.e = email )) {
                    storedEmails.push({ e: email, p: password });
                    await save('userEmails', storedEmails);
                }
            }
            if (isRegister) {
                const {user} = await auth().createUserWithEmailAndPassword(email, password);
                await firestore()
                    .collection('users')
                    .doc(user.uid)
                    .set({
                        email: user.email,
                        name: user.displayName,
                        photo: user.photoURL,
                        subscription: {},
                        lastDonation: {},
                    })
            } else {
                const {user} = await auth().signInWithEmailAndPassword(email, password);
                await firestore()
                    .collection('users')
                    .doc(user.uid)
                    .update({
                        email: user.email,
                        name: user.displayName,
                        photo: user.photoURL,
                    })
            }
        } catch (e: any) {
            const err = e as FirebaseError;
            console.log(e);
            if (err.code === 'auth/email-already-in-use') {
                Alert.alert('Oops!', 'Este email ya esta en uso, intenta con otro.');
            } else if (err.code === 'auth/invalid-credential') {
                Alert.alert('Oops!', 'Usuario no encontrado, Asegurese de ingresar correctamente los datos.');
            } else {
                Alert.alert('Oops!', 'Usuario no encontrado, Asegurese de ingresar correctamente los datos.');
            }
        } finally {
            setLoading(false);
        }
    }

    function onCancel() {
        router.dismiss();
    }

    useLayoutEffect(() => {
        navigation.setOptions({
            title: isRegister ? 'Registrarse' : 'Inicia sesion',
        })
    }, [isRegister]);

    return (
        <ScrollView style={styles.container}>
            <View style={styles.lottieWrapper}>
                <LottieView
                    autoPlay
                    ref={animation}
                    enableMergePathsAndroidForKitKatAndAbove={true}
                    style={{
                        width: 130,
                        height: 130,
                    }}
                    source={require('@/assets/lottie/auth-animation.json')}
                />
            </View>
            <View style={styles.inputWrapper}>
                <Text>Email</Text>
                <TextInput
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    placeholder="Email"
                    style={styles.input}
                />
            </View>

            <View style={{height: 20}}/>

            <View style={styles.inputWrapper}>
                <Text>Contrasena</Text>
                <TextInput
                    value={password}
                    autoCapitalize="none"
                    onChangeText={setPassword}
                    placeholder="Contrasena"
                    style={styles.input}
                />
            </View>

            <BouncyCheckbox
                size={20}
                fillColor="green"
                unFillColor="#FFFFFF"
                text="Recordarme"
                disabled={!email}
                isChecked={remember}
                style={{marginTop: 10}}
                textStyle={{textDecorationLine: 'none'}}
                onPress={(isChecked: boolean) => setRemember(isChecked)}
            />

            <TouchableOpacity style={[styles.submitButton, {opacity: loading ? 0.5 : 1}]} onPress={onSubmit}>
                {loading && <ActivityIndicator/>}
                <Text style={styles.submitButtonText}>{isRegister ? 'Registrarse' : 'Ingresar'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.changeFormTypeButton} onPress={onChangeFormType}>
                <Text>{isRegister ? 'Ya tienes cuenta?, Ingresa aqui' : 'No estas registrado aun?, registrate aqui'}</Text>
            </TouchableOpacity>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff'
    },
    inputWrapper: {
        gap: 10,
    },
    input: {
        height: 40,
        borderWidth: 1,
        borderColor: '#afafaf',
        borderRadius: 8,
        paddingHorizontal: 10
    },
    submitButton: {
        backgroundColor: '#000',
        flexDirection: 'row',
        gap: 10,
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20
    },
    submitButtonText: {
        color: '#fff'
    },
    cancelButton: {
        color: '#ff0000',
    },
    lottieWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 80,
    },
    changeFormTypeButton: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20
    }
})
