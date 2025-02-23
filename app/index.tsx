import {ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import usePlatform from "@/lib/hooks/usePlatform";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {useRouter} from "expo-router";

import auth from '@react-native-firebase/auth';
import * as AppleAuthentication from 'expo-apple-authentication';
import {
    GoogleSignin,
    statusCodes, isSuccessResponse, isErrorWithCode
} from '@react-native-google-signin/google-signin';
import {useEffect, useState} from "react";
import firestore from '@react-native-firebase/firestore';
import {loadArray, remove, save, saveString} from "@/lib/utils/storage";
import {useBiometricAuth} from "@/lib/hooks/useBiometricAuth";
import api from "@/lib/utils/api";
import endpoints from "@/lib/utils/api/endpoints";
import {useAuth} from "@/lib/context/AuthContext";
import {Image} from "expo-image";

GoogleSignin.configure({
    webClientId: '589962407829-t4g9men77q1ts91fkni300afek6mcr67.apps.googleusercontent.com'
});


export default function Index() {
    const platform = usePlatform();
    const {top} = useSafeAreaInsets();
    const router = useRouter();
    const [loadingGoogle, setLoadingGoogle] = useState(false);
    const [loadingApple, setLoadingApple] = useState(false);
    const [storedOptions, setStoredOptions] = useState<any[]>([]);
    const {authenticate} = useBiometricAuth()
    const {login} = useAuth();
    const {checkAuth} = useAuth();

    useEffect(() => {
        checkStoredOptions();

        checkAuth(() => {
            // setInitializing(false)
            router.replace('/auth/tabs/resume');
        }, () => {
            console.log('i am here')
            // router.replace('/');
        })
    }, []);

    async function quickLogin(e: string, p: string) {
        const result = await authenticate();
        console.log({ email: e, password: p })

        if (result) {
            try {
                const response = await api.post(endpoints.auth.login, { email: e, password: p });
                console.log('response', response);
                if (response.status === 200) {
                    await login(response.data.user.access_token, response.data.user)
                }
            } catch (error) {
                console.error(error);
            }
            // const {user} = await auth().signInWithEmailAndPassword(e, p);
            // await firestore()
            //     .collection('users')
            //     .doc(user.uid)
            //     .update({
            //         email: user.email,
            //         name: user.displayName,
            //         photo: user.photoURL,
            //     })
        }
    }

    async function checkStoredOptions() {
        const storedEmails = await loadArray('userEmails');
        console.log(storedEmails);
        setStoredOptions(storedEmails);
    }

    async function onPressGoogle() {
        setLoadingGoogle(true)
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        try {
            await GoogleSignin.hasPlayServices()
            const response = await GoogleSignin.signIn();
            if (isSuccessResponse(response)) {
                const {user} = await auth().signInWithCredential(auth.GoogleAuthProvider.credential(response.data.idToken));
                const userDoc = firestore().collection('users').doc(user.uid);
                const docSnapshot = await userDoc.get();

                if (docSnapshot.exists) {
                    await firestore()
                        .collection('users')
                        .doc(user.uid)
                        .update({
                            email: user.email,
                            name: user.displayName,
                            photo: user.photoURL,
                        })
                } else {
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
                }
            }

        } catch (error) {
            console.error(error);
            if (isErrorWithCode(error)) {
                console.log(error.code);
                switch (error.code) {
                    case statusCodes.SIGN_IN_CANCELLED:
                        // Android-only, you probably have hit rate limiting.
                        // You can still call `presentExplicitSignIn` in this case.
                        break;
                    case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
                        // Android: play services not available or outdated.
                        // Get more details from `error.userInfo`.
                        // Web: when calling an unimplemented api (requestAuthorization)
                        // or when the Google Client Library is not loaded yet.
                        break;
                    default:
                    // something else happened
                }
            } else {
                // an error that's not related to google sign in occurred
            }
        } finally {
            setLoadingGoogle(false)
        }
    }

    async function onPressEmail() {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push('/login');
    }

    async function onPressApple() {
        setLoadingApple(true)
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        try {
            const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
            });

            const {user} = await auth().signInWithCredential(auth.AppleAuthProvider.credential(credential.identityToken));

            const userDoc = firestore().collection('users').doc(user.uid);
            const docSnapshot = await userDoc.get();

            if (docSnapshot.exists) {
                await firestore()
                    .collection('users')
                    .doc(user.uid)
                    .update({
                        email: user.email,
                        name: user.displayName,
                        photo: user.photoURL,
                    })
            } else {
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
            }
            // signed in
        } catch (e: any) {
            alert('Error: ' + e.message);
            if (e.code === 'ERR_REQUEST_CANCELED') {
                // handle that the user canceled the sign-in flow
            } else {
                // handle other errors
            }
        } finally {
            setLoadingApple(false)
        }
    }


    return (
        <View style={[styles.container, {paddingTop: top}]}>

            <View style={styles.top}>
                <Image source={require('@/assets/images/icon.png')} style={{ width: 200, height: 200 }} />
            </View>

            <View style={styles.buttonsContainer}>
                <TouchableOpacity style={styles.button} onPress={onPressEmail}>
                    <Ionicons name="mail" size={24} color="black"/>
                    <Text style={styles.buttonText}>Ingresar con Email</Text>
                </TouchableOpacity>

                <TouchableOpacity disabled style={[styles.button, styles.buttonDisabled]} onPress={onPressGoogle}>
                    {loadingGoogle ? <ActivityIndicator/> : <Ionicons name="logo-google" size={24} color="black"/>}
                    <Text style={styles.buttonText}>Ingresar con Google</Text>
                </TouchableOpacity>

                {
                    platform === 'ios' &&
                    <TouchableOpacity disabled style={[styles.button, styles.buttonDisabled]} onPress={onPressApple}>
                        {loadingApple ? <ActivityIndicator/> : <Ionicons name="logo-apple" size={24} color="black"/>}
                        <Text style={styles.buttonText}>Ingresar con Apple</Text>
                    </TouchableOpacity>
                }

                <View style={{ height: 50 }} />
                {
                    storedOptions.length > 0 &&
                    <View style={styles.options}>
                        <Text style={{textAlign: 'center', marginVertical: 20}}>Cuentas Guardadas</Text>
                        <FlatList
                            horizontal
                            data={storedOptions}
                            contentContainerStyle={{justifyContent: 'center'}}
                            keyExtractor={(item) => item?.e}
                            ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
                            renderItem={({item}) => (
                                <TouchableOpacity style={styles.option} onPress={() => quickLogin(item.e, item.p)}>
                                    <Text>{item.e}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                }
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: 250,
        gap: 10,
        padding: 10,
        borderRadius: 12,
        borderColor: '#000',
        borderWidth: 1,
    },

    buttonDisabled: {
        opacity: 0.5
    },
    buttonsContainer: {
        flex: 1,
        gap: 20,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        paddingVertical: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff', // Ensure the background is set
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 }, // Moves shadow upwards
        shadowOpacity: 0.1, // Light shadow effect
        shadowRadius: 4,
        elevation: 5, // For Android shadow
    },

    top: {
        width: '100%',
        height: 300,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    buttonText: {
        fontSize: 20
    },
    options: {
        backgroundColor: '#fff',
        flex: 1
    },
    option: {
        borderWidth: 1,
        padding: 10,
        borderRadius: 12,
        maxHeight: 40,
    }
})
