import {Button, RefreshControl, SafeAreaView, ScrollView, SectionList, StyleSheet, Text, View} from "react-native";
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

    function manageEdit() {
        router.push('/auth/transaction-form');
    }


    useEffect(() => {
        const {start, end} = getCurrentMonth();
        const userId = auth().currentUser?.uid;
        const userRef = firestore().collection('users').doc(userId);
        const subscriber = firestore()
            .collection('transactions')
            .where('user_id', '==', userRef)
            .where('date', '>', start)
            .where('date', '<', end)
            .onSnapshot(async documentSnapshot => {
                const transactions = await Promise.all(documentSnapshot?.docs.map(async doc => {
                    const data = doc.data();
                    let categoryData = null;

                    if (data.category && data.category.get) {
                        const categoryDoc = await data.category.get();
                        categoryData = { id: categoryDoc.id, ...categoryDoc.data() };                    }
                    return {
                        ...data,
                        id: doc.id,
                        date: doc.data().date?.toDate(),
                        category: categoryData
                    }
                }));

                // Group tasks by day
                const groupedByDay = transactions?.reduce((acc: { [key: string]: any[] }, transaction) => {
                    const day = format(new Date(transaction.date || new Date()), 'd MMM · eeee', {locale: es});
                    if (!acc[day]) {
                        acc[day] = [];
                    }
                    acc[day].push(transaction);
                    return acc;
                }, {});

                // Convert grouped data to sections array
                const listData: Section[] = Object.entries(groupedByDay || {}).map(([day, transactions]) => {
                    const totals = transactions.reduce((acc: {
                        [key: string]: { code: string, symbol: string, total: number }
                    }, transaction) => {
                        const {code, symbol} = transaction.currency;
                        if (!acc[code]) {
                            acc[code] = {code, symbol, total: 0};
                        }
                        acc[code].total += transaction.amount;
                        return acc;
                    }, {});

                    return {
                        title: day,
                        data: transactions,
                        totals: Object.values(totals),
                    };
                });


                // Sort sections by date
                listData.sort((a, b) => {
                    const dateA = new Date(a.data[0].due_date || new Date());
                    const dateB = new Date(b.data[0].due_date || new Date());
                    return dateA.getTime() - dateB.getTime();
                });

                setDocs(listData);
            });


        // Stop listening for updates when no longer required
        return () => subscriber();
    }, [navigation]);

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
        <SafeAreaView style={[styles.container]}>
            <SectionList
                showsVerticalScrollIndicator={false}
                sections={docs}
                contentInsetAdjustmentBehavior="automatic"
                stickySectionHeadersEnabled={true}
                keyExtractor={((item) => item?.id)}
                renderItem={({item}) => (
                    <LayoutAnimationConfig>
                        <Animated.View entering={StretchInY}>
                            <TransactionRow transaction={item} cb={() => onPressRow(item)} />
                        </Animated.View>
                    </LayoutAnimationConfig>
                )}
                renderSectionHeader={TransactionRowHeader}
            />

            <Fab/>
            <TransactionResumeModal visible={modalVisible} onClose={() => setModalVisible(false)} transaction={selectedTransaction} onEdit={() => manageEdit()} />
        </SafeAreaView>
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
});
