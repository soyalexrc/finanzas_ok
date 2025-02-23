import {useState, useCallback, useEffect} from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import {Alert, Linking} from "react-native";

export function useBiometricAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isBiometricSupported, setIsBiometricSupported] = useState(false);

    const checkBiometricSupport = async (): Promise<boolean> => {
        const hasHardwareSupport = await LocalAuthentication.hasHardwareAsync();
        if (!hasHardwareSupport) {
            Alert.alert('Aviso', 'Los permisos de autenticación biométrica están denegados o no se encuentran, si deseas acceder al contenido de esta página, por favor revisa la configuración y otorga los permisos solicitados.', [
                { text: 'Cancelar', style: 'destructive' },
                {
                    text: 'Dar Acceso',
                    style: 'default',
                    isPreferred: true,
                    onPress: async () => await Linking.openSettings()
                }
            ]);
        }
        setIsBiometricSupported(hasHardwareSupport);
        return hasHardwareSupport;
    }

    const authenticate = useCallback(async () => {
        try {
            const hasHardwareSupport = await LocalAuthentication.hasHardwareAsync();
            if (!hasHardwareSupport) {
                Alert.alert('Aviso', 'Los permisos de autenticación biométrica están denegados o no se encuentran, si deseas acceder al contenido de esta página, por favor revisa la configuración y otorga los permisos solicitados.', [
                    { text: 'Cancelar', style: 'destructive' },
                    {
                        text: 'Dar Acceso',
                        style: 'default',
                        isPreferred: true,
                        onPress: async () => await Linking.openSettings()
                    }
                ])
                return false;
            }

            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Verifica tu identidad para continuar',
                cancelLabel: 'Cancelar autenticación biométrica',
            });

            if (result.success) {
                setIsAuthenticated(true);
                return true;
            } else {
                setIsAuthenticated(false);
                return false;
            }
        } catch (error) {
            console.error('Error durante procedimiento con biometria:', error);
            return false;
        }
    }, []);

    return {isAuthenticated, authenticate, isBiometricSupported, checkBiometricSupport};
}
