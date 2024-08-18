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
    deleteAccount, deleteCategory,
    getAllAccounts, getAllCategories,
    getAmountOfTransactionsByAccountId, getTransactions,
    getTransactionsGroupedAndFiltered
} from "@/lib/db";
import {Account, Category, TransactionsGroupedByDate} from "@/lib/types/Transaction";
import {useRouter} from "expo-router";
import {changeEmoji} from "@/lib/store/features/ui/uiSlice";
import * as ContextMenu from "zeego/context-menu";
import {
    selectHomeViewTypeFilter,
    updateTransactionsGroupedByDate
} from "@/lib/store/features/transactions/transactionsSlice";
import {
    selectAccountFilter, selectCategoryFilter, selectDateRangeFilter, updateAccountFilter, updateCategoryFilter,
    updateChartPoints,
    updateTransactionsGroupedByCategory
} from "@/lib/store/features/transactions/reportSlice";
import {getCurrentMonth, getCurrentWeek} from "@/lib/helpers/date";
import {
    selectCategories, selectCategory, selectSelectedCategory,
    updateCategoriesList,
    updateCategoryCreateUpdate
} from "@/lib/store/features/categories/categoriesSlice";

export default function Screen() {
    const db = useSQLiteContext();
    const headerHeight = useHeaderHeight()
    const isIos = Platform.OS === 'ios';
    const categories = useAppSelector(selectCategories);
    const dispatch = useAppDispatch();
    const router = useRouter();
    const theme = useTheme();
    const filterType = useAppSelector(selectHomeViewTypeFilter);
    const selectedAccountFilter = useAppSelector(selectAccountFilter);
    const selectedCategoryForm = useAppSelector(selectSelectedCategory);
    const selectedCategoryFilter = useAppSelector(selectCategoryFilter);
    const selectedDateRange = useAppSelector(selectDateRangeFilter);
    const globalAccount = useAppSelector(selectSelectedAccountGlobal);


    function onPressCategory(category: Category) {
        dispatch(updateCategoryCreateUpdate(category));
        dispatch(changeEmoji(category.icon))
        router.push('/createEditCategory')
    }

    async function onPressDeleteCategory(categoryId: number) {
        const {start, end} = filterType.date === 'week' ? getCurrentWeek() : getCurrentMonth()
        let transactions: TransactionsGroupedByDate[];
        Alert.alert('Are you sure you want to delete this category?', 'The associated transactions to this category will be deleted. This action cannot be undone.', [
            {style: 'default', text: 'Cancel', isPreferred: true},
            {
                style: 'destructive',
                text: 'Delete',
                isPreferred: false,
                onPress: async () => {
                    await deleteCategory(db, categoryId);
                    dispatch(updateCategoriesList(getAllCategories(db)));

                    if (selectedCategoryForm.id === categoryId) {
                        dispatch(selectCategory(categories[0]))
                    }

                    transactions = await getTransactionsGroupedAndFiltered(db, start.toISOString(), end.toISOString(), filterType.type, globalAccount.id);
                    dispatch(updateTransactionsGroupedByDate(transactions));
                    if (selectedCategoryFilter.id === categoryId) {
                        dispatch(updateCategoryFilter({ id: 0, icon: '', type: '', title: '' }))
                        const {
                            amountsGroupedByDate,
                            transactionsGroupedByCategory
                        } = await getTransactions(db, selectedDateRange.start, selectedDateRange.end, selectedAccountFilter.id, 0);
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
                categories.map(category => (
                    <ContextMenu.Root key={category.id}>
                        <ContextMenu.Trigger>
                            <TouchableOpacity style={[styles.item, {backgroundColor: theme.color1.val}]}
                                              key={category.id}
                                              onPress={() => onPressCategory(category)}>
                                <Text fontSize={30}>{category.icon}</Text>
                                <View
                                    flex={1}
                                    flexDirection='row'
                                    alignItems='center'
                                    justifyContent='space-between'
                                    borderBottomWidth={1}
                                    py={15}
                                    borderColor='$color2'
                                >
                                    <Text fontSize={18}>{category.title}</Text>
                                </View>
                            </TouchableOpacity>
                        </ContextMenu.Trigger>
                        <ContextMenu.Content loop={false} alignOffset={0} collisionPadding={0}
                                             avoidCollisions={true}>
                            <ContextMenu.Item key='delete' destructive
                                              onSelect={() => onPressDeleteCategory(category.id)}>
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
