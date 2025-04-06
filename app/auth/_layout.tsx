import {Stack, useRouter} from "expo-router";
import {useEffect} from "react";
import {ActivityIndicator, TouchableOpacity, View} from "react-native";
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import {selectAuth, updateAccessToken, updateUser, User} from "@/lib/store/features/auth/auth.slice";
import {load, loadString} from "@/lib/utils/storage";
import {useCategories} from "@/lib/utils/api/categories";
import {useCurrencies} from "@/lib/utils/api/currencies";
import {updateCategoriesList} from "@/lib/store/features/transactions/categories.slice";
import {Category} from "@/lib/types/transaction";
import {CurrencyV2, updateCurrenciesList} from "@/lib/store/features/transactions/currencies.slice";
import {Ionicons} from "@expo/vector-icons";
import {useAuth} from "@/lib/context/AuthContext";
import {updateCurrency} from "@/lib/store/features/transactions/transactions.slice";

export default function Layout() {
    const router = useRouter();
    const {user, token} = useAuth()
    const dispatch = useAppDispatch();

    const {data: categories, refetch: refetchCategories} = useCategories(user?._id ?? '', user?.access_token ?? '')
    const {data: currencies, refetch: refetchCurrencies} = useCurrencies(user?.access_token ?? '')

    useEffect(() => {
        async function checkUser() {
            if (user && token) {
                refetchCategories().then(res => {
                    if (res.data) {
                        dispatch(updateCategoriesList(res.data))
                    }
                })
                refetchCurrencies().then(res => {
                    console.log(res.data);
                    if (res.data) {
                        dispatch(updateCurrenciesList(res.data))
                        dispatch(updateCurrency(res.data.find((c: any) => c._id === user.favCurrencies[0]) as CurrencyV2))
                    }
                })
            }
        }

        checkUser();
    }, []);

    if (!user) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <ActivityIndicator/>
            </View>
        )

    }


    return (
        <Stack>
            <Stack.Screen name="tabs" options={{headerShown: false}}/>
            <Stack.Screen name="transaction-form" options={{headerShown: false}}/>
            <Stack.Screen name="shared-spaces" options={{headerShown: false}}/>
            <Stack.Screen name="currency-selection" options={{
                headerShadowVisible: false,
                headerLargeTitle: true,
                title: 'Seleccionar moneda',
                presentation: 'modal',
                headerRight: () => (
                    <TouchableOpacity onPress={() => {
                        router.back(); // Dismiss the modal first
                        setTimeout(() => {
                            router.push('/auth/tabs/browse/account') // Then navigate to the new screen
                        }, 500); // Small delay ensures a smooth transition

                    }}>
                        <Ionicons name="settings-outline" size={24} color="black" />
                    </TouchableOpacity>
                )
            }}/>
        </Stack>
    )
}
