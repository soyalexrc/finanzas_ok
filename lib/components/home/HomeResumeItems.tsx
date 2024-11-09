import {Alert, Platform, StyleSheet} from "react-native";
import * as ContextMenu from 'zeego/context-menu'
import {useRouter} from "expo-router";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import {Button, Text, useTheme, View, XStack} from 'tamagui';
import {
    addTransactionInHomeList,
    removeTransactionFromHomeList,
    selectHomeViewTypeFilter,
    selectTransactionsGroupedByDate,
    updateCurrentTransaction, updateTransactionsGroupedByDate
} from "@/lib/store/features/transactions/transactionsSlice";
import {FullTransaction} from "@/lib/types/Transaction";
import {selectCategory} from "@/lib/store/features/categories/categoriesSlice";
import {
    selectAccountForm,
    selectSelectedAccountGlobal,
    updateAccountsList
} from "@/lib/store/features/accounts/accountsSlice";
import {formatDateHomeItemGroups, getCurrentMonth, getCurrentWeek} from "@/lib/helpers/date";
import {
    createTransaction,
    deleteTransaction, getAllAccounts, getTransactions,
    getTransactionsGroupedAndFiltered, getTransactionsGroupedAndFilteredV2, getTransactionsV2,
    stopRecurringInTransaction
} from "@/lib/db";
import {useSQLiteContext} from "expo-sqlite";
import {formatByThousands} from "@/lib/helpers/string";
import {
    selectAccountFilter,
    selectCategoryFilter,
    selectDateRangeFilter,
    updateChartPoints,
    updateTransactionsGroupedByCategory
} from "@/lib/store/features/transactions/reportSlice";
import {useSelector} from "react-redux";
import {selectSettings} from "@/lib/store/features/settings/settingsSlice";
import * as Haptics from 'expo-haptics';
import {useTranslation} from "react-i18next";

