import {Platform, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {useRouter} from "expo-router";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {Entypo} from "@expo/vector-icons";
import {AntDesign} from '@expo/vector-icons';
import {useState} from "react";
import {
    BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import DatePicker from 'react-native-date-picker'
import {format} from "date-fns";
import RecurringSelectorDropdown from "@/lib/components/RecurringSelectorDropdown";
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import {selectSelectedCategory} from "@/lib/store/features/categories/categoriesSlice";
import {formatByThousands, textShortener} from "@/lib/helpers/string";
import CategoriesBottomSheet from "@/lib/components/CategoriesBottomSheet";
import {selectLayoutModalState, updateLayoutModalState} from "@/lib/store/features/ui/uiSlice";
import AccountsBottomSheet from "@/lib/components/AccountsBottomSheet";
import {selectSelectedAccountForm} from "@/lib/store/features/accounts/accountsSlice";
import NotesBottomSheet from "@/lib/components/NotesBottomSheet";
import {
    onChangeDate,
    selectCurrentTransaction, selectHomeViewTypeFilter, updateTransactionsGroupedByDate
} from "@/lib/store/features/transactions/transactionsSlice";
import TransactionKeyboard from "@/lib/components/TransactionKeyboard";
import CustomBackdrop from "@/lib/components/CustomBackdrop";
import {fromZonedTime} from "date-fns-tz";
import {createTransaction, getTransactionsGroupedAndFiltered, updateTransaction} from "@/lib/db";
import {useSQLiteContext} from "expo-sqlite";
import {getCurrentMonth, getCurrentWeek} from "@/lib/helpers/date";
import sleep from "@/lib/helpers/sleep";
import {useTheme} from "@react-navigation/native";

export default function Screen() {
    const router = useRouter();
    const db = useSQLiteContext();
    const isIos = Platform.OS === 'ios';
    const dispatch = useAppDispatch();
    const colors = useTheme().colors;
    const filterType = useAppSelector(selectHomeViewTypeFilter)
    const currentTransaction = useAppSelector(selectCurrentTransaction)
    const selectedCategory = useAppSelector(selectSelectedCategory);
    const selectedAccount = useAppSelector(selectSelectedAccountForm);
    const insets = useSafeAreaInsets();
    const [showCalendar, setShowCalendar] = useState<boolean>(false);
    const isModalOpen = useAppSelector(selectLayoutModalState)
    // callbacks

    function formatDate(date: string | Date | number) {
        return fromZonedTime(date, Intl.DateTimeFormat().resolvedOptions().timeZone);
    }

    async function handleCreateOrEditTransaction() {
    //     Check if it is create id = -1 or update id > 0
        const {start, end} = filterType.date === 'week' ? getCurrentWeek() : getCurrentMonth()

        if (currentTransaction.id > 0) {
            const updatedTransaction = await updateTransaction(db, {
                id: currentTransaction.id,
                account_id: selectedAccount.id,
                category_id: selectedCategory.id,
                recurrentDate: currentTransaction.recurrentDate,
                amount: currentTransaction.amount,
                date: currentTransaction.date,
                notes: currentTransaction.notes
            });
            if (updatedTransaction) {
                const transactions = await getTransactionsGroupedAndFiltered(db, start.toISOString(), end.toISOString(), filterType.type, selectedAccount.id);
                dispatch(updateTransactionsGroupedByDate(transactions));
                await sleep(200);
                router.back()
            }
        } else {
            const newTransaction = await createTransaction(db, {
                id: -1,
                account_id: selectedAccount.id,
                category_id: selectedCategory.id,
                recurrentDate: currentTransaction.recurrentDate,
                amount: currentTransaction.amount,
                date: currentTransaction.date,
                notes: currentTransaction.notes
            });
            if (newTransaction) {
                const transactions = await getTransactionsGroupedAndFiltered(db, start.toISOString(), end.toISOString(), filterType.type, selectedAccount.id);
                dispatch(updateTransactionsGroupedByDate(transactions));
                await sleep(200);
                router.back()
            }
        }
    }

    return (
        <>
            <BottomSheetModalProvider>
                <View style={[styles.container, { backgroundColor: colors.background }]}>
                    {isModalOpen && <CustomBackdrop/>}
                    <View style={[styles.header, {paddingTop: isIos ? insets.top : insets.top + 20}]}>
                        <TouchableOpacity onPress={() => router.back()}>
                            <Text style={{fontSize: 18, color: 'gray'}}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.calendarButton} onPress={() => setShowCalendar(true)}>
                            <Text style={{
                                fontSize: 18,
                                color: colors.text
                            }}>{format(formatDate(currentTransaction.date), 'MMM d')}</Text>
                            <Entypo name="select-arrows" size={18} color='gray'/>
                        </TouchableOpacity>
                        <View style={styles.headerRightSide}>
                            <RecurringSelectorDropdown/>
                            {
                                currentTransaction.id > 0 &&
                                <TouchableOpacity>
                                    <Entypo name="dots-three-horizontal" size={24} color={colors.text}/>
                                </TouchableOpacity>
                            }
                        </View>
                    </View>
                    <View style={styles.content}>
                        <View style={styles.amount}>
                            <View style={{flexDirection: 'row', alignItems: 'flex-start', gap: 10}}>
                                <Text style={{color: 'gray', fontSize: 32, marginTop: 10}}>S/</Text>
                                <Text
                                    style={{fontSize: 64, color: colors.text}}>{formatByThousands(String(currentTransaction.amount))}</Text>
                            </View>
                        </View>
                        <View style={styles.keyboard}>
                            <View style={{borderBottomWidth: 1, borderColor: 'gray'}}>
                                <NotesBottomSheet styles={{paddingVertical: 10, paddingHorizontal: 20}}>
                                    <Text style={{fontSize: 16, color: colors.text}}>Notes</Text>
                                </NotesBottomSheet>
                            </View>
                            <View style={{
                                borderBottomWidth: 1,
                                borderColor: 'gray',
                                flexDirection: 'row',
                                gap: 20,
                                paddingHorizontal: 30
                            }}>
                                <AccountsBottomSheet styles={styles.accountsWrapper}>
                                    <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
                                        <Text style={{fontSize: 16}}>{selectedAccount.icon}</Text>
                                        <Text style={{fontSize: 16, color: colors.text}}>{textShortener(selectedAccount.title)}</Text>
                                    </View>
                                    <AntDesign name="arrowright" size={24} color="gray"/>
                                </AccountsBottomSheet>
                                <CategoriesBottomSheet styles={styles.categoriesWrapper}>
                                    <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
                                        <Text style={{fontSize: 16}}>{selectedCategory.icon}</Text>
                                        <Text style={{fontSize: 16, color: colors.text}}>{textShortener(selectedCategory.title)}</Text>
                                    </View>
                                </CategoriesBottomSheet>
                                <View style={{flex: 0.2, justifyContent: 'center'}}>
                                    <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.text }]} onPress={handleCreateOrEditTransaction}>
                                        <Text style={{color: colors.background, fontWeight: 'bold', fontSize: 16}}>Save</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <TransactionKeyboard/>
                        </View>
                    </View>
                </View>
            </BottomSheetModalProvider>
            {/*TODO add locales*/}
            <DatePicker
                modal
                mode="date"
                open={showCalendar}
                date={new Date(currentTransaction.date)}
                maximumDate={new Date()}
                onConfirm={(date) => {
                    const timeZonedDate = formatDate(date)
                    setShowCalendar(false)
                    dispatch(onChangeDate(timeZonedDate.toISOString()))
                }}
                onCancel={() => {
                    setShowCalendar(false)
                }}
            />
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
    content: {
        flex: 1,
    },
    amount: {
        flex: 0.4,
        justifyContent: 'center',
        alignItems: 'center'
    },
    keyboard: {
        flex: 0.6,
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
