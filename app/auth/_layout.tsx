import {Stack} from "expo-router";
import {useEffect} from "react";
import {ActivityIndicator, View} from "react-native";
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import {selectAuth, updateAccessToken, updateUser, User} from "@/lib/store/features/auth/auth.slice";
import {load, loadString} from "@/lib/utils/storage";
import {useCategories} from "@/lib/utils/api/categories";
import {useCurrencies} from "@/lib/utils/api/currencies";
import {updateCategoriesList} from "@/lib/store/features/transactions/categories.slice";
import {Category} from "@/lib/types/transaction";
import {updateCurrenciesList} from "@/lib/store/features/transactions/currencies.slice";

export default function Layout() {
    const { user } = useAppSelector(selectAuth)
    const dispatch = useAppDispatch();

    const {data: categories, refetch: refetchCategories} = useCategories(user?._id ?? '', user?.access_token ?? '')
    const {data: currencies, refetch: refetchCurrencies} = useCurrencies(user?.access_token ?? '')

    useEffect(() => {
        async function checkUser() {
            const user = await load('user');
            const accessToken = await loadString('access_token')

            if (user && accessToken) {
                dispatch(updateUser(user as User))
                dispatch(updateAccessToken(accessToken))
                refetchCategories().then(res => {
                    if (res.data) {
                        dispatch(updateCategoriesList(res.data))
                    }
                })
                refetchCurrencies().then(res => {
                    console.log(res.data);
                    if (res.data) {
                        dispatch(updateCurrenciesList(res.data))
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
            <Stack.Screen name="tabs" options={{ headerShown: false }} />
            <Stack.Screen name="transaction-form" options={{ headerShown: false }} />
        </Stack>
    )
}
