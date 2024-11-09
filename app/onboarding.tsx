import {Button, Image, Input, Text, useTheme, View, XStack, YStack} from "tamagui";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {save} from "@/lib/utils/storage";
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import {
    selectSettings, updateNotificationsScheduling,
    updateOnBoardingLastStep,
    updateOnboardingState, updateSelectedLanguage
} from "@/lib/store/features/settings/settingsSlice";
import {
    createAccount,
    deleteSettingByKey,
    getAllAccounts, getAllCategories,
    getSettingByKey, insertMultipleCategories,
    updateSettingByKey
} from "@/lib/db";
import {useSQLiteContext} from "expo-sqlite";
import {useRouter} from "expo-router";
import {
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    RefreshControl,
    TouchableOpacity,
    useColorScheme
} from "react-native";
import {useTranslation} from "react-i18next";
import {Entypo, Feather} from "@expo/vector-icons";
import i18next from "i18next";
import * as DropdownMenu from "zeego/dropdown-menu";
import currencies from "@/lib/utils/data/currencies";
import CurrenciesSheet from "@/lib/components/ui/android-dropdowns-sheets/CurrenciesSheet";
import {
    addAccount,
    selectAccountCreateUpdate,
    selectAccountGlobally,
    updateAccountsList
} from "@/lib/store/features/accounts/accountsSlice";
import {useEffect, useState} from "react";
import {selectCurrentEmoji} from "@/lib/store/features/ui/uiSlice";
import {getLocales} from "expo-localization";
import {
    englishCategories,
    spanishCategories,
    chineseCategories,
    frenchCategories,
    germanCategories,
    japaneseCategories
} from '@/lib/utils/data/categories';
import * as Notifications from "expo-notifications";
import * as Linking from "expo-linking";
import * as Haptics from "expo-haptics";
import {cancelScheduledNotificationAsync} from "expo-notifications";
import {updateAccountFilter} from "@/lib/store/features/transactions/reportSlice";
import {selectCategory, updateCategoriesList} from "@/lib/store/features/categories/categoriesSlice";

