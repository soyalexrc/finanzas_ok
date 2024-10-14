import * as DropdownMenu from "zeego/dropdown-menu";
import {Alert, StyleSheet, Text, TouchableOpacity, useColorScheme, View} from "react-native";
import {Entypo, MaterialCommunityIcons} from "@expo/vector-icons";
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import {
    onChangeHiddenAmount,
    onRecurrentSettingChange,
    removeTransactionFromHomeList,
    selectCurrentTransaction,
    selectHomeViewTypeFilter,
    selectTransactionsGroupedByDate,
    updateHiddenFlag,
    updateTransactionsGroupedByDate
} from "@/lib/store/features/transactions/transactionsSlice";
import * as ContextMenu from "zeego/context-menu";
import {getCurrentMonth, getCurrentWeek} from "@/lib/helpers/date";
import {deleteTransaction, getAllAccounts, getTransactions, getTransactionsGroupedAndFiltered} from "@/lib/db";
import {selectSelectedAccountGlobal, updateAccountsList} from "@/lib/store/features/accounts/accountsSlice";
import {
    selectAccountFilter,
    selectCategoryFilter,
    selectDateRangeFilter,
    updateChartPoints,
    updateTransactionsGroupedByCategory
} from "@/lib/store/features/transactions/reportSlice";
import {useSQLiteContext} from "expo-sqlite";
import {useSelector} from "react-redux";
import {useRouter} from "expo-router";


export default function TransactionsSettingsDropdown({resetTab}: {resetTab: () => void}) {
    const db = useSQLiteContext();
    const currentTransaction = useAppSelector(selectCurrentTransaction);
    const dispatch = useAppDispatch();
    const scheme = useColorScheme();
    const filterType = useAppSelector(selectHomeViewTypeFilter)
    const router = useRouter();

    const selectedDateRange = useAppSelector(selectDateRangeFilter);
    const selectedCategoryFilter = useSelector(selectCategoryFilter);
    const selectedAccountFilter = useSelector(selectAccountFilter);
    const globalAccount = useAppSelector(selectSelectedAccountGlobal);

    function onSelect(value: 'on' | 'mixed' | 'off', keyItem: string) {
        if (value === 'on') {
            dispatch(updateHiddenFlag(1))
        } else {
            dispatch(updateHiddenFlag(0))
            dispatch(onChangeHiddenAmount("0"))
            resetTab()
        }
    }

    function handleDeleteItem(id: number) {
        const {start, end} = filterType.date === 'week' ? getCurrentWeek() : getCurrentMonth()
        Alert.alert('Delete entry?', 'This action cannot be undone.', [
            {style: 'default', text: 'Cancel', isPreferred: true},
            {
                style: 'destructive', text: 'Delete', isPreferred: true, onPress: async () => {
                    await deleteTransaction(db, id)
                    const transactions = await getTransactionsGroupedAndFiltered(db, start.toISOString(), end.toISOString(), filterType.type, globalAccount.id);
                    const {amountsGroupedByDate, transactionsGroupedByCategory} = await getTransactions(db, selectedDateRange.start, selectedDateRange.end, selectedAccountFilter.id, selectedCategoryFilter.id);
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


    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger>
                <TouchableOpacity>
                    <Entypo name="dots-three-horizontal" size={24}
                            color={scheme === 'light' ? 'black' : 'white'}/>
                </TouchableOpacity>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content loop={false} side='bottom' sideOffset={0} align='center' alignOffset={0} collisionPadding={0} avoidCollisions={true}>
                {/*<DropdownMenu.CheckboxItem key="hidden_feature"*/}
                {/*                           value={currentTransaction.is_hidden_transaction > 0 ? 'on' : 'off'}*/}
                {/*                           onValueChange={(value) => onSelect(value, 'hidden_feature')}>*/}
                {/*    <DropdownMenu.ItemTitle>Is hidden transaction</DropdownMenu.ItemTitle>*/}
                {/*    <DropdownMenu.ItemIndicator/>*/}
                {/*</DropdownMenu.CheckboxItem>*/}
                    <ContextMenu.Item key='delete' destructive
                                      onSelect={() => handleDeleteItem(currentTransaction.id)}>
                        <ContextMenu.ItemTitle>Delete</ContextMenu.ItemTitle>
                        <ContextMenu.ItemIcon
                            ios={{
                                name: 'trash'
                            }}
                        />
                    </ContextMenu.Item>
            </DropdownMenu.Content>
        </DropdownMenu.Root>

    )
}

const styles = StyleSheet.create({
    container: {
        height: 300,
        justifyContent: 'center',
        alignItems: 'center'
    },
    fs32: {
        fontSize: 32
    },
    fwBold: {
        fontWeight: 'bold'
    },
    fs18: {
        fontSize: 18
    },
    fw64: {
        fontSize: 64
    },
    fw18: {
        fontSize: 18
    },
    opacityMedium: {
        opacity: 0.5
    }
})
