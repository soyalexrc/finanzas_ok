import {Button, ListItem, Separator, Sheet, Text, useTheme, View, XStack, YGroup, YStack} from "tamagui";
import React, {useEffect, useState} from "react";
import {AntDesign} from "@expo/vector-icons";
import {Platform, TouchableOpacity, useColorScheme} from "react-native";
import {useTranslation} from "react-i18next";
import Entypo from "@expo/vector-icons/Entypo";
import * as Haptics from 'expo-haptics';
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import {
    selectHomeViewTypeFilter,
    updateHomeViewTypeFilter,
    updateTransactionsGroupedByDate
} from "@/lib/store/features/transactions/transactionsSlice";
import {
    updateFilterType,
    updateMonth,
    updateTotalByMonth, updateTotalsInYear,
    updateYear
} from "@/lib/store/features/transactions/filterSlice";
import {formatByThousands} from "@/lib/helpers/string";
import {format} from "date-fns";
import {formatDate, getCustomMonthAndYear} from "@/lib/helpers/date";
import {enUS, es} from "date-fns/locale";
import {selectSettings} from "@/lib/store/features/settings/settingsSlice";
import {
    getSettingByKey,
    getTotalIncomeByYear,
    getTotalsOnEveryMonthByYear,
    getTotalSpentByYear,
    getTransactionsGroupedAndFilteredV2
} from "@/lib/db";
import {useSQLiteContext} from "expo-sqlite";
import {convertNumberToK} from "@/lib/helpers/operations";

type Props = {
    open: boolean;
    setOpen: (value: boolean) => void;
}

