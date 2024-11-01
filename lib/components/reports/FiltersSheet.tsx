import {useState} from "react";
import {Button, Sheet, Text, useTheme, View, XStack, YStack} from "tamagui";
import {FlatList, Platform, StyleSheet, TouchableOpacity} from "react-native";
import {textShortener} from "@/lib/helpers/string";
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import {
    selectCategories,
} from "@/lib/store/features/categories/categoriesSlice";
import {selectAccounts} from "@/lib/store/features/accounts/accountsSlice";
import DatePicker from "react-native-date-picker";
import {formatDate} from "@/lib/helpers/date";
import {
    selectAccountFilter,
    selectCategoryFilter,
    selectDateRangeFilter,
    updateAccountFilter,
    updateCategoryFilter, updateChartPoints,
    updateDateRangeFilter,
    updateTransactionsGroupedByCategory
} from "@/lib/store/features/transactions/reportSlice";
import {format} from "date-fns";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {getTransactions} from "@/lib/db";
import {useSQLiteContext} from "expo-sqlite";
import {Account, Category} from "@/lib/types/Transaction";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import {useTranslation} from "react-i18next";
import {selectSettings} from "@/lib/store/features/settings/settingsSlice";
import * as Haptics from "expo-haptics";

type Props = {
    open: boolean;
    setOpen: (value: boolean) => void;
    updatePresetDays: () => void;
}

