import {Button, Input, Separator, Text, useTheme, View, XStack, YStack} from "tamagui";
import {Alert, TouchableOpacity, useColorScheme} from "react-native";
import {useRouter} from "expo-router";
import {Entypo} from "@expo/vector-icons";
import * as DropdownMenu from 'zeego/dropdown-menu'
import {
    addAccount,
    selectAccountCreateUpdate,
    selectSelectedAccountGlobal,
    updateAccountsList
} from "@/lib/store/features/accounts/accountsSlice";
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import {useEffect, useState} from "react";
import {selectCurrentEmoji} from "@/lib/store/features/ui/uiSlice";
import {getLocales} from "expo-localization";
import {
    createAccount,
    createCategory,
    getAllAccounts,
    getAllCategories,
    getTransactions, getTransactionsGroupedAndFiltered,
    updateAccount,
    updateCategory
} from "@/lib/db";
import {useSQLiteContext} from "expo-sqlite";
import {useUser} from "@clerk/clerk-expo";
import {
    addCategory,
    selectCategoryCreateUpdate, selectSelectedCategory,
    updateCategoriesList
} from "@/lib/store/features/categories/categoriesSlice";
import {
    selectAccountFilter, selectCategoryFilter, selectDateRangeFilter,
    updateChartPoints,
    updateTransactionsGroupedByCategory
} from "@/lib/store/features/transactions/reportSlice";
import {
    selectHomeViewTypeFilter,
    updateTransactionsGroupedByDate
} from "@/lib/store/features/transactions/transactionsSlice";
import {getCurrentMonth, getCurrentWeek} from "@/lib/helpers/date";

export default function Screen() {
    const db = useSQLiteContext();
    const {user} = useUser();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const theme = useTheme();
    const schemeColor = useColorScheme();
    const categoryCreateUpdate = useAppSelector(selectCategoryCreateUpdate);
    const [categoryTitle, setCategoryTitle] = useState<string>('')
    const [categoryType, setCategoryType] = useState<'Expense' | 'Income'>('Expense');
    const currentEmoji = useAppSelector(selectCurrentEmoji);

    const filterType = useAppSelector(selectHomeViewTypeFilter);
    const selectedAccountFilter = useAppSelector(selectAccountFilter);
    const selectedCategoryFilter = useAppSelector(selectCategoryFilter);
    const selectedDateRange = useAppSelector(selectDateRangeFilter);
    const globalAccount = useAppSelector(selectSelectedAccountGlobal);

    // TODO add support for multi currency per account (for example, a savings account in USD, credit card in PEN) with name and icons (coins api), and manage exchange rates from api. Rememeber to make the exchange rate between the coin of the account and the coin of the transaction (this is the global currency selected)

    useEffect(() => {
        setCategoryTitle(categoryCreateUpdate.title)
        setCategoryType(categoryCreateUpdate.type === 'expense' ? 'Expense' : 'Income');
    }, []);

    async function manageCreateAccount() {
        const {start, end} = filterType.date === 'week' ? getCurrentWeek() : getCurrentMonth()

        if (!categoryTitle) return;

        if (categoryCreateUpdate.id) {
            await updateCategory(
                db,
                {
                    id: categoryCreateUpdate.id,
                    title: categoryTitle,
                    icon: currentEmoji,
                    type: categoryType.toLowerCase()
                });
            dispatch(updateCategoriesList(getAllCategories(db)))
            router.back();
        } else {
            const newCategory: any = await createCategory(
                db,
                {
                    title: categoryTitle,
                    icon: currentEmoji,
                    type: categoryType.toLowerCase(),
                },
                user!.id);

            if (newCategory.error) {
                Alert.alert('No se pudo registrar la categoria', newCategory.desc)
            } else {
                dispatch(addCategory(newCategory.data));
                router.back();
            }
        }

        const transactions = await getTransactionsGroupedAndFiltered(db, start.toISOString(), end.toISOString(), filterType.type, globalAccount.id);
        dispatch(updateTransactionsGroupedByDate(transactions));

        const {
            amountsGroupedByDate,
            transactionsGroupedByCategory
        } = await getTransactions(db, selectedDateRange.start, selectedDateRange.end, selectedAccountFilter.id, selectedCategoryFilter.id);
        dispatch(updateTransactionsGroupedByCategory(transactionsGroupedByCategory));
        dispatch(updateChartPoints(amountsGroupedByDate))


    }


    return (
        <>
            <View flex={1} backgroundColor="$color1" p={20}>
                <XStack justifyContent='space-between' alignItems='center' mb={30}>
                    <TouchableOpacity style={{padding: 10, borderRadius: 12}} onPress={() => router.back()}>
                        <Text>Cancel</Text>
                    </TouchableOpacity>
                    <Text fontSize={20}>Category</Text>
                    <Button onPress={manageCreateAccount}>Done</Button>
                </XStack>

                <YStack mb={70}>
                    <Text fontSize={16} mb={4}>Name</Text>
                    <View flex={1} gap={6} position='relative'>
                        <TouchableOpacity onPress={() => router.push('/emojiSelection')} style={{
                            position: 'absolute',
                            top: -5,
                            zIndex: 11,
                            left: 5,
                            padding: 10,
                            borderRightWidth: 1,
                            borderStyle: 'solid',
                            borderColor: theme.color1.val
                        }}>
                            <Text fontSize={25}>{currentEmoji ?? '✅'}</Text>
                        </TouchableOpacity>
                        <Input size="$4" value={categoryTitle} onChangeText={setCategoryTitle} paddingLeft={60}
                               placeholder="New Category"/>
                    </View>
                </YStack>


                <YStack mb={70}>
                    <Text fontSize={16} mb={4}>Type</Text>
                    <DropdownMenu.Root key="type">
                        <DropdownMenu.Trigger>
                            <TouchableOpacity style={{
                                backgroundColor: theme.color2.val,
                                height: 50,
                                paddingHorizontal: 20,
                                borderRadius: 8,
                                flexDirection: 'row',
                                alignItems: 'center',
                                borderWidth: 1,
                                borderStyle: 'solid',
                                borderColor: theme.color5.val,
                                justifyContent: 'space-between'
                            }}>
                                <Text>{categoryType ?? 'Select Category Type'}</Text>
                                <Entypo name="select-arrows" size={18}
                                        color={schemeColor === 'light' ? 'black' : 'white'}/>
                            </TouchableOpacity>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content loop={false} alignOffset={0} sideOffset={0} side={0} align={0}
                                              collisionPadding={0}
                                              avoidCollisions={true}>
                            <DropdownMenu.Item key="exoense" onSelect={() => setCategoryType('Expense')}>
                                <DropdownMenu.ItemTitle>Expense</DropdownMenu.ItemTitle>
                            </DropdownMenu.Item>
                            <DropdownMenu.Item key="income" onSelect={() => setCategoryType('Income')}>
                                <DropdownMenu.ItemTitle>Income</DropdownMenu.ItemTitle>
                            </DropdownMenu.Item>
                        </DropdownMenu.Content>
                    </DropdownMenu.Root>
                </YStack>

            </View>
            {/*<EmojiSelectionSheet open={openEmojisSheet} setOpen={setOpenEmojisSheet} onSelectEmoji={onEmojiSelected} />*/}
        </>
    )
}
