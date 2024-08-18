import {Button, Input, Separator, Text, useTheme, View, XStack, YStack} from "tamagui";
import {Alert, TouchableOpacity, useColorScheme} from "react-native";
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
import {useUser} from "@clerk/clerk-expo";

export default function Screen() {
    const locales = getLocales();
    const db = useSQLiteContext();
    const {user} = useUser();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const theme = useTheme();
    const schemeColor = useColorScheme();
    const accountCreateUpdate = useAppSelector(selectAccountCreateUpdate);
    const [accountTitle, setAccountTitle] = useState<string>('')
    const [accountBalance, setAccountBalance] = useState<string>('0')
    const [accountCurrency, setAccountCurrency] = useState<{ code: string, symbol: string }>({
        code: locales[0].currencyCode ?? 'USD',
        symbol: locales[0].currencySymbol ?? '$'
    })
    const [accountPositiveState, setAccountPositiveState] = useState<string>('');
    const currentEmoji = useAppSelector(selectCurrentEmoji);

    // TODO add support for multi currency per account (for example, a savings account in USD, credit card in PEN) with name and icons (coins api), and manage exchange rates from api. Rememeber to make the exchange rate between the coin of the account and the coin of the transaction (this is the global currency selected)

    useEffect(() => {
        setAccountTitle(accountCreateUpdate.title)
        setAccountBalance(accountCreateUpdate.balance.toString())
        setAccountPositiveState(accountCreateUpdate.positive_state ? 'Positive' : 'Negative');
    }, []);

    async function manageCreateAccount() {
        if (!accountTitle) return;
        if (!accountCurrency) return;

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
                },
                user!.id);

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
            <View flex={1} backgroundColor="$color1" p={20}>
                <XStack justifyContent='space-between' alignItems='center' mb={30}>
                    <TouchableOpacity style={{padding: 10, borderRadius: 12}} onPress={() => router.back()}>
                        <Text>Cancel</Text>
                    </TouchableOpacity>
                    <Text fontSize={20}>Account</Text>
                    <Button onPress={manageCreateAccount}>Done</Button>
                </XStack>

                <YStack mb={70}>
                    <Text fontSize={16} mb={4}>Name</Text>
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
                               placeholder="New Account"/>
                    </View>
                </YStack>

                <YStack>
                    <Text fontSize={16} mb={4}>Balance</Text>
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
                            accountCreateUpdate.id < 1 &&
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
                                    {
                                        locales.filter(item => item.currencyCode !== 'USD').map(locale => (
                                            <DropdownMenu.Item key={locale.currencyCode!}
                                                               onSelect={() => setAccountCurrency(prevState => ({
                                                                   ...prevState,
                                                                   code: locale.currencyCode!
                                                               }))}>
                                                <DropdownMenu.ItemTitle>{locale.currencyCode ?? '...'}</DropdownMenu.ItemTitle>
                                            </DropdownMenu.Item>
                                        ))
                                    }
                                    <DropdownMenu.Item key="USD"
                                                       onSelect={() => setAccountCurrency({code: 'USD', symbol: '$'})}>
                                        <DropdownMenu.ItemTitle>USD</DropdownMenu.ItemTitle>
                                    </DropdownMenu.Item>
                                </DropdownMenu.Content>
                            </DropdownMenu.Root>
                        }


                        <Input keyboardType="numeric" value={accountBalance} onChangeText={setAccountBalance} size="$4"
                               paddingLeft={60} placeholder="Balance"/>
                    </View>
                </YStack>
                <Text mt={50} mb={20} color="$gray10Dark">You can not change the currency for this account in the future.</Text>

                <YStack mb={70}>
                    <Text fontSize={16} mb={4}>State</Text>
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
                            <DropdownMenu.Item key="positive" onSelect={() => setAccountPositiveState('Positive')}>
                                <DropdownMenu.ItemTitle>Positive</DropdownMenu.ItemTitle>
                            </DropdownMenu.Item>
                            <DropdownMenu.Item key="negative" onSelect={() => setAccountPositiveState('Negative')}>
                                <DropdownMenu.ItemTitle>Negative</DropdownMenu.ItemTitle>
                            </DropdownMenu.Item>
                        </DropdownMenu.Content>
                    </DropdownMenu.Root>

                    <Text mt={10} color="$gray10Dark">Negative adds a minus sign at the beginning of the balance</Text>
                </YStack>

            </View>
            {/*<EmojiSelectionSheet open={openEmojisSheet} setOpen={setOpenEmojisSheet} onSelectEmoji={onEmojiSelected} />*/}
        </>
    )
}
