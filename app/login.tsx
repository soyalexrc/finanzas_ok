import {View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert} from "react-native";
import {Stack, useLocalSearchParams, useNavigation, useRouter} from "expo-router";
import {Fragment, useEffect, useLayoutEffect, useRef, useState} from "react";
import * as Haptics from 'expo-haptics';
import LottieView from "lottie-react-native";
import { OtpInput } from "react-native-otp-entry";

import {load, loadArray, remove, save, saveString} from "@/lib/utils/storage";
import api from "@/lib/utils/api";
import endpoints from "@/lib/utils/api/endpoints";
import {useAuth} from "@/lib/context/AuthContext";
import {toast} from "sonner-native";
import {Colors} from "@/lib/constants/colors";
import {Passkey} from "react-native-passkey";


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
    const [step, setStep] = useState<'login' | 'register' | 'otp'>('login');
    const [otp, setOtp] = useState('');
    const [remember, setRemember] = useState(false);
    const {login} = useAuth();

    async function onChangeFormType() {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setIsRegister(!isRegister)
    }

    async function onCodeSentForRegisterPassKey() {
        try {
            setLoading(true);
            const {data} = await api.post('auth/validateEmailForRegister', { email, code: otp });

            if (data.error) {
                toast.error(data.message)
                return;
            }

            if (Object.keys(data).find(k => k === 'pubKeyCredParams')) {
                const passkeyCreateResult = await Passkey.create(data);

                console.log('result', passkeyCreateResult);

                if (passkeyCreateResult.id) {
                    const {data: completeData} = await api.post("/auth/complete-registration", {
                        email,
                        registrationResponse: passkeyCreateResult,
                        challenge: data.challenge
                    });

                    console.log('completeData', completeData);

                    if (completeData) {
                        toast.success('Llave de acceso creada correctamente');
                        await login(completeData.user.access_token, completeData.user)
                    } else {
                        toast.error('Error al crear la llave de acceso');
                    }
                }
            }

            // console.log(data);
        } catch (error: any) {
            console.error(error);
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    async function onSubmitV2(userEmail = '') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setLoading(true);

        try {
            // Save the email to storage
            const storedEmails: string[] = await loadArray('userEmails');
            if (!storedEmails.find(storedEmail => storedEmail === email)) {
                storedEmails.push(email);
                await save('userEmails', storedEmails);
            }

            // check user exists
            const {data} = await api.post('auth/validateUserEmailForPasskey', { email });

            if (data.message?.includes('OTP')) {
                toast.info('Se ha enviado un correo de verificacion a tu email, por favor verifica tu bandeja de entrada')
                setStep('otp')
            } else {
                const passkeyGetResult = await Passkey.get(data);

                console.log('result', passkeyGetResult);

                if (passkeyGetResult.id) {
                    const {data: completeData} = await api.post("/auth/complete-authentication", {
                        email,
                        authenticationResponse: passkeyGetResult,
                        challenge: data.challenge
                    });

                    console.log('completeData', completeData);

                    if (completeData) {
                        toast.success('Autenticacion correcta');
                        await login(completeData.user.access_token, completeData.user)
                    } else {
                        toast.error('Error al autenticar');
                    }
                }
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
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
        } catch (e: any) {
            console.log(e);
            toast.error(e.message)
            setLoading(false);
        } finally {
            setLoading(false);
        }
    }

    function onCancel() {
        router.dismiss();
    }

    // useLayoutEffect(() => {
    //     navigation.setOptions({
    //         title: isRegister ? 'Registrarse' : 'Inicia sesion',
    //     })
    // }, [isRegister]);

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

                {
                    step === 'login' &&
                    <Fragment>
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

                        {/*<View style={styles.inputWrapper}>*/}
                        {/*    <Text>Contrasena</Text>*/}
                        {/*    <TextInput*/}
                        {/*        value={password}*/}
                        {/*        onChangeText={setPassword}*/}
                        {/*        autoCapitalize="none"*/}
                        {/*        secureTextEntry={true}*/}
                        {/*        placeholder="Contrasena"*/}
                        {/*        style={styles.input}*/}
                        {/*    />*/}
                        {/*</View>*/}


                        {/*{*/}
                        {/*    !isRegister &&*/}
                        {/*    <BouncyCheckbox*/}
                        {/*        size={20}*/}
                        {/*        fillColor="green"*/}
                        {/*        unFillColor="#FFFFFF"*/}
                        {/*        text="Recordarme"*/}
                        {/*        isChecked={remember}*/}
                        {/*        style={{marginTop: 10}}*/}
                        {/*        textStyle={{textDecorationLine: 'none'}}*/}
                        {/*        onPress={(isChecked: boolean) => setRemember(isChecked)}*/}
                        {/*    />*/}
                        {/*}*/}

                        <TouchableOpacity style={[styles.submitButton, {opacity: loading ? 0.5 : 1}]} onPress={() =>  onSubmitV2()}>
                            {loading && <ActivityIndicator/>}
                            <Text style={styles.submitButtonText}>Continuar</Text>
                        </TouchableOpacity>
                        {/*<TouchableOpacity style={styles.changeFormTypeButton} onPress={onChangeFormType}>*/}
                        {/*    <Text>{isRegister ? 'Ya tienes cuenta?, Ingresa aqui' : 'No estas registrado aun?, registrate aqui'}</Text>*/}
                        {/*</TouchableOpacity>*/}
                    </Fragment>
                }

                {
                    step === 'otp' &&
                    <Fragment>
                        <Text style={{ marginTop: 10, fontSize: 16, textAlign: 'center' }}>
                            Se ha enviado un correo de verificacion a <Text style={{ fontWeight: 'bold' }}>{email}</Text>
                        </Text>
                        <OtpInput
                            numberOfDigits={6}
                            focusColor={Colors.primary}
                            autoFocus={false}
                            type="numeric"
                            textProps={{
                                accessibilityRole: "text",
                                accessibilityLabel: "OTP digit",
                                allowFontScaling: false,
                            }}
                            textInputProps={{
                                accessibilityLabel: "One-Time Password",
                            }}
                            onTextChange={setOtp}
                            theme={{
                                containerStyle: {
                                    marginTop: 20,
                                },
                                pinCodeContainerStyle: {
                                    borderRadius: 6,
                                }
                            }}
                        />
                        <TouchableOpacity disabled={otp.length < 6} style={[styles.submitButton, {opacity: loading ? 0.5 : 1}]} onPress={onCodeSentForRegisterPassKey}>
                            {loading && <ActivityIndicator/>}
                            <Text style={styles.submitButtonText}>Continuar</Text>
                        </TouchableOpacity>
                    </Fragment>
                }


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
