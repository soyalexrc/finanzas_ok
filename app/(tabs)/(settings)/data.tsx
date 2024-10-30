import {Button, Image, ListItem, ScrollView, Separator, Text, View, YGroup} from "tamagui";
import React from "react";
import {Alert, Platform} from "react-native";
import {useHeaderHeight} from "@react-navigation/elements";
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from "expo-document-picker";
import * as Sharing from "expo-sharing";
import {openDatabaseAsync, openDatabaseSync, useSQLiteContext} from "expo-sqlite";
import {
    getAllAccounts,
    getAllCategories,
    getTransactions,
    getTransactionsGroupedAndFiltered,
    migrateDbIfNeeded,
    wipeData
} from "@/lib/db";
import {Ionicons} from "@expo/vector-icons";
import {useTranslation} from "react-i18next";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Entypo from "@expo/vector-icons/Entypo";
import {useRouter} from "expo-router";
import {getCurrentWeek} from "@/lib/helpers/date";
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import {
    resetFilters,
    selectCategoryFilter,
    selectDateRangeFilter, updateAccountFilter, updateChartPoints,
    updateTransactionsGroupedByCategory
} from "@/lib/store/features/transactions/reportSlice";
import {
    resetTransactionsSlice,
    selectHomeViewTypeFilter,
    updateTransactionsGroupedByDate
} from "@/lib/store/features/transactions/transactionsSlice";
import {
    resetAccountsSlice,
    selectSelectedAccountGlobal,
    updateAccountsList
} from "@/lib/store/features/accounts/accountsSlice";
import {
    resetCategoriesSlice,
    selectCategory,
    updateCategoriesList
} from "@/lib/store/features/categories/categoriesSlice";

export default function Screen() {
    const db = useSQLiteContext()
    const isIos = Platform.OS === 'ios';
    const headerHeight = useHeaderHeight();
    const {t} = useTranslation();
    const selectedDateRange = useAppSelector(selectDateRangeFilter);
    const selectedCategoryFilter = useAppSelector(selectCategoryFilter);
    const filterType = useAppSelector(selectHomeViewTypeFilter)
    const selectedAccount = useAppSelector(selectSelectedAccountGlobal);
    const dispatch = useAppDispatch();

    function handleWipeData() {
        Alert.alert(t('COMMON.WARNING'), t('SETTINGS.DATA_MANAGEMENT.OPTIONS.POPUP_MESSAGE'), [
            {style: 'default', text: t('COMMON.CANCEL'), isPreferred: true},
            {
                style: 'destructive',
                text: t('COMMON.ACCEPT'),
                onPress: async () => {
                    await wipeData(db);
                    dispatch(resetAccountsSlice());
                    dispatch(resetFilters());
                    dispatch(resetTransactionsSlice());
                }
            }
        ])
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
                        disabled
                        title={t('SETTINGS.DATA_MANAGEMENT.OPTIONS.IMPORT')}
                    />
                </YGroup.Item>
                <YGroup.Item>
                    <ListItem
                        hoverTheme
                        pressTheme
                        disabled
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
