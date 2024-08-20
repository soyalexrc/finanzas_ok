import {Platform, StyleSheet, TouchableOpacity, useColorScheme} from "react-native";
import {View, Text, Button} from 'tamagui';
import {useRouter} from "expo-router";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {Entypo} from "@expo/vector-icons";
import {AntDesign} from '@expo/vector-icons';
import {useEffect, useState} from "react";
import DatePicker from 'react-native-date-picker'
import {format} from "date-fns";
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import {selectSelectedCategory} from "@/lib/store/features/categories/categoriesSlice";
import {formatByThousands, textShortener} from "@/lib/helpers/string";
import {
    selectAccountForm,
    selectAccounts,
    selectSelectedAccountForm, selectSelectedAccountGlobal, updateAccountInList
} from "@/lib/store/features/accounts/accountsSlice";
import {
    onChangeDate,
    selectCurrentTransaction, selectHomeViewTypeFilter, updateTransactionsGroupedByDate
} from "@/lib/store/features/transactions/transactionsSlice";
import {createTransaction, getTransactions, getTransactionsGroupedAndFiltered, updateTransaction} from "@/lib/db";
import {useSQLiteContext} from "expo-sqlite";
import {formatDate, getCurrentMonth, getCurrentWeek} from "@/lib/helpers/date";
import sleep from "@/lib/helpers/sleep";
import RecurringSelectorDropdown from "@/lib/components/ui/RecurringSelectorDropdown";
import TransactionKeyboard from "@/lib/components/transaction/TransactionKeyboard";
import CategoriesBottomSheet from "@/lib/components/transaction/CategoriesBottomSheet";
import AccountsBottomSheet from "@/lib/components/transaction/AccountsBottomSheet";
import NotesBottomSheet from "@/lib/components/transaction/NotesBottomSheet";
import {
    selectAccountFilter, selectCategoryFilter,
    selectDateRangeFilter,
    updateChartPoints,
    updateTransactionsGroupedByCategory
} from "@/lib/store/features/transactions/reportSlice";
import {loadString} from "@/lib/utils/storage";

