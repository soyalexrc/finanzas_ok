import {useState, useCallback} from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import {Alert, Linking} from "react-native";
import {useTranslation} from "react-i18next";

export function useBiometricAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const {t} = useTranslation();

    const authenticate = useCallback(async () => {
        try {
            const hasHardwareSupport = await LocalAuthentication.hasHardwareAsync();
            if (!hasHardwareSupport) {
                Alert.alert(t('COMMON.WARNING'), 'Biometric authentication permissions are denied or not found, if you want to access the content on this page, please check out the settings and give the requested permissions.', [
                    { text: t('COMMON.CANCEL'), style: 'destructive' },
                    {
                        text: t('COMMON.GIVE_ACCESS'),
                        style: 'default',
                        isPreferred: true,
                        onPress: async () => await Linking.openSettings()
                    }
                ])
                return false;
            }

            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Authenticate to continue',
                cancelLabel: 'Cancel Biometrics prompt',
            });

            if (result.success) {
                setIsAuthenticated(true);
                return true;
            } else {
                setIsAuthenticated(false);
                return false;
            }
        } catch (error) {
            console.error('Error during biometric authentication:', error);
            return false;
        }
    }, []);

    return {isAuthenticated, authenticate};
}
