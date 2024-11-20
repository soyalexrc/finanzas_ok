import * as DropdownMenu from "zeego/dropdown-menu";
import {Alert, Dimensions, FlatList, Platform, Pressable, StyleSheet, TouchableOpacity} from "react-native";
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
import {useState} from "react";

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
    const {width} = Dimensions.get('window');
    const [selectedIndex, setSelectedIndex] = useState<number>(0);


    function FirstItem() {
        return (
            <View style={[styles.container, {width}]}>
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

    const sampleData = [
        {category: 'Food', total: 100, color: '#fefefe'},
        {category: 'Food', total: 200, color: '#000'},
        {category: 'Other', total: 200, color: '#FC1010FF'},
        {category: 'Car', total: 600, color: '#7cec6f'},
    ]




    const data = [
        {id: '1', content: <FirstItem/>},
        {id: '2', content: <FirstItem/>},
    ]

    return (
        <>
            <FlatList
                data={data}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={item => item.id}
                renderItem={({item, index}) => item.content}
                onMomentumScrollEnd={event => {
                    const index = Math.floor(event.nativeEvent.contentOffset.x) / Math.floor(width);
                    setSelectedIndex(index);
                }}
            />
            <View style={styles.dotsContainer}>
                {data.map((_, index) => (
                    <Dot key={index} isSelected={index === selectedIndex}/>
                ))}
            </View>
        </>
    )
}

const Dot = ({isSelected}) => (
    <View style={[styles.dot, isSelected && styles.selectedDot]}/>
);

const styles = StyleSheet.create({
    container: {
        height: 300,
        justifyContent: 'center',
        alignItems: 'center'
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10
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
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#ccc',
        marginHorizontal: 5
    },
    selectedDot: {
        backgroundColor: '#5EAA4BFF'
    }
})
