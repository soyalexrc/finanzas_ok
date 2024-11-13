import * as DropdownMenu from "zeego/dropdown-menu";
import {Platform, Pressable, StyleSheet} from "react-native";
import {Text, useTheme, View, XStack} from 'tamagui'
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import {
    selectHomeViewTypeFilter, selectCurrentBalance, selectTransactionsGroupedByDate,
    updateHomeViewTypeFilter,
    updateTransactionsGroupedByDate, updateCurrentBalance
} from "@/lib/store/features/transactions/transactionsSlice";
import {getCurrentMonth, getCurrentWeek} from "@/lib/helpers/date";
import {getCurrentBalance, getTransactionsGroupedAndFiltered, getTransactionsGroupedAndFilteredV2} from "@/lib/db";
import {useSQLiteContext} from "expo-sqlite";
import {calculateTotal, formatByThousands, formatTitleOption, formatWithDecimals} from "@/lib/helpers/string";
import {selectAccounts, selectSelectedAccountGlobal} from "@/lib/store/features/accounts/accountsSlice";
import {selectSettings} from "@/lib/store/features/settings/settingsSlice";
import {useTranslation} from "react-i18next";
import {selectMonth, selectType, selectYear} from "@/lib/store/features/transactions/filterSlice";

export default function ResumeDropDown() {
    const theme = useTheme();
    const {hidden_feature_flag} = useAppSelector(selectSettings);
    const selectedAccount = useAppSelector(selectSelectedAccountGlobal)
    const transactionsInView = useAppSelector(selectTransactionsGroupedByDate);
    const currentBalance = useAppSelector(selectCurrentBalance);
    const {t} = useTranslation();
    const type = useAppSelector(selectType);
    const month = useAppSelector(selectMonth);
    const year = useAppSelector(selectYear);

    return (
        <View style={styles.container}>
            <View style={{alignItems: 'center'}}>

                <Text fontSize="$6">
                    {`${type === 'expense' ? t('COMMON.SPENT_IN') : t('COMMON.INCOME_IN')}`} {month.text} {year !== new Date().getFullYear() && year}
                </Text>
                {
                    transactionsInView.length > 0 && calculateTotal(transactionsInView, hidden_feature_flag).map((total, index) => (
                        <XStack key={total.amount + index} mb={4} mt={index === 0 ? 10 : 0}>
                            <Text style={[index !== 0 && {color: theme.gray10Dark.val}]}
                                  fontSize={index === 0 ? '$9' : '$4'}>{total.symbol}</Text>
                            <Text style={[index !== 0 && {color: theme.gray10Dark.val}]}
                                  mt={index !== 0 ? -6 : -12}
                                  fontSize={index === 0 ? '$12' : '$8'}>{formatByThousands(total.amount)}</Text>
                            <Text style={[index !== 0 && {color: theme.gray10Dark.val}]}
                                  fontSize={index === 0 ? '$9' : '$4'}>.{total.decimals}</Text>
                        </XStack>
                    ))
                }
                {
                    transactionsInView.length < 1 &&
                    <XStack mb={4}>
                        <Text fontSize="$9">{selectedAccount.currency_symbol}</Text>
                        <Text mt={-12}
                              fontSize="$12">{formatByThousands(formatWithDecimals(currentBalance).amount)}</Text>
                        <Text fontSize="$9">.{formatWithDecimals(currentBalance).decimals}</Text>
                    </XStack>
                }
            </View>
        </View>

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
