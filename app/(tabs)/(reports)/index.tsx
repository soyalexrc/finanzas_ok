import {useColorScheme, Platform, RefreshControl} from 'react-native';
import {View, Text, ScrollView, ToggleGroup, XStack, Button, YStack, useTheme, Image} from 'tamagui';
import React, {useCallback, useState} from "react";
import {useRouter} from "expo-router";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import CustomHeader from "@/lib/components/ui/CustomHeader";
import {formatByThousands} from "@/lib/helpers/string";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import ReportsSheet from "@/lib/components/reports/FiltersSheet";
import {getTransactions} from "@/lib/db";
import {useSQLiteContext} from "expo-sqlite";
import {useDispatch, useSelector} from "react-redux";
import {
    selectChartPoints,
    selectTransactionsGroupedByCategory, updateChartPoints, updateDetailGroup,
    updateTransactionsGroupedByCategory
} from "@/lib/store/features/transactions/reportSlice";
import {ChartPoints, TransactionsGroupedByCategory} from "@/lib/types/Transaction";
import {calculateTotalTransactions} from "@/lib/helpers/operations";
import {CartesianChart, Line} from "victory-native";
import {SharedValue} from "react-native-reanimated";
import {Circle} from "@shopify/react-native-skia";

export default function ReportScreen() {
    const db = useSQLiteContext();
    const dispatch = useDispatch();
    const chartPoints = useSelector(selectChartPoints);
    const transactions = useSelector(selectTransactionsGroupedByCategory);
    const router = useRouter();
    const schemeColor = useColorScheme()
    const theme = useTheme();
    const insets = useSafeAreaInsets()
    const isIos = Platform.OS === 'ios';
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [openFiltersSheet, setOpenFiltersSheet] = useState<boolean>(false);

    function handlePress(item: TransactionsGroupedByCategory) {
        dispatch(updateDetailGroup(item));
        router.push('/(tabs)/(reports)/detailGroup')
    }

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        setTimeout(async () => {
            const {amountsGroupedByDate, transactionsGroupedByCategory} = await getTransactions(db);
            dispatch(updateTransactionsGroupedByCategory(transactionsGroupedByCategory));
            dispatch(updateChartPoints(amountsGroupedByDate))
            setRefreshing(false)
        }, 500)
    }, [])


    function calculateTotalFromChartPoints(points: ChartPoints[]) {
        return points.reduce((acc, item) => acc + item.total, 0).toFixed(2)
    }


    return (
        <YStack flex={1} backgroundColor="$color1" paddingTop={insets.top}>
            <CustomHeader style={{ paddingTop: isIos ? insets.top : 0 }}>
                <Text fontSize={36}>S/ {formatByThousands(calculateTotalFromChartPoints(chartPoints))}</Text>
                {
                    transactions.length > 0 &&
                    <Button onPress={() => setOpenFiltersSheet(true)} height="$2" borderRadius="$12">
                        <FontAwesome name="filter" size={20} color={schemeColor === 'light' ? 'black' : 'white'}/>
                    </Button>
                }
            </CustomHeader>
            {
                transactions.length < 1 &&
                <View flex={1} justifyContent="center" alignItems="center">
                    <Image
                        source={require('@/assets/images/transactions/empty-list.png')}
                        width={200}
                        height={200}
                    />
                    <Text fontSize={18}>There are no data.</Text>
                    <Button marginVertical={20} onPress={() => router.push('/transactionCreateUpdate')}>Create transaction</Button>
                </View>
            }
            {
                transactions.length > 0 &&
                <ScrollView
                    marginTop={insets.top}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    showsVerticalScrollIndicator={false}
                    stickyHeaderIndices={[0]}
                >

                    {/*Resumen de monto segun filtro (semana, mes, ano)*/}


                    <View paddingHorizontal={10} paddingTop={20} paddingBottom={10} flexDirection="row" backgroundColor="$color1" gap={15} >
                        <Text fontSize={16} color="$gray10Dark">Spent this week</Text>
                        <View flexDirection="row" gap={5}>
                            <View borderRadius={100} padding={3} backgroundColor="$red3Light">
                                <MaterialCommunityIcons name="arrow-up" size={16} color="#fa3737"/>
                            </View>
                            <Text fontSize={16} color="$red9Dark">5,320%</Text>
                        </View>
                    </View>


                    {/*Grafica*/}
                    <View height={210} p={10}>
                        <CartesianChart data={chartPoints} xKey="date" yKeys={["total"]} >

                            {/* 👇 render function exposes various data, such as points. */}
                            {({points}) => (
                                // 👇 and we'll use the Line component to render a line path.
                                <>
                                    <Line points={points.total} color={theme.color10?.val} strokeWidth={3} curveType="linear"/>
                                </>
                            )}
                        </CartesianChart>
                    </View>

                    {/*Filtros de semana, mes, ano*/}
                    <XStack justifyContent="center">
                        <ToggleGroup
                            marginTop={10}
                            marginBottom={20}
                            orientation="horizontal"
                            id="simple-filter"
                            type="single"
                        >
                            <ToggleGroup.Item value="15" aria-label="Filter by week">
                                <Text>Last 15 days</Text>
                            </ToggleGroup.Item>
                            <ToggleGroup.Item value="45" aria-label="Filter by month">
                                <Text>Last 45 days</Text>
                            </ToggleGroup.Item>
                            <ToggleGroup.Item value="60" aria-label="Filter by year">
                                <Text>Last 60 days</Text>
                            </ToggleGroup.Item>
                        </ToggleGroup>
                    </XStack>

                    {/*Lista de items*/}
                    {
                        transactions.map((item, index) => (
                            <Button icon={<Text fontSize={30}>{item.category.icon}</Text>} key={item.category.title + index}
                                    backgroundColor='$background075' borderRadius={0} onPress={() => handlePress(item)}
                                    paddingHorizontal={20} gap={6} flexDirection="row" justifyContent="space-between"
                                    alignItems="center">
                                <View
                                    flex={1}
                                    flexDirection='row'
                                    alignItems='center'
                                    justifyContent='space-between'
                                >
                                    <View flexDirection='row' gap={10} alignItems='center'>
                                        {/*{*/}
                                        {/*    item.recurrentDate !== 'none' &&*/}
                                        {/*    <FontAwesome6 name="arrow-rotate-left" size={16} color="gray"/>*/}
                                        {/*}*/}
                                        <Text fontSize={18} fontWeight={500}>{item.category.title}</Text>
                                        {
                                            item.transactions.length > 0 &&
                                            <Text fontSize={14} color="$gray10Dark">x {item.transactions.length}</Text>
                                        }
                                    </View>
                                    <Text>S/ {formatByThousands(calculateTotalTransactions(item.transactions))}</Text>
                                </View>
                            </Button>
                        ))
                    }
                    <View height={200}/>
                </ScrollView>
            }
            <ReportsSheet open={openFiltersSheet} setOpen={setOpenFiltersSheet}/>
        </YStack>
    );
}

function ToolTip({x, y}: { x: SharedValue<number>; y: SharedValue<number> }) {
    return <Circle cx={x} cy={y} r={8} color="black"/>;
}
