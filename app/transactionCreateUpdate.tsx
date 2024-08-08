import {Platform, StyleSheet, TouchableOpacity, useColorScheme} from "react-native";
import {View, Text, Button} from 'tamagui';
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
    const scheme = useColorScheme();
    const dispatch = useAppDispatch();
    const colors = useTheme().colors;
    const filterType = useAppSelector(selectHomeViewTypeFilter)
    const currentTransaction = useAppSelector(selectCurrentTransaction)
    const selectedCategory = useAppSelector(selectSelectedCategory);
    const selectedAccount = useAppSelector(selectSelectedAccountForm);
    const insets = useSafeAreaInsets();
    const [showCalendar, setShowCalendar] = useState<boolean>(false);
    const isModalOpen = useAppSelector(selectLayoutModalState)

    const [openCategoriesSheet, setOpenCategoriesSheet] = useState<boolean>(false)
    const [openAccountsSheet, setOpenAccountsSheet] = useState<boolean>(false)
    const [openNotesSheet, setOpenNotesSheet] = useState<boolean>(false)
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
                <View position="relative" flex={1} backgroundColor="$background">
                    {isModalOpen && <CustomBackdrop/>}
                    <View style={[styles.header, {paddingTop: isIos ? insets.top : insets.top + 20}]}>
                        <TouchableOpacity onPress={() => router.back()}>
                            <Text fontSize={18} color="$gray10Dark">Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.calendarButton} onPress={() => setShowCalendar(true)}>
                            <Text fontSize={18}>{format(formatDate(currentTransaction.date), 'MMM d')}</Text>
                            <Entypo name="select-arrows" size={18} color={scheme === 'light' ? 'black' : 'white'} />
                        </TouchableOpacity>
                        <View style={styles.headerRightSide}>
                            <RecurringSelectorDropdown/>
                            {
                                currentTransaction.id > 0 &&
                                <TouchableOpacity>
                                    <Entypo name="dots-three-horizontal" size={24} color={scheme === 'light' ? 'black' : 'white'}/>
                                </TouchableOpacity>
                            }
                        </View>
                    </View>
                    <View flex={1}>
                        <View flex={0.4} justifyContent="center" alignItems="center">
                            <View flexDirection="row" alignItems="flex-start" gap="$2">
                                <Text marginTop="$3" fontSize="$9" color="$gray10Dark">S/</Text>
                                <Text fontSize="$12">{formatByThousands(String(currentTransaction.amount))}</Text>
                            </View>
                        </View>
                        <View flex={0.6}>
                            <View borderBottomWidth={1} borderColor="$gray10Dark">
                                <TouchableOpacity onPress={() => setOpenNotesSheet(true)} style={{paddingVertical: 10, paddingHorizontal: 20}}>
                                    <Text fontSize={16}>{textShortener(currentTransaction.notes, 35) || 'Notes'}</Text>
                                </TouchableOpacity>
                            </View>
                            <View borderBottomWidth={1} borderColor="$gray10Dark" flexDirection="row" gap={20} paddingHorizontal={20}>
                                <TouchableOpacity style={styles.accountsWrapper} onPress={() => setOpenAccountsSheet(true)}>
                                    <View flexDirection="row" alignItems="center" gap={5}>
                                        <Text fontSize={16}>{selectedAccount.icon}</Text>
                                        <Text fontSize={16}>{textShortener(selectedAccount.title)}</Text>
                                    </View>
                                    <AntDesign name="arrowright" size={24} color="gray"/>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setOpenCategoriesSheet(true)} style={styles.categoriesWrapper}>
                                    <View flexDirection="row" alignItems="center" gap={5}>
                                        <Text fontSize={16}>{selectedCategory.icon}</Text>
                                        <Text fontSize={16}>{textShortener(selectedCategory.title)}</Text>
                                    </View>
                                </TouchableOpacity>
                                <View flex={0.2} justifyContent="center">
                                    <Button onPress={handleCreateOrEditTransaction} borderRadius="$4" paddingHorizontal={0} width={70} height={35} justifyContent='center' alignItems='center'>
                                        <Text fontSize={16}>Save</Text>
                                    </Button>
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
            <CategoriesBottomSheet open={openCategoriesSheet} setOpen={setOpenCategoriesSheet} />
            <AccountsBottomSheet open={openAccountsSheet} setOpen={setOpenAccountsSheet} />
            <NotesBottomSheet open={openNotesSheet} setOpen={setOpenNotesSheet} />
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
