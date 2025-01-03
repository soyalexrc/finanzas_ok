import {Sheet, Text} from "tamagui";
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import {
    selectSelectedAccountGlobal, updateAccountsList
} from "@/lib/store/features/accounts/accountsSlice";
import {FullTransaction} from "@/lib/types/Transaction";
import {
    createTransaction,
    deleteTransaction,
    getAllAccounts, getSettingByKey, getTotalsOnEveryMonthByYear, getTotalSpentByYear,
    getTransactions,
    getTransactionsGroupedAndFiltered, getTransactionsGroupedAndFilteredV2, stopRecurringInTransaction
} from "@/lib/db";
import {
    addTransactionInHomeList,
    removeTransactionFromHomeList,
    selectHomeViewTypeFilter,
    updateTransactionsGroupedByDate
} from "@/lib/store/features/transactions/transactionsSlice";
import {useSQLiteContext} from "expo-sqlite";
import {getCurrentMonth, getCurrentWeek, getCustomMonthAndYear} from "@/lib/helpers/date";
import {Alert, TouchableOpacity, useColorScheme} from "react-native";
import {useTranslation} from "react-i18next";
import {useState} from "react";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
    selectAccountFilter,
    selectCategoryFilter,
    selectDateRangeFilter,
    updateChartPoints,
    updateTransactionsGroupedByCategory
} from "@/lib/store/features/transactions/reportSlice";
import {useSelector} from "react-redux";
import {updateTotalByMonth, updateTotalsInYear} from "@/lib/store/features/transactions/filterSlice";

type Props = {
    open: boolean;
    setOpen: (value: boolean) => void;
    item: FullTransaction | undefined;
    itemGroupId: number;
    resetData: () => void;
}

