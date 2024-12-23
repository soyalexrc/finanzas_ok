import {Button, StyleSheet, Text, View} from "react-native";
import auth from "@react-native-firebase/auth";
import {Fragment, useEffect, useState} from "react";
import {AgendaList, CalendarProvider, ExpandableCalendar} from "react-native-calendars";
import {Colors} from "@/lib/constants/colors";
import {parse, format} from 'date-fns';
import Fab from "@/lib/components/transactions/Fab";
import TransactionRow from "@/lib/components/transactions/TransactionRow";
import {MarkedDates} from "react-native-calendars/src/types";
import {getCurrentMonth} from "@/lib/helpers/date";
import firestore from "@react-native-firebase/firestore";
import {es} from "date-fns/locale";
import {useNavigation, useRouter} from "expo-router";
import {LocaleConfig} from 'react-native-calendars';
import {useSafeAreaInsets} from "react-native-safe-area-context";
import TransactionRowHeader from "@/lib/components/transactions/TransactionRowHeader";
import Animated, {LayoutAnimationConfig, StretchInY} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import TransactionResumeModal from "@/lib/components/ui/modals/TransactionResumeModal";


interface Section {
    title: {
        title: string;
        totals: any[]
    };
    data: any[];
}


LocaleConfig.locales['es'] = {
    monthNames: [
        'Enero',
        'Febrero',
        'Marzo',
        'Abril',
        'Mayo',
        'Junio',
        'Julio',
        'Agosto',
        'Septiembre',
        'Octubre',
        'Noviembre',
        'Diciembre'
    ],
    monthNamesShort: ['Ene.', 'Feb.', 'Mar.', 'Abr.', 'May.', 'Jun.', 'Jul.', 'Ago.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'],
    dayNames: ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'],
    dayNamesShort: ['Dom.', 'Lun.', 'Mar.', 'Mie.', 'Jue.', 'Vie.', 'Sab.'],
    today: "Hoy"
};

LocaleConfig.defaultLocale = 'es';


export default function Screen() {
    const today = new Date().toISOString();
    const [agendaItems, setAgendaItems] = useState<Section[]>([]);
    const [markedDates, setMarkedDates] = useState<MarkedDates>({});
    const navigation = useNavigation();
    const { top } = useSafeAreaInsets();
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [selectedTransaction, setSelectedTransaction] = useState<any>({});
    const router = useRouter();

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

                const updatedMarkedDates = { ...markedDates };

                transactions.forEach((transaction) => {
                    updatedMarkedDates[transaction.date.toISOString().split('T')[0]] = { marked: true, dotColor: Colors.primary };
                });

                setMarkedDates(updatedMarkedDates);

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
                        title: {
                            title: day,
                            totals: Object.values(totals),
                        },
                        data: transactions,
                    };
                });


                // Sort sections by date
                listData.sort((a, b) => {
                    const dateA = new Date(a.data[0].due_date || new Date());
                    const dateB = new Date(b.data[0].due_date || new Date());
                    return dateA.getTime() - dateB.getTime();
                });

                setAgendaItems(listData);
            });


        // Stop listening for updates when no longer required
        return () => subscriber();
    }, [navigation]);

    function manageEdit() {
        router.push('/auth/transaction-form');
    }

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
        <View style={[styles.container, {paddingTop: top }]}>
            <CalendarProvider
                date={today}
                showTodayButton={true}
                todayBottomMargin={10}
                todayButtonStyle={{}}
                theme={{
                    todayButtonTextColor: '#000000',
                }}>
                <ExpandableCalendar
                    closeOnDayPress
                    hideArrows
                    markedDates={markedDates}
                    theme={{
                        todayTextColor: Colors.primary,
                        todayButtonFontSize: 24,
                        textDisabledColor: Colors.lightText,
                        textDayFontWeight: '300',
                        textMonthFontWeight: 'bold',
                        textDayFontSize: 16,
                        textMonthFontSize: 18,
                        selectedDayBackgroundColor: Colors.primary,
                        selectedDayTextColor: 'white',
                        todayButtonTextColor: '#0026ff',
                    }}
                />
                <AgendaList
                    sections={agendaItems}
                    keyExtractor={((item) => item?.id)}
                    renderItem={({ item }) =>
                        <LayoutAnimationConfig>
                            <Animated.View entering={StretchInY}>
                                <TransactionRow transaction={item} cb={() => onPressRow(item)} heightValue={80} />
                            </Animated.View>
                        </LayoutAnimationConfig>}
                    renderSectionHeader={(section) => <TransactionRowHeader section={section} />}
                    theme={{
                        dayTextColor: '#000000',
                        agendaDayTextColor: '#ff00ff',
                        textDayHeaderFontWeight: 'bold',
                    }}
                />
            </CalendarProvider>
            <Fab />
            <TransactionResumeModal visible={modalVisible} onClose={() => setModalVisible(false)} transaction={selectedTransaction} onEdit={() => manageEdit()} />
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    header: {
        fontSize: 16,
        fontWeight: 'bold',
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
});
