import * as DropdownMenu from "zeego/dropdown-menu";
import {Sheet, Text, View} from "tamagui";
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import {
    selectAccountGlobally,
    selectAccounts,
    selectSelectedAccountGlobal, updateAccountsList
} from "@/lib/store/features/accounts/accountsSlice";
import {Account, FullTransaction} from "@/lib/types/Transaction";
import {
    createTransaction,
    deleteTransaction,
    getAllAccounts,
    getCurrentBalance,
    getTransactions,
    getTransactionsGroupedAndFiltered, stopRecurringInTransaction
} from "@/lib/db";
import {
    addTransactionInHomeList,
    removeTransactionFromHomeList,
    selectHomeViewTypeFilter, selectTransactionsGroupedByDate, updateCurrentBalance, updateHomeViewTypeFilter,
    updateTransactionsGroupedByDate
} from "@/lib/store/features/transactions/transactionsSlice";
import {useSQLiteContext} from "expo-sqlite";
import {getCurrentMonth, getCurrentWeek} from "@/lib/helpers/date";
import {Alert, Touchable, TouchableOpacity, useColorScheme} from "react-native";
import {useTranslation} from "react-i18next";
import {useState} from "react";
import {Entypo} from "@expo/vector-icons";
import {formatAccountTitle} from "@/lib/helpers/string";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
    selectAccountFilter,
    selectCategoryFilter,
    selectDateRangeFilter,
    updateChartPoints,
    updateTransactionsGroupedByCategory
} from "@/lib/store/features/transactions/reportSlice";
import {useSelector} from "react-redux";

type Props = {
    open: boolean;
    setOpen: (value: boolean) => void;
    fn: () => void;
}

export default function OnlyDeleteOptionSheet({open, setOpen, fn}: Props) {
    const db = useSQLiteContext();
    const schemeColor = useColorScheme();
    const [position, setPosition] = useState(0);
    const selectedDateRange = useAppSelector(selectDateRangeFilter);
    const filterType = useAppSelector(selectHomeViewTypeFilter)
    const selectedAccount = useAppSelector(selectSelectedAccountGlobal);
    const selectedCategoryFilter = useSelector(selectCategoryFilter);
    const selectedAccountFilter = useSelector(selectAccountFilter);
    const globalAccount = useAppSelector(selectSelectedAccountGlobal);
    const dispatch = useAppDispatch();
    const {t} = useTranslation()

    return (
        <Sheet
            forceRemoveScrollEnabled={open}
            modal={false}
            open={open}
            dismissOnOverlayPress
            onOpenChange={setOpen}
            position={position}
            onPositionChange={setPosition}
            snapPoints={[10]}
            snapPointsMode='percent'
            dismissOnSnapToBottom
            zIndex={100_000}
            animation="quick"
        >
            <Sheet.Overlay
                animation="quick"
                enterStyle={{opacity: 0}}
                exitStyle={{opacity: 0}}
            />

            <Sheet.Frame borderTopLeftRadius={12} borderTopRightRadius={12} backgroundColor="$color1" px={10} pb={20}>
                <TouchableOpacity onPress={fn} style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 20,
                    gap: 12,
                    paddingVertical: 15
                }}>
                    <MaterialIcons name="delete-forever" size={20} color="red"/>
                    <Text fontSize={17}>{t('COMMON.DELETE')}</Text>
                </TouchableOpacity>


            </Sheet.Frame>
        </Sheet>
    )
}