export default function Screen() {
    const router = useRouter();
    const db = useSQLiteContext();
    const isIos = Platform.OS === 'ios';
    const scheme = useColorScheme();
    const dispatch = useAppDispatch();
    const accounts = useAppSelector(selectAccounts);
    const selectedDateRange = useAppSelector(selectDateRangeFilter);
    const filterType = useAppSelector(selectHomeViewTypeFilter)
    const currentTransaction = useAppSelector(selectCurrentTransaction)
    const selectedCategory = useAppSelector(selectSelectedCategory);
    const selectedAccount = useAppSelector(selectSelectedAccountForm);
    const globalAccount = useAppSelector(selectSelectedAccountGlobal);
    const selectedAccountFilter = useAppSelector(selectAccountFilter);
    const selectedCategoryFilter = useAppSelector(selectCategoryFilter);

    const insets = useSafeAreaInsets();
    const [showCalendar, setShowCalendar] = useState<boolean>(false);

    const [openCategoriesSheet, setOpenCategoriesSheet] = useState<boolean>(false)
    const [openAccountsSheet, setOpenAccountsSheet] = useState<boolean>(false)
    const [openNotesSheet, setOpenNotesSheet] = useState<boolean>(false)

    // callbacks

    async function handleCreateOrEditTransaction() {
        const {start, end} = filterType.date === 'week' ? getCurrentWeek() : getCurrentMonth()
        let transaction: any;
        if (currentTransaction.id > 0) {
            transaction = await updateTransaction(db, {
                id: currentTransaction.id,
                account_id: selectedAccount.id,
                category_id: selectedCategory.id,
                recurrentDate: currentTransaction.recurrentDate,
                amount: currentTransaction.amount,
                date: currentTransaction.date,
                notes: currentTransaction.notes
            });
        } else {
            transaction =  await createTransaction(db, {
                id: -1,
                account_id: selectedAccount.id,
                category_id: selectedCategory.id,
                recurrentDate: currentTransaction.recurrentDate,
                amount: currentTransaction.amount,
                date: currentTransaction.date,
                notes: currentTransaction.notes
            });
        }

        // update category in redux
        dispatch(updateAccountInList(transaction.account));

        const transactions = await getTransactionsGroupedAndFiltered(db, start.toISOString(), end.toISOString(), filterType.type, globalAccount.id);
        const {
            amountsGroupedByDate,
            transactionsGroupedByCategory
        } = await getTransactions(db, selectedDateRange.start, selectedDateRange.end, selectedAccountFilter.id, selectedCategoryFilter.id);
        dispatch(updateTransactionsGroupedByDate(transactions));
        dispatch(updateTransactionsGroupedByCategory(transactionsGroupedByCategory));
        dispatch(updateChartPoints(amountsGroupedByDate))

        await sleep(100);
        router.back()
    }

    useEffect(() => {
        if (selectedAccount.id === 0) {
            if (globalAccount.id > 0) {
                dispatch(selectAccountForm(globalAccount));
            } else {
                dispatch(selectAccountForm(accounts[0]));
            }
        }
    }, []);

    return (
        <>
            <View position="relative" flex={1} backgroundColor="$background">
                <View style={[styles.header, {paddingTop: isIos ? insets.top : insets.top + 20}]}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text fontSize={18} color="$gray10Dark">Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.calendarButton} onPress={() => setShowCalendar(true)}>
                        <Text fontSize={18}>{format(formatDate(currentTransaction.date), 'MMM d')}</Text>
                        <Entypo name="select-arrows" size={18} color={scheme === 'light' ? 'black' : 'white'}/>
                    </TouchableOpacity>
                    <View style={styles.headerRightSide}>
                        <RecurringSelectorDropdown/>
                        {
                            currentTransaction.id > 0 &&
                            <TouchableOpacity>
                                <Entypo name="dots-three-horizontal" size={24}
                                        color={scheme === 'light' ? 'black' : 'white'}/>
                            </TouchableOpacity>
                        }
                    </View>
                </View>
                <View flex={1}>
                    <View flex={0.4} justifyContent="center" alignItems="center">
                        <View flexDirection="row" alignItems="flex-start" gap="$2">
                            <Text marginTop="$3" fontSize="$9"
                                  color="$gray10Dark">{selectedAccount.currency_symbol}</Text>
                            <Text fontSize="$12">{formatByThousands(String(currentTransaction.amount))}</Text>
                        </View>
                    </View>
                    <View flex={0.6}>
                        <View borderBottomWidth={1} borderColor="$gray10Dark">
                            <TouchableOpacity onPress={() => setOpenNotesSheet(true)}
                                              style={{paddingVertical: 10, paddingHorizontal: 20}}>
                                <Text fontSize={16}>{textShortener(currentTransaction.notes, 35) || 'Notes'}</Text>
                            </TouchableOpacity>
                        </View>
                        <View borderBottomWidth={1} borderColor="$gray10Dark" flexDirection="row" gap={20}
                              paddingHorizontal={20}>
                            <TouchableOpacity style={styles.accountsWrapper} onPress={() => setOpenAccountsSheet(true)}>
                                <View flexDirection="row" alignItems="center" gap={5}>
                                    <Text fontSize={16}>{selectedAccount.icon}</Text>
                                    <Text fontSize={16}>{textShortener(selectedAccount.title)}</Text>
                                </View>
                                <AntDesign name="arrowright" size={24} color="gray"/>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setOpenCategoriesSheet(true)}
                                              style={styles.categoriesWrapper}>
                                <View flexDirection="row" alignItems="center" gap={5}>
                                    <Text fontSize={16}>{selectedCategory.icon}</Text>
                                    <Text fontSize={16}>{textShortener(selectedCategory.title)}</Text>
                                </View>
                            </TouchableOpacity>
                            <View flex={0.2} justifyContent="center">
                                <Button onPress={handleCreateOrEditTransaction} borderRadius="$4" paddingHorizontal={0}
                                        width={70} height={35} justifyContent='center' alignItems='center'>
                                    <Text fontSize={16}>Save</Text>
                                </Button>
                            </View>
                        </View>
                        <TransactionKeyboard/>
                    </View>
                </View>
            </View>
            {/*TODO add locales*/}
            <DatePicker
                modal
                mode="date"
                open={showCalendar}
                date={new Date(currentTransaction.date)}
                maximumDate={new Date()}
                onConfirm={(date) => {
                    const timeZonedDate = formatDate(date)
                    timeZonedDate.setHours(5);
                    setShowCalendar(false)
                    dispatch(onChangeDate(timeZonedDate.toISOString()))
                }}
                onCancel={() => {
                    setShowCalendar(false)
                }}
            />
            <CategoriesBottomSheet open={openCategoriesSheet} setOpen={setOpenCategoriesSheet}/>
            <AccountsBottomSheet open={openAccountsSheet} setOpen={setOpenAccountsSheet}/>
            <NotesBottomSheet open={openNotesSheet} setOpen={setOpenNotesSheet}/>
        </>
    )
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20
    },
    container: {
        position: 'relative',
        flex: 1,
    },
    calendarButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3
    },
    headerRightSide: {
        flexDirection: 'row',
        gap: 20
    },
    saveButton: {
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        width: 70,
        height: 30
    },
    accountsWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flex: 0.4,
        paddingVertical: 10
    },
    categoriesWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 0.4,
        paddingVertical: 10
    }

})
