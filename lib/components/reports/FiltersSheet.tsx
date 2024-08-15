import {useState} from "react";
import {Button, Sheet, Text, TextArea, View, XStack, YStack} from "tamagui";
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

type Props = {
    open: boolean;
    setOpen: (value: boolean) => void;
}

export default function ReportsSheet({open, setOpen}: Props) {
    const db = useSQLiteContext();
    const [position, setPosition] = useState(0);
    const dispatch = useAppDispatch()
    const accounts = useAppSelector(selectAccounts);
    const categories = useAppSelector(selectCategories);
    const selectedCategory = useAppSelector(selectCategoryFilter);
    const selectedAccount = useAppSelector(selectAccountFilter);
    const selectedDateRange = useAppSelector(selectDateRangeFilter);
    const [showDateFromCalendar, setShowDateFromCalendar] = useState<boolean>(false);
    const [showDateToCalendar, setShowDateToCalendar] = useState<boolean>(false);
    const insets = useSafeAreaInsets();

    const isIos = Platform.OS === 'ios';

    async function applyFilters() {
        const {amountsGroupedByDate, transactionsGroupedByCategory} = await getTransactions(db, selectedDateRange.start, selectedDateRange.end, selectedAccount.id, selectedCategory.id);
        dispatch(updateTransactionsGroupedByCategory(transactionsGroupedByCategory));
        dispatch(updateChartPoints(amountsGroupedByDate))
        setOpen(false);
    }

    function onPressCategory(category: Category) {
        if (selectedCategory.id === category.id) {
            dispatch(updateCategoryFilter({id: 0, icon: '', title: '', type: ''}))
        } else {
            dispatch(updateCategoryFilter(category))
        }
    }

    function onPressAccount(account: Account) {
        if (selectedAccount.id === account.id) {
            dispatch(updateAccountFilter({id: 0, icon: '', title: '', balance: 0, positive_status: 0}))
        } else {
            dispatch(updateAccountFilter(account))
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
                   <Text textAlign="center" marginVertical={15} fontSize={16} fontWeight="bold" color="$gray10Dark">Select
                       Date Range</Text>

                   <XStack gap={20} paddingHorizontal={20}>
                       <YStack flex={1}>
                           <Text textAlign="center" mb={5}>Date from</Text>
                           <Button onPress={() => setShowDateFromCalendar(true)}>{selectedDateRange.start ? format(selectedDateRange.start, 'dd/MM/yyyy') : 'DD/MM/YYYY'}</Button>
                       </YStack>
                       <YStack flex={1}>
                           <Text textAlign="center" mb={5}>Date to</Text>
                           <Button disabled={selectedDateRange.start === ''} onPress={() => setShowDateToCalendar(true)}>{selectedDateRange.end ? format(selectedDateRange.end, 'dd/MM/yyyy') : 'DD/MM/YYYY'}</Button>
                       </YStack>
                   </XStack>
               </YStack>

                <YStack marginVertical={45} gap={20}>
                    <Text textAlign="center" fontSize={16} fontWeight="bold" color="$gray10Dark">Select Category</Text>
                    <FlatList
                        data={categories}
                        contentContainerStyle={{paddingHorizontal: 20, gap: 10}}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({item}) => (
                            <TouchableOpacity key={item.id} style={[styles.item, selectedCategory.id === item.id && styles.selectedItem]} onPress={() => onPressCategory(item)}>
                                <Text style={{fontSize: 50}}>{item.icon}</Text>
                                <Text>{textShortener(item.title, 15)}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </YStack>

                <YStack gap={20}>
                    <Text textAlign="center" fontSize={16} fontWeight="bold" color="$gray10Dark">Select Account</Text>
                    <FlatList
                        data={accounts}
                        contentContainerStyle={{paddingHorizontal: 20, gap: 10}}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({item}) => (
                            <TouchableOpacity key={item.id} style={[styles.item, selectedAccount.id === item.id && styles.selectedItem]} onPress={() => onPressAccount(item)}>
                                <Text style={{fontSize: 50}}>{item.icon}</Text>
                                <Text>{textShortener(item.title, 15)}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </YStack>

               <View bottom={0} left={0} width="100%" mb={insets.bottom} position='absolute'  >
                   <Button mx={10} onPress={applyFilters}>Apply filters</Button>
               </View>

                <DatePicker
                    modal
                    mode="date"
                    open={showDateFromCalendar}
                    date={new Date()}
                    maximumDate={new Date()}
                    onConfirm={(date) => {
                        const timeZonedDate = formatDate(date)
                        setShowDateFromCalendar(false)
                        dispatch(updateDateRangeFilter({ type: 'start', value: timeZonedDate.toISOString() }))
                    }}
                    onCancel={() => {
                        setShowDateFromCalendar(false)
                    }}
                />

                <DatePicker
                    modal
                    mode="date"
                    open={showDateToCalendar}
                    date={new Date()}
                    minimumDate={new Date(selectedDateRange.start)}
                    maximumDate={new Date()}
                    onConfirm={(date) => {
                        const timeZonedDate = formatDate(date)
                        setShowDateToCalendar(false)
                        dispatch(updateDateRangeFilter({ type: 'end', value: timeZonedDate.toISOString() }))
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
        alignItems: 'center'
    },
    selectedItem: {
        borderWidth: 2,
        borderColor: 'lightgray',
        borderStyle: 'solid'
    }
})
