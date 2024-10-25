import {Button, Input, Separator, Text, useTheme, View, XStack, YStack} from "tamagui";
import {Alert, Platform, TouchableOpacity, useColorScheme} from "react-native";
import {useRouter} from "expo-router";
import {Entypo} from "@expo/vector-icons";
import * as DropdownMenu from 'zeego/dropdown-menu'
import {addAccount, selectAccountCreateUpdate, updateAccountsList} from "@/lib/store/features/accounts/accountsSlice";
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import {useEffect, useState} from "react";
import {selectCurrentEmoji} from "@/lib/store/features/ui/uiSlice";
import {getLocales} from "expo-localization";
import {createAccount, getAllAccounts, updateAccount} from "@/lib/db";
import {useSQLiteContext} from "expo-sqlite";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {useTranslation} from "react-i18next";
import CurrenciesSheet from "@/lib/components/ui/android-dropdowns-sheets/CurrenciesSheet";
import currencies from '@/lib/utils/data/currencies';
import * as Haptics from "expo-haptics";

export default function Screen() {
    const locales = getLocales();
    const db = useSQLiteContext();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const schemeColor = useColorScheme();
    const {t} = useTranslation()

    const accountCreateUpdate = useAppSelector(selectAccountCreateUpdate);
    const isIos = Platform.OS === 'ios';
    const [openCurrenciesSheet, setOpenCurrenciesSheet] = useState<boolean>(false)
    const [accountTitle, setAccountTitle] = useState<string>('')
    const [accountBalance, setAccountBalance] = useState<string>('0')
    const [accountCurrency, setAccountCurrency] = useState<{ code: string, symbol: string }>({
        code: locales[0].currencyCode ?? 'USD',
        symbol: locales[0].currencySymbol ?? '$'
    })
    const [accountPositiveState, setAccountPositiveState] = useState<string>('');
    const currentEmoji = useAppSelector(selectCurrentEmoji);

    function handleChangeAccountState(state: 'Positive' | 'Negative') {
        setAccountPositiveState(state);
        if (state === 'Positive') {
            setAccountBalance(accountBalance.replace('-', ''));
        } else {
            if (accountBalance.includes('-')) return;
            setAccountBalance('-' + accountBalance)
        }
    }

    // TODO add support for multi currency per account (for example, a savings account in USD, credit card in PEN) with name and icons (coins api), and manage exchange rates from api. Rememeber to make the exchange rate between the coin of the account and the coin of the transaction (this is the global currency selected)

    useEffect(() => {
        setAccountTitle(accountCreateUpdate.title)
        setAccountBalance(accountCreateUpdate.balance.toFixed(2))
        setAccountPositiveState(accountCreateUpdate.positive_state ? t('SETTINGS.ACCOUNTS.POSITIVE') : t('SETTINGS.ACCOUNTS.NEGATIVE'));
    }, []);

    async function manageCreateAccount() {
        if (!accountTitle) return;
        if (!accountCurrency) return;

        await Haptics.selectionAsync();

        if (accountCreateUpdate.id) {
            await updateAccount(
                db,
                {
                    id: accountCreateUpdate.id,
                    title: accountTitle,
                    balance: parseInt(accountBalance),
                    icon: currentEmoji,
                    positive_state: accountPositiveState === 'Positive' ? 1 : 0,
                });
            dispatch(updateAccountsList(getAllAccounts(db)))
            router.back();
        } else {
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

            if (newAccount.error) {
                Alert.alert('No se pudo registrar la cuenta', newAccount.desc)
            } else {
                dispatch(addAccount(newAccount.data));
                router.back();
            }
        }


    }


    return (
        <>
            <View flex={1} backgroundColor="$color1" px={20} pb={20} pt={Platform.OS === 'android' ? insets.top + 20 : 20}>
                <XStack justifyContent='space-between' alignItems='center' mb={30}>
                    <TouchableOpacity style={{padding: 10, borderRadius: 12}} onPress={() => router.replace('/(settings)')}>
                        <Text>{t('COMMON.CANCEL')}</Text>
                    </TouchableOpacity>
                    <Text fontSize={20}>{t('COMMON.ACCOUNT')}</Text>
                    <Button onPress={manageCreateAccount}>{t('COMMON.DONE')}</Button>
                </XStack>

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
                    <Text fontSize={16} mb={4}>{t('SETTINGS.ACCOUNTS.BALANCE')}</Text>
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
                                <DropdownMenu.Content loop={false} alignOffset={0} sideOffset={0} side={0} align={0}
                                                      collisionPadding={0}
                                                      avoidCollisions={true}>
                                   <DropdownMenu.Group key="locales">
                                       {
                                           locales.map(locale => (
                                               <DropdownMenu.Item key={locale.currencyCode!}
                                                                  onSelect={() => setAccountCurrency({ code: locale.currencyCode!, symbol: locale.currencySymbol! })}>
                                                   <DropdownMenu.ItemTitle>{locale.currencyCode ?? '...'}</DropdownMenu.ItemTitle>
                                               </DropdownMenu.Item>
                                           ))
                                       }
                                   </DropdownMenu.Group>

                                    <DropdownMenu.Group key="additionals">
                                        {
                                            currencies.map(({code, symbol}) => (
                                                <DropdownMenu.Item key={code}
                                                                   onSelect={() => setAccountCurrency({ code, symbol })}>
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


                        <Input keyboardType="numeric" value={accountBalance} onChangeText={setAccountBalance} size="$4"
                               paddingLeft={60} placeholder="Balance"/>
                    </View>
                </YStack>
                <Text mt={50} mb={20} color="$gray10Dark">{t('SETTINGS.ACCOUNTS.BALANCE_TIP')}</Text>

                <YStack mb={70}>
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
                            <DropdownMenu.Item key="positive" onSelect={() => handleChangeAccountState('Positive')}>
                                <DropdownMenu.ItemTitle>{t('SETTINGS.ACCOUNTS.POSITIVE')}</DropdownMenu.ItemTitle>
                            </DropdownMenu.Item>
                            <DropdownMenu.Item key="negative" onSelect={() => handleChangeAccountState('Negative')}>
                                <DropdownMenu.ItemTitle>{t('SETTINGS.ACCOUNTS.NEGATIVE')}</DropdownMenu.ItemTitle>
                            </DropdownMenu.Item>
                        </DropdownMenu.Content>
                    </DropdownMenu.Root>

                    <Text mt={10} color="$gray10Dark">{t('SETTINGS.ACCOUNTS.STATE_TIP')}</Text>
                </YStack>

            </View>
            {!isIos && <CurrenciesSheet open={openCurrenciesSheet} setOpen={setOpenCurrenciesSheet} currentCode={accountCurrency.code} locales={locales} onSelect={(code, symbol) => setAccountCurrency({ code, symbol})} />}
            {/*<EmojiSelectionSheet open={openEmojisSheet} setOpen={setOpenEmojisSheet} onSelectEmoji={onEmojiSelected} />*/}
        </>
    )
}