export default function TransactionSelectionOptionsSheet({open, setOpen, item, itemGroupId, resetData} : Props) {
    const db = useSQLiteContext();
    const schemeColor = useColorScheme();
    const [position, setPosition] = useState(0);
    const selectedDateRange = useAppSelector(selectDateRangeFilter);
    const filterType = useAppSelector(selectHomeViewTypeFilter)
    const { type, month, year, limit } = useAppSelector( state => state.filter );
    const dispatch = useAppDispatch();
    const {t} = useTranslation()

    function handleDeleteItem(id: number, groupId: number) {
        const {start, end} = getCustomMonthAndYear(month.number, year);
        Alert.alert(t('TRANSACTIONS.DELETE.TITLE'), t('TRANSACTIONS.DELETE.TEXT'), [
            {style: 'default', text: t('COMMON.CANCEL'), isPreferred: true},
            {
                style: 'destructive', text: t('COMMON.DELETE'), isPreferred: true, onPress: async () => {
                    setOpen(false)
                    resetData()
                    dispatch(removeTransactionFromHomeList({transactionId: id, groupId}));
                    await deleteTransaction(db, id)
                    const filterLimit = getSettingByKey(db, 'filter_limit')
                    const totalsOnEveryMonthByYear = getTotalsOnEveryMonthByYear(db, new Date().getFullYear(), type, filterLimit?.value ? Number(filterLimit.value) : 2500);
                    const totalSpentByYear = getTotalSpentByYear(db, new Date().getFullYear());
                    dispatch(updateTotalByMonth(totalsOnEveryMonthByYear));
                    dispatch(updateTotalsInYear(totalSpentByYear));

                    const transactions = await getTransactionsGroupedAndFilteredV2(db, start.toISOString(), end.toISOString(), type === 'expense' ? 'Spent' : 'Revenue');
                    // const {amountsGroupedByDate, transactionsGroupedByCategory} = await getTransactions(db, selectedDateRange.start, selectedDateRange.end, selectedAccountFilter.id, selectedCategoryFilter.id);
                    const accounts = getAllAccounts(db);
                    dispatch(updateAccountsList(accounts))
                    dispatch(updateTransactionsGroupedByDate(transactions));
                    // dispatch(updateTransactionsGroupedByCategory(transactionsGroupedByCategory));
                    // dispatch(updateChartPoints(amountsGroupedByDate))
                }
            },
        ])
    }

    async function duplicateTransaction(transaction: FullTransaction) {
        const {start, end} = filterType.date === 'week' ? getCurrentWeek() : getCurrentMonth()
        const newTransaction = await createTransaction(db, { ...transaction, category_id: transaction.category.id, account_id: transaction.account.id })
        if (newTransaction) {
            setOpen(false)
            resetData()
            dispatch(addTransactionInHomeList(newTransaction as FullTransaction))
            const transactions = await getTransactionsGroupedAndFilteredV2(db, start.toISOString(), end.toISOString(), type === 'expense' ? 'Spent' : 'Revenue');
            // const {amountsGroupedByDate, transactionsGroupedByCategory} = await getTransactions(db, selectedDateRange.start, selectedDateRange.end, selectedAccountFilter.id, selectedCategoryFilter.id);
            dispatch(updateTransactionsGroupedByDate(transactions));
            // dispatch(updateTransactionsGroupedByCategory(transactionsGroupedByCategory));
            // dispatch(updateChartPoints(amountsGroupedByDate))
        }
    }

    async function stopRecurrent(transactionId: number) {
        const {start, end} = getCustomMonthAndYear(month.number, year);
        const updatedTransaction = await stopRecurringInTransaction(db, transactionId)
        if (updatedTransaction) {
            setOpen(false)
            resetData()
            const filterLimit = getSettingByKey(db, 'filter_limit')
            const totalsOnEveryMonthByYear = getTotalsOnEveryMonthByYear(db, new Date().getFullYear(), type, filterLimit?.value ? Number(filterLimit.value) : 2500);
            const totalSpentByYear = getTotalSpentByYear(db, new Date().getFullYear());
            dispatch(updateTotalByMonth(totalsOnEveryMonthByYear));
            dispatch(updateTotalsInYear(totalSpentByYear));
            const transactions = await getTransactionsGroupedAndFilteredV2(db, start.toISOString(), end.toISOString(), type === 'expense' ? 'Spent' : 'Revenue');
            dispatch(updateTransactionsGroupedByDate(transactions));
        }
    }

    return (
        <Sheet
            forceRemoveScrollEnabled={open}
            modal={false}
            open={open}
            dismissOnOverlayPress
            onOpenChange={setOpen}
            position={position}
            onPositionChange={setPosition}
            snapPoints={item && item.recurrentDate !== 'none' ? [16] : [16]}
            snapPointsMode='percent'
            dismissOnSnapToBottom
            zIndex={100_000}
        >
            <Sheet.Overlay
                enterStyle={{opacity: 0}}
                exitStyle={{opacity: 0}}
            />

            <Sheet.Frame borderTopLeftRadius={12} borderTopRightRadius={12} backgroundColor="$color1" px={10} pb={20}>

                {
                    item &&
                    <>
                        {
                            item.recurrentDate !== 'none' &&
                            <TouchableOpacity onPress={() => stopRecurrent(item.id)} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, gap: 12, paddingVertical: 15 }}>
                                <FontAwesome6 name="arrow-rotate-right" size={20} color={schemeColor === 'dark' ? 'white' : 'black'} />
                                <Text fontSize={17}>{t('COMMON.STOP_RECURRING')}</Text>
                            </TouchableOpacity>
                        }

                        {/*<TouchableOpacity onPress={() => duplicateTransaction(item)} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, gap: 12, paddingVertical: 15 }}>*/}
                        {/*    <MaterialIcons name="control-point-duplicate" size={20} color={schemeColor === 'dark' ? 'white' : 'black'} />*/}
                        {/*    <Text fontSize={17}>{t('COMMON.DUPLICATE')}</Text>*/}
                        {/*</TouchableOpacity>*/}

                        <TouchableOpacity onPress={() => handleDeleteItem(item.id, itemGroupId)} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, gap: 12, paddingVertical: 15 }}>
                            <MaterialIcons name="delete-forever" size={20} color="red" />
                            <Text fontSize={17}>{t('COMMON.DELETE')}</Text>
                        </TouchableOpacity>
                    </>
                }
            </Sheet.Frame>
        </Sheet>
    )
}