export default function ReportsSheet({open, setOpen, updatePresetDays}: Props) {
    const db = useSQLiteContext();
    const [position, setPosition] = useState(0);
    const dispatch = useAppDispatch()
    const accounts = useAppSelector(selectAccounts);
    const categories = useAppSelector(selectCategories);
    const theme = useTheme();
    const isIos = Platform.OS === "ios";
    const selectedCategory = useAppSelector(selectCategoryFilter);
    const selectedAccount = useAppSelector(selectAccountFilter);
    const selectedDateRange = useAppSelector(selectDateRangeFilter);
    const [showDateFromCalendar, setShowDateFromCalendar] = useState<boolean>(false);
    const [showDateToCalendar, setShowDateToCalendar] = useState<boolean>(false);
    const {t} = useTranslation()
    const {selectedLanguage} = useAppSelector(selectSettings)

    const [localCategory, setLocalCategory] = useState<Category>(selectedCategory);
    const [localAccount, setLocalAccount] = useState<Account>(selectedAccount);
    const insets = useSafeAreaInsets();

    async function applyFilters() {
        await Haptics.selectionAsync();
        dispatch(updateCategoryFilter(localCategory))
        dispatch(updateAccountFilter(localAccount))
        const {
            amountsGroupedByDate,
            transactionsGroupedByCategory
        } = await getTransactions(db, selectedDateRange.start, selectedDateRange.end, localAccount.id, localCategory.id);
        dispatch(updateTransactionsGroupedByCategory(transactionsGroupedByCategory));
        dispatch(updateChartPoints(amountsGroupedByDate))

        updatePresetDays();
        setOpen(false);
    }

    async function clearCategory() {
        await Haptics.selectionAsync();
        dispatch(updateCategoryFilter({id: 0, title: '', icon: '', type: ''}));
        setLocalCategory({id: 0, title: '', icon: '', type: ''});
    }

    async function clearAccount() {
        await Haptics.selectionAsync()
        // dispatch(updateAccountFilter({ title: '', currency_symbol: '', currency_code: '', id: 0, icon: '', balance: 0, positive_state: 1}));
        // setLocalAccount({ title: '', currency_symbol: '', currency_code: '', id: 0, icon: '', balance: 0, positive_state: 1});
    }

    async function handleTouchLocalCategory(item: Category) {
        await Haptics.selectionAsync()
        setLocalCategory(item);
    }

    async function handleTouchLocalAccount(item: Account) {
        await Haptics.selectionAsync()
        setLocalAccount(item);
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
            snapPoints={[90]}
            snapPointsMode='percent'
            dismissOnSnapToBottom
            zIndex={100_000}
            animation="medium"
        >
            <Sheet.Overlay
                animation="lazy"
                enterStyle={{opacity: 0}}
                exitStyle={{opacity: 0}}
            />

            <Sheet.Frame borderTopLeftRadius={12} borderTopRightRadius={12} backgroundColor="$color1">
                <YStack gap={20}>
                    <Text textAlign="center" marginVertical={15} fontSize={16} fontWeight="bold"
                          color="$gray10Dark">{t('REPORTS_SHEET.SELECT_DATE_RANGE')}s</Text>

                    <XStack gap={20} paddingHorizontal={20}>
                        <YStack flex={1}>
                            <Text textAlign="center" mb={5}>{t('REPORTS_SHEET.DATE_FROM')}</Text>
                            <Button variant="outlined"
                                    onPress={() => setShowDateFromCalendar(true)}>{selectedDateRange.start ? format(selectedDateRange.start, 'dd/MM/yyyy') : 'DD/MM/YYYY'}</Button>
                        </YStack>
                        <YStack flex={1}>
                            <Text textAlign="center" mb={5}>{t('REPORTS_SHEET.DATE_TO')}</Text>
                            <Button variant="outlined" disabled={selectedDateRange.start === ''}
                                    onPress={() => setShowDateToCalendar(true)}>{selectedDateRange.end ? format(selectedDateRange.end, 'dd/MM/yyyy') : 'DD/MM/YYYY'}</Button>
                        </YStack>
                    </XStack>
                </YStack>

                <YStack marginVertical={45}>
                    <XStack justifyContent="space-between">
                        <Text mx={30} fontSize={16} fontWeight="bold"
                              color="$gray10Dark">{t('REPORTS_SHEET.SELECT_CATEGORY')}</Text>
                        <TouchableOpacity
                            accessible={true} accessibilityLabel={`Clear category selection`} accessibilityHint="This will make the filter category empty and filter by all categories"
                            style={{
                            borderStyle: 'solid',
                            borderWidth: 1,
                            borderColor: theme.red10Dark.val,
                            borderRadius: 20,
                            paddingVertical: 4,
                            paddingHorizontal: 8,
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginRight: 30
                        }} onPress={clearCategory}>
                            <MaterialIcons name="clear" size={16} color={theme.red10Dark.val}/>
                            <Text fontSize={12} color={theme.red10Dark.val}>{t('REPORTS_SHEET.CLEAR')}</Text>
                        </TouchableOpacity>
                    </XStack>
                    <Text mt={5} mx={30} fontSize={12} fontWeight="bold"   accessibilityLabel="Current category"
                          accessibilityHint="This is empty by default, select one to filter by that cateogry"
                          color="$gray10Dark">{localCategory.icon} {localCategory.title}</Text>
                    <FlatList
                        estimatedItemSize={200}
                        data={categories}
                        contentContainerStyle={{paddingHorizontal: 20}}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({item}) => (
                            <TouchableOpacity style={styles.item} onPress={() => handleTouchLocalCategory(item)}>
                                <Text style={{fontSize: isIos ? 50 : 40}}>{item.icon}</Text>
                                <Text>{textShortener(item.title, 15)}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </YStack>


                <YStack>
                    <XStack justifyContent="space-between">
                        <Text mx={30} fontSize={16} fontWeight="bold"
                              color="$gray10Dark">{t('REPORTS_SHEET.SELECT_ACCOUNT')}</Text>
                        <TouchableOpacity
                            accessible={true} accessibilityLabel={`Clear account selection`} accessibilityHint="This will make the filter account empty and filter by all accounts. is not available yet."
                            style={{
                            borderStyle: 'solid',
                            borderWidth: 1,
                            borderColor: theme.red10Dark.val,
                            borderRadius: 20,
                            paddingVertical: 4,
                            paddingHorizontal: 8,
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginRight: 30
                        }} onPress={clearAccount}>
                            <MaterialIcons name="clear" size={16} color={theme.red10Dark.val}/>
                            <Text fontSize={12} color={theme.red10Dark.val}>{t('REPORTS_SHEET.CLEAR')}</Text>
                        </TouchableOpacity>
                    </XStack>
                    <Text mt={5} mx={30} fontSize={12} fontWeight="bold"
                          color="$gray10Dark">{localAccount?.icon} {localAccount?.title}</Text>
                    <FlatList
                        data={accounts}
                        contentContainerStyle={{paddingHorizontal: 20}}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({item}) => (
                            <TouchableOpacity style={styles.item} onPress={() => handleTouchLocalAccount(item)}>
                                <Text style={{fontSize: isIos ? 50 : 40}}>{item.icon}</Text>
                                <Text>{textShortener(item.title, 15)}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </YStack>

                <View bottom={0} left={0} width="100%" mb={isIos ? insets.bottom + 50: insets.bottom + 20} position='absolute'>
                    <Button mx={10} onPress={applyFilters}>{t('REPORTS_SHEET.APPLY_FILTERS')}</Button>
                </View>

                <DatePicker
                    modal
                    mode="date"
                    locale={selectedLanguage}
                    accessible={true}
                    accessibilityLabel="Date selector"
                    accessibilityHint="Select a Date to filter from"
                    accessibilityLanguage={selectedLanguage}
                    title={t('REPORTS_SHEET.SELECT_DATE_RANGE')}
                    cancelText={t('COMMON.CANCEL')}
                    confirmText={t('COMMON.CONFIRM')}
                    open={showDateFromCalendar}
                    date={selectedDateRange.start ? formatDate(selectedDateRange.start) : new Date()}
                    maximumDate={new Date()}
                    onConfirm={(date) => {
                        const timeZonedDate = formatDate(date)
                        timeZonedDate.setHours(0);
                        setShowDateFromCalendar(false)
                        dispatch(updateDateRangeFilter({type: 'start', value: timeZonedDate.toISOString()}))
                    }}
                    onCancel={() => {
                        setShowDateFromCalendar(false)
                    }}
                />

                <DatePicker
                    modal
                    mode="date"
                    locale={selectedLanguage}
                    accessible={true}
                    accessibilityLabel="Date selector"
                    accessibilityHint="Select a Date to filter to"
                    accessibilityLanguage={selectedLanguage}
                    title={t('REPORTS_SHEET.SELECT_DATE_RANGE')}
                    cancelText={t('COMMON.CANCEL')}
                    confirmText={t('COMMON.CONFIRM')}
                    open={showDateToCalendar}
                    date={selectedDateRange.end ? formatDate(selectedDateRange.end) : new Date()}
                    minimumDate={new Date(selectedDateRange.start)}
                    maximumDate={new Date()}
                    onConfirm={(date) => {
                        const timeZonedDate = formatDate(date)
                        timeZonedDate.setHours(19);
                        setShowDateToCalendar(false)
                        dispatch(updateDateRangeFilter({type: 'end', value: timeZonedDate.toISOString()}))
                    }}
                    onCancel={() => {
                        setShowDateToCalendar(false)
                    }}
                />
            </Sheet.Frame>
        </Sheet>
    )
}

const styles = StyleSheet.create({
    item: {
        justifyContent: 'center',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
    }
})
