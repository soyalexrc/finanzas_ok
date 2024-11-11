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

export default function ResumeDropDown({fn}: { fn: () => void }) {
    const db = useSQLiteContext();
    const theme = useTheme();
    const dispatch = useAppDispatch();
    const accounts = useAppSelector(selectAccounts);
    const {hidden_feature_flag} = useAppSelector(selectSettings);
    const filterType = useAppSelector(selectHomeViewTypeFilter)
    const selectedAccount = useAppSelector(selectSelectedAccountGlobal)
    const transactionsInView = useAppSelector(selectTransactionsGroupedByDate);
    const currentBalance = useAppSelector(selectCurrentBalance);
    const {t} = useTranslation();
    const isIos = Platform.OS === 'ios';

    async function handleSelectOption(type: 'Spent' | 'Revenue', date: 'month' | 'none') {
        dispatch(updateHomeViewTypeFilter({type, date}))
            const {start, end} = getCurrentMonth();
            const transactions = await getTransactionsGroupedAndFilteredV2(db, start.toISOString(), end.toISOString(), type);
            dispatch(updateTransactionsGroupedByDate(transactions));

        // if (type !== 'Balance') {
        //     const {start, end} = date === 'week' ? getCurrentWeek() : getCurrentMonth();
        //     const transactions = await getTransactionsGroupedAndFilteredV2(db, start.toISOString(), end.toISOString(), type, selectedAccount.id);
        //     dispatch(updateTransactionsGroupedByDate(transactions));
        // } else {
        //     const currentBalance = await getCurrentBalance(db);
        //     dispatch(updateCurrentBalance(currentBalance));
        // }
    }

    return (
        <View style={styles.container}>
            <View style={{alignItems: 'center'}}>
                <Text
                    fontSize="$6">{
                    // filterType.type === 'Balance'
                    //     ? t('HOME_RESUME_DROPDOWN.BALANCE')
                    //     :
                    //     filterType.type === 'Spent' && filterType.date === 'week' ? t('HOME_RESUME_DROPDOWN.SPENT_THIS_WEEK')
                    //         :
                    filterType.type === 'Spent' && filterType.date === 'month' ? t('HOME_RESUME_DROPDOWN.SPENT_THIS_MONTH')
                        // : filterType.type === 'Revenue' && filterType.date === 'week' ? t('HOME_RESUME_DROPDOWN.REVENUE_THIS_WEEK')
                        : filterType.type === 'Revenue' && filterType.date === 'month' ? t('HOME_RESUME_DROPDOWN.REVENUE_THIS_MONTH')
                            : ''
                }
                </Text>
                {/*{*/}
                {/*    filterType.type === 'Balance' &&*/}
                {/*    <XStack mb={4}>*/}
                {/*        <Text fontSize="$9">{selectedAccount.currency_symbol}</Text>*/}
                {/*        <Text mt={-12}*/}
                {/*              fontSize="$12">{formatByThousands(formatWithDecimals(currentBalance).amount)}</Text>*/}
                {/*    </XStack>*/}
                {/*}*/}
                {/*{*/}
                {/*    filterType.type !== 'Balance' &&*/}
                {/*    <>*/}
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
                {/*    </>*/}
                {/*}*/}
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
