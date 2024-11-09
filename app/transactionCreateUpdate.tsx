import {
    Alert, Dimensions,
    Platform,
    Pressable,
    StyleSheet,
    TouchableOpacity,
    useColorScheme
} from "react-native";
import {View, Text, Button, useTheme, useWindowDimensions, XStack} from 'tamagui';
import {useRouter} from "expo-router";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {Entypo, MaterialCommunityIcons} from "@expo/vector-icons";
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
    selectSelectedAccountForm, selectSelectedAccountGlobal, updateAccountInList, updateAccountsList
} from "@/lib/store/features/accounts/accountsSlice";
import {
    onChangeDate,
    selectCurrentTransaction, selectHomeViewTypeFilter, updateTransactionsGroupedByDate
} from "@/lib/store/features/transactions/transactionsSlice";
import {
    createTransactionV2, deleteTransaction,
    getAllAccounts,
    getTransactions,
    getTransactionsGroupedAndFiltered, getTransactionsGroupedAndFilteredV2, getTransactionsV2,
} from "@/lib/db";
import {useSQLiteContext} from "expo-sqlite";
import {formatDate, getCurrentMonth, getCurrentWeek} from "@/lib/helpers/date";
import RecurringSelectorDropdown from "@/lib/components/ui/RecurringSelectorDropdown";
import TransactionKeyboard from "@/lib/components/transaction/TransactionKeyboard";
import CategoriesBottomSheet from "@/lib/components/transaction/CategoriesBottomSheet";
import NotesBottomSheet from "@/lib/components/transaction/NotesBottomSheet";
import {
    selectAccountFilter, selectCategoryFilter,
    selectDateRangeFilter,
    updateChartPoints,
    updateTransactionsGroupedByCategory
} from "@/lib/store/features/transactions/reportSlice";
import * as DropdownMenu from "zeego/dropdown-menu";
import {selectSettings} from "@/lib/store/features/settings/settingsSlice";
import {useTranslation} from "react-i18next";
import HiddenFlagSheet from "@/lib/components/ui/android-dropdowns-sheets/HiddenFlagSheet";
import * as Haptics from "expo-haptics";
import TransactionsSettingsSheet from "@/lib/components/ui/android-dropdowns-sheets/TransactionsSettingsSheet";
import RecurringSelectorSheet from "@/lib/components/ui/android-dropdowns-sheets/RecurringSelectorSheet";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {es, enUS} from 'date-fns/locale';

