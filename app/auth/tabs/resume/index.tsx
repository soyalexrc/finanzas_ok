import {
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
import Animated, {StretchInY, LayoutAnimationConfig} from 'react-native-reanimated';
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import TransactionRow from "@/lib/components/transactions/TransactionRow";
import usePlatform from "@/lib/hooks/usePlatform";
import Fab from "@/lib/components/transactions/Fab";
import {Stack, useNavigation, useRouter} from "expo-router";
import {Colors} from "@/lib/constants/colors";
import * as Haptics from 'expo-haptics';
import TransactionResumeModal from "@/lib/components/modals/TransactionResumeModal";
import {formatByThousands, formatWithDecimals} from "@/lib/helpers/string";
import TransactionsPerCategoryChart from "@/lib/components/charts/TransactionsPerCategoryChart";
import TransactionsPerMonthChart from "@/lib/components/charts/TransactionsPerMonthChart";
import YearPicker from "@/lib/components/transactions/YearPicker";
import YearPickerButton from "@/lib/components/transactions/YearPicker";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import CurrencyPickerModal from "@/lib/components/modals/CurrencyPickerModal";
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import {selectCurrency, selectYear, updateCurrency} from "@/lib/store/features/transactions/transactions.slice";

interface Section {
    title: string;
    data: any[];
    totals: any[]
}


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

    function manageEdit() {
        router.push('/auth/transaction-form');
    }

    useEffect(() => {
        const userReference = firestore().collection('users').doc(auth().currentUser?.uid);

        const subscriber = firestore()
            .collection('stats')
            .where('userId', '==', userReference)
            .onSnapshot(async documentSnapshot => {
                const data = documentSnapshot.docs.map(doc => doc.data());
                // console.log('user stats data: ', data );
                const perMonthPerYearData = data.filter(d => d.type === 'perMonthPerYear') || [];
                const lastWeekData = data.find(d => d.type === 'lastWeek')?.data || {};
                const lastMonthData = data.find(d => d.type === 'lastMonth')?.data || {};
                const currentMonthData = data.find(d => d.type === 'currentMonth')?.data || {};

                setLastWeek(lastWeekData);
                setLastMonth(lastMonthData);
                setCurrentMonth(currentMonthData);
                setRawPerMonthPerYear(perMonthPerYearData);
            })

        return () => subscriber();
    }, []);

    useEffect(() => {
        const data = rawPerMonthPerYear.find(d => d.year == year)?.data || [];
        setPerMonthPerYear(data);
    }, [year, rawPerMonthPerYear]);

    async function onPressRow(transaction: any) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedTransaction({
            date: transaction?.date,
            amount: transaction?.amount,
            currency: transaction?.currency,
            category: {
                id: transaction?.category?.id || '',
                title: transaction?.category.title || '',
                icon: transaction?.category?.icon || '',
                type: transaction?.category?.type || '',
                description: transaction?.category?.description || ''
            },
            description: transaction?.description || '',
            documents: transaction?.documents || '',
            images: transaction?.images || [],
            title: transaction?.title || '',
            id: transaction?.id
        });
        setModalVisible(true)
    }

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
                <View style={[styles.containerSmall, {width}]}>
                    <View style={{alignItems: 'center'}}>
                        <Text>
                            Gastado este mes
                        </Text>
                        <View style={{marginBottom: 4, flexDirection: 'row'}}>
                            <Text style={{fontSize: 40}}>{currency?.symbol}</Text>
                            <Text
                                style={{fontSize: 50}}>{formatByThousands(formatWithDecimals(currentMonth[currency.code])?.amount || '-')}</Text>
                            <Text style={{fontSize: 40}}>.{formatWithDecimals(currentMonth[currency.code])?.decimals || '-'}</Text>
                        </View>
                    </View>
                </View>

                {/*    last week and last month boxes */}
                <View style={{flexDirection: 'row', justifyContent: 'space-around', padding: 10, gap: 10}}>
                    <View style={{backgroundColor: '#f0f0f0', padding: 10, borderRadius: 10, flex: 1}}>
                        <Text style={styles.subTitle}>Semana pasada</Text>
                        <Text style={styles.smallAmount}>{currency.symbol} {lastWeek[currency.code] || '-'}</Text>
                    </View>
                    <View style={{backgroundColor: '#f0f0f0', padding: 10, borderRadius: 10, flex: 1}}>
                        <Text style={styles.subTitle}>Mes pasado</Text>
                        <Text style={styles.smallAmount}>{currency.symbol} {lastMonth[currency.code] || '-'}</Text>
                    </View>
                </View>

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

                <View style={{height: 200, position: 'relative'}}>
                    <TransactionsPerMonthChart
                        data={perMonthPerYear}
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

                <View style={{height: 250, position: 'relative', marginVertical: 30}}>
                    <TransactionsPerCategoryChart
                        width={width}
                        height={250}
                        dom={{
                            scrollEnabled: false
                        }}
                    />
                    <View style={styles.overlay}/>
                </View>
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
                    dispatch(updateCurrency({code: currency.code, symbol: currency.symbol}));
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
