import {ScrollView, Text, useTheme, View, YStack} from "tamagui";
import {Alert, Platform, StyleSheet, TouchableOpacity} from "react-native";
import {useHeaderHeight} from "@react-navigation/elements";
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import {
    selectAccountForm, selectAccountGlobally,
    selectAccounts, selectSelectedAccountForm, selectSelectedAccountGlobal,
    updateAccountCreateUpdate, updateAccountsList
} from "@/lib/store/features/accounts/accountsSlice";
import {formatByThousands} from "@/lib/helpers/string";
import {useSQLiteContext} from "expo-sqlite";
import {
    deleteAccount,
    getAllAccounts,
    getAmountOfTransactionsByAccountId, getTransactions,
    getTransactionsGroupedAndFiltered
} from "@/lib/db";
import {Account, TransactionsGroupedByDate} from "@/lib/types/Transaction";
import {useRouter} from "expo-router";
import {changeEmoji} from "@/lib/store/features/ui/uiSlice";
import * as ContextMenu from "zeego/context-menu";
import {
    selectHomeViewTypeFilter,
    updateTransactionsGroupedByDate
} from "@/lib/store/features/transactions/transactionsSlice";
import {
    selectAccountFilter, selectCategoryFilter, selectDateRangeFilter, updateAccountFilter,
    updateChartPoints,
    updateTransactionsGroupedByCategory
} from "@/lib/store/features/transactions/reportSlice";
import {getCurrentMonth, getCurrentWeek} from "@/lib/helpers/date";
import {selectCategories} from "@/lib/store/features/categories/categoriesSlice";

export default function Screen() {
    const db = useSQLiteContext();
    const headerHeight = useHeaderHeight()
    const isIos = Platform.OS === 'ios';
    const accounts = useAppSelector(selectAccounts);
    const dispatch = useAppDispatch();
    const router = useRouter();
    const theme = useTheme();
    const filterType = useAppSelector(selectHomeViewTypeFilter);
    const selectedAccountFilter = useAppSelector(selectAccountFilter);
    const selectedAccountForm = useAppSelector(selectSelectedAccountForm);
    const selectedCategoryFilter = useAppSelector(selectCategoryFilter);
    const selectedDateRange = useAppSelector(selectDateRangeFilter);
    const globalAccount = useAppSelector(selectSelectedAccountGlobal);

    function onPressAccount(account: Account) {
        dispatch(updateAccountCreateUpdate(account));
        dispatch(changeEmoji(account.icon))
        router.push('/createEditAccount')
    }

    console.log(accounts);

    async function onPressDeleteAccount(accountId: number) {
        const {start, end} = filterType.date === 'week' ? getCurrentWeek() : getCurrentMonth()
        let transactions: TransactionsGroupedByDate[];
        Alert.alert('Are you sure you want to delete this account?', 'The associated transactions to this account will be deleted. This action cannot be undone.', [
            {style: 'default', text: 'Cancel', isPreferred: true},
            {
                style: 'destructive',
                text: 'Delete',
                isPreferred: false,
                onPress: async () => {
                    await deleteAccount(db, accountId);
                    dispatch(updateAccountsList(getAllAccounts(db)));
                    if (selectedAccountForm.id === accountId) {
                        dispatch(selectAccountForm(accounts[0]))
                    }
                    if (globalAccount.id === accountId) {
                        dispatch(selectAccountGlobally(accounts[0]))
                        transactions = await getTransactionsGroupedAndFiltered(db, start.toISOString(), end.toISOString(), filterType.type, accounts[0].id);
                        dispatch(updateTransactionsGroupedByDate(transactions));
                    } else {
                        transactions = await getTransactionsGroupedAndFiltered(db, start.toISOString(), end.toISOString(), filterType.type, globalAccount.id);
                        dispatch(updateTransactionsGroupedByDate(transactions));
                    }
                    if (selectedAccountFilter.id === accountId) {
                        dispatch(updateAccountFilter(accounts[0]))
                        const {
                            amountsGroupedByDate,
                            transactionsGroupedByCategory
                        } = await getTransactions(db, selectedDateRange.start, selectedDateRange.end, accounts[0].id, selectedCategoryFilter.id);
                        dispatch(updateTransactionsGroupedByCategory(transactionsGroupedByCategory));
                        dispatch(updateChartPoints(amountsGroupedByDate))
                    } else {
                        const {
                            amountsGroupedByDate,
                            transactionsGroupedByCategory
                        } = await getTransactions(db, selectedDateRange.start, selectedDateRange.end, selectedAccountFilter.id, selectedCategoryFilter.id);
                        dispatch(updateTransactionsGroupedByCategory(transactionsGroupedByCategory));
                        dispatch(updateChartPoints(amountsGroupedByDate))
                    }

                }
            }
        ])
    }

    return (
        <ScrollView flex={1} backgroundColor="$color1" showsVerticalScrollIndicator={false}
                    paddingTop={isIos ? headerHeight + 20 : headerHeight}>
            {
                accounts.map(account => (
                    <ContextMenu.Root key={account.id}>
                        <ContextMenu.Trigger>
                            <TouchableOpacity style={[styles.item, { backgroundColor:  theme.color1.val}]} key={account.id}
                                              onPress={() => onPressAccount(account)}>
                                <Text fontSize={40}>{account.icon}</Text>
                                <View
                                    flex={1}
                                    flexDirection='row'
                                    alignItems='center'
                                    justifyContent='space-between'
                                    borderBottomWidth={1}
                                    py={10}
                                    borderColor='$color2'
                                >
                                    <YStack gap={4}>
                                        <Text fontSize={18} fontWeight="bold">{account.title}</Text>
                                        <Text
                                            color="$gray10Dark">{getAmountOfTransactionsByAccountId(db, account.id)} Transactions</Text>
                                    </YStack>
                                    <Text
                                        fontSize={18}>{account.currency_symbol} {formatByThousands(account.balance.toString())} {account.currency_code}</Text>
                                </View>
                            </TouchableOpacity>
                        </ContextMenu.Trigger>
                        <ContextMenu.Content loop={false} alignOffset={0} collisionPadding={0}
                                             avoidCollisions={true}>
                            <ContextMenu.Item key='delete'  destructive onSelect={() => onPressDeleteAccount(account.id)}>
                                <ContextMenu.ItemTitle>Delete</ContextMenu.ItemTitle>
                                <ContextMenu.ItemIcon
                                    ios={{
                                        name: 'trash'
                                    }}
                                />
                            </ContextMenu.Item>
                        </ContextMenu.Content>
                    </ContextMenu.Root>
                ))
            }
            <View height={200} />
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    item: {
        borderRadius: 0,
        paddingHorizontal: 20,
        gap: 20,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    }
})