export default function Screen() {
    const {width, height} = Dimensions.get('screen');
    const isSmallPhone = height <= 812;
    const isMediumPhone = height > 812 && height < 855
    const router = useRouter();
    const db = useSQLiteContext();
    const isIos = Platform.OS === 'ios';
    const theme = useTheme()
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
    const {selectedLanguage} = useAppSelector(selectSettings)
    const {t} = useTranslation()

    const insets = useSafeAreaInsets();
    const [showCalendar, setShowCalendar] = useState<boolean>(false);

    const [openCategoriesSheet, setOpenCategoriesSheet] = useState<boolean>(false)
    const [openNotesSheet, setOpenNotesSheet] = useState<boolean>(false)
    const [openHiddenMenuSheet, setOpenHiddenMenuSheet] = useState<boolean>(false)
    const [openConfigSheet, setOpenConfigSheet] = useState<boolean>(false)
    const [openRecurrencySheet, setOpenRecurrencySheet] = useState<boolean>(false)
    const {hidden_feature_flag} = useAppSelector(selectSettings)

    const [tab, setTab] = useState<'total' | 'visible'>(hidden_feature_flag ? 'visible' : 'total');

    // callbacks

    async function handleCreateOrEditTransaction() {
        const {start, end} = filterType.date === 'week' ? getCurrentWeek() : getCurrentMonth()

        if (Number(currentTransaction.amount) < 1 && Number(currentTransaction.hidden_amount) < 1) {
            Alert.alert(t('COMMON.WARNING'), t('COMMON.MESSAGES.INSERT_AMOUNT'))
            return;
        }

        if (selectedCategory.id < 1) {
            Alert.alert(t('COMMON.WARNING'), t('COMMON.MESSAGES.INSERT_CATEGORY'))
            return;
        }

        // if (selectedAccount.id < 1) {
        //     Alert.alert(t('COMMON.WARNING'), t('COMMON.MESSAGES.INSERT_ACCOUNT'))
        //     return;
        // }
        if (currentTransaction.id > 0) {
            await deleteTransaction(db, currentTransaction.id);
            // transaction = await updateTransaction(db, {
            //     id: currentTransaction.id,
            //     account_id: selectedAccount.id,
            //     category_id: selectedCategory.id,
            //     recurrentDate: currentTransaction.recurrentDate,
            //     amount: currentTransaction.amount,
            //     date: currentTransaction.date,
            //     notes: currentTransaction.notes
            // });
        }
        const transaction: any = createTransactionV2(db, {
            id: -1,
            account: selectedAccount?.title ?? '',
            currency_code_t: 'EUR',
            currency_symbol_t: 'E',
            dateTime: new Date().toISOString(),
            category: selectedCategory.title,
            category_icon: selectedCategory.icon,
            category_type: selectedCategory.type,
            recurrentDate: currentTransaction.recurrentDate,
            amount: currentTransaction.amount,
            date: currentTransaction.date,
            notes: currentTransaction.notes,
            hidden_amount: currentTransaction.hidden_amount,
        });

        // update category in redux
        // dispatch(updateAccountInList(transaction.account));
        // const accounts = getAllAccounts(db);
        // dispatch(updateAccountsList(accounts))

        const transactions = await getTransactionsGroupedAndFilteredV2(db, start.toISOString(), end.toISOString(), filterType.type);
        const {
            amountsGroupedByDate,
            transactionsGroupedByCategory
        } = await getTransactionsV2(db, selectedDateRange.start, selectedDateRange.end);
        dispatch(updateTransactionsGroupedByDate(transactions));
        dispatch(updateTransactionsGroupedByCategory(transactionsGroupedByCategory));
        dispatch(updateChartPoints(amountsGroupedByDate))

        // await sleep(100);
        router.back()
    }

    useEffect(() => {
        if (selectedAccount?.id === 0) {
            if (globalAccount.id > 0) {
                dispatch(selectAccountForm(globalAccount));
            } else {
                dispatch(selectAccountForm(accounts[0]));
            }
        }
    }, []);

    async function handlePopHiddenMenu() {
        await Haptics.selectionAsync();
        setOpenHiddenMenuSheet(true)
    }

    async function handleTouchCalendar() {
        await Haptics.selectionAsync();
        setShowCalendar(true)
    }

    async function handleTouchNotes() {
        await Haptics.selectionAsync();
        setOpenNotesSheet(true)
    }

    async function handleTouchRecurrency() {
        await Haptics.selectionAsync();
        setOpenRecurrencySheet(true)
    }

    function handleDeleteItem() {
        const {start, end} = filterType.date === 'week' ? getCurrentWeek() : getCurrentMonth()
        Alert.alert(t('TRANSACTIONS.DELETE.TITLE'), t('TRANSACTIONS.DELETE.TEXT'), [
            {style: 'default', text: t('COMMON.CANCEL'), isPreferred: true},
            {
                style: 'destructive', text: t('COMMON.DELETE'), isPreferred: true, onPress: async () => {
                    await deleteTransaction(db, currentTransaction.id)
                    const transactions = await getTransactionsGroupedAndFiltered(db, start.toISOString(), end.toISOString(), filterType.type, globalAccount.id);
                    const {
                        amountsGroupedByDate,
                        transactionsGroupedByCategory
                    } = await getTransactions(db, selectedDateRange.start, selectedDateRange.end, selectedAccountFilter.id, selectedCategoryFilter.id);
                    const accounts = getAllAccounts(db);
                    dispatch(updateAccountsList(accounts))
                    dispatch(updateTransactionsGroupedByDate(transactions));
                    dispatch(updateTransactionsGroupedByCategory(transactionsGroupedByCategory));
                    dispatch(updateChartPoints(amountsGroupedByDate))
                    router.back()
                }
            },
        ])
    }

    console.log({
        platform: Platform.OS,
        width,
        height
    })

    return (
        <>
            <View position="relative" flex={1} backgroundColor="$background">
                <View style={[styles.header, {paddingTop: isIos ? 30 : insets.top + 20}]}>
                    <View flexDirection="row" gap={20}>
                        <TouchableOpacity style={[styles.calendarButton, {
                            backgroundColor: theme.color2?.val,
                            padding: 10,
                            borderRadius: 100
                        }]} onPress={handleTouchCalendar}>
                            <Text
                                fontSize={18}>{format(formatDate(currentTransaction.date), 'dd MMMM', {locale: selectedLanguage === 'es' ? es : enUS})}</Text>
                            <Entypo name="select-arrows" size={18} color={scheme === 'light' ? 'black' : 'white'}/>
                        </TouchableOpacity>
                        <View style={styles.headerRightSide}>
                            {isIos && <RecurringSelectorDropdown/>}
                            {
                                !isIos &&
                                <TouchableOpacity
                                    style={{backgroundColor: theme.color2?.val, padding: 10, borderRadius: 100}}
                                    onPress={handleTouchRecurrency}>
                                    <MaterialCommunityIcons name="calendar-sync-outline" size={24}
                                                            color={scheme === 'light' ? 'black' : 'white'}/>
                                </TouchableOpacity>
                            }
                            {/*{*/}
                            {/*    currentTransaction.id > 0 && isIos &&*/}
                            {/*    <TransactionsSettingsDropdown fn={handleDeleteItem} resetTab={() => setTab('total')}/>*/}
                            {/*}*/}
                            {/*{*/}
                            {/*    currentTransaction.id > 0 && !isIos &&*/}
                            {/*    <TouchableOpacity onPress={() => setOpenConfigSheet(true)}>*/}
                            {/*        <Entypo name="dots-three-horizontal" size={24}*/}
                            {/*                color={scheme === 'light' ? 'black' : 'white'}/>*/}
                            {/*    </TouchableOpacity>*/}
                            {/*}*/}
                        </View>
                        <TouchableOpacity style={{backgroundColor: theme.color2?.val, padding: 10, borderRadius: 100}}
                                          onPress={handleTouchNotes}>
                            <FontAwesome name="commenting-o" size={24} color={scheme === 'light' ? 'black' : 'white'}/>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={{
                        backgroundColor: scheme === 'light' ? '#ffe5e5' : '#9f0101',
                        padding: 10,
                        borderRadius: 100
                    }} onPress={() => router.back()}>
                        <AntDesign name="close" size={20} color={scheme === 'light' ? 'black' : 'white'}/>
                    </TouchableOpacity>
                </View>
                <View flex={1}>
                    <View flex={isSmallPhone ? 0.45 : isMediumPhone ? 0.5 : 0.55} justifyContent="center" alignItems="center">
                        {
                            isIos &&
                            <DropdownMenu.Root>
                                <DropdownMenu.Trigger action="longPress">
                                    <View flexDirection="row" alignItems="flex-start" gap="$2">
                                        <Text marginTop="$3" fontSize="$9"
                                              color="$gray10Dark">{selectedAccount?.currency_symbol}</Text>
                                        {
                                            tab === 'total' && <Text
                                                fontSize="$12">{formatByThousands(String(currentTransaction.amount))}</Text>
                                        }
                                        {
                                            tab === 'visible' && <Text
                                                fontSize="$12">{formatByThousands(String(currentTransaction.hidden_amount))}</Text>
                                        }
                                    </View>
                                </DropdownMenu.Trigger>
                                <DropdownMenu.Content loop={false} side='bottom' sideOffset={0} align='center'
                                                      alignOffset={0}
                                                      collisionPadding={0} avoidCollisions={true}>
                                    <DropdownMenu.CheckboxItem key="total"
                                                               value={tab === 'total' ? 'on' : 'off'}
                                                               onValueChange={() => setTab('total')}>
                                        <DropdownMenu.ItemTitle>{t('CREATE_TRANSACTION.HIDDEN_FEATURE.SEE_TOTAL')}</DropdownMenu.ItemTitle>
                                        <DropdownMenu.ItemIndicator/>
                                    </DropdownMenu.CheckboxItem>
                                    <DropdownMenu.CheckboxItem key="visible"
                                                               value={tab === 'visible' ? 'on' : 'off'}
                                                               onValueChange={() => setTab('visible')}>
                                        <DropdownMenu.ItemTitle>{t('CREATE_TRANSACTION.HIDDEN_FEATURE.SEE_VISIBLE')}</DropdownMenu.ItemTitle>
                                        <DropdownMenu.ItemIndicator/>
                                    </DropdownMenu.CheckboxItem>
                                </DropdownMenu.Content>
                            </DropdownMenu.Root>
                        }
                        {
                            !isIos &&
                            <Pressable onLongPress={() => handlePopHiddenMenu()}
                                       style={{flexDirection: 'row', alignItems: 'flex-start', gap: 2}}>
                                <Text marginTop="$3" fontSize="$9"
                                      color="$gray10Dark">{selectedAccount?.currency_symbol}</Text>
                                {
                                    tab === 'total' &&
                                    <Text fontSize="$12">{formatByThousands(String(currentTransaction.amount))}</Text>
                                }
                                {
                                    tab === 'visible' && <Text
                                        fontSize="$12">{formatByThousands(String(currentTransaction.hidden_amount))}</Text>
                                }
                            </Pressable>
                        }
                    </View>
                    {/*{*/}
                    {/*    currentTransaction.is_hidden_transaction > 0 &&*/}
                    {/*    <XStack justifyContent="center">*/}
                    {/*        <ToggleGroup*/}
                    {/*            orientation="horizontal"*/}
                    {/*            type="single" // since this demo switches between loosen types*/}
                    {/*            value={tab}*/}
                    {/*            size="$1"*/}
                    {/*            onValueChange={(value: 'total' | 'visible') => setTab(value)}*/}
                    {/*            disableDeactivation={true}*/}
                    {/*        >*/}
                    {/*            <ToggleGroup.Item key='total' value="total" aria-label="Symbols" paddingHorizontal={10}>*/}
                    {/*                <Text fontSize={14}>Total</Text>*/}
                    {/*            </ToggleGroup.Item>*/}
                    {/*            <ToggleGroup.Item key='visible' value="visible" aria-label="Symbols"*/}
                    {/*                              paddingHorizontal={10}>*/}
                    {/*                <Text fontSize={14}>Visible</Text>*/}
                    {/*            </ToggleGroup.Item>*/}
                    {/*        </ToggleGroup>*/}
                    {/*    </XStack>*/}
                    {/*}*/}
                    <View flex={isSmallPhone ? 0.55 : isMediumPhone ? 0.5 : 0.45}>
                        <View flexDirection="row" gap={5} alignItems="center"
                              paddingHorizontal={5}>
                            {/*<TouchableOpacity accessible={true} accessibilityLabel={`Account selection`}*/}
                            {/*                  accessibilityHint={`Select an account for the transaction, current account is: ${selectedAccount?.title ?? 'None'}`}*/}
                            {/*                  style={styles.accountsWrapper} onPress={() => setOpenAccountsSheet(true)}>*/}
                            {/*    <View flexDirection="row" alignItems="center" gap={5}>*/}
                            {/*        <Text fontSize={16}>{selectedAccount?.icon}</Text>*/}
                            {/*        <Text*/}
                            {/*            fontSize={16}>{textShortener(selectedAccount?.title, 13) ?? 'Select account'}</Text>*/}
                            {/*    </View>*/}
                            {/*</TouchableOpacity>*/}
                            {/*<AntDesign name="arrowright" size={24} color="gray"/>*/}
                            <TouchableOpacity style={[
                                styles.categoriesWrapper, {
                                    backgroundColor: theme.color2?.val,
                                    padding: 10,
                                    borderRadius: 100
                                }
                            ]}  accessible={true} accessibilityLabel={`Category selection`}
                                              accessibilityHint={`Select a category for the transaction, current category is: ${selectedCategory?.title ?? 'None'}`}
                                              onPress={() => setOpenCategoriesSheet(true)}>
                                <View flexDirection="row" alignItems="center" justifyContent="space-between" flex={1} gap={5}>
                                    <XStack alignItems="center" gap={10}>
                                        <Text fontSize={16}>{selectedCategory?.icon}</Text>
                                        <Text fontSize={16}>{textShortener(selectedCategory?.title, 20)}</Text>
                                    </XStack>
                                    <Entypo name="select-arrows" size={18} color={scheme === 'light' ? 'black' : 'white'}/>
                                </View>
                            </TouchableOpacity>
                            <Button accesible={true} accessibilityLabel="Save transaction changes"
                                    accessibilityHint="This will save the new transaction or edit one if you are editing one exisisting."
                                    flex={0.6} onPress={handleCreateOrEditTransaction} borderRadius="$12"
                                    paddingHorizontal={0}
                                    height={45} justifyContent='center' alignItems='center'>
                                <Text fontSize={16}>{t('CREATE_TRANSACTION.SAVE')}</Text>
                            </Button>
                        </View>
                        {/*{*/}
                        {/*    width <= 375 &&*/}
                        {/*    <View flexDirection="row">*/}
                        {/*        <Button accesible={true} accessibilityLabel="Save transaction changes" accessibilityHint="This will save the new transaction or edit one if you are editing one exisisting." flex={1} mx={10} onPress={handleCreateOrEditTransaction} borderRadius="$4" paddingHorizontal={0}*/}
                        {/*                height={35} justifyContent='center' alignItems='center'>*/}
                        {/*            <Text fontSize={16}>{t('CREATE_TRANSACTION.SAVE')}</Text>*/}
                        {/*        </Button>*/}
                        {/*    </View>*/}
                        {/*}*/}
                        <TransactionKeyboard tab={tab}/>
                    </View>
                </View>
            </View>
            {/*TODO add locales*/}
            <DatePicker
                modal
                mode="date"
                locale={selectedLanguage}
                accessible={true}
                accessibilityLabel="Date selector"
                accessibilityHint="Select a Date to this transaction"
                accessibilityLanguage={selectedLanguage}
                accessibilityElementsHidden={false}
                accessibilityActions={[
                    {name: 'activate', label: 'Activate'},
                    {name: 'escape', label: 'Escape'},
                    {name: 'increment', label: 'Increment'},
                    {name: 'decrement', label: 'Decrement'}
                ]}
                title={t('REPORTS_SHEET.SELECT_DATE_RANGE')}
                cancelText={t('COMMON.CANCEL')}
                confirmText={t('COMMON.CONFIRM')}
                open={showCalendar}
                date={new Date(currentTransaction.date)}
                maximumDate={new Date()}
                onConfirm={(date) => {
                    // TODO GET DATE TIME CORRECTLY
                    const timeZonedDate = formatDate(date)
                    // console.log({timeZonedDate, date})
                    timeZonedDate.setHours(5);
                    setShowCalendar(false)
                    dispatch(onChangeDate(timeZonedDate.toISOString()))
                }}
                onCancel={() => {
                    setShowCalendar(false)
                }}
            />
            <CategoriesBottomSheet open={openCategoriesSheet} setOpen={setOpenCategoriesSheet}/>
            {/*<AccountsBottomSheet open={openAccountsSheet} setOpen={setOpenAccountsSheet}/>*/}
            <NotesBottomSheet open={openNotesSheet} setOpen={setOpenNotesSheet}/>
            {
                !isIos &&
                <>
                    <HiddenFlagSheet open={openHiddenMenuSheet} setOpen={setOpenHiddenMenuSheet}
                                     fn={(value => setTab(value))} tab={tab}/>
                    <TransactionsSettingsSheet open={openConfigSheet} setOpen={setOpenConfigSheet}
                                               fn={handleDeleteItem}/>
                    <RecurringSelectorSheet open={openRecurrencySheet} setOpen={setOpenRecurrencySheet}/>
                </>
            }
        </>
    )
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10
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
        flex: 1,
        justifyContent: 'space-between',
        paddingVertical: 10
    },
    categoriesWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        paddingVertical: 10
    }

})
