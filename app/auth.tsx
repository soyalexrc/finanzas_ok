import {Button, Image, Input, Separator, Text, useTheme, View} from "tamagui";
import {RefObject, useCallback, useRef, useState} from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet, TextInput,
    TouchableOpacity,
    useColorScheme,
    useWindowDimensions
} from "react-native";
import useWarmUpBrowser from "@/lib/hooks/useWarmUpBrowser";
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking'
import {useOAuth, useSignIn, useSignUp} from "@clerk/clerk-expo";
import {Ionicons} from "@expo/vector-icons";
import {useTranslation} from "react-i18next";
import LottieView from 'lottie-react-native';
import {OTPInput} from "@/lib/components/ui/OTPInput";
import {useRouter} from "expo-router";

export default function Screen() {
    useWarmUpBrowser();
    const router = useRouter();
    const isIos = Platform.OS === 'ios';
    const animation = useRef<LottieView>(null);
    const theme = useTheme();
    const colorScheme = useColorScheme();
    const {width} = useWindowDimensions();
    const {t} = useTranslation()
    const [email, setEmail] = useState('');
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [password, setPassword] = useState('');
    const {signIn, setActive, isLoaded} = useSignIn();
    const {signUp, isLoaded: signUpLoaded, setActive: signupSetActive} = useSignUp();
    const [type, setType] = useState<'login' | 'signup'>('login')
    const [loading, setLoading] = useState(false);
    const [pendingVerification, setPendingVerification] = useState(false);

    const [codes, setCodes] = useState<string[] | undefined>(Array(6).fill(""));
    const refs: RefObject<TextInput>[] = [
        useRef<TextInput>(null),
        useRef<TextInput>(null),
        useRef<TextInput>(null),
        useRef<TextInput>(null),
        useRef<TextInput>(null),
        useRef<TextInput>(null),
    ];

    const [errorMessages, setErrorMessages] = useState<string[]>();
    const {startOAuthFlow: startOAuthFlowWithGoogle} = useOAuth({strategy: 'oauth_google'});
    const {startOAuthFlow: startOAuthFlowWithApple} = useOAuth({strategy: 'oauth_apple'});

    WebBrowser.maybeCompleteAuthSession();

    const onSignInPress = async () => {
        if (!isLoaded) return;
        if (email.length < 1) {
            Alert.alert('Error', t('EMAIL_REQUIRED_ERROR'));
            return
        }

        if (password.length < 1) {
            Alert.alert('Error', t('PASSWORD_REQUIRED_ERROR'));
            return
        }

        setLoading(true);


        try {
            const signInAttempt = await signIn.create({
                identifier: email,
                password,
            })

            if (signInAttempt.status === 'complete') {
                await setActive({ session: signInAttempt.createdSessionId })
                router.back()
            } else {
                // If the status is not complete, check why. User may need to
                // complete further steps.
                console.error(JSON.stringify(signInAttempt, null, 2))
            }
        } catch (error: any) {
            Alert.alert(error.errors[0].message, error.errors[0].longMessage);
        } finally {
            setLoading(false);
        }
    }

    function toggleType() {
        setFirstname('')
        setLastname('')
        setType(type === 'login' ? 'signup' : 'login');
    }

    const onSignUpPress = async () => {
        if (!signUpLoaded) return;
        if (firstname.length < 1) {
            Alert.alert('Error', t('AUTH.NAME_REQUIRED_ERROR'));
            return
        }

        if (lastname.length < 1) {
            Alert.alert('Error', t('LASTNAME_REQUIRED_ERROR'));
            return
        }

        if (email.length < 1) {
            Alert.alert('Error', t('EMAIL_REQUIRED_ERROR'));
            return
        }

        if (password.length < 1) {
            Alert.alert('Error', t('PASSWORD_REQUIRED_ERROR'));
            return
        }

        setLoading(true);

        try {
            // Create the user on Clerk
            await signUp.create({
                firstName: firstname,
                lastName: lastname,
                emailAddress: email,
                password,
            })


            // Send the user an email with the verification code
            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })

            // Display the second form to collect the verification code
            setPendingVerification(true)
        } catch (error: any) {
            Alert.alert(error.errors[0].message, error.errors[0].longMessage);
        } finally {
            setLoading(false);
        }
    };

    const onPressVerify = async () => {
        if (!signUpLoaded) {
            return
        }
        setLoading(true);
        const code = codes!.join('')

        // Use the code the user provided to attempt verification
        try {
            const signUpAttempt = await signUp.attemptEmailAddressVerification({
                code
            })

            // // If verification was completed, set the session to active
            // // and redirect the user
            if (signUpAttempt.status === 'complete') {
                await setActive!({ session: signUpAttempt.createdSessionId })
                router.back();
            } else {
                // If the status is not complete, check why. User may need to
                // complete further steps.
                console.error(JSON.stringify(signUpAttempt, null, 2))
            }
        } catch (error: any) {
            Alert.alert(error.errors[0].message, error.errors[0].longMessage);
        }
        finally {
            setLoading(false)
        }
    }


    const signInWithOAuth = useCallback(async (type: 'google' | 'apple') => {
        try {
            if (type === 'google') {
                const {
                    createdSessionId,
                    signIn,
                    signUp,
                    setActive,
                    authSessionResult
                } = await startOAuthFlowWithGoogle({
                    redirectUrl: Linking.createURL('/(tabs)', {scheme: 'myapp'})
                });
                if (createdSessionId) {
                    await setActive!({session: createdSessionId})
                } else {
                    // Use signIn or signUp for next steps such as MFA
                }
            } else {
                const {createdSessionId, signIn, signUp, setActive, authSessionResult} = await startOAuthFlowWithApple({
                    redirectUrl: Linking.createURL('/(tabs)', {scheme: 'myapp'})
                });
                if (createdSessionId) {
                    await setActive!({session: createdSessionId})
                } else {
                    // Use signIn or signUp for next steps such as MFA
                }
            }
        } catch (error: any) {
            Alert.alert(error.errors[0].message, error.errors[0].longMessage);
        }
    }, [])

    const onChangeCode = (text: string, index: number) => {
        if (text.length > 1) {
            setErrorMessages(undefined);
            const newCodes = text.split("");
            setCodes(newCodes);
            refs[5]!.current?.focus();
            return;
        }
        setErrorMessages(undefined);
        const newCodes = [...codes!];
        newCodes[index] = text;
        setCodes(newCodes);
        if (text !== "" && index < 5) {
            refs[index + 1]!.current?.focus();
        }
    };


    return (
        <View flex={1} backgroundColor="$color1" px={20} justifyContent="center">
            <KeyboardAvoidingView style={{flex: 1}} behavior={isIos ? 'padding' : 'height'} keyboardVerticalOffset={70}>
                <View alignItems="center">
                    <LottieView
                        autoPlay
                        ref={animation}
                        enableMergePathsAndroidForKitKatAndAbove={true}
                        style={{
                            width: type === 'login' ? 200 : 150,
                            height: type === 'login' ? 200 : 150,
                        }}
                        // Find more Lottie files at https://lottiefiles.com/featured
                        source={require('@/assets/lottie/auth-animation.json')}
                    />
                </View>
                {
                    !pendingVerification &&
                    <View>
                        {
                            type === 'signup' &&
                            <>
                                <Text mb={2}>{t('AUTH.FIRSTNAME')}</Text>
                                <Input value={firstname} onChangeText={setFirstname} size="$4" borderWidth={2} mb={10}/>

                                <Text mb={2}>{t('AUTH.LASTNAME')}</Text>
                                <Input value={lastname} onChangeText={setLastname} size="$4" borderWidth={2} mb={10}/>
                            </>
                        }

                        <Text mb={2}>{t('AUTH.EMAIL')}</Text>
                        <Input value={email} autoCapitalize="none" onChangeText={setEmail} size="$4" borderWidth={2} mb={10}/>

                        <Text mb={2}>{t('AUTH.PASSWORD')}</Text>
                        <Input value={password} autoCapitalize="none" secureTextEntry onChangeText={setPassword} size="$4" borderWidth={2}/>

                        <View alignItems="center" mt={10}>
                            <TouchableOpacity onPress={toggleType}>
                                <Text>{type === 'signup' ? t('AUTH.ALREADY_HAVE_ACCOUNT') : t('AUTH.DONT_HAVE_ACCOUNT')}</Text>
                            </TouchableOpacity>
                        </View>

                        {
                            type === 'login' &&
                            <Button disabled={loading} onPress={onSignInPress}
                                    mt={20}>{t(loading ? 'COMMON.LOADING' : 'AUTH.LOGIN_BUTTON')}</Button>
                        }
                        {
                            type === 'signup' &&
                            <Button disabled={loading} onPress={onSignUpPress}
                                    mt={20}>{t(loading ? 'COMMON.LOADING' : 'AUTH.SIGNUP_BUTTON')}</Button>
                        }

                        {/*<View flexDirection="row" my={40} gap={40} position="relative">*/}
                        {/*    <Separator/>*/}
                        {/*    <Separator/>*/}
                        {/*    <Text*/}
                        {/*        style={{*/}
                        {/*            position: 'absolute',*/}
                        {/*            top: -10,*/}
                        {/*            left: (width * 0.5) - 25,*/}
                        {/*        }}*/}
                        {/*    >{t('AUTH.OR')}</Text>*/}
                        {/*</View>*/}
                        {/*<View backgroundColor="$color1">*/}
                        {/*    {*/}
                        {/*        isIos &&*/}
                        {/*        <TouchableOpacity onPress={() => signInWithOAuth('apple')}*/}
                        {/*                          style={[styles.btnLight, styles.btn, {marginBottom: 10}]}>*/}
                        {/*            <Ionicons name="logo-apple" size={20} style={styles.btnIcon} color="white"/>*/}
                        {/*            <Text fontSize={18} color="white">{t('AUTH.CONTINUE_WITH_APPLE')}</Text>*/}
                        {/*        </TouchableOpacity>*/}
                        {/*    }*/}
                        {/*    <TouchableOpacity*/}
                        {/*        onPress={() => signInWithOAuth('google')}*/}
                        {/*        style={[*/}
                        {/*            styles.btnDark,*/}
                        {/*            styles.btn,*/}
                        {/*            colorScheme === 'light' && {*/}
                        {/*                borderColor: 'gray',*/}
                        {/*                borderWidth: 1,*/}
                        {/*                borderStyle: 'solid'*/}
                        {/*            }*/}
                        {/*        ]}>*/}
                        {/*        <Image marginRight={8} source={require('@/assets/images/signin/google-icon.png')}*/}
                        {/*               width={20} height={20}/>*/}
                        {/*        <Text fontSize={18} color="black">{t('AUTH.CONTINUE_WITH_GOOGLE')}</Text>*/}
                        {/*    </TouchableOpacity>*/}
                        {/*</View>*/}
                    </View>
                }
                {
                    pendingVerification &&
                    <>
                        <Text textAlign="center" fontSize={20} mb={10} fontWeight="bold">{t('AUTH.ACCESS_CODE.TITLE')}</Text>
                        <Text textAlign="center" mb={30}>{t('AUTH.ACCESS_CODE.DESCRIPTION')} <Text fontWeight="bold">{email}</Text></Text>
                        <OTPInput
                            codes={codes!}
                            errorMessages={errorMessages}
                            onChangeCode={onChangeCode}
                            refs={refs}
                            config={{
                                backgroundColor: theme.color1.val,
                                borderColor: theme.color5.val,
                                errorColor: theme.red10Dark.val,
                                focusColor: theme.color10.val,
                                textColor: theme.color12.val
                            }}
                        />
                        <Button disabled={loading} onPress={onPressVerify}
                                mt={20}>{t(loading ? 'COMMON.LOADING' : 'AUTH.VERIFY_EMAIL')}</Button>
                    </>
                }
            </KeyboardAvoidingView>
        </View>
    )
}

const styles = StyleSheet.create({
    btn: {
        height: 50,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    btnLight: {
        backgroundColor: '#000',
    },
    btnLightText: {
        color: '#000',
        fontSize: 20,

    },
    btnDark: {
        backgroundColor: '#ffffff',
    },
    btnDarkText: {
        color: '#fff',
        fontSize: 20,
    },
    btnOutline: {
        borderWidth: 3,
        borderColor: 'gray',
    },
    btnIcon: {
        paddingRight: 8,
    },
});
