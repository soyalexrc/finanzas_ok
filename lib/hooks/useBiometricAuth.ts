import { useState, useCallback } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';

export function useBiometricAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const authenticate = useCallback(async () => {
        try {
            const hasHardwareSupport = await LocalAuthentication.hasHardwareAsync();
            if (!hasHardwareSupport) {
                console.error('Biometric authentication is not supported on this device.');
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
