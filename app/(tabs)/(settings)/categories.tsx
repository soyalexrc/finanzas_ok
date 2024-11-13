import {ScrollView, Text, ToggleGroup, useTheme, View, XStack, YStack} from "tamagui";
import {Alert, Platform, StyleSheet, TouchableOpacity} from "react-native";
import {useHeaderHeight} from "@react-navigation/elements";
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import {
    selectSelectedAccountGlobal,
} from "@/lib/store/features/accounts/accountsSlice";
import {useSQLiteContext} from "expo-sqlite";
import {
    deleteCategory,
    getAllCategories,
    getAmountOfTransactionsByCategoryId,
    getAmountOfTransactionsByCategoryTitle,
    getTotalsOnEveryMonthByYear, getTotalSpentByYear,
    getTransactions,
    getTransactionsGroupedAndFiltered,
    getTransactionsGroupedAndFilteredV2
} from "@/lib/db";
import {Category, TransactionsGroupedByDate} from "@/lib/types/Transaction";
import {useRouter} from "expo-router";
import {changeEmoji} from "@/lib/store/features/ui/uiSlice";
import * as ContextMenu from "zeego/context-menu";
import {
    selectHomeViewTypeFilter,
    updateTransactionsGroupedByDate
} from "@/lib/store/features/transactions/transactionsSlice";
import {
    selectAccountFilter, selectCategoryFilter, selectDateRangeFilter, updateCategoryFilter,
    updateChartPoints,
    updateTransactionsGroupedByCategory
} from "@/lib/store/features/transactions/reportSlice";
import {getCurrentMonth, getCurrentWeek, getCustomMonthAndYear} from "@/lib/helpers/date";
import {
    selectCategories, selectCategory, selectSelectedCategory,
    updateCategoriesList,
    updateCategoryCreateUpdate
} from "@/lib/store/features/categories/categoriesSlice";
import * as Haptics from "expo-haptics";
import React, {useState} from "react";
import OnlyDeleteOptionSheet from "@/lib/components/ui/android-dropdowns-sheets/OnlyDeleteOptionSheet";
import {useTranslation} from "react-i18next";
import {updateTotalByMonth, updateTotalsInYear} from "@/lib/store/features/transactions/filterSlice";

export default function Screen() {
    const db = useSQLiteContext();
    const headerHeight = useHeaderHeight()
    const isIos = Platform.OS === 'ios';
    const categories = useAppSelector(selectCategories);
    const dispatch = useAppDispatch();
    const router = useRouter();
    const theme = useTheme();
    const selectedCategoryForm = useAppSelector(selectSelectedCategory);
    const selectedCategoryFilter = useAppSelector(selectCategoryFilter);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number>(0);
    const [open, setOpen] = useState<boolean>(false);
    const {t} = useTranslation();
    const [categoryType, setCategoryType] = useState<string>('expense')
    const { limit, type, month, year } = useAppSelector(state => state.filter);
    async function onPressCategory(category: Category) {
        await Haptics.selectionAsync();
        dispatch(updateCategoryCreateUpdate(category));
        dispatch(changeEmoji(category.icon))
        router.push('/createEditCategory')
    }

    async function onPressDeleteCategory(categoryId: number) {
        const {start, end} = getCustomMonthAndYear(month.number, year);
        let transactions: TransactionsGroupedByDate[];
        Alert.alert(t('SETTINGS.CATEGORIES.DELETE.TITLE'), t('SETTINGS.CATEGORIES.DELETE.TEXT'), [
            {style: 'default', text: t('COMMON.CANCEL'), isPreferred: true},
            {
                style: 'destructive',
                text: t('COMMON.DELETE'),
                isPreferred: false,
                onPress: async () => {
                    await deleteCategory(db, categoryId);
                    setOpen(false)
                    setSelectedCategoryId(0)
                    dispatch(updateCategoriesList(getAllCategories(db)));

                    if (selectedCategoryForm.id === categoryId) {
                        dispatch(selectCategory(categories[0]))
                    }
                    const totalsOnEveryMonthByYear = getTotalsOnEveryMonthByYear(db, new Date().getFullYear(), type);
                    const totalSpentByYear = getTotalSpentByYear(db, new Date().getFullYear());
                    dispatch(updateTotalByMonth(totalsOnEveryMonthByYear));
                    dispatch(updateTotalsInYear(totalSpentByYear));
                    transactions = await getTransactionsGroupedAndFilteredV2(db, start.toISOString(), end.toISOString(), type === 'expense' ? 'Spent' : 'Revenue');
                    dispatch(updateTransactionsGroupedByDate(transactions));
                    if (selectedCategoryFilter.id === categoryId) {
                        dispatch(updateCategoryFilter({ id: 0, icon: '', type: '', title: '' }))
                        // const {
                        //     amountsGroupedByDate,
                        //     transactionsGroupedByCategory
                        // } = await getTransactions(db, selectedDateRange.start, selectedDateRange.end, selectedAccountFilter.id, 0);
                        // dispatch(updateTransactionsGroupedByCategory(transactionsGroupedByCategory));
                        // dispatch(updateChartPoints(amountsGroupedByDate))
                    } else {
                        // const {
                        //     amountsGroupedByDate,
                        //     transactionsGroupedByCategory
                        // } = await getTransactions(db, selectedDateRange.start, selectedDateRange.end, selectedAccountFilter.id, selectedCategoryFilter.id);
                        // dispatch(updateTransactionsGroupedByCategory(transactionsGroupedByCategory));
                        // dispatch(updateChartPoints(amountsGroupedByDate))
                    }

                }
            }
        ])
    }


    async function handleLongPress(accountId: number) {
        await Haptics.selectionAsync();
        setSelectedCategoryId(accountId);
        setOpen(true);
    }

    return (
        <View flex={1}>
            <View backgroundColor="$color1" paddingHorizontal={10} paddingTop={isIos ? headerHeight + 20 : 20}>
                <ToggleGroup
                    marginBottom={10}
                    value={categoryType}
                    onValueChange={setCategoryType}
                    orientation="horizontal"
                    type="single"
                >
                    <ToggleGroup.Item flex={1} value="expense" aria-label="Categories of type expense filter">
                        <Text>{t('COMMON.EXPENSE')}</Text>
                    </ToggleGroup.Item>
                    <ToggleGroup.Item flex={1} value="income" aria-label="Categories of type income filter">
                        <Text>{t('COMMON.INCOME')}</Text>
                    </ToggleGroup.Item>
                </ToggleGroup>
            </View>
            <ScrollView flex={1} backgroundColor="$color1" showsVerticalScrollIndicator={false}>
                {
                    categories.filter(c => c.type === categoryType).map(category => {
                        if (isIos) {
                            return (
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
                            )
                        } else {
                            return (
                                <TouchableOpacity style={[styles.item, {backgroundColor: theme.color1.val}]}
                                                  key={category.id}
                                                  onPress={() => onPressCategory(category)}
                                                  onLongPress={() => handleLongPress(category.id)}
                                >
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
                                        <YStack>
                                            <Text fontSize={18}>{category.title}</Text>
                                            <Text
                                                color="$gray10Dark">{getAmountOfTransactionsByCategoryTitle(db, category.title)} {t('COMMON.TRANSACTIONS')}</Text>
                                        </YStack>
                                    </View>
                                </TouchableOpacity>                            )
                        }
                    })
                }
                <View height={200} />
            </ScrollView>
            <OnlyDeleteOptionSheet open={open} setOpen={setOpen} fn={() => onPressDeleteCategory(selectedCategoryId)}/>
        </View>

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
