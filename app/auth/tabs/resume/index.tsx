import {
    ActivityIndicator, Alert,
    Button,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    SectionList,
    StyleSheet,
    Text, TouchableOpacity,
    useWindowDimensions,
    View
} from "react-native";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import Fab from "@/lib/components/transactions/Fab";
import {Stack, useNavigation, useRouter} from "expo-router";
import {Colors} from "@/lib/constants/colors";
import * as Haptics from 'expo-haptics';
import TransactionResumeModal from "@/lib/components/modals/TransactionResumeModal";
import {formatByThousands, formatWithDecimals} from "@/lib/helpers/string";
import TransactionsPerCategoryChart from "@/lib/components/charts/TransactionsPerCategoryChart";
import TransactionsPerMonthChart from "@/lib/components/charts/TransactionsPerMonthChart";
import YearPickerButton from "@/lib/components/transactions/YearPicker";
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import {selectCurrency, selectYear, updateCurrency} from "@/lib/store/features/transactions/transactions.slice";
import {
    useMonthlyStatistics, useMonthlyTotalsByCategory,
    useStatisticsByCurrencyAndYear,
    useYearlyExpensesByCategory
} from "@/lib/utils/api/transactions";
import {useAuth} from "@/lib/context/AuthContext";
import TotalsByMonthPerCategoryList from "@/lib/components/transactions/TotalsByMonthPerCategoryList";
import StatisticsByCurrencyList from "@/lib/components/transactions/StatisticsByCurrencyList";
import SharedSpacesList from "@/lib/components/shared-spaces/SharedSpacesList";

