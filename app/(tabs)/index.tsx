import React, {useEffect} from "react";
import {Platform, StyleSheet, useColorScheme} from "react-native";
import {Button, useThemeName, View, ScrollView} from 'tamagui';
import {Feather} from "@expo/vector-icons";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {useRouter} from "expo-router";
import {
    resetCurrentTransaction,
    selectHomeViewTypeFilter,
    updateTransactionsGroupedByDate
} from "@/lib/store/features/transactions/transactionsSlice";
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import CustomHeader from "@/lib/components/ui/CustomHeader";
import ResumeDropDown from "@/lib/components/home/ResumeDropDown";
import HomeResumeItems from "@/lib/components/home/HomeResumeItems";
import AccountSelectDropdown from "@/lib/components/ui/AccountSelectDropdown";
import {selectSelectedAccountGlobal, updateAccountsList} from "@/lib/store/features/accounts/accountsSlice";
import {useSQLiteContext} from "expo-sqlite";
import {getCurrentWeek, getDateRangeBetweenGapDaysAndToday} from "@/lib/helpers/date";
import {getAllAccounts, getAllCategories, getTransactions, getTransactionsGroupedAndFiltered} from "@/lib/db";
import {selectCategory, updateCategoriesList} from "@/lib/store/features/categories/categoriesSlice";
import {
    selectAccountFilter, selectCategoryFilter,
    selectDateRangeFilter, updateAccountFilter, updateCategoryFilter,
    updateChartPoints,
    updateTransactionsGroupedByCategory
} from "@/lib/store/features/transactions/reportSlice";
import {useAuth} from "@clerk/clerk-expo";


export default function HomeScreen() {
    const { signOut } = useAuth();
    const router = useRouter();
    const schemeColor = useColorScheme()
    const isIos = Platform.OS === 'ios';
    const dispatch = useAppDispatch();
    const insets = useSafeAreaInsets();
    const selectedDateRange = useAppSelector(selectDateRangeFilter);
    const selectedAccountFilter = useAppSelector(selectAccountFilter);
    const selectedCategoryFilter = useAppSelector(selectCategoryFilter);
    const selectedAccount = useAppSelector(selectSelectedAccountGlobal);
    const filterType = useAppSelector(selectHomeViewTypeFilter)
    const db = useSQLiteContext();

    async function updateStore() {
        try {
            const accounts = getAllAccounts(db);
            const categories = getAllCategories(db);
            const {start, end} = getCurrentWeek();
            const {amountsGroupedByDate, transactionsGroupedByCategory} = await getTransactions(db, selectedDateRange.start, selectedDateRange.end, accounts[0].id, selectedCategoryFilter.id);
            const transactions = await getTransactionsGroupedAndFiltered(db, start.toISOString(), end.toISOString(), filterType.type, selectedAccount.id);
            dispatch(updateAccountsList(accounts))
            dispatch(updateCategoriesList(categories));
            dispatch(selectCategory(categories[0]));

            dispatch(updateTransactionsGroupedByDate(transactions));
            dispatch(updateTransactionsGroupedByCategory(transactionsGroupedByCategory));
            dispatch(updateChartPoints(amountsGroupedByDate))
            dispatch(updateAccountFilter(accounts[0]));
        } catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        updateStore();
    }, []);

    function onPressNewTransaction() {
        dispatch(resetCurrentTransaction());
        router.push('/transactionCreateUpdate');
    }

    return (
        <View flex={1} backgroundColor="$color1">
            <CustomHeader style={{paddingTop: insets.top}}>
                <AccountSelectDropdown/>
                <Button onPress={onPressNewTransaction} size="$2" borderRadius="$12">
                    <Feather name="plus" size={20} color={schemeColor === 'light' ? 'black' : 'white'}/>
                </Button>
            </CustomHeader>
            <ScrollView showsVerticalScrollIndicator={false} paddingTop={isIos ? insets.top + 50 : 0}>
                <ResumeDropDown/>
                {/*<Button onPress={() => signOut()}>Sign out</Button>*/}
                {/*    Lista de items por semana, mes y cada dia como separator con el total*/}
                <HomeResumeItems/>
                <View style={{height: 200}}/>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    createButton: {
        borderRadius: 100,
        padding: 3
    }
})

