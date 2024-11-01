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
    const theme = useTheme();
    const {notifications} = useAppSelector(selectSettings);

    const schemeColor = useColorScheme();

    // Notifications
    const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);

    const accountCreateUpdate = useAppSelector(selectAccountCreateUpdate);
    const isIos = Platform.OS === 'ios';
    const [openCurrenciesSheet, setOpenCurrenciesSheet] = useState<boolean>(false)
    const [accountTitle, setAccountTitle] = useState<string>('')
    const [accountBalance, setAccountBalance] = useState<string>('0')
    const [categories, setCategories] = useState<{ type: string, title: string; id: number, icon: string }[]>(englishCategories)
    const [refreshing, setRefreshing] = useState<boolean>(false)
    const [accountCurrency, setAccountCurrency] = useState<{ code: string, symbol: string }>({
        code: locales[0].currencyCode ?? 'USD',
        symbol: locales[0].currencySymbol ?? '$'
    })
    const [accountPositiveState, setAccountPositiveState] = useState<string>('');
    const currentEmoji = useAppSelector(selectCurrentEmoji);

    async function selectLanguage(lng: string) {
        const result = updateSettingByKey(db, 'selected_language', lng);
        if (result) {
            dispatch(updateSelectedLanguage(lng));
            await i18next.changeLanguage(lng);
            resetCategories(lng)
        }
    }

    function resetCategories(lng: string) {
        switch (lng) {
            case 'es':
                setCategories(spanishCategories);
                break;
            case 'en':
                setCategories(englishCategories);
                break;
            case 'fr':
                setCategories(frenchCategories);
                break;
            case 'de':
                setCategories(germanCategories);
                break;
            case 'ja':
                setCategories(japaneseCategories);
                break;
            case 'zh':
                setCategories(chineseCategories);
            default:
                setCategories(englishCategories)
        }
    }

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

    function handleChangeAccountState(state: 'Positive' | 'Negative') {
        setAccountPositiveState(state);
        if (state === 'Positive') {
            setAccountBalance(accountBalance.replace('-', ''));
        } else {
            if (accountBalance.includes('-')) return;
            setAccountBalance('-' + accountBalance)
        }
    }

    function manageCreateCategories() {
        insertMultipleCategories(db, categories);
        const allCategories = getAllCategories(db);
        dispatch(updateCategoriesList(allCategories));
        dispatch(selectCategory(allCategories[0]));
        changeStep('next')
    }

    async function manageCreateAccount() {
        if (!accountTitle) {
            Alert.alert(t('COMMON.WARNING'), t('COMMON.MESSAGES.INSERT_ACCOUNT_TITLE'))
            return;
        };
        if (!accountCurrency) return;

        const newAccount: any = await createAccount(
            db,
            {
                title: accountTitle,
                balance: parseInt(accountBalance),
                icon: currentEmoji,
                positive_state: accountPositiveState === 'Positive' ? 1 : 0,
                currency_code: accountCurrency.code,
                currency_symbol: accountCurrency.symbol
            });

        if (newAccount.desc === 'Ya existe una cuenta con ese nombre.') {
            changeStep('next')
            return;
        }

        if (newAccount.error) {
            Alert.alert('No se pudo registrar la cuenta', newAccount.desc)
        } else {
            dispatch(addAccount(newAccount.data));
            dispatch(selectAccountGlobally(newAccount.data));
            const accounts = getAllAccounts(db);
            dispatch(updateAccountsList(accounts))
            dispatch(updateAccountFilter(accounts[0]));
            changeStep('next')
        }
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
                            source={require('@/assets/images/translation.png')}
                            width={170}
                            height={170}
                            objectFit="contain"
                        />
                    </XStack>
                    <YStack px={20} mt={20}>
                        <Text fontSize={30} mb={10}>{t('ONBOARDING.LANGUAGE.TITLE')}</Text>
                        <Text fontSize={14} mb={10}>
                            {t('ONBOARDING.LANGUAGE.DESC')}

                        </Text>
                    </YStack>

                    <YStack p={20} gap={15}>
                        <TouchableOpacity accessible={true} accessibilityLabel="Language selection: English"   onPress={() => selectLanguage('en')} style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <XStack alignItems="center" gap={15}>
                                <Image source={require('@/assets/images/flags/en.png')} width={30} height={30}/>
                                <Text>{t('SETTINGS.LANGUAGE.OPTIONS.ENGLISH')}</Text>
                            </XStack>
                            {selectedLanguage === 'en' && <Entypo name="check" size={20} color="black"/>}
                        </TouchableOpacity>

                        <TouchableOpacity accessible={true} accessibilityLabel="Language selection: Spanish"  onPress={() => selectLanguage('es')} style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <XStack alignItems="center" gap={15}>
                                <Image source={require('@/assets/images/flags/es.png')} width={30} height={30}/>
                                <Text>{t('SETTINGS.LANGUAGE.OPTIONS.SPANISH')}</Text>
                            </XStack>
                            {selectedLanguage === 'es' && <Entypo name="check" size={20} color="black"/>}
                        </TouchableOpacity>

                        <TouchableOpacity accessible={true} accessibilityLabel="Language selection: French"  onPress={() => selectLanguage('fr')} style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <XStack alignItems="center" gap={15}>
                                <Image source={require('@/assets/images/flags/fr.png')} width={30} height={30}/>
                                <Text>{t('SETTINGS.LANGUAGE.OPTIONS.FRENCH')}</Text>
                            </XStack>
                            {selectedLanguage === 'fr' && <Entypo name="check" size={20} color="black"/>}
                        </TouchableOpacity>

                        <TouchableOpacity accessible={true} accessibilityLabel="Language selection: German"  onPress={() => selectLanguage('de')} style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <XStack alignItems="center" gap={15}>
                                <Image source={require('@/assets/images/flags/de.png')} width={30} height={30}/>
                                <Text>{t('SETTINGS.LANGUAGE.OPTIONS.GERMAN')}</Text>
                            </XStack>
                            {selectedLanguage === 'de' && <Entypo name="check" size={20} color="black"/>}
                        </TouchableOpacity>

                        <TouchableOpacity accessible={true} accessibilityLabel="Language selection: Japanese"  onPress={() => selectLanguage('ja')} style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <XStack alignItems="center" gap={15}>
                                <Image source={require('@/assets/images/flags/ja.png')} width={30} height={30}/>
                                <Text>{t('SETTINGS.LANGUAGE.OPTIONS.JAPANESE')}</Text>
                            </XStack>
                            {selectedLanguage === 'ja' && <Entypo name="check" size={20} color="black"/>}
                        </TouchableOpacity>

                        <TouchableOpacity  accessible={true} accessibilityLabel="Language selection: Chinese"  onPress={() => selectLanguage('zh')} style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <XStack alignItems="center" gap={15}>
                                <Image source={require('@/assets/images/flags/zh.png')} width={30} height={30}/>
                                <Text>{t('SETTINGS.LANGUAGE.OPTIONS.CHINESE')}</Text>
                            </XStack>
                            {selectedLanguage === 'zh' && <Entypo name="check" size={20} color="black"/>}
                        </TouchableOpacity>
                    </YStack>

                    <View flex={1}/>
                    <Button mx={20} mb={10} onPress={() => changeStep('next')} >{t('COMMON.NEXT')}</Button>

                </View>
            }
            {
                onBoardingLastStep === 3 &&
                <KeyboardAvoidingView style={{flex: 1}}>
                    <XStack justifyContent="center">
                        <Image
                            source={require('@/assets/images/accounting.png')}
                            width={170}
                            height={170}
                            objectFit="contain"
                        />
                    </XStack>
                    <YStack px={20} mt={20}>
                        <Text fontSize={30} mb={10}>{t('ONBOARDING.ACCOUNT.TITLE')}</Text>
                        <Text fontSize={14} mb={10}>{t('ONBOARDING.ACCOUNT.DESC')}</Text>
                    </YStack>

                    <YStack px={20}>
                        <YStack mb={70}>
                            <Text fontSize={16} mb={4}>{t('COMMON.NAME')}</Text>
                            <View flex={1} gap={6} position='relative'>
                                <TouchableOpacity onPress={() => router.push('/emojiSelection')} style={{
                                    position: 'absolute',
                                    top: -5,
                                    zIndex: 11,
                                    left: 5,
                                    padding: 10,
                                    borderRightWidth: 1,
                                    borderStyle: 'solid',
                                    borderColor: theme.color1.val
                                }}>
                                    <Text fontSize={25}>{currentEmoji ?? '✅'}</Text>
                                </TouchableOpacity>
                                <Input size="$4" value={accountTitle} onChangeText={setAccountTitle} paddingLeft={60}
                                       placeholder={t('SETTINGS.ACCOUNTS.PLACE_HOLDER')}/>
                            </View>
                        </YStack>

                        <YStack>
                            <Text fontSize={16} nativeID="balanceInput" mb={4}>{t('SETTINGS.ACCOUNTS.BALANCE')}</Text>
                            <View flex={1} gap={6} position='relative'>
                                {
                                    accountCreateUpdate.id > 0 &&
                                    <View style={{
                                        position: 'absolute',
                                        top: 5,
                                        zIndex: 11,
                                        left: 5,
                                        padding: 10,
                                        borderRightWidth: 1,
                                        borderStyle: 'solid',
                                        borderColor: theme.color1.val
                                    }}>
                                        <Text color="$gray10Dark">{accountCurrency.code}</Text>
                                    </View>
                                }
                                {
                                    accountCreateUpdate.id < 1 && isIos &&
                                    <DropdownMenu.Root key="currency" style={{
                                        position: 'absolute',
                                        top: 5,
                                        zIndex: 11,
                                        left: 5,
                                        padding: 10,
                                        borderRightWidth: 1,
                                        borderStyle: 'solid',
                                        borderColor: theme.color1.val
                                    }}>
                                        <DropdownMenu.Trigger>
                                            <TouchableOpacity>
                                                <Text>{accountCurrency.code}</Text>
                                            </TouchableOpacity>
                                        </DropdownMenu.Trigger>
                                        <DropdownMenu.Content loop={false} alignOffset={0} sideOffset={0} side={0}
                                                              align={0}
                                                              collisionPadding={0}
                                                              avoidCollisions={true}>
                                            <DropdownMenu.Group key="locales">
                                                {
                                                    locales.map(locale => (
                                                        <DropdownMenu.Item key={locale.currencyCode!}
                                                                           onSelect={() => setAccountCurrency({
                                                                               code: locale.currencyCode!,
                                                                               symbol: locale.currencySymbol!
                                                                           })}>
                                                            <DropdownMenu.ItemTitle>{locale.currencyCode ?? '...'}</DropdownMenu.ItemTitle>
                                                        </DropdownMenu.Item>
                                                    ))
                                                }
                                            </DropdownMenu.Group>

                                            <DropdownMenu.Group key="additionals">
                                                {
                                                    currencies.map(({code, symbol}) => (
                                                        <DropdownMenu.Item key={code}
                                                                           onSelect={() => setAccountCurrency({
                                                                               code,
                                                                               symbol
                                                                           })}>
                                                            <DropdownMenu.ItemTitle>{code}</DropdownMenu.ItemTitle>
                                                        </DropdownMenu.Item>
                                                    ))
                                                }
                                            </DropdownMenu.Group>
                                        </DropdownMenu.Content>
                                    </DropdownMenu.Root>
                                }

                                {
                                    accountCreateUpdate.id < 1 && !isIos &&
                                    <TouchableOpacity
                                        accessible={true}
                                        accessibilityLabel="Currency selection"
                                        accessibilityHint="You can select the currency of the account pressing here."
                                        onPress={() => setOpenCurrenciesSheet(true)}
                                        style={{
                                            position: 'absolute',
                                            top: 2,
                                            zIndex: 11,
                                            left: 5,
                                            padding: 10,
                                            borderRightWidth: 1,
                                            borderStyle: 'solid',
                                            borderColor: theme.color1.val
                                        }}
                                    >
                                        <Text>{accountCurrency.code}</Text>
                                    </TouchableOpacity>
                                }


                                <Input keyboardType="numeric" returnKeyType="done" value={accountBalance}
                                       onChangeText={setAccountBalance}
                                       size="$4"
                                       accessible={true}
                                       accessibilityLabel="Balance configuration"
                                       accessibilityHint="You can set the balance of the account here."
                                       accessibilityLabelledBy="balanceInput"
                                       paddingLeft={60}/>
                            </View>
                        </YStack>

                        <YStack my={70}>
                            <Text fontSize={16} mb={4}>{t('SETTINGS.ACCOUNTS.STATE')}</Text>
                            <DropdownMenu.Root key="positive_state">
                                <DropdownMenu.Trigger>
                                    <TouchableOpacity style={{
                                        backgroundColor: theme.color2.val,
                                        height: 50,
                                        paddingHorizontal: 20,
                                        borderRadius: 8,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        borderWidth: 1,
                                        borderStyle: 'solid',
                                        borderColor: theme.color5.val,
                                        justifyContent: 'space-between'
                                    }}>
                                        <Text>{accountPositiveState ?? 'Select Balance State'}</Text>
                                        <Entypo name="select-arrows" size={18}
                                                color={schemeColor === 'light' ? 'black' : 'white'}/>
                                    </TouchableOpacity>
                                </DropdownMenu.Trigger>
                                <DropdownMenu.Content loop={false} alignOffset={0} sideOffset={0} side={0} align={0}
                                                      collisionPadding={0}
                                                      avoidCollisions={true}>
                                    <DropdownMenu.Item key="positive"
                                                       onSelect={() => handleChangeAccountState('Positive')}>
                                        <DropdownMenu.ItemTitle>{t('SETTINGS.ACCOUNTS.POSITIVE')}</DropdownMenu.ItemTitle>
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Item key="negative"
                                                       onSelect={() => handleChangeAccountState('Negative')}>
                                        <DropdownMenu.ItemTitle>{t('SETTINGS.ACCOUNTS.NEGATIVE')}</DropdownMenu.ItemTitle>
                                    </DropdownMenu.Item>
                                </DropdownMenu.Content>
                            </DropdownMenu.Root>

                            <Text mt={10} color="$gray10Dark">{t('SETTINGS.ACCOUNTS.STATE_TIP')}</Text>
                        </YStack>
                    </YStack>

                    <View flex={1}/>
                    <Button mx={20} mb={10} onPress={manageCreateAccount} >{t('COMMON.NEXT')}</Button>

                </KeyboardAvoidingView>
            }

            {
                onBoardingLastStep === 4 &&
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
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={() => {
                                setRefreshing(true);
                                setTimeout(() => {
                                    resetCategories(selectedLanguage)
                                    setRefreshing(false);
                                }, 1000)
                            }}/>
                        }
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
                onBoardingLastStep === 5 &&
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
                onBoardingLastStep === 6 &&
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
