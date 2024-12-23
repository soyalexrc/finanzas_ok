import {
    Button,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    SectionList,
    StyleSheet,
    Text,
    useWindowDimensions,
    View
} from "react-native";
import Animated, {StretchInY, LayoutAnimationConfig} from 'react-native-reanimated';
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import TransactionRow from "@/lib/components/transactions/TransactionRow";
import usePlatform from "@/lib/hooks/usePlatform";
import firestore, {Timestamp, query, and, where} from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import {getCurrentMonth} from "@/lib/helpers/date";
import {format} from "date-fns";
import TransactionRowHeader from "@/lib/components/transactions/TransactionRowHeader";
import Fab from "@/lib/components/transactions/Fab";
import {useNavigation, useRouter} from "expo-router";
import {Colors} from "@/lib/constants/colors";
import * as Haptics from 'expo-haptics';
import TransactionResumeModal from "@/lib/components/ui/modals/TransactionResumeModal";
import {es} from "date-fns/locale";
import {formatByThousands, formatWithDecimals} from "@/lib/helpers/string";

interface Todo {
    id: number;
    name: string;
    description?: string | null;
    priority: number;
    due_date?: number | null;
    date_added: number;
    completed: number;
    date_completed?: number | null;
    project_id: number;
    project_name?: string;
    project_color?: string;
}


interface Section {
    title: string;
    data: any[];
    totals: any[]
}


export default function Screen() {
    const platform = usePlatform();
    const [refreshing, setRefreshing] = useState(false);
    const [docs, setDocs] = useState<Section[]>([])
    const navigation = useNavigation();
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [selectedTransaction, setSelectedTransaction] = useState<any>({});
    const router = useRouter();
    const {width} = useWindowDimensions();

    function manageEdit() {
        router.push('/auth/transaction-form');
    }


    // useEffect(() => {
    //     const {start, end} = getCurrentMonth();
    //     const userId = auth().currentUser?.uid;
    //     const userRef = firestore().collection('users').doc(userId);
    //     const subscriber = firestore()
    //         .collection('transactions')
    //         .where('user_id', '==', userRef)
    //         .where('date', '>', start)
    //         .where('date', '<', end)
    //         .onSnapshot(async documentSnapshot => {
    //             const transactions = await Promise.all(documentSnapshot?.docs.map(async doc => {
    //                 const data = doc.data();
    //                 let categoryData = null;
    //
    //                 if (data.category && data.category.get) {
    //                     const categoryDoc = await data.category.get();
    //                     categoryData = { id: categoryDoc.id, ...categoryDoc.data() };                    }
    //                 return {
    //                     ...data,
    //                     id: doc.id,
    //                     date: doc.data().date?.toDate(),
    //                     category: categoryData
    //                 }
    //             }));
    //
    //             // Group tasks by day
    //             const groupedByDay = transactions?.reduce((acc: { [key: string]: any[] }, transaction) => {
    //                 const day = format(new Date(transaction.date || new Date()), 'd MMM · eeee', {locale: es});
    //                 if (!acc[day]) {
    //                     acc[day] = [];
    //                 }
    //                 acc[day].push(transaction);
    //                 return acc;
    //             }, {});
    //
    //             // Convert grouped data to sections array
    //             const listData: Section[] = Object.entries(groupedByDay || {}).map(([day, transactions]) => {
    //                 const totals = transactions.reduce((acc: {
    //                     [key: string]: { code: string, symbol: string, total: number }
    //                 }, transaction) => {
    //                     const {code, symbol} = transaction.currency;
    //                     if (!acc[code]) {
    //                         acc[code] = {code, symbol, total: 0};
    //                     }
    //                     acc[code].total += transaction.amount;
    //                     return acc;
    //                 }, {});
    //
    //                 return {
    //                     title: day,
    //                     data: transactions,
    //                     totals: Object.values(totals),
    //                 };
    //             });
    //
    //
    //             // Sort sections by date
    //             listData.sort((a, b) => {
    //                 const dateA = new Date(a.data[0].due_date || new Date());
    //                 const dateB = new Date(b.data[0].due_date || new Date());
    //                 return dateA.getTime() - dateB.getTime();
    //             });
    //
    //             setDocs(listData);
    //         });
    //
    //
    //     // Stop listening for updates when no longer required
    //     return () => subscriber();
    // }, [navigation]);

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
        <View style={{ flex: 1 }}>
            <ScrollView
                contentInsetAdjustmentBehavior="automatic"
                style={styles.container}>
                <View style={[styles.containerSmall, {width}]}>
                    <View style={{alignItems: 'center'}}>
                        <Text>
                            Gastado este mes
                        </Text>
                        <View style={{ marginBottom: 4, flexDirection: 'row' }}>
                            <Text style={{ fontSize: 40 }}>$</Text>
                            <Text style={{ fontSize: 50 }}>{formatByThousands(formatWithDecimals(1200.23).amount)}</Text>
                            <Text style={{ fontSize: 40 }}>.{formatWithDecimals(1200.23).decimals}</Text>
                        </View>
                    </View>
                </View>

            {/*    last week and last month boxes */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 }}>
                    <View style={{ backgroundColor: '#f0f0f0', padding: 10, borderRadius: 10 }}>
                        <Text style={styles.fs18}>Semana pasada</Text>
                        <Text style={styles.fs32}>$ 1200.23</Text>
                    </View>
                    <View style={{ backgroundColor: '#f0f0f0', padding: 10, borderRadius: 10 }}>
                        <Text style={styles.fs18}>Mes pasado</Text>
                        <Text style={styles.fs32}>$ 1200.23</Text>
                    </View>
                </View>

            </ScrollView>
            <Fab/>
            <TransactionResumeModal visible={modalVisible} onClose={() => setModalVisible(false)} transaction={selectedTransaction} onEdit={() => manageEdit()} />

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
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
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
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
        width: 6,
        height: 6,
        borderRadius: 5,
        backgroundColor: '#ccc',
        marginHorizontal: 5
    },
    selectedDot: {
        backgroundColor: '#5EAA4BFF'
    }
});
