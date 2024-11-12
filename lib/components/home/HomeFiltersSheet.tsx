import {Button, ListItem, Separator, Sheet, Text, useTheme, View, XStack, YGroup, YStack} from "tamagui";
import React, {useEffect, useState} from "react";
import {AntDesign} from "@expo/vector-icons";
import {TouchableOpacity, useColorScheme} from "react-native";
import {useTranslation} from "react-i18next";
import Entypo from "@expo/vector-icons/Entypo";
import * as Haptics from 'expo-haptics';
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import {selectHomeViewTypeFilter, updateHomeViewTypeFilter} from "@/lib/store/features/transactions/transactionsSlice";
import {updateFilterType, updateMonth} from "@/lib/store/features/transactions/filterSlice";
import {formatByThousands} from "@/lib/helpers/string";
import {format} from "date-fns";
import {formatDate} from "@/lib/helpers/date";
import {enUS, es} from "date-fns/locale";
import {selectSettings} from "@/lib/store/features/settings/settingsSlice";

type Props = {
    open: boolean;
    setOpen: (value: boolean) => void;
}

export default function HomeFiltersSheet({setOpen, open} : Props) {
    const [position, setPosition] = useState(0);
    const scheme = useColorScheme()
    const { t } = useTranslation()
    const theme = useTheme();
    const {selectedLanguage} = useAppSelector(selectSettings);
    const dispatch = useAppDispatch();
    const {
        month,
        type,
        year,
        totalByMonth,
        totalInYear
    } = useAppSelector(state => state.filter);

    async function handleSelectMonth(month: number) {
        const currentMonth = new Date().getMonth() + 1;
        if (month > currentMonth) return;
        await Haptics.selectionAsync();

        dispatch(updateMonth({
            text: format(formatDate(new Date(new Date().setMonth(month - 1)).toISOString()), 'MMMM', { locale: selectedLanguage === 'es' ? es : enUS }),
            number: month
        }));    }

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

            <Sheet.Frame borderTopLeftRadius={12} borderTopRightRadius={12} backgroundColor="$color1" px={10} >
                <YStack justifyContent="space-between" flex={1}>
                    <YStack gap={20}>
                        <XStack justifyContent="space-between" p={10}>
                            <YStack>
                                <Text color="$gray9Dark">Spent this year</Text>
                                {
                                    totalInYear && totalInYear.length > 0 &&
                                    <Text fontSize={40}>{totalInYear[0].symbol} {formatByThousands(String(totalInYear[0].amount))}</Text>
                                }
                                {
                                    totalInYear && totalInYear.length > 1 &&
                                    <Text fontSize={18}>{totalInYear[1].symbol} {formatByThousands(String(totalInYear[1].amount))} {totalInYear[2] && `- ${totalInYear[2].symbol} ${formatByThousands(String(totalInYear[2].amount))}`} </Text>
                                }
                                {/*<Text fontSize={18}>S/ 90,928.12 - Bs.S 450,120.23</Text>*/}
                            </YStack>

                            <Button borderRadius={100} height={40} width={60} onPress={() => setOpen(false)}>
                                <AntDesign name="close" size={20} color={scheme === 'light' ? 'black' : 'white'}/>
                            </Button>
                        </XStack>
                        <XStack position="relative" height={200} justifyContent="space-between" gap={5} alignItems="flex-end" px={5}>
                            <Text position="absolute" top={-20} right={10}>1k</Text>
                            <View height={1} position="absolute" borderWidth={1} borderColor={theme.color12?.val} width="100%" top={0} borderStyle="dashed" />
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
                        <XStack justifyContent="space-between" gap={5} alignItems="flex-end" px={5} mt={-15}>
                            {
                                totalByMonth.map(item => <Text key={item.month}>{item.month.substring(0, 1)}</Text>)
                            }
                        </XStack>
                        <YGroup alignSelf="center" bordered
                                separator={<Separator/>}>
                            <YGroup.Item>
                                <ListItem
                                    title="Year"
                                    iconAfter={
                                        <XStack gap={5} alignItems="center" gap={10}>
                                            <TouchableOpacity disabled style={{
                                                backgroundColor: theme.color3?.val,
                                                padding: 3,
                                                borderRadius: 100
                                            }}>
                                                <Entypo name="chevron-left" size={18} color={scheme === 'light' ? 'black' : 'white'} />
                                            </TouchableOpacity>
                                            <Text>{year}</Text>
                                            <TouchableOpacity disabled style={{
                                                backgroundColor: theme.color3?.val,
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
                                    onPress={() => dispatch(updateFilterType(type === 'income' ? 'expense' : 'income'))}
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
                <View height={85} />
            </Sheet.Frame>
        </Sheet>
    )
}
