import {View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert} from "react-native";
import {Stack, useLocalSearchParams, useNavigation, useRouter} from "expo-router";
import {Fragment, useEffect, useLayoutEffect, useRef, useState} from "react";
import * as Haptics from 'expo-haptics';
import LottieView from "lottie-react-native";
import auth from '@react-native-firebase/auth';
import {FirebaseError} from 'firebase/app';
import BouncyCheckbox from "react-native-bouncy-checkbox";
import {load, loadArray, remove, save, saveString} from "@/lib/utils/storage";
import api from "@/lib/utils/api";
import endpoints from "@/lib/utils/api/endpoints";
import {useAuth} from "@/lib/context/AuthContext";


export default function Screen() {
    const navigation = useNavigation();
    const animation = useRef<LottieView>(null);
    const router = useRouter();
    const [isRegister, setIsRegister] = useState(false);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [lastname, setLastname] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const {login} = useAuth();

    async function onChangeFormType() {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setIsRegister(!isRegister)
    }

    async function onSubmit() {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setLoading(true);
        try {
            if (remember) {
                const storedEmails: { e: string; p: string }[] = await loadArray('userEmails');
                if (!storedEmails.find(storedEmail => storedEmail.e === email)) {
                    storedEmails.push({e: email, p: password});
                    await save('userEmails', storedEmails);
                }
            }
            if (isRegister) {
                try {
                    const response = await api.post(endpoints.auth.register, {
                        email,
                        password,
                        firstname: name,
                        lastname,
                        favCurrencies: ['67b60a53743e50fa9d4b5fc2'],
                        photoUrl: "",
                    });

                    if (response.status === 200) {
                        await login(response.data.user.access_token, response.data.user)
                    }
                } catch (error) {
                    console.error(error);
                }
            } else {
                try {
                    const response = await api.post(endpoints.auth.login, {email, password});

                    if (response.status === 200) {
                        await login(response.data.user.access_token, response.data.user)
                    }
                } catch (error) {
                    console.error(error);
                }

            }
            // const {user} = await auth().signInWithEmailAndPassword(email, password);
            // await firestore()
            //     .collection('users')
            //     .doc(user.uid)
            //     .update({
            //         email: user.email,
            //         name: user.displayName,
            //         photo: user.photoURL,
            //     })
            // }
        } catch (e: any) {
            // const err = e as FirebaseError;
            console.log(e);
            // if (err.code === 'auth/email-already-in-use') {
            //     Alert.alert('Oops!', 'Este email ya esta en uso, intenta con otro.');
            // } else if (err.code === 'auth/invalid-credential') {
            //     Alert.alert('Oops!', 'Usuario no encontrado, Asegurese de ingresar correctamente los datos.');
            // } else {
            //     Alert.alert('Oops!', 'Usuario no encontrado, Asegurese de ingresar correctamente los datos.');
            // }
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
        <Fragment>
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


                {
                    isRegister &&
                    <Fragment>
                        <View style={styles.inputWrapper}>
                            <Text>Nombre</Text>
                            <TextInput
                                value={name}
                                onChangeText={setName}
                                autoCapitalize="sentences"
                                placeholder="Nombre"
                                style={styles.input}
                            />
                        </View>

                        <View style={{height: 20}}/>

                        <View style={styles.inputWrapper}>
                            <Text>Apellido</Text>
                            <TextInput
                                value={lastname}
                                autoCapitalize="sentences"
                                onChangeText={setLastname}
                                placeholder="Apellido"
                                style={styles.input}
                            />
                        </View>

                        <View style={{height: 20}}/>
                    </Fragment>
                }

                <View style={styles.inputWrapper}>
                    <Text>Email</Text>
                    <TextInput
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        placeholder="Email"
                        style={styles.input}
                    />
                </View>

                <View style={{height: 20}}/>

                <View style={styles.inputWrapper}>
                    <Text>Contrasena</Text>
                    <TextInput
                        value={password}
                        onChangeText={setPassword}
                        autoCapitalize="none"
                        secureTextEntry={true}
                        placeholder="Contrasena"
                        style={styles.input}
                    />
                </View>


                {
                    !isRegister &&
                    <BouncyCheckbox
                        size={20}
                        fillColor="green"
                        unFillColor="#FFFFFF"
                        text="Recordarme"
                        isChecked={remember}
                        style={{marginTop: 10}}
                        textStyle={{textDecorationLine: 'none'}}
                        onPress={(isChecked: boolean) => setRemember(isChecked)}
                    />
                }

                <TouchableOpacity style={[styles.submitButton, {opacity: loading ? 0.5 : 1}]} onPress={onSubmit}>
                    {loading && <ActivityIndicator/>}
                    <Text style={styles.submitButtonText}>{isRegister ? 'Registrarse' : 'Ingresar'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.changeFormTypeButton} onPress={onChangeFormType}>
                    <Text>{isRegister ? 'Ya tienes cuenta?, Ingresa aqui' : 'No estas registrado aun?, registrate aqui'}</Text>
                </TouchableOpacity>
            </ScrollView>
        </Fragment>
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
