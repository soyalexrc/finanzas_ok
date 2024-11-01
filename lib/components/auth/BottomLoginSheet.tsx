import { Ionicons } from '@expo/vector-icons';
import {View, Text, Image} from 'tamagui';
import {Platform, StyleSheet, TouchableOpacity, useColorScheme} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {useCallback} from "react";
import * as WebBrowser from 'expo-web-browser';
import useWarmUpBrowser from "@/lib/hooks/useWarmUpBrowser";

const BottomLoginSheet = () => {
    useWarmUpBrowser();
    const isIos = Platform.OS === 'ios';
    const colorScheme = useColorScheme();
    const { bottom } = useSafeAreaInsets();

    // const { startOAuthFlow: startOAuthFlowWithGoogle } = useOAuth({ strategy: 'oauth_google' });
    // const { startOAuthFlow: startOAuthFlowWithApple } = useOAuth({ strategy: 'oauth_apple' });

    WebBrowser.maybeCompleteAuthSession();

    const signInWithOAuth = useCallback(async (type: 'google' | 'apple') => {
        // try {
        //     if (type === 'google') {
        //         const {createdSessionId, signIn, signUp, setActive, authSessionResult} = await startOAuthFlowWithGoogle({
        //             redirectUrl: Linking.createURL('/(tabs)', { scheme: 'myapp' })
        //         });
        //         if (createdSessionId) {
        //             await setActive!({ session: createdSessionId })
        //         } else {
        //             // Use signIn or signUp for next steps such as MFA
        //         }
        //     } else {
        //         const {createdSessionId, signIn, signUp, setActive, authSessionResult} = await startOAuthFlowWithApple({
        //             redirectUrl: Linking.createURL('/(tabs)', { scheme: 'myapp' })
        //         });
        //         if (createdSessionId) {
        //             await setActive!({ session: createdSessionId })
        //         } else {
        //             // Use signIn or signUp for next steps such as MFA
        //         }
        //     }
        // } catch (error) {
        //     console.error('OAuth error', error)
        // }
    }, [])

    return (
        <View zIndex={20} backgroundColor="$color1" height={isIos ? 200 : 100} style={[styles.container, { paddingBottom: bottom }]}>
            {
                isIos &&
                <TouchableOpacity onPress={() => signInWithOAuth('apple')} style={[styles.btnLight, styles.btn]}>
                    <Ionicons name="logo-apple" size={20} style={styles.btnIcon} color="white" />
                    <Text fontSize={18} color="white">Continue with Apple</Text>
                </TouchableOpacity>
            }
            <TouchableOpacity
                onPress={() => signInWithOAuth('google')}
                style={[
                    styles.btnDark,
                    styles.btn,
                    colorScheme === 'light' && {  borderColor: 'gray', borderWidth: 1, borderStyle: 'solid'}
                ]}>
                <Image marginRight={8} source={require('@/assets/images/signin/google-icon.png')} width={20} height={20} />
                <Text fontSize={18} color="black">Continue with Google</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    btn: {
        height: 50,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    container: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 26,
        gap: 14,
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
export default BottomLoginSheet;