export default function HomeFiltersSheet({setOpen, open} : Props) {
    const db = useSQLiteContext();
    const [position, setPosition] = useState(0);
    const dispatch = useAppDispatch();
    const scheme = useColorScheme()
    const { t } = useTranslation()
    const theme = useTheme();
    const isIos = Platform.OS === 'ios';
    const {selectedLanguage} = useAppSelector(selectSettings);
    const {
        month,
        type,
        year,
        totalByMonth,
        totalInYear,
        limit
    } = useAppSelector(state => state.filter);

    async function handleSelectMonth(month: number) {
        const currentMonth = new Date().getMonth() + 1;
        if (month > currentMonth) return;
        await Haptics.selectionAsync();

        dispatch(updateMonth({
            text: format(formatDate(new Date(new Date().setMonth(month - 1)).toISOString()), 'MMMM', { locale: selectedLanguage === 'es' ? es : enUS }),
            number: month
        }));

        const {start, end} = getCustomMonthAndYear(month, year);
        const transactions = await getTransactionsGroupedAndFilteredV2(db, start.toISOString(), end.toISOString(), type === 'expense' ? 'Spent' : 'Revenue');
        dispatch(updateTransactionsGroupedByDate(transactions));
    }

    async function onTypeChange(t: 'income' | 'expense') {
        dispatch(updateFilterType(t));
        const {start, end} = getCustomMonthAndYear(month.number, year);
        const totalResultByYear = t === 'expense' ? getTotalSpentByYear(db, year) : getTotalIncomeByYear(db, year);
        const filterLimit = getSettingByKey(db, 'filter_limit')
        const totalsOnEveryMonthByYear = getTotalsOnEveryMonthByYear(db, year, t, filterLimit?.value ? Number(filterLimit.value) : 2500);
        dispatch(updateTotalByMonth(totalsOnEveryMonthByYear));

        dispatch(updateTotalsInYear(totalResultByYear));
        const transactions = await getTransactionsGroupedAndFilteredV2(db, start.toISOString(), end.toISOString(), t === 'expense' ? 'Spent' : 'Revenue');
        dispatch(updateTransactionsGroupedByDate(transactions));
    }

    async function onYearChange(operation: 'add' | 'subtract') {
        const newYear = operation === 'add' ? year + 1 : year - 1;
        dispatch(updateYear(newYear));
        const filterLimit = getSettingByKey(db, 'filter_limit')
        const totalsOnEveryMonthByYear = getTotalsOnEveryMonthByYear(db, newYear, type, filterLimit?.value ? Number(filterLimit.value) : 2500);
        const totalSpentByYear = getTotalSpentByYear(db, newYear);

        dispatch(updateTotalByMonth(totalsOnEveryMonthByYear));
        dispatch(updateTotalsInYear(totalSpentByYear));

        const {start, end} = getCustomMonthAndYear(month.number, newYear);
        const transactions = await getTransactionsGroupedAndFilteredV2(db, start.toISOString(), end.toISOString(), type === 'expense' ? 'Spent' : 'Revenue');
        dispatch(updateTransactionsGroupedByDate(transactions));
    }

    return (
        <Sheet
            forceRemoveScrollEnabled={open}
            modal={false}
            open={open}
            dismissOnOverlayPress
            onOpenChange={setOpen}
            position={position}
            onPositionChange={setPosition}
            snapPoints={[80]}
            snapPointsMode='percent'
            dismissOnSnapToBottom
            zIndex={100_000}
        >
            <Sheet.Overlay
                enterStyle={{opacity: 0}}
                exitStyle={{opacity: 0}}
            />

            <Sheet.Handle />

            <Sheet.Frame borderTopLeftRadius={12} borderTopRightRadius={12} backgroundColor="$color1" px={10}>
                <YStack justifyContent="space-between" flex={1}>
                    <YStack gap={20}>
                        <XStack justifyContent="space-between" p={10}>
                            <YStack minHeight={88}>
                                <Text fontSize={16} color="$gray9Dark">
                                    {
                                        type === 'expense'
                                            ? new Date().getFullYear() === year ? t('SETTINGS.FILTERS.OPTIONS.SPENT_THIS_YEAR'): t('SETTINGS.FILTERS.OPTIONS.SPENT_IN') + ' ' + year
                                            : new Date().getFullYear() === year ? t('SETTINGS.FILTERS.OPTIONS.INCOME_THIS_YEAR'): t('SETTINGS.FILTERS.OPTIONS.INCOME_IN') + ' ' + year
                                    }
                                </Text>
                                {
                                    totalInYear && totalInYear.length > 0 &&
                                    <Text fontSize={36}>{totalInYear[0].symbol} {formatByThousands(String(totalInYear[0].amount))}</Text>
                                }
                                {
                                    totalInYear && totalInYear.length > 1 &&
                                    <Text fontSize={18}>{totalInYear[1].symbol} {formatByThousands(String(totalInYear[1].amount))} {totalInYear[2] && `- ${totalInYear[2].symbol} ${formatByThousands(String(totalInYear[2].amount))}`} </Text>
                                }
                                {/*<Text fontSize={18}>S/ 90,928.12 - Bs.S 450,120.23</Text>*/}
                            </YStack>

                                <Button size="$2.5" borderRadius={100} onPress={() => setOpen(false)}>
                                    <AntDesign name="close" size={20} color={scheme === 'light' ? 'black' : 'white'}/>
                                </Button>
                        </XStack>
                        <XStack position="relative" height={200} justifyContent="space-between" gap={5} alignItems="flex-end" px={5}>
                            <Text position="absolute" fontSize={20} top={-28} right={10}>{convertNumberToK(limit)}</Text>
                            <View height={1} position="absolute" borderWidth={1} borderColor={theme.color10?.val} width="100%" top={0} borderStyle="dashed" />
                            {
                                totalByMonth.map(item => (
                                    <TouchableOpacity
                                        onPress={() => handleSelectMonth(item.monthNumber)}
                                        key={item.month}
                                        style={{
                                            flex: 1,
                                            height: '100%',
                                            flexDirection: 'column',
                                            justifyContent: 'flex-end',
                                        }}
                                    >
                                        <View
                                            style={{
                                                height: `${item.percentage}%`,
                                                backgroundColor: month.number === item.monthNumber ? theme.color10?.val : theme.color3?.val,
                                                borderColor: theme.color9?.val,
                                                borderTopLeftRadius: 5,
                                                borderTopRightRadius: 5,
                                                borderWidth: month.number === item.monthNumber? 1 : 0,
                                            }}
                                        />
                                    </TouchableOpacity>
                                ))
                            }
                        </XStack>
                        <XStack justifyContent="space-evenly" gap={5} alignItems="flex-end" px={5} mt={-15}>
                            {
                                totalByMonth.map((item, index) => {
                                    if (index % 2 !== 0) return null;
                                    return <Text key={item.month}>{item.month.substring(0, 3)}</Text>
                                })
                            }
                        </XStack>
                        <YGroup alignSelf="center" bordered
                                separator={<Separator/>}>
                            <YGroup.Item>
                                <ListItem
                                    title="Year"
                                    iconAfter={
                                        <XStack alignItems="center" gap={10}>
                                            <TouchableOpacity onPress={() => onYearChange("subtract")} disabled={year <= new Date().getFullYear() - 1} style={{
                                                backgroundColor: year <= new Date().getFullYear() - 1 ? theme?.color3?.val : theme.color5?.val,
                                                padding: 3,
                                                borderRadius: 100
                                            }}>
                                                <Entypo name="chevron-left" size={18} color={scheme === 'light' ? 'black' : 'white'} />
                                            </TouchableOpacity>
                                            <Text>{year}</Text>
                                            <TouchableOpacity onPress={() => onYearChange('add')} disabled={year === new Date().getFullYear()} style={{
                                                backgroundColor: year === new Date().getFullYear() ? theme.color3?.val : theme.color5?.val,
                                                padding: 3,
                                                borderRadius: 100
                                            }}>
                                                <Entypo name="chevron-right" size={18} color={scheme === 'light' ? 'black' : 'white'} />
                                            </TouchableOpacity>
                                        </XStack>
                                    }
                                />
                            </YGroup.Item>
                            <YGroup.Item>
                                <ListItem
                                    hoverTheme
                                    pressTheme
                                    title="Type"
                                    onPress={() => onTypeChange(type === 'income' ? 'expense' : 'income')}
                                    iconAfter={
                                        <XStack gap={5}>
                                            <Text>{type === 'income' ? t('COMMON.INCOME') : t('COMMON.EXPENSE')}</Text>
                                            <Entypo name="select-arrows" size={18} color={scheme === 'light' ? 'black' : 'white'}/>
                                        </XStack>
                                    }
                                />
                            </YGroup.Item>
                        </YGroup>
                    </YStack>
                    <XStack gap={10}>
                        <Button onPress={() => setOpen(false)} variant='outlined' flex={1}>{t('COMMON.CANCEL')}</Button>
                        <Button onPress={() => setOpen(false)} flex={1}>{t('COMMON.DONE')}</Button>
                    </XStack>
                </YStack>
                {
                    isIos && <View height={85} />
                }
            </Sheet.Frame>
        </Sheet>
    )
}