export default function HomeResumeItems({fn}: {fn: (t: FullTransaction, groupId: number) => void}) {
    const db = useSQLiteContext();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const theme = useTheme();
    const {hidden_feature_flag} = useAppSelector(selectSettings);
    const selectedDateRange = useAppSelector(selectDateRangeFilter);
    const transactions = useAppSelector(selectTransactionsGroupedByDate);
    const filterType = useAppSelector(selectHomeViewTypeFilter)
    const selectedAccount = useAppSelector(selectSelectedAccountGlobal);
    const selectedCategoryFilter = useSelector(selectCategoryFilter);
    const selectedAccountFilter = useSelector(selectAccountFilter);
    const globalAccount = useAppSelector(selectSelectedAccountGlobal);
    const {selectedLanguage} = useAppSelector(selectSettings);
    const isIos = Platform.OS === 'ios';
    const {t} = useTranslation();

    async function handlePress(t: FullTransaction) {
        await Haptics.selectionAsync();
        dispatch(updateCurrentTransaction({
            dateTime: new Date().toISOString(),
            category_icon: t.category.icon,
            date: t.date,
            category: t.category.title,
            currency_symbol_t: t.account.currency_symbol,
            currency_code_t: t.account.currency_code,
            amount: t.amount,
            hidden_amount: t.hidden_amount,
            id: t.id,
            account: t.account.title,
            category_type: t.category.type,
            notes: t.notes,
            recurrentDate: t.recurrentDate
        }));
        dispatch(selectCategory(t.category));
        // dispatch(selectAccountForm(t.account));
        router.push('/transactionCreateUpdate')
    }

    async function handleLongPress(t: FullTransaction, groupId: number) {
        await Haptics.selectionAsync();
        fn(t, groupId);
    }

    function handleDeleteItem(id: number, groupId: number) {
        const {start, end} = getCurrentMonth()
        Alert.alert(t('TRANSACTIONS.DELETE.TITLE'), t('TRANSACTIONS.DELETE.TEXT'), [
            {style: 'default', text: t('COMMON.CANCEL'), isPreferred: true},
            {
                style: 'destructive', text: t('COMMON.DELETE'), isPreferred: true, onPress: async () => {
                    dispatch(removeTransactionFromHomeList({transactionId: id, groupId}));
                    await deleteTransaction(db, id)
                    const transactions = await getTransactionsGroupedAndFilteredV2(db, start.toISOString(), end.toISOString(), filterType.type);
                    // const {amountsGroupedByDate, transactionsGroupedByCategory} = await getTransactionsV2(db, selectedDateRange.start, selectedDateRange.end);
                    // const accounts = getAllAccounts(db);
                    // dispatch(updateAccountsList(accounts))
                    dispatch(updateTransactionsGroupedByDate(transactions));
                    // dispatch(updateTransactionsGroupedByCategory(transactionsGroupedByCategory));
                    // dispatch(updateChartPoints(amountsGroupedByDate))
                }
            },
        ])
    }

    async function duplicateTransaction(transaction: FullTransaction) {
        // const {start, end} = filterType.date === 'week' ? getCurrentWeek() : getCurrentMonth()
        // const newTransaction = await createTransaction(db, { ...transaction, category_id: transaction.category.id, account_id: transaction.account.id })
        // if (newTransaction) {
        //     dispatch(addTransactionInHomeList(newTransaction as FullTransaction))
        //     const transactions = await getTransactionsGroupedAndFilteredV2(db, start.toISOString(), end.toISOString(), filterType.type);
        //     const {amountsGroupedByDate, transactionsGroupedByCategory} = await getTransactions(db, selectedDateRange.start, selectedDateRange.end, selectedAccountFilter.id, selectedCategoryFilter.id);
        //     dispatch(updateTransactionsGroupedByDate(transactions));
        //     dispatch(updateTransactionsGroupedByCategory(transactionsGroupedByCategory));
        //     dispatch(updateChartPoints(amountsGroupedByDate))
        // }
    }

    async function stopRecurrent(transactionId: number) {
        const {start, end} = getCurrentMonth()
        const updatedTransaction = await stopRecurringInTransaction(db, transactionId)
        if (updatedTransaction) {
            const transactions = await getTransactionsGroupedAndFilteredV2(db, start.toISOString(), end.toISOString(), filterType.type);
            dispatch(updateTransactionsGroupedByDate(transactions));
        }
    }

    return (
        <>
            {transactions?.map(group => (
                <View key={group.id}>
                    <View paddingHorizontal={20} gap={20} flexDirection="row" justifyContent="space-between" alignItems="center">
                        <View width={30}/>
                        <View style={[styles.imageWithLabel, {marginTop: 12}]}>
                            <Text style={{color: 'gray', fontSize: 14}}>{formatDateHomeItemGroups(group.date, selectedLanguage)}</Text>
                            <XStack gap={16}>
                                {
                                    group.totals.map((total, index) => (
                                        <Text key={total.amount + index} style={{color: 'gray', fontSize: 14}}>{total.symbol} {formatByThousands(String(hidden_feature_flag ? total.hidden_amount : total.amount))}</Text>
                                    ))
                                }
                            </XStack>
                        </View>
                    </View>
                    {group.items?.map((item) => {
                        if (isIos) {
                            return (
                                <ContextMenu.Root key={item.id}>
                                    <ContextMenu.Trigger>
                                        <Button icon={ <Text fontSize={30}>{item.category.icon}</Text>} backgroundColor='$background075' borderRadius={0} onPress={() => handlePress(item)} paddingHorizontal={20} gap={6} flexDirection="row" justifyContent="space-between" alignItems="center">
                                            <View
                                                flex={1}
                                                flexDirection='row'
                                                alignItems='center'
                                                justifyContent='space-between'
                                            >
                                                <View flexDirection='row' gap={10} alignItems='center' flex={0.7}>
                                                    {
                                                        item.recurrentDate !== 'none' &&
                                                        <FontAwesome6 name="arrow-rotate-left" size={16} color="gray"/>
                                                    }
                                                    <Text fontSize={18} fontWeight={500}>{item.category.title}</Text>
                                                </View>
                                                <Text flex={0.3} textAlign="right" style={[item.category.type === 'income' && { color: theme.green10Dark.val}]}>{item.account.currency_symbol} {formatByThousands(hidden_feature_flag ? item.hidden_amount : item.amount)}</Text>
                                            </View>
                                        </Button>
                                    </ContextMenu.Trigger>
                                    <ContextMenu.Content loop={false} alignOffset={0} collisionPadding={0}
                                                         avoidCollisions={true}>
                                        {
                                            item.recurrentDate !== 'none' &&
                                            <ContextMenu.Item onSelect={() => stopRecurrent(item.id)} key='recurring'>
                                                <ContextMenu.ItemTitle>{t('COMMON.STOP_RECURRING')}</ContextMenu.ItemTitle>
                                                <ContextMenu.ItemIcon
                                                    ios={{
                                                        name: 'xmark'
                                                    }}
                                                />
                                            </ContextMenu.Item>
                                        }
                                        <ContextMenu.Item key='duplicate' onSelect={() => duplicateTransaction(item)}>
                                            <ContextMenu.ItemTitle>{t('TRANSACTIONS.DUPLICATE')}</ContextMenu.ItemTitle>
                                            <ContextMenu.ItemIcon
                                                ios={{
                                                    name: 'doc.on.doc'
                                                }}
                                            />
                                        </ContextMenu.Item>
                                        <ContextMenu.Item key='delete' onSelect={() => handleDeleteItem(item.id, group.id)} destructive>
                                            <ContextMenu.ItemTitle>{t('COMMON.DELETE')}</ContextMenu.ItemTitle>
                                            <ContextMenu.ItemIcon
                                                ios={{
                                                    name: 'trash'
                                                }}
                                            />
                                        </ContextMenu.Item>
                                    </ContextMenu.Content>
                                </ContextMenu.Root>
                            )
                        } else {
                            return (
                                <Button
                                    key={item.id}
                                    icon={ <Text fontSize={30}>{item.category.icon}</Text>}
                                    backgroundColor='$background075'
                                    borderRadius={0}
                                    onPress={() => handlePress(item)}
                                    onLongPress={() => handleLongPress(item, group.id)}
                                    paddingHorizontal={20}
                                    gap={6}
                                    flexDirection="row"
                                    justifyContent="space-between"
                                    alignItems="center">
                                    <View
                                        flex={1}
                                        flexDirection='row'
                                        alignItems='center'
                                        justifyContent='space-between'
                                    >
                                        <View flexDirection='row' flex={0.7} gap={10} alignItems='center'>
                                            {
                                                item.recurrentDate !== 'none' &&
                                                <FontAwesome6 name="arrow-rotate-left" size={16} color="gray"/>
                                            }
                                            <Text fontSize={18} fontWeight={500}>{item.category.title}</Text>
                                        </View>
                                        <Text flex={0.3} textAlign="right" style={[item.category.type === 'income' && { color: theme.green10Dark.val}]}>{item.account.currency_symbol} {formatByThousands(hidden_feature_flag ? item.hidden_amount : item.amount)}</Text>
                                    </View>
                                </Button>

                                // <ContextMenu.Root key={item.id}>
                                //     <ContextMenu.Trigger>
                                //     </ContextMenu.Trigger>
                                //     <ContextMenu.Content loop={false} alignOffset={0} collisionPadding={0}
                                //                          avoidCollisions={true}>
                                //         {
                                //             item.recurrentDate !== 'none' &&
                                //             <ContextMenu.Item onSelect={() => stopRecurrent(item.id)} key='recurring'>
                                //                 <ContextMenu.ItemTitle>Stop Recurring</ContextMenu.ItemTitle>
                                //                 <ContextMenu.ItemIcon
                                //                     ios={{
                                //                         name: 'xmark'
                                //                     }}
                                //                 />
                                //             </ContextMenu.Item>
                                //         }
                                //         <ContextMenu.Item key='duplicate' onSelect={() => duplicateTransaction(item)}>
                                //             <ContextMenu.ItemTitle>Duplicate</ContextMenu.ItemTitle>
                                //             <ContextMenu.ItemIcon
                                //                 ios={{
                                //                     name: 'doc.on.doc'
                                //                 }}
                                //             />
                                //         </ContextMenu.Item>
                                //         <ContextMenu.Item key='delete' onSelect={() => handleDeleteItem(item.id, group.id)} destructive>
                                //             <ContextMenu.ItemTitle>Delete</ContextMenu.ItemTitle>
                                //             <ContextMenu.ItemIcon
                                //                 ios={{
                                //                     name: 'trash'
                                //                 }}
                                //             />
                                //         </ContextMenu.Item>
                                //     </ContextMenu.Content>
                                // </ContextMenu.Root>
                            )
                        }
                    })}
                </View>

            ))}
        </>

    )
}

const styles = StyleSheet.create({
    imageWithLabel: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderColor: 'gray',
        paddingVertical: 15,
    },
    label: {
        fontSize: 18,
        fontWeight: '500',
    }
})
