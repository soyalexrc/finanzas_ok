import {Button, ListItem, Separator, Sheet, Text, useTheme, View, XStack, YGroup, YStack} from "tamagui";
import React, {useEffect, useState} from "react";
import {AntDesign} from "@expo/vector-icons";
import {TouchableOpacity, useColorScheme} from "react-native";
import {useTranslation} from "react-i18next";
import Entypo from "@expo/vector-icons/Entypo";
import * as Haptics from 'expo-haptics';
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import {selectHomeViewTypeFilter, updateHomeViewTypeFilter} from "@/lib/store/features/transactions/transactionsSlice";

type Props = {
    open: boolean;
    setOpen: (value: boolean) => void;
}

const DATA = [
    {x: 'JAN', y: 12},
    {x: 'FEB', y: 90},
    {x: 'MAR', y: 45.2},
    {x: 'APR', y: 65.21},
    {x: 'MAY', y: 10},
    {x: 'JUN', y: 0},
    {x: 'JUL', y: 2.5},
    {x: 'AUG', y: 35.65},
    {x: 'SEP', y: 78.12},
    {x: 'OCT', y: 50.43},
    {x: 'NOV', y: 20.12},
    {x: 'DEC', y: 17.54}
]

export default function HomeFiltersSheet({setOpen, open} : Props) {
    const [position, setPosition] = useState(0);
    const [selectedMonth, setSelectedMonth] = useState<string>('');
    const scheme = useColorScheme()
    const { t } = useTranslation()
    const theme = useTheme()
    const filterType = useAppSelector(selectHomeViewTypeFilter);
    const [type, setType] = useState<string>(filterType.type);
    const dispatch = useAppDispatch();

    async function handleSelectMonth(month: string) {
        await Haptics.selectionAsync();
        setSelectedMonth(selectedMonth === month ? '' : month)
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
            snapPoints={[75]}
            snapPointsMode='percent'
            dismissOnSnapToBottom
            zIndex={100_000}
        >
            <Sheet.Overlay
                enterStyle={{opacity: 0}}
                exitStyle={{opacity: 0}}
            />

            <Sheet.Frame borderTopLeftRadius={12} borderTopRightRadius={12} backgroundColor="$color1" px={10} >
                <YStack justifyContent="space-between" flex={1}>
                    <YStack gap={20}>
                        <XStack justifyContent="space-between" p={10}>
                            <YStack>
                                <Text color="$gray11Dark">Spent this year</Text>
                                <Text fontSize={40}>$ 35,801</Text>
                                <Text fontSize={18}>S/ 90,928.12 - Bs.S 450,120.23</Text>
                            </YStack>

                            <Button borderRadius={100} height={40} width={60} onPress={() => setOpen(false)}>
                                <AntDesign name="close" size={20} color={scheme === 'light' ? 'black' : 'white'}/>
                            </Button>
                        </XStack>
                        <XStack position="relative" height={200} justifyContent="space-between" gap={5} alignItems="flex-end" px={5}>
                            <Text position="absolute" top={-20} right={10}>50k</Text>
                            <View height={2} position="absolute" borderWidth={1} borderColor={theme.color12?.val} width="100%" top={0} borderStyle="dashed" />
                            {
                                DATA.map(item => (
                                    <TouchableOpacity
                                        onPress={() => handleSelectMonth(item.x)}
                                        key={item.x}
                                        style={{
                                            flex: 1,
                                            height: '100%',

                                            flexDirection: 'column',
                                            justifyContent: 'flex-end',
                                        }}
                                    >
                                        <View
                                            style={{
                                                height: `${item.y}%`,
                                                backgroundColor: selectedMonth === item.x ? theme.color10?.val : theme.color3?.val,
                                                borderColor: theme.color9?.val,
                                                borderTopLeftRadius: 5,
                                                borderTopRightRadius: 5,
                                                borderWidth: selectedMonth === item.x ? 1 : 0,
                                            }}
                                        />
                                    </TouchableOpacity>
                                ))
                            }
                        </XStack>
                        <XStack justifyContent="space-between" gap={5} alignItems="flex-end" px={5} mt={-15}>
                            {
                                DATA.map(item => <Text key={item.x}>{item.x.substring(0, 1)}</Text>)
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
                                            <Text>2024</Text>
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
                                    onPress={() => {
                                        setType(type === 'Revenue' ? 'Spent' : 'Revenue');
                                    }}
                                    iconAfter={
                                        <XStack gap={5}>
                                            <Text>{type === 'Revenue' ? t('COMMON.INCOME') : t('COMMON.EXPENSE')}</Text>
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
                <View height={80} />
            </Sheet.Frame>
        </Sheet>
    )
}