export default function Screen() {
    const locales = getLocales();
    const insets = useSafeAreaInsets();
    const db = useSQLiteContext();
    const dispatch = useAppDispatch();
    const {onBoardingLastStep, selectedLanguage} = useAppSelector(selectSettings)
    const router = useRouter();
    const {t} = useTranslation()
    const {notifications} = useAppSelector(selectSettings);


    // Notifications
    const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);

    const isIos = Platform.OS === 'ios';
    const [openCurrenciesSheet, setOpenCurrenciesSheet] = useState<boolean>(false)
    const [accountTitle, setAccountTitle] = useState<string>('')
    const [accountBalance, setAccountBalance] = useState<string>('0')
    const [categories, setCategories] = useState<{ type: string, title: string; id: number, icon: string }[]>([])
    const [refreshing, setRefreshing] = useState<boolean>(false)
    const [accountCurrency, setAccountCurrency] = useState<{ code: string, symbol: string }>({
        code: locales[0].currencyCode ?? 'USD',
        symbol: locales[0].currencySymbol ?? '$'
    })
    const [accountPositiveState, setAccountPositiveState] = useState<string>('');
    const currentEmoji = useAppSelector(selectCurrentEmoji);

    useEffect(() => {
        if (locales[0].languageCode === 'es') {
            setCategories(spanishCategories)
        } else if (locales[0].languageCode === 'en') {
            setCategories(englishCategories)
        }
        else if (locales[0].languageCode === 'de') {
            setCategories(germanCategories)
        }
        else if (locales[0].languageCode === 'ja') {
            setCategories(japaneseCategories)
        }
        else if (locales[0].languageCode === 'zh') {
            setCategories(chineseCategories)
        }
        else if (locales[0].languageCode === 'fr') {
            setCategories(frenchCategories)
        }
    }, []);

    async function complete() {
        const result = updateSettingByKey(db, 'is_onboarding_shown', 'true');
        if (result) {
            dispatch(updateOnboardingState(result));
            router.replace('/(tabs)');
        }
    }

    async function reset() {
        const result = await save('onboarding_last_step', 1);
        if (result) dispatch(updateOnBoardingLastStep(1));

        const r = updateSettingByKey(db, 'is_onboarding_shown', 'true');
        if (r) {
            dispatch(updateOnboardingState(true));
            router.replace('/(tabs)');
        }
    }

    function changeStep(operation: 'next' | 'prev') {
        const newStep = operation === 'next' ? onBoardingLastStep + 1 : onBoardingLastStep - 1;
        // const result = await save('onboarding_last_step', newStep);
        // if (result) {
        dispatch(updateOnBoardingLastStep(newStep));
        // }
    }

    function manageCreateCategories() {
        insertMultipleCategories(db, categories);
        const allCategories = getAllCategories(db);
        dispatch(updateCategoriesList(allCategories));
        dispatch(selectCategory(allCategories[0]));
        changeStep('next')
    }

    function removeCategory(id: number) {
        const updatedList = categories.filter(category => category.id !== id);
        setCategories(updatedList);
    }

    async function getPermissionsStatus() {
        const {status} = await Notifications.getPermissionsAsync();
        setNotificationsEnabled(status === 'granted')
    }

    useEffect(() => {
        const interval = setInterval(() => {
            getPermissionsStatus();
        }, 3000)

        return () => {
            clearInterval(interval)
        }
    }, []);

    async function askForPermissions() {
        const {status, canAskAgain} = await Notifications.requestPermissionsAsync()

        if (status === 'granted') {
            setNotificationsEnabled(true);
        }

        if (status === 'denied' && !canAskAgain) {
            await Linking.openSettings();
        }
    }

    async function scheduleDailyNotification(hour: number, minute: number) {
        await Haptics.selectionAsync();
        await cancelDailyNotification()
        const notification = {
            title: t('SETTINGS.NOTIFICATIONS.OPTIONS.NOTIFICATION_TITLE'),
            body: t('SETTINGS.NOTIFICATIONS.OPTIONS.NOTIFICATION_BODY'),
            data: {},
        };

        const trigger: Notifications.NotificationTriggerInput = {
            repeats: true,
            hour,
            minute
        };

        try {
            const schedulingResult = await Notifications.scheduleNotificationAsync({
                content: notification,
                trigger,
            });
            dispatch(updateNotificationsScheduling({ hour, minute, active: true }))
            updateSettingByKey(db, 'daily_notification', schedulingResult);
        } catch (error) {
            console.error('Error scheduling daily notification:', error);
        }
    }

    async function cancelDailyNotification() {
        try {
            const notification = getSettingByKey(db, 'daily_notification');
            console.log('notification onboarding', notification);
            dispatch(updateNotificationsScheduling({ hour: 8, minute: 0, active: false }))
            if (notification?.value) {
                await cancelScheduledNotificationAsync(notification?.value);
                deleteSettingByKey(db, 'daily_notification');
            }
        } catch (err) {
            console.error(err);
        }
    }


    return (
        <View flex={1} backgroundColor="$color1" paddingTop={insets.top} paddingBottom={insets.bottom}>
            {
                onBoardingLastStep === 1 &&
                <View flex={1}>
                    <XStack justifyContent="center">
                        <Image source={require('@/assets/images/adaptive-icon.png')} width={170} height={170}/>
                    </XStack>
                    <Text fontSize="$10" textAlign="center" mb={10}>{t('COMMON.WELCOME')}!</Text>
                    <Text fontSize={14} textAlign="center">{t('ONBOARDING.WELCOME.MONEY_IN_SHAPE')}! 💪</Text>
                    <Text fontSize={14} textAlign="center">{t('ONBOARDING.WELCOME.MONEY_MISSION')} 🚀</Text>
                    <Text fontSize={14} textAlign="center">{t('ONBOARDING.WELCOME.TAME_FINANCES')}! 🦁</Text>
                    <View flex={1}/>
                    <Button mx={20} mb={10} onPress={() => changeStep('next')}>{t('COMMON.GET_STARTED')}</Button>
                </View>
            }

            {
                onBoardingLastStep === 2 &&
                <View flex={1}>
                    <XStack justifyContent="center">
                        <Image
                            source={require('@/assets/images/edit-list.png')}
                            width={170}
                            height={170}
                            objectFit="contain"
                        />
                    </XStack>
                    <YStack px={20} mt={20}>
                        <Text fontSize={30} mb={10}>{t('ONBOARDING.CATEGORIES.TITLE')}</Text>
                        <Text fontSize={14} mb={10}>{t('ONBOARDING.CATEGORIES.DESC')}</Text>
                    </YStack>

                    {/*<ScrollView flex={1} mb={10} p={20}>*/}
                    {/*    */}
                    {/*</ScrollView>*/}

                    <FlatList
                        data={categories}
                        style={{flex: 1, marginVertical: 10}}
                        contentContainerStyle={{paddingHorizontal: 20}}
                        keyExtractor={((item, index) => item.id.toString())}
                        renderItem={({item, index}) => (
                            <XStack justifyContent="space-between" mb={10}>
                                <XStack gap={10} alignItems="center">
                                    <Text fontSize={24}>{item.icon}</Text>
                                    <Text fontSize={16}>{item.title}</Text>
                                </XStack>
                                <TouchableOpacity onPress={() => removeCategory(item.id)} accessible={true} accessibilityLabel={`Remove category ${item.title} ${index + 1}`} accessibilityHint={`Removes the default category named: ${item.title} ${index + 1}`}>
                                    <Feather name="trash-2" size={isIos ? 24 : 30} color="red" />
                                </TouchableOpacity>
                            </XStack>
                        )}
                    />

                    <Button mx={20} mb={10} onPress={manageCreateCategories} >{t('COMMON.NEXT')}</Button>

                </View>
            }
            {
                onBoardingLastStep === 3 &&
                <View flex={1}>
                    <XStack justifyContent="center">
                        <Image
                            source={require('@/assets/images/schedule_notification.webp')}
                            width={170}
                            height={170}
                            objectFit="contain"
                        />
                    </XStack>
                    <YStack px={20} mt={20}>
                        <Text fontSize={30} mb={10}>{t('ONBOARDING.NOTIFICATIONS.TITLE')}</Text>
                        <Text fontSize={14} mb={10}>{t('ONBOARDING.NOTIFICATIONS.DESC')}</Text>
                    </YStack>

                    {
                        notificationsEnabled &&
                        <YStack p={20} gap={15}>
                            <TouchableOpacity onPress={cancelDailyNotification} style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <Text fontSize={16}>{t('ONBOARDING.NOTIFICATIONS.OPTIONS.NONE')}</Text>
                                {!notifications.scheduling.active && <Entypo name="check" size={20} color="black"/>}
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => scheduleDailyNotification(9, 0)} style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <Text fontSize={16}>{t('ONBOARDING.NOTIFICATIONS.OPTIONS.MORNINGS')}</Text>
                                {notifications.scheduling.hour === 9 && <Entypo name="check" size={20} color="black"/>}
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => scheduleDailyNotification(15, 0)} style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <Text fontSize={16}>{t('ONBOARDING.NOTIFICATIONS.OPTIONS.AFTERNOONS')}</Text>
                                {notifications.scheduling.hour === 15 && <Entypo name="check" size={20} color="black"/>}
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => scheduleDailyNotification(21, 0)} style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <Text fontSize={16}>{t('ONBOARDING.NOTIFICATIONS.OPTIONS.NIGHTS')}</Text>
                                {notifications.scheduling.hour === 21 && <Entypo name="check" size={20} color="black"/>}
                            </TouchableOpacity>


                            {/*<TouchableOpacity style={{*/}
                            {/*    flexDirection: 'row',*/}
                            {/*    justifyContent: 'space-between',*/}
                            {/*    alignItems: 'center'*/}
                            {/*}}>*/}
                            {/*    <Text fontSize={16}>Personalizar</Text>*/}
                            {/*    {selectedLanguage === 'fr' && <Entypo name="check" size={20} color="black"/>}*/}
                            {/*</TouchableOpacity>*/}


                        </YStack>
                    }
                    {
                        !notificationsEnabled &&

                        <YStack justifyContent="center" flex={3} alignItems="center" gap={20}>
                            <Image
                                source={require('@/assets/images/notifications-error.png')}
                                width={50}
                                height={50}
                                objectFit="contain"
                            />
                            <View maxWidth={300}>
                                <Text textAlign="center">{t('COMMON.MESSAGES.ACTIVATE_NOTIFICATIONS')}</Text>
                            </View>
                            <Button backgroundColor="$color11" onPress={askForPermissions}>
                                <Text color="$color1">{t('COMMON.ACTIVATE')}</Text>
                            </Button>
                        </YStack>
                    }
                    <View flex={1}/>

                    <Button mx={20} mb={10} onPress={() => changeStep('next')} >{t('COMMON.NEXT')}</Button>

                </View>
            }
            {
                onBoardingLastStep === 4 &&
                <View flex={1}>
                    <XStack justifyContent="center" alignItems="center" flex={1}>
                        <Image
                            source={require('@/assets/images/completed.webp')}
                            width={100}
                            height={100}
                            objectFit="contain"
                        />
                    </XStack>
                    <YStack px={20} mt={20} alignItems="center">

                        <Text fontSize={30} my={20} textAlign='center'>{t('ONBOARDING.FINISH')}</Text>
                    </YStack>


                    <View flex={1}/>

                    <Button mx={20} mb={10} onPress={complete} >{t('COMMON.DONE')}</Button>


                </View>
            }
            {!isIos && <CurrenciesSheet open={openCurrenciesSheet} setOpen={setOpenCurrenciesSheet}
                                        currentCode={accountCurrency.code} locales={locales}
                                        onSelect={(code, symbol) => setAccountCurrency({code, symbol})}/>}
        </View>
    )
}
