import {
    ActivityIndicator,
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
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import CurrencyPickerModal from "@/lib/components/modals/CurrencyPickerModal";
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import {selectCurrency, selectYear, updateCurrency} from "@/lib/store/features/transactions/transactions.slice";
import {
    useMonthlyStatistics,
    useStatisticsByCurrencyAndYear,
    useYearlyExpensesByCategory
} from "@/lib/utils/api/transactions";
import {useAuth} from "@/lib/context/AuthContext";

export default function Screen() {
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [selectedTransaction, setSelectedTransaction] = useState<any>({});
    const [currentMonth, setCurrentMonth] = useState<any>({});
    const [lastMonth, setLastMonth] = useState<any>({});
    const [lastWeek, setLastWeek] = useState<any>({});
    const [rawPerMonthPerYear, setRawPerMonthPerYear] = useState<any[]>([]);
    const [perMonthPerYear, setPerMonthPerYear] = useState<any[]>([]);
    const router = useRouter();
    const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
    const year = useAppSelector(selectYear);
    const {width} = useWindowDimensions();
    const currency = useAppSelector(selectCurrency);
    const dispatch = useAppDispatch();

    const {user, token} = useAuth()

    const {
        data: expensesByCategory,
        isPending: byCategoryLoading,
        error: byCategoryError,
        refetch: recallExpensesByCategorycs
    } = useYearlyExpensesByCategory(user._id, year, currency._id, token)
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
        refetch: recallStatisticsByCurrencyAndYear
    } = useStatisticsByCurrencyAndYear(user._id, year, currency._id, token)


    function manageEdit() {
        router.push('/auth/transaction-form');
    }


    useEffect(() => {
        // const data = rawPerMonthPerYear.find(d => d.year == year)?.data || [];
        // setPerMonthPerYear(data);
        recallStatisticsByCurrencyAndYear();
        recallMonthlyStatistics();
        recallExpensesByCategorycs();
    }, [year, currency]);


    return (
        <View style={{flex: 1}}>
            <Stack.Screen options={{
                title: 'Resumen',
                headerLargeTitle: true,
                headerRight: () => <YearPickerButton/>,
                headerLeft: () => (
                    <TouchableOpacity
                        onPress={() => setCurrencyModalVisible(true)}
                        style={{
                            paddingVertical: 5,
                            alignItems: 'center',
                        }}>
                        <Text style={{color: Colors.primary, fontWeight: 'bold'}}>{currency.code}</Text>
                    </TouchableOpacity>
                )
            }}/>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentInsetAdjustmentBehavior="automatic"
                style={[styles.container]}
            >

                {
                    statisticsByCurrencyAndYearLoading &&
                    <View>
                        <ActivityIndicator/>
                    </View>
                }

                {
                    !statisticsByCurrencyAndYearLoading && statisticsByCurrencyAndYear &&
                    <View style={[styles.containerSmall, {width}]}>
                        <View style={{alignItems: 'center'}}>
                            <Text>
                                Gastado este mes
                            </Text>
                            <View style={{marginBottom: 4, flexDirection: 'row'}}>
                                <Text style={{fontSize: 40}}>{currency?.symbol}</Text>
                                <Text
                                    style={{fontSize: 50}}>{formatByThousands(formatWithDecimals(statisticsByCurrencyAndYear.totalCurrentMonth)?.amount)}</Text>
                                <Text
                                    style={{fontSize: 40}}>.{formatWithDecimals(statisticsByCurrencyAndYear.totalCurrentMonth)?.decimals || '-'}</Text>
                            </View>
                        </View>
                    </View>
                }


                {
                    statisticsByCurrencyAndYearLoading &&
                    <View>
                        <ActivityIndicator/>
                    </View>
                }


                {
                    !statisticsByCurrencyAndYearLoading && statisticsByCurrencyAndYear &&

                    <View style={{flexDirection: 'row', justifyContent: 'space-around', padding: 10, gap: 10}}>
                        <View style={{backgroundColor: '#f0f0f0', padding: 10, borderRadius: 10, flex: 1}}>
                            <Text style={styles.subTitle}>Semana pasada</Text>
                            <Text style={styles.smallAmount}>{currency.symbol} {statisticsByCurrencyAndYear.totalLastWeek}</Text>
                        </View>
                        <View style={{backgroundColor: '#f0f0f0', padding: 10, borderRadius: 10, flex: 1}}>
                            <Text style={styles.subTitle}>Mes pasado</Text>
                            <Text style={styles.smallAmount}>{currency.symbol} {statisticsByCurrencyAndYear.totalLastMonth}</Text>
                        </View>
                    </View>
                }


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
                    <View>
                        <ActivityIndicator/>
                    </View>
                }

                {
                    !monthlyStatisticsLoading && monthlyStatistics.length > 0 &&
                    <View style={{height: 200, position: 'relative'}}>
                        <TransactionsPerMonthChart
                            data={monthlyStatistics}
                            currency={currency.code}
                            width={width}
                            onMouseMove={async () => {
                                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            }}
                            height={200}
                            dom={{
                                scrollEnabled: false,
                            }}
                        />
                        <View style={styles.overlay}/>
                    </View>
                }

                {
                    byCategoryLoading &&
                    <View>
                        <ActivityIndicator/>
                    </View>
                }

                {
                    !byCategoryLoading && expensesByCategory.length > 0 &&
                    <View style={{height: 250, position: 'relative', marginVertical: 30}}>
                        <TransactionsPerCategoryChart
                            width={width}
                            data={expensesByCategory}
                            height={250}
                            dom={{
                                scrollEnabled: false
                            }}
                        />
                        <View style={styles.overlay}/>
                    </View>
                }
                <View style={{height: 100}}/>
            </ScrollView>
            <Fab/>
            <TransactionResumeModal
                onRemove={() => {
                }}
                visible={modalVisible} onClose={() => setModalVisible(false)}
                transaction={selectedTransaction} onEdit={() => manageEdit()}/>
            <CurrencyPickerModal
                onSelect={(currency) => {
                    dispatch(updateCurrency(currency));
                }}
                visible={currencyModalVisible}
                onClose={() => setCurrencyModalVisible(false)}
            />

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
    }
});
