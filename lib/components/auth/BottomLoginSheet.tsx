import { Ionicons } from '@expo/vector-icons';
import {View, Text} from 'tamagui';
import {Platform, StyleSheet, TouchableOpacity} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {useCallback, useEffect} from "react";
import * as WebBrowser from 'expo-web-browser';
import {OAuthStrategy} from "@clerk/types";
import useWarmUpBrowser from "@/lib/hooks/useWarmUpBrowser";
import {useOAuth} from "@clerk/clerk-expo";
import * as Linking from 'expo-linking'

const BottomLoginSheet = () => {
    useWarmUpBrowser();
    const isIos = Platform.OS === 'ios';
    const { bottom } = useSafeAreaInsets();

    const { startOAuthFlow: startOAuthFlowWithGoogle } = useOAuth({ strategy: 'oauth_google' });
    const { startOAuthFlow: startOAuthFlowWithApple } = useOAuth({ strategy: 'oauth_apple' });

    WebBrowser.maybeCompleteAuthSession();

    const signInWithOAuth = useCallback(async (type: 'google' | 'apple') => {
        try {
            if (type === 'google') {
                const {createdSessionId, signIn, signUp, setActive} = await startOAuthFlowWithGoogle({
                    redirectUrl: Linking.createURL('/(tabs)', { scheme: 'myapp' })
                });
                if (createdSessionId) {
                    await setActive!({ session: createdSessionId })
                } else {
                    // Use signIn or signUp for next steps such as MFA
                }
            } else {
                const {createdSessionId, signIn, signUp, setActive} = await startOAuthFlowWithApple({
                    redirectUrl: Linking.createURL('/(tabs)', { scheme: 'myapp' })
                });
                if (createdSessionId) {
                    await setActive!({ session: createdSessionId })
                } else {
                    // Use signIn or signUp for next steps such as MFA
                }
            }
        } catch (error) {
            console.error('OAuth error', error)
        }
    }, [])

    return (
        <View backgroundColor="black" height={isIos ? 200 : 100} style={[styles.container, { paddingBottom: bottom }]}>
            {
                isIos &&
                <TouchableOpacity onPress={() => signInWithOAuth('apple')} style={[styles.btnLight, styles.btn]}>
                    <Ionicons name="logo-apple" size={20} style={styles.btnIcon} />
                    <Text style={styles.btnLightText}>Continue with Apple</Text>
                </TouchableOpacity>
            }
            <TouchableOpacity onPress={() => signInWithOAuth('google')} style={[styles.btnDark, styles.btn]}>
                <Ionicons name="logo-google" size={20} style={styles.btnIcon} color={'#fff'} />
                <Text style={styles.btnDarkText}>Continue with Google</Text>
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
        backgroundColor: '#fff',
    },
    btnLightText: {
        color: '#000',
        fontSize: 20,
    },
    btnDark: {
        backgroundColor: '#1a73e8',
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
