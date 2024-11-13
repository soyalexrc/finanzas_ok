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
    selectHomeViewTypeFilter, updateCurrency,
    updateTransactionsGroupedByDate
} from "@/lib/store/features/transactions/transactionsSlice";
import {useSQLiteContext} from "expo-sqlite";
import {getLocales} from "expo-localization";
import {
    getAllAccounts,
    getAllCategories, getSettingByKey,
    getSettings, getTotalsOnEveryMonthByYear, getTotalSpentByYear,
    getTransactions,
    getTransactionsGroupedAndFiltered, getTransactionsGroupedAndFilteredV2, getTransactionsV2, updateSettingByKey
} from "@/lib/db";
import {formatDate, getCurrentMonth, getCurrentWeek} from "@/lib/helpers/date";
import {selectCategory, updateCategoriesList} from "@/lib/store/features/categories/categoriesSlice";
import '@/lib/language';
import i18next from "i18next";
import {changeCurrentTheme, CustomTheme} from "@/lib/store/features/ui/uiSlice";
import * as net from "node:net";
import {useTranslation} from "react-i18next";
import {
    updateLimit,
    updateMonth,
    updateTotalByMonth,
    updateTotalsInYear
} from "@/lib/store/features/transactions/filterSlice";
import {format} from "date-fns";
import {enUS, es} from "date-fns/locale";
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
    const {languageCode, currencyCode, currencySymbol} = getLocales()[0]
    const filterType = useAppSelector(selectHomeViewTypeFilter)
    const db = useSQLiteContext();

    async function updateStore() {
        try {
            await validateSettingsFromStorage();
            const accounts = getAllAccounts(db);
            const categories = getAllCategories(db);
            const settingLanguage = getSettingByKey(db, 'selected_language')
            const {start, end} = getCurrentMonth();
            const totalsOnEveryMonthByYear = getTotalsOnEveryMonthByYear(db, new Date().getFullYear(), 'expense');
            const totalSpentByYear = getTotalSpentByYear(db, new Date().getFullYear());
            const currentMonthNumber = new Date().getMonth() + 1;
            const filterLimit = getSettingByKey(db, 'filter_limit')

            // const {
            //     amountsGroupedByDate,
            //     transactionsGroupedByCategory
            // } = await getTransactionsV2(db, selectedDateRange.start, selectedDateRange.end);
            const transactions = await getTransactionsGroupedAndFilteredV2(db, start.toISOString(), end.toISOString(), 'Spent');
            dispatch(updateAccountsList(accounts))
            dispatch(updateCategoriesList(categories));
            dispatch(updateCurrency({symbol: currencySymbol ?? '$', code: currencyCode ?? 'USD'}));
            dispatch(updateTotalByMonth(totalsOnEveryMonthByYear));
            dispatch(updateTotalsInYear(totalSpentByYear));
            dispatch(updateLimit(filterLimit?.value ? Number(filterLimit.value) : 2500));
            dispatch(updateMonth({ number: currentMonthNumber, text: format(formatDate(new Date().toISOString()), 'MMMM', { locale: settingLanguage?.value && settingLanguage.value === 'es' ? es : enUS }) }))
            // {format(formatDate(new Date().toISOString()), 'MMMM', {locale: selectedLanguage === 'es' ? es : enUS})}
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

    async function validateSettingsFromStorage() {

        const settings = getSettings(db);

        dispatch(changeCurrentTheme(settings?.custom_theme as CustomTheme ?? 'green'));
        dispatch(updateAppearance(settings?.appearance as 'system' | 'light' | 'dark' ?? 'system'));
        dispatch(updateOnboardingState(settings?.is_onboarding_shown ? JSON.parse(settings?.is_onboarding_shown) : false));
        dispatch(updateSelectedLanguage(settings?.selected_language ?? 'en'))
        dispatch(updateHiddenFeatureFlag(settings?.hidden_feature_flag ? JSON.parse(settings?.hidden_feature_flag) : false));
        if (!settings?.is_onboarding_shown || settings?.is_onboarding_shown === 'false') {
            router.replace('/onboarding')
        }

        if (!settings?.selected_language) {
            updateSettingByKey(db, 'selected_language', languageCode ?? 'en');
        }

        if (!settings?.filter_limit) {
            updateSettingByKey(db, 'filter_limit', '2500');
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
                                  title: '',
                                  headerBlurEffect: 'prominent',
                                  headerBackTitle: t('COMMON.BACK'),
                                  headerTransparent: isIos,
                                  headerTintColor: theme.color12?.val,
                                  headerStyle: {
                                      backgroundColor: theme.color1?.val,
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
