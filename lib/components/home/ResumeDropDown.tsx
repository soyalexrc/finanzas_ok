import * as DropdownMenu from "zeego/dropdown-menu";
import {StyleSheet} from "react-native";
import {Text, useTheme, View, XStack} from 'tamagui'
import {useState} from "react";
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import {
    selectHomeViewTypeFilter, selectCurrentBalance, selectTransactionsGroupedByDate,
    updateHomeViewTypeFilter,
    updateTransactionsGroupedByDate, updateCurrentBalance
} from "@/lib/store/features/transactions/transactionsSlice";
import {getCurrentMonth, getCurrentWeek} from "@/lib/helpers/date";
import {getCurrentBalance, getTransactionsGroupedAndFiltered} from "@/lib/db";
import {useSQLiteContext} from "expo-sqlite";
import {calculateTotal, formatByThousands, formatTitleOption, formatWithDecimals} from "@/lib/helpers/string";
import {groups} from "@/lib/utils/data/transaction";
import {selectSelectedAccountGlobal} from "@/lib/store/features/accounts/accountsSlice";
import {TransactionsGroupedByDate} from "@/lib/types/Transaction";

export default function ResumeDropDown() {
    const db = useSQLiteContext();
    const  theme = useTheme();
    const dispatch = useAppDispatch();
    const filterType = useAppSelector(selectHomeViewTypeFilter)
    const selectedAccount = useAppSelector(selectSelectedAccountGlobal)
    const transactionsInView = useAppSelector(selectTransactionsGroupedByDate);
    const currentBalance = useAppSelector(selectCurrentBalance);

    async function handleSelectOption(type: 'Spent' | 'Revenue' | 'Balance', date: 'week' | 'month' | 'none') {
        dispatch(updateHomeViewTypeFilter({type, date}))
        if (type !== 'Balance') {
            const {start, end} = date === 'week' ? getCurrentWeek() : getCurrentMonth();
            const transactions = await getTransactionsGroupedAndFiltered(db, start.toISOString(), end.toISOString(), type, selectedAccount.id);
            dispatch(updateTransactionsGroupedByDate(transactions));
        } else {
            const currentBalance = await getCurrentBalance(db);
            dispatch(updateCurrentBalance(currentBalance));
        }
    }

    return (
        <View style={styles.container}>
            <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                    <View style={{alignItems: 'center'}}>
                        <Text
                            fontSize="$6">{filterType.type === 'Balance' ? 'Current balance' : `${filterType.type} this ${filterType.date}`}</Text>
                        {
                            filterType.type === 'Balance' &&
                            <>
                                <Text
                                    fontSize="$12">{formatByThousands(formatWithDecimals(currentBalance).amount)}</Text>
                                <Text fontSize="$9">.{formatWithDecimals(currentBalance).decimals}</Text>
                            </>
                        }
                        {
                            filterType.type !== 'Balance' &&
                            <>
                                {
                                    calculateTotal(transactionsInView).map((total, index) => (
                                        <XStack mb={4} mt={index === 0 ? 10 : 0}>
                                            <Text style={[index !== 0 && { color: theme.gray10Dark.val }]} fontSize={index === 0 ? '$9' : '$5'}>{total.symbol}</Text>
                                            <Text style={[index !== 0 && { color: theme.gray10Dark.val }]}  mt={-10} fontSize={index === 0 ? '$12' : '$9'}>{formatByThousands(total.amount)}</Text>
                                            <Text style={[index !== 0 && { color: theme.gray10Dark.val }]}  fontSize={index === 0 ? '$9' : '$5'}>.{total.decimals}</Text>
                                        </XStack>
                                    ))
                                }
                            </>
                        }
                    </View>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content loop={false} side='bottom' sideOffset={0} align='center' alignOffset={0}
                                      collisionPadding={0} avoidCollisions={true}>
                    {
                        groups.map(group => (
                            <DropdownMenu.Group key={group.key}>
                                {
                                    group.items.map(item => (
                                        <DropdownMenu.CheckboxItem key={item.key}
                                                                   value={(filterType.type === group.key && filterType.date === item.type) ? 'on' : 'off'}
                                                                   onValueChange={() => handleSelectOption(group.key, item.type)}>
                                            <DropdownMenu.ItemTitle>{formatTitleOption(group.key, item.type)}</DropdownMenu.ItemTitle>
                                            <DropdownMenu.ItemIndicator/>
                                        </DropdownMenu.CheckboxItem>
                                    ))
                                }
                            </DropdownMenu.Group>
                        ))
                    }
                </DropdownMenu.Content>
            </DropdownMenu.Root>
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
