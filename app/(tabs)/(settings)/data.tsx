import {ListItem, ScrollView, Separator, YGroup} from "tamagui";
import React from "react";
import {Alert, Platform} from "react-native";
import {useHeaderHeight} from "@react-navigation/elements";
import {useSQLiteContext} from "expo-sqlite";
import {
    getAllAccounts,
    getAllCategories,
    getAllTransactions, getSettings, getSettingsRaw,
    getTransactions, getTransactionsGroupedAndFiltered, getTransactionsGroupedAndFilteredV2, importSheetToDB,
    wipeData
} from "@/lib/db";
import {useTranslation} from "react-i18next";
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import {
    resetFilters,
    selectCategoryFilter,
    selectDateRangeFilter,
    updateAccountFilter,
    updateChartPoints,
    updateTransactionsGroupedByCategory,
} from "@/lib/store/features/transactions/reportSlice";
import {
    resetTransactionsSlice, selectHomeViewTypeFilter, updateTransactionsGroupedByDate,
} from "@/lib/store/features/transactions/transactionsSlice";
import {exportXSLX, readXlsxFile} from "@/lib/helpers/data";
import {
    resetCategoriesSlice,
    selectCategory,
    updateCategoriesList
} from "@/lib/store/features/categories/categoriesSlice";
import {
    resetAccountsSlice,
    selectSelectedAccountGlobal,
    updateAccountsList
} from "@/lib/store/features/accounts/accountsSlice";
import {getCurrentMonth, getCurrentWeek} from "@/lib/helpers/date";

export default function Screen() {
    const db = useSQLiteContext()
    const isIos = Platform.OS === 'ios';
    const headerHeight = useHeaderHeight();
    const {t} = useTranslation();
    const dispatch = useAppDispatch();
    const selectedDateRange = useAppSelector(selectDateRangeFilter);
    const selectedCategoryFilter = useAppSelector(selectCategoryFilter);
    const selectedAccount = useAppSelector(selectSelectedAccountGlobal);
    const filterType = useAppSelector(selectHomeViewTypeFilter)

    function handleWipeData() {
        Alert.alert(t('COMMON.WARNING'), t('SETTINGS.DATA_MANAGEMENT.OPTIONS.POPUP_MESSAGE'), [
            {style: 'default', text: t('COMMON.CANCEL'), isPreferred: true},
            {
                style: 'destructive',
                text: t('COMMON.ACCEPT'),
                onPress: async () => {
                    await wipeData(db);
                    dispatch(resetFilters());
                    dispatch(resetTransactionsSlice());
                    dispatch(resetCategoriesSlice())
                    dispatch(resetAccountsSlice())
                    Alert.alert(t('COMMON.DONE'), 'Se ha eliminado toda la información de la aplicación')
                }
            }
        ])
    }

    async function handleExportDataToSheet() {
        const transactions = await getAllTransactions(db);
        const categories = getAllCategories(db);
        const accounts = getAllAccounts(db);
        const settings = getSettingsRaw(db);
        await exportXSLX(transactions, settings, categories, accounts, 'Finanzas ok - Backup')
    }

    async function handleImportDataFromSheet() {
        const data = await readXlsxFile();
        const keys = Object.keys(data);

        // validate that in te keys exists the transactions, categories, accounts and settings keys
        if (!keys.includes('transactions') || !keys.includes('categories') || !keys.includes('accounts') || !keys.includes('settings')) {
            Alert.alert(t('COMMON.ERROR'), 'No se ha podido importar la información, por favor verifica que el archivo tenga las hojas necesarias');
            return;
        }

        //  Validar existencia de data antes de importar
        if (!data) {
            Alert.alert(t('COMMON.ERROR'), 'No se ha podido importar la información');
            return;
        }

        await importSheetToDB(db, data.transactions, data.accounts, data.categories, data.settings);
        dispatch(resetFilters());
        dispatch(resetTransactionsSlice());
        dispatch(resetCategoriesSlice())
        dispatch(resetAccountsSlice())

        const accounts = getAllAccounts(db);
        const categories = getAllCategories(db);
        const {start, end} = getCurrentMonth();
        // const {
        //     amountsGroupedByDate,
        //     transactionsGroupedByCategory
        // } = await getTransactions(db, selectedDateRange.start, selectedDateRange.end, accounts[0]?.id, selectedCategoryFilter?.id);
        const transactions = await getTransactionsGroupedAndFilteredV2(db, start.toISOString(), end.toISOString(), filterType.type);
        dispatch(updateAccountsList(accounts))
        dispatch(updateCategoriesList(categories));

        dispatch(selectCategory(categories[0]));
        dispatch(updateTransactionsGroupedByDate(transactions));
        // dispatch(updateTransactionsGroupedByCategory(transactionsGroupedByCategory));
        // dispatch(updateChartPoints(amountsGroupedByDate))
        dispatch(updateAccountFilter(accounts[0]));

        Alert.alert(t('COMMON.DONE'), 'Se ha importado la información correctamente')
    }

    return (
        <ScrollView flex={1} backgroundColor="$color1" showsVerticalScrollIndicator={false}
                    paddingTop={isIos ? headerHeight + 20 : 20}>
            <YGroup alignSelf="center" bordered marginHorizontal={16} marginBottom={40}
                    separator={<Separator/>}>
                <YGroup.Item>
                    <ListItem
                        hoverTheme
                        pressTheme
                        disabled
                        title={t('SETTINGS.DATA_MANAGEMENT.OPTIONS.BACKUP')}
                    />
                </YGroup.Item>
                <YGroup.Item>
                    <ListItem
                        hoverTheme
                        pressTheme
                        disabled
                        title={t('SETTINGS.DATA_MANAGEMENT.OPTIONS.FORCE_PULL_SYNC')}
                    />
                </YGroup.Item>
                <YGroup.Item>
                    <ListItem
                        hoverTheme
                        pressTheme
                        onPress={handleImportDataFromSheet}
                        title={t('SETTINGS.DATA_MANAGEMENT.OPTIONS.IMPORT')}
                    />
                </YGroup.Item>
                <YGroup.Item>
                    <ListItem
                        hoverTheme
                        pressTheme
                        onPress={handleExportDataToSheet}
                        title={t('SETTINGS.DATA_MANAGEMENT.OPTIONS.EXPORT')}
                    />
                </YGroup.Item>
            </YGroup>
            <YGroup alignSelf="center" bordered marginHorizontal={16} marginBottom={40}
                    separator={<Separator/>}>
                <YGroup.Item>
                    <ListItem
                        hoverTheme
                        pressTheme
                        onPress={handleWipeData}
                        title={t('SETTINGS.DATA_MANAGEMENT.OPTIONS.WIPE')}
                    />
                </YGroup.Item>
            </YGroup>
        </ScrollView>
    )
}
