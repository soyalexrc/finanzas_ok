import {Button, Input, Separator, Text, useTheme, View, XStack, YStack} from "tamagui";
import {TouchableOpacity, useColorScheme} from "react-native";
import {useRouter} from "expo-router";
import {Entypo} from "@expo/vector-icons";
import * as DropdownMenu from 'zeego/dropdown-menu'
import {selectAccountCreateUpdate} from "@/lib/store/features/accounts/accountsSlice";
import {useAppSelector} from "@/lib/store/hooks";
import {useEffect, useState} from "react";

export default function Screen() {
    const router = useRouter();
    const theme = useTheme();
    const schemeColor = useColorScheme();
    const accountCreateUpdate = useAppSelector(selectAccountCreateUpdate);
    const [accountTitle, setAccountTitle] = useState<string>('')
    const [accountIcon, setAccountIcon] = useState<string>('')
    const [accountBalance, setAccountBalance] = useState<string>('0')
    const [accountPositiveState, setAccountPositiveState] = useState<string>('')
    // TODO add emoji sheet picker
    // TODO add currency sheet picker
    // TODO add support for multi currency per account (for example, a savings account in USD, credit card in PEN) with name and icons (coins api), and manage exchange rates from api. Rememeber to make the exchange rate between the coin of the account and the coin of the transaction (this is the global currency selected)

    useEffect(() => {
        setAccountTitle(accountCreateUpdate.title)
        setAccountIcon(accountCreateUpdate.icon)
        setAccountBalance(accountCreateUpdate.balance.toString())
        setAccountPositiveState(accountCreateUpdate.positive_status ? 'Positive' : 'Negative');
    }, []);

    return (
        <View flex={1} backgroundColor="$color1" p={20}>
            <XStack justifyContent='space-between' alignItems='center' mb={30}>
                <TouchableOpacity style={{ padding: 10, borderRadius: 12 }} onPress={() => router.back()}>
                    <Text>Cancel</Text>
                </TouchableOpacity>
                <Text fontSize={20}>Account</Text>
                <Button>Done</Button>
            </XStack>

            <YStack mb={70}>
                <Text fontSize={16} mb={4}>Name</Text>
                <View flex={1} gap={6} position='relative'>
                    <TouchableOpacity style={{ position: 'absolute', top: -5, zIndex: 11, left: 5, padding: 10, borderRightWidth: 1, borderStyle: 'solid', borderColor: theme.color1.val}}>
                        <Text fontSize={25}>{accountIcon ?? '✅'}</Text>
                    </TouchableOpacity>
                    <Input  size="$4" value={accountTitle} onChangeText={setAccountTitle} paddingLeft={60} placeholder="New Account"  />
                </View>
            </YStack>

            <YStack mb={70}>
                <Text fontSize={16} mb={4}>Balance</Text>
                <View flex={1} gap={6} position='relative'>
                    <TouchableOpacity style={{ position: 'absolute', top: 5, zIndex: 11, left: 5, padding: 10, borderRightWidth: 1, borderStyle: 'solid', borderColor: theme.color1.val}}>
                        <Text>PEN</Text>
                    </TouchableOpacity>
                    <Input keyboardType="numeric" value={accountBalance} onChangeText={setAccountBalance} size="$4" paddingLeft={60} placeholder="New Account"  />
                </View>
            </YStack>

            <YStack mb={70}>
                <Text fontSize={16} mb={4}>State</Text>
                <DropdownMenu.Root key="positive_status">
                    <DropdownMenu.Trigger>
                        <TouchableOpacity style={{ backgroundColor: theme.color2.val, height: 50, paddingHorizontal: 20, borderRadius: 8, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderStyle: 'solid', borderColor: theme.color5.val, justifyContent: 'space-between' }}>
                            <Text>{accountPositiveState ?? 'Select Balance State'}</Text>
                            <Entypo name="select-arrows" size={18} color={schemeColor === 'light' ? 'black' : 'white'}/>
                        </TouchableOpacity>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content loop={false} alignOffset={0} sideOffset={0} side={0} align={0} collisionPadding={0}
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
    )
}
