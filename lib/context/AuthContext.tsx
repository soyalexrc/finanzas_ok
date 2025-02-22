import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import {useRouter} from 'expo-router';
import {load, loadString, remove, save, saveString} from "@/lib/utils/storage";
import {AUTH_DATA} from "@/lib/enums/auth";

type AuthContextType = {
    isAuthenticated: boolean;
    user: any;
    token: string;
    login: (token: string, user: any) => Promise<void>;
    updateUserInfo: (user: any) => Promise<void>;
    checkAuth: (onSuccess: () => void, onError: () => void) => Promise<void>;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({children}: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<any>({});
    const [token, setToken] = useState<string>('');
    const router = useRouter();

    // useEffect(() => {
    //     checkAuth();
    // }, []);

    const checkAuth = async (onSuccess: () => void, onError: () => void) => {
        const token = await loadString(AUTH_DATA.TOKEN) ?? '';
        const storedUser: any = await load(AUTH_DATA.USER)
        if (Boolean(token) && Boolean(storedUser)) {
            setIsAuthenticated(true);
            setUser(storedUser);
            setToken(token);
            // setTimeout(() => {
            onSuccess();
            // }, 500)
        } else {
            onError();
        }
    };


    const login = async (token: string, user: any) => {
        try {
            setIsAuthenticated(true);
            await saveString(AUTH_DATA.TOKEN, token);
            await save(AUTH_DATA.USER, user);
            setUser(user);
            setToken(token);
            router.replace('/auth/tabs/resume');
        } catch (e) {
            console.error(e);
        }
    };


    const updateUserInfo = async (user: any) => {
        try {
            await save(AUTH_DATA.USER, user);
            setUser(user);
        } catch (e) {
            console.error(e);
        }
    };

    const logout = async () => {
        setIsAuthenticated(false);
        await remove(AUTH_DATA.TOKEN);
        await remove(AUTH_DATA.USER);
        setUser({});
        setToken('');
        router.replace('/');
    };
    return (
        <AuthContext.Provider value={{isAuthenticated, login, logout, user, token, updateUserInfo, checkAuth}}>
            {children}
        </AuthContext.Provider>
    );
};