export default function Screen() {
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [selectedTransaction, setSelectedTransaction] = useState<any>({});
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const router = useRouter();
    const year = useAppSelector(selectYear);
    const {width} = useWindowDimensions();
    const currency = useAppSelector(selectCurrency);

    const {user, token} = useAuth()

    // const {
    //     data: expensesByCategory,
    //     isPending: byCategoryLoading,
    //     error: byCategoryError,
    //     refetch: recallExpensesByCategorycs
    // } = useYearlyExpensesByCategory(user._id, year, currency._id, token)
    const {
        data: monthlyStatistics,
        isPending: monthlyStatisticsLoading,
        error: monthlyStatisticsError,
        refetch: recallMonthlyStatistics
    } = useMonthlyStatistics(user._id, year, currency._id, token)
    const {
        data: statisticsByCurrencyAndYear,
        isPending: statisticsByCurrencyAndYearLoading,
        error: statisticsByCurrencyAndYearError,
        refetch: recallStatisticsByCurrencyAndYear,
    } = useStatisticsByCurrencyAndYear(user._id, year, currency._id, token)
    const {
        data: monthlyTotalsByCategory,
        isPending: monthlyTotalsByCategoryLoading,
        error: monthlyTotalsByCategoryError,
        refetch: recallMonthlyTotalsByCategory,
    } = useMonthlyTotalsByCategory(user._id, 'expense', currency._id, token)

    useEffect(() => {
        recallMonthlyTotalsByCategory();
    }, [currency]);


    function manageEdit() {
        router.push('/auth/transaction-form');
    }


    useEffect(() => {
        // const data = rawPerMonthPerYear.find(d => d.year == year)?.data || [];
        // setPerMonthPerYear(data);
        recallStatisticsByCurrencyAndYear();
        recallMonthlyStatistics();
        // recallExpensesByCategorycs();
    }, [year, currency]);


    // console.log('monthlyTotalsByCategory', monthlyTotalsByCategory)
    // console.log('statisticsByCurrencyAndYear', statisticsByCurrencyAndYear)

    return (
        <View style={{flex: 1}}>
            <Stack.Screen options={{
                title: 'Resumen',
                headerLargeTitle: true,
                headerRight: () => (
                    <View style={{flexDirection: 'row', gap: 20}}>
                        <YearPickerButton/>
                        <TouchableOpacity
                            onPress={() => router.push('/auth/currency-selection')}
                            style={{
                                padding: 5,
                                borderRadius: 5,
                                alignItems: 'center',
                                backgroundColor: Colors.primary
                            }}>
                            <Text style={{color: '#fff', fontWeight: 'bold'}}>{currency.symbol}</Text>
                        </TouchableOpacity>
                    </View>
                ),
                headerTitleAlign: 'center',
            }}/>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentInsetAdjustmentBehavior="automatic"
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={async () => {
                            setRefreshing(true);
                            await recallStatisticsByCurrencyAndYear();
                            await recallMonthlyStatistics();
                            await recallMonthlyTotalsByCategory();
                            // await recallExpensesByCategorycs();
                            setTimeout(() => {
                                setRefreshing(false);
                            }, 500)
                        }}
                    />
                }
                style={[styles.container]}
            >

                <StatisticsByCurrencyList
                    data={statisticsByCurrencyAndYear}
                    currency={currency}
                    loading={statisticsByCurrencyAndYearLoading}
                />

                <TotalsByMonthPerCategoryList
                    data={monthlyTotalsByCategory}
                    currency={currency}
                    loading={monthlyTotalsByCategoryLoading}
                    error={monthlyTotalsByCategoryError}
                />


                {/*{*/}
                {/*    statisticsByCurrencyAndYearLoading &&*/}
                {/*    <View style={{ height: 200 }}>*/}
                {/*        <ActivityIndicator/>*/}
                {/*    </View>*/}
                {/*}*/}


                {/*{*/}
                {/*    !statisticsByCurrencyAndYearLoading && statisticsByCurrencyAndYear &&*/}

                {/*    <View style={{flexDirection: 'row', justifyContent: 'space-around', padding: 10, gap: 10}}>*/}
                {/*        <View style={{backgroundColor: '#f0f0f0', padding: 10, borderRadius: 10, flex: 1}}>*/}
                {/*            <Text style={styles.subTitle}>Semana pasada</Text>*/}
                {/*            <Text*/}
                {/*                style={styles.smallAmount}>{currency.symbol} {statisticsByCurrencyAndYear.totalLastWeek}</Text>*/}
                {/*        </View>*/}
                {/*        <View style={{backgroundColor: '#f0f0f0', padding: 10, borderRadius: 10, flex: 1}}>*/}
                {/*            <Text style={styles.subTitle}>Mes pasado</Text>*/}
                {/*            <Text*/}
                {/*                style={styles.smallAmount}>{currency.symbol} {statisticsByCurrencyAndYear.totalLastMonth}</Text>*/}
                {/*        </View>*/}
                {/*    </View>*/}
                {/*}*/}


                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                        paddingHorizontal: 10,
                        height: 1,
                        marginVertical: 30,
                        backgroundColor: '#efefef'
                    }}
                />

                {
                    monthlyStatisticsLoading &&
                    <View style={{height: 300}}>
                        <ActivityIndicator/>
                    </View>
                }

                {
                    !monthlyStatisticsLoading && monthlyStatistics?.length > 0 &&
                    <View style={{height: 260, paddingHorizontal: 5, position: 'relative'}}>
                        <Text style={{textAlign: 'center', fontSize: 20}}>Gastado en {year}</Text>
                        <TransactionsPerMonthChart
                            data={monthlyStatistics}
                            currency={currency.code}
                            width={width}
                            height={245}
                            onChartPressed={(data) => {
                                Alert.alert('data', JSON.stringify(data))
                            }}
                            dom={{
                                scrollEnabled: false,
                            }}
                        />
                        <View style={styles.overlay}/>
                    </View>
                }

                <SharedSpacesList horizontal={true}/>

                {/*{*/}
                {/*    byCategoryLoading &&*/}
                {/*    <View style={{ height: 300 }}>*/}
                {/*        <ActivityIndicator/>*/}
                {/*    </View>*/}
                {/*}*/}

                {/*{*/}
                {/*    !byCategoryLoading && expensesByCategory?.length > 0 &&*/}
                {/*    <View style={{height: 300, position: 'relative', marginVertical: 70}}>*/}
                {/*        <TransactionsPerCategoryChart*/}
                {/*            width={width}*/}
                {/*            data={expensesByCategory}*/}
                {/*            height={300}*/}
                {/*            dom={{*/}
                {/*                scrollEnabled: false*/}
                {/*            }}*/}
                {/*        />*/}
                {/*        <View style={styles.overlay}/>*/}
                {/*    </View>*/}
                {/*}*/}
                {/*{*/}
                {/*    expensesByCategory?.map((item: any) => (*/}
                {/*        <View key={item.name} style={styles.card}>*/}
                {/*            <Text style={styles.name}>{item.name}</Text>*/}
                {/*            <Text style={styles.value}>{item.value}</Text>*/}
                {/*        </View>*/}
                {/*    ))*/}
                {/*}*/}
                <View style={{height: 100}}/>
            </ScrollView>
            <Fab customBottom={100}/>
            <TransactionResumeModal
                onRemove={() => {
                }}
                visible={modalVisible} onClose={() => setModalVisible(false)}
                transaction={selectedTransaction} onEdit={() => manageEdit()}/>

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    subTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'gray'
    },
    smallAmount: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 5,
    },
    headerText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        padding: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.lightBorder,
    },
    sheetContainer: {
        // add horizontal space
        borderRadius: 0
    },

//     other
    containerSmall: {
        height: 250,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 5,
        backgroundColor: '#ccc',
        marginHorizontal: 5
    },
    selectedDot: {
        backgroundColor: '#5EAA4BFF'
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#333'
    },

    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0)',
        zIndex: 1
    },
    card: {
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4, // For Android shadow
    },
    name: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
    value: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#007AFF", // iOS blue for contrast
    },
});
