import * as DropdownMenu from "zeego/dropdown-menu";
import {Text, View} from "tamagui";
import { Entypo } from '@expo/vector-icons';
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import {
    selectAccountGlobally,
    selectAccounts,
    selectSelectedAccountGlobal
} from "@/lib/store/features/accounts/accountsSlice";
import {Account} from "@/lib/types/Transaction";
import {getTransactionsGroupedAndFiltered} from "@/lib/db";
import {
    selectHomeViewTypeFilter,
    updateTransactionsGroupedByDate
} from "@/lib/store/features/transactions/transactionsSlice";
import {useSQLiteContext} from "expo-sqlite";
import {getCurrentMonth, getCurrentWeek} from "@/lib/helpers/date";
import {useColorScheme} from "react-native";
import {useTranslation} from "react-i18next";
import {formatAccountTitle} from "@/lib/helpers/string";

export default function AccountSelectDropdown() {
    const db = useSQLiteContext();
    const scheme = useColorScheme();
    const accounts = useAppSelector(selectAccounts);
    const filterType = useAppSelector(selectHomeViewTypeFilter)
    const selectedAccount = useAppSelector(selectSelectedAccountGlobal);
    const dispatch = useAppDispatch();
    const {t} = useTranslation()

    async function onSelectAccount(account?: Account) {
        const {start, end} = filterType.date === 'week' ? getCurrentWeek() : getCurrentMonth()
        if (!account) {
            dispatch(selectAccountGlobally({
                title: 'All accounts',
                id: 0,
                balance: 0,
                icon: '',
                positive_state: 1,
                currency_code: '',
                currency_symbol: ''
            }));
            const transactions = await getTransactionsGroupedAndFiltered(db, start.toISOString(), end.toISOString(), filterType.type, 0);
            dispatch(updateTransactionsGroupedByDate(transactions));
        } else {
            dispatch(selectAccountGlobally(account));
            const transactions = await getTransactionsGroupedAndFiltered(db, start.toISOString(), end.toISOString(), filterType.type, account.id);
            dispatch(updateTransactionsGroupedByDate(transactions));
        }
    }

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <Text fontSize={16}>{formatAccountTitle(selectedAccount, true, t('COMMON.ALL_ACCOUNTS'))}</Text>
                    <Entypo name="select-arrows" size={18} color={scheme === 'light' ? 'black' : 'white'} />
                </View>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content loop={false} side='bottom' sideOffset={0} align='center' alignOffset={0} collisionPadding={0} avoidCollisions={true}>
                <DropdownMenu.Group>
                    <DropdownMenu.CheckboxItem onValueChange={() => onSelectAccount()} key='0' value={selectedAccount.id === 0 ? 'on' : 'off'}>
                        <DropdownMenu.ItemTitle>{t('COMMON.ALL_ACCOUNTS')}</DropdownMenu.ItemTitle>
                        <DropdownMenu.ItemIndicator />
                    </DropdownMenu.CheckboxItem>
                </DropdownMenu.Group>
                <DropdownMenu.Group>
                    {
                        accounts?.map((account) => (
                            <DropdownMenu.CheckboxItem onValueChange={() => onSelectAccount(account)} key={String(account.id)} value={selectedAccount.id === account.id ? 'on' : 'off'}>
                                <DropdownMenu.ItemTitle>{formatAccountTitle(account, false, t('COMMON.ALL_ACCOUNTS'))}</DropdownMenu.ItemTitle>
                                <DropdownMenu.ItemIndicator />
                            </DropdownMenu.CheckboxItem>
                        ))
                    }
                </DropdownMenu.Group>
            </DropdownMenu.Content>
        </DropdownMenu.Root>

    )
}
