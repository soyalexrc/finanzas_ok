import {useColorScheme, Platform, RefreshControl} from 'react-native';
import {View, Text, ScrollView, ToggleGroup, XStack, Button, YStack, useTheme, Image} from 'tamagui';
import React, {useEffect, useState} from "react";
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
    selectAccountFilter, selectCategoryFilter,
    selectChartPoints, selectDateRangeFilter,
    selectTransactionsGroupedByCategory, updateChartPoints, updateDateRangeFilter, updateDetailGroup,
    updateTransactionsGroupedByCategory
} from "@/lib/store/features/transactions/reportSlice";
import {TransactionsGroupedByCategory} from "@/lib/types/Transaction";
import {calculateTotalFromChartPoints, calculateTotalTransactions} from "@/lib/helpers/operations";
import {CartesianChart, Line} from "victory-native";
import {SharedValue} from "react-native-reanimated";
import {Circle} from "@shopify/react-native-skia";
import {getDateRangeBetweenGapDaysAndToday, getDateRangeAlongTimeAgo} from "@/lib/helpers/date";
import {selectCategories} from "@/lib/store/features/categories/categoriesSlice";

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
    const selectedCategory = useSelector(selectCategoryFilter);
    const selectedAccount = useSelector(selectAccountFilter);
    const selectedDateRange = useSelector(selectDateRangeFilter);
    const [daysFrom, setDaysFrom] = useState<string>('15')

    function handlePress(item: TransactionsGroupedByCategory) {
        dispatch(updateDetailGroup(item));
        router.push('/detailGroup')
    }

    async function onRefresh() {
        setRefreshing(true);
        setTimeout(async () => {
            const {
                amountsGroupedByDate,
                transactionsGroupedByCategory
            } = await getTransactions(db, selectedDateRange.start, selectedDateRange.end, selectedAccount.id, selectedCategory.id);
            dispatch(updateTransactionsGroupedByCategory(transactionsGroupedByCategory));
            dispatch(updateChartPoints(amountsGroupedByDate))
            setRefreshing(false)
        }, 500)
    }

    useEffect(() => {
        if (daysFrom !== '0') {
            handleGetReportByPresetDays();
        }
    }, [daysFrom]);

    async function handleGetReportByPresetDays() {
        if (daysFrom) {
            const {start, end} = getDateRangeBetweenGapDaysAndToday(Number(daysFrom));
            dispatch(updateDateRangeFilter({type: 'start', value: start.toISOString()}));
            dispatch(updateDateRangeFilter({type: 'end', value: end.toISOString()}));
            const {
                amountsGroupedByDate,
                transactionsGroupedByCategory
            } = await getTransactions(db, start.toISOString(), end.toISOString(), selectedAccount.id, selectedCategory.id);
            dispatch(updateTransactionsGroupedByCategory(transactionsGroupedByCategory));
            dispatch(updateChartPoints(amountsGroupedByDate))
        } else {
            const {start, end} = getDateRangeAlongTimeAgo();
            dispatch(updateDateRangeFilter({ type: 'start', value: start.toISOString()}));
            dispatch(updateDateRangeFilter({ type: 'end', value: end.toISOString() }));

            const {
                amountsGroupedByDate,
                transactionsGroupedByCategory
            } = await getTransactions(db, start.toISOString(), end.toISOString(), selectedAccount.id, selectedCategory.id);
            dispatch(updateTransactionsGroupedByCategory(transactionsGroupedByCategory));
            dispatch(updateChartPoints(amountsGroupedByDate))
        }
    }

    return (
        <YStack flex={1} backgroundColor="$color1" paddingTop={insets.top}>
            <CustomHeader style={{paddingTop: isIos ? insets.top : 0}}>
                <Text fontSize={36}>{selectedAccount.currency_symbol} {formatByThousands(calculateTotalFromChartPoints(chartPoints))}</Text>
                <Button onPress={() => setOpenFiltersSheet(true)} height="$2" borderRadius="$12">
                    <FontAwesome name="filter" size={20} color={schemeColor === 'light' ? 'black' : 'white'}/>
                </Button>
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
                    <Button marginVertical={20} onPress={() => router.push('/transactionCreateUpdate')}>Create
                        transaction</Button>
                </View>
            }
            {
                transactions.length > 0 &&
                <ScrollView
                    marginTop={insets.top}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>
                    }
                    showsVerticalScrollIndicator={false}
                    stickyHeaderIndices={[0]}
                >

                    {/*Resumen de monto segun filtro (semana, mes, ano)*/}


                    <YStack paddingHorizontal={10} paddingVertical={5}  backgroundColor="$color1">
                        <Text fontSize={12} textAlign="center" color="$gray10Dark">{selectedAccount.icon} {selectedAccount.title}</Text>
                        {/*<View  flexDirection="row"*/}
                        {/*     gap={15}>*/}
                        {/*    <Text fontSize={16} color="$gray10Dark">Spent this week</Text>*/}
                        {/*    <View flexDirection="row" gap={5}>*/}
                        {/*        <View borderRadius={100} padding={3} backgroundColor="$red3Light">*/}
                        {/*            <MaterialCommunityIcons name="arrow-up" size={16} color="#fa3737"/>*/}
                        {/*        </View>*/}
                        {/*        <Text fontSize={16} color="$red9Dark">5,320%</Text>*/}
                        {/*    </View>*/}
                        {/*</View>*/}
                    </YStack>


                    {/*Grafica*/}
                    <View height={250} p={10}>
                        {
                            chartPoints.length > 2 &&
                            <CartesianChart data={chartPoints} xKey="date" yKeys={["total"]}
                                            domainPadding={{left: 0, right: 0, top: 30, bottom: 10}}>

                                {/* 👇 render function exposes various data, such as points. */}
                                {({points, chartBounds}) => (
                                    // 👇 and we'll use the Line component to render a line path.
                                    // <Bar
                                    //     points={points.total}
                                    //     chartBounds={chartBounds}
                                    //     color={theme.color10?.val}
                                    //     roundedCorners={{ topLeft: 10, topRight: 10 }}
                                    // />
                                    <>
                                        <Line points={points.total} color={theme.color10?.val} strokeWidth={3}
                                              curveType="natural"/>
                                    </>
                                )}

                            </CartesianChart>
                        }
                        {
                            chartPoints.length < 3 &&
                            <View flex={1} justifyContent="center" alignItems="center">
                                <Text fontSize={16} color="$gray10Dark">There are no data to display the graph.</Text>
                            </View>
                        }
                    </View>

                    {/*Filtros de semana, mes, ano*/}
                    <XStack justifyContent="center">
                        <ToggleGroup
                            marginTop={10}
                            marginBottom={20}
                            value={daysFrom}
                            onValueChange={setDaysFrom}
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
                            <Button icon={<Text fontSize={30}>{item.category.icon}</Text>}
                                    key={item.category.title + index}
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
                                    <Text>{item.account.currency_symbol} {formatByThousands(calculateTotalTransactions(item.transactions))}</Text>
                                </View>
                            </Button>
                        ))
                    }
                    <View height={200}/>
                </ScrollView>
            }
            <ReportsSheet open={openFiltersSheet} setOpen={setOpenFiltersSheet} updatePresetDays={() => setDaysFrom('0')} />
        </YStack>
    );
}

function ToolTip({x, y}: { x: SharedValue<number>; y: SharedValue<number> }) {
    return <Circle cx={x} cy={y} r={8} color="black"/>;
}
