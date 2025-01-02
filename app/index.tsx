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
import {loadArray, remove} from "@/lib/utils/storage";
import {useBiometricAuth} from "@/lib/hooks/useBiometricAuth";

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

    useEffect(() => {
        checkStoredOptions();
    }, []);

    async function quickLogin(e: string, p: string) {
        const result = await authenticate();

        if (result) {
            const {user} = await auth().signInWithEmailAndPassword(e, p);
            await firestore()
                .collection('users')
                .doc(user.uid)
                .update({
                    email: user.email,
                    name: user.displayName,
                    photo: user.photoURL,
                })
        }
    }

    async function checkStoredOptions() {
        const storedEmails = await loadArray('userEmails');
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

            <View style={styles.top}/>

            <View style={styles.buttonsContainer}>
                <TouchableOpacity style={styles.button} onPress={onPressEmail}>
                    <Ionicons name="mail" size={24} color="black"/>
                    <Text style={styles.buttonText}>Ingresar con Email</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={onPressGoogle}>
                    {loadingGoogle ? <ActivityIndicator/> : <Ionicons name="logo-google" size={24} color="black"/>}
                    <Text style={styles.buttonText}>Ingresar con Google</Text>
                </TouchableOpacity>

                {
                    platform === 'ios' &&
                    <TouchableOpacity style={styles.button} onPress={onPressApple}>
                        {loadingApple ? <ActivityIndicator/> : <Ionicons name="logo-apple" size={24} color="black"/>}
                        <Text style={styles.buttonText}>Ingresar con Apple</Text>
                    </TouchableOpacity>
                }
            </View>
            <View style={styles.options}>
                <Text style={{textAlign: 'center', marginVertical: 20}}>Cuentas Guardadas</Text>
                <FlatList
                    horizontal
                    data={storedOptions}
                    contentContainerStyle={{justifyContent: 'center'}}
                    keyExtractor={({item}) => item?.e}
                    renderItem={({item}) => (
                        <TouchableOpacity style={styles.option} onPress={() => quickLogin(item.e, item.p)}>
                            <Text>{item.e}</Text>
                        </TouchableOpacity>
                    )}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    buttonsContainer: {
        flex: 1,
        gap: 20,
        marginVertical: 20,
        alignItems: 'center',
        justifyContent: 'center'
    },
    top: {
        backgroundColor: 'gray',
        width: '100%',
        height: 300
    },
    buttonText: {
        fontSize: 20
    },
    options: {
        flex: 1
    },
    option: {
        borderWidth: 1,
        padding: 10,
        borderRadius: 12,
        maxHeight: 40,
    }
})
