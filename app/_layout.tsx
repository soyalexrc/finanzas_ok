import {useFonts} from 'expo-font';
import {Slot, Stack, useRouter, useSegments} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, {useEffect} from 'react';
import 'react-native-reanimated';
import NetInfo from '@react-native-community/netinfo';
import Providers from "@/lib/components/Providers";
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import {changeNetworkState, selectNetworkState} from "@/lib/store/features/network/networkSlice";
import {load, loadString, saveString} from "@/lib/utils/storage";
import {Appearance, Platform, StatusBar, useColorScheme} from "react-native";
import * as Updates from 'expo-updates';
import {
    selectSettings,
    updateAppearance,
    updateHiddenFeatureFlag, updateNotificationsScheduling, updateOnboardingState,
    updateSelectedLanguage
} from "@/lib/store/features/settings/settingsSlice";
import {useTheme, View} from "tamagui";
import {
    selectCategoryFilter,
    selectDateRangeFilter, updateAccountFilter, updateChartPoints, updateTransactionsGroupedByCategory
} from "@/lib/store/features/transactions/reportSlice";
import {selectSelectedAccountGlobal, updateAccountsList} from "@/lib/store/features/accounts/accountsSlice";
import {
    selectHomeViewTypeFilter,
    updateTransactionsGroupedByDate
} from "@/lib/store/features/transactions/transactionsSlice";
import {useSQLiteContext} from "expo-sqlite";
import {getLocales} from "expo-localization";
import {
    getAllAccounts,
    getAllCategories,
    getSettings,
    getTransactions,
    getTransactionsGroupedAndFiltered, getTransactionsGroupedAndFilteredV2, getTransactionsV2
} from "@/lib/db";
import {getCurrentMonth, getCurrentWeek} from "@/lib/helpers/date";
import {selectCategory, updateCategoriesList} from "@/lib/store/features/categories/categoriesSlice";
import '@/lib/language';
import i18next from "i18next";
import {changeCurrentTheme, CustomTheme} from "@/lib/store/features/ui/uiSlice";
import * as net from "node:net";
import {useTranslation} from "react-i18next";
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const InitialLayout = () => {
    const theme = useTheme();
    const { t } = useTranslation();
    const isIos = Platform.OS === 'ios';
    const dispatch = useAppDispatch();
    const appearance = useAppSelector(selectSettings).appearance;
    const router = useRouter();
    const colorScheme = useColorScheme();
    const networkState = useAppSelector(selectNetworkState);
    const selectedDateRange = useAppSelector(selectDateRangeFilter);
    const selectedCategoryFilter = useAppSelector(selectCategoryFilter);
    const selectedAccount = useAppSelector(selectSelectedAccountGlobal);
    const filterType = useAppSelector(selectHomeViewTypeFilter)
    const db = useSQLiteContext();

    async function updateStore() {
        try {
            await validateSettingsFromStorage();
            const accounts = getAllAccounts(db);
            const categories = getAllCategories(db);
            const {start, end} = getCurrentMonth();
            // const {
            //     amountsGroupedByDate,
            //     transactionsGroupedByCategory
            // } = await getTransactionsV2(db, selectedDateRange.start, selectedDateRange.end);
            const transactions = await getTransactionsGroupedAndFilteredV2(db, start.toISOString(), end.toISOString(), filterType.type);
            dispatch(updateAccountsList(accounts))
            dispatch(updateCategoriesList(categories));

            // dispatch(selectCategory(categories[0]));
            dispatch(updateTransactionsGroupedByDate(transactions));
            // dispatch(updateTransactionsGroupedByCategory(transactionsGroupedByCategory));
            // dispatch(updateChartPoints(amountsGroupedByDate))
            // dispatch(updateAccountFilter(accounts[0]));
        } catch (err) {
            console.log('update store', err);
        }
    }

    useEffect(() => {
        updateStore();
    }, []);

    const [loaded, error] = useFonts({
        Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
        InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
    })


    useEffect(() => {
        if (error) throw error;
    }, [error]);

    useEffect(() => {
        if (appearance !== 'system') {
            Appearance.setColorScheme(appearance);
        } else {
            Appearance.setColorScheme(null)
        }
    }, [appearance]);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(
            state => {
                if (state.isConnected) {
                    onFetchUpdateAsync()
                }
                dispatch(changeNetworkState(state))
            }
        )
        return () => {
            unsubscribe()
        }
    }, []);

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);


    if (!loaded) {
        return <Slot/>;
    }

    async function onFetchUpdateAsync() {
        try {
            const update = await Updates.checkForUpdateAsync();

            if (update.isAvailable) {
                await Updates.fetchUpdateAsync();
                await Updates.reloadAsync();
            }
        } catch (error) {
            // You can also add an alert() to see the error message in case of an error when fetching updates.
            console.log(`Error fetching latest Expo update: ${error}`);
        }
    }

    async function validateSettingsFromStorage() {
        const {languageCode} = getLocales()[0]

        const settings = getSettings(db);
        dispatch(changeCurrentTheme(settings?.custom_theme as CustomTheme ?? 'green'));
        dispatch(updateAppearance(settings?.appearance as 'system' | 'light' | 'dark' ?? 'system'));
        dispatch(updateOnboardingState(settings?.is_onboarding_shown ? JSON.parse(settings?.is_onboarding_shown) : false));
        dispatch(updateSelectedLanguage(settings?.selected_language ?? 'en'))
        dispatch(updateHiddenFeatureFlag(settings?.hidden_feature_flag ? JSON.parse(settings?.hidden_feature_flag) : false));
        if (!settings?.is_onboarding_shown || settings?.is_onboarding_shown === 'false') {
            router.replace('/onboarding')
        }
        await i18next.changeLanguage(settings?.selected_language ? settings.selected_language : languageCode ?? 'en');

        const notifications_scheduling: any = await load('notifications_scheduling') ?? {
            hour: 20,
            minute: 0,
            active: false
        };
        dispatch(updateNotificationsScheduling(notifications_scheduling));


    }


    return (
        <View flex={1} backgroundColor="$color1">
            <StatusBar
                barStyle={appearance === 'system' ? (colorScheme === 'dark' ? 'light-content' : 'dark-content') : appearance === 'light' ? 'dark-content' : 'light-content'}/>
            <Stack initialRouteName="(tabs)">
                <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
                <Stack.Screen name="onboarding" options={{headerShown: false}}/>
                <Stack.Screen name="transactionCreateUpdate"
                              options={{presentation: 'modal', headerShown: false, animation: "slide_from_bottom"}}/>
                <Stack.Screen name="emojiSelection"
                              options={{presentation: 'modal', headerShown: false, animation: "slide_from_bottom"}}/>
                <Stack.Screen name="search"

                              options={{
                                  animation: "slide_from_right",
                                  title: 'Search',
                                  headerBlurEffect: 'prominent',
                                  headerBackTitle: t('COMMON.BACK'),
                                  headerTransparent: isIos,
                                  headerTintColor: theme.color12.val,
                                  headerStyle: {
                                      backgroundColor: theme.color1.val,
                                  },
                              }}/>
                <Stack.Screen name="auth" options={{
                    headerShown: false,
                    presentation: 'modal',
                }}/>
                <Stack.Screen name="+not-found"/>
            </Stack>
        </View>
    )
}

export default function RootLayout() {
    return (
        <Providers>
            <InitialLayout/>
        </Providers>
    );
}
