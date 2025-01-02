import {
    ActivityIndicator,
    Alert,
    Button,
    LogBox, Pressable,
    RefreshControl, ScrollView, SectionList,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    View, ViewToken
} from "react-native";
import auth from "@react-native-firebase/auth";
import {Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from "react";
import {AgendaList, CalendarProvider, ExpandableCalendar} from "react-native-calendars";
import {Colors} from "@/lib/constants/colors";
import {parse, format} from 'date-fns';
import Fab from "@/lib/components/transactions/Fab";
import TransactionRow from "@/lib/components/transactions/TransactionRow";
import {MarkedDates} from "react-native-calendars/src/types";
import {getCurrentMonth, getCustomMonth, getCustomMonthAndYear, getCustomMonthRangeWithYear} from "@/lib/helpers/date";
import firestore from "@react-native-firebase/firestore";
import {es} from "date-fns/locale";
import {useFocusEffect, useNavigation, useRouter} from "expo-router";
import {LocaleConfig} from 'react-native-calendars';
import {useSafeAreaInsets} from "react-native-safe-area-context";
import TransactionRowHeader from "@/lib/components/transactions/TransactionRowHeader";
import Animated, {
    LayoutAnimationConfig, runOnJS,
    StretchInY, useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import TransactionResumeModal from "@/lib/components/modals/TransactionResumeModal";
import sleep from "@/lib/helpers/sleep";
import {FlashList} from "@shopify/flash-list";
import {Ionicons} from "@expo/vector-icons";

LogBox.ignoreLogs([
    'Warning: ExpandableCalendar: Support for defaultProps will be removed from function components in a future major release.'
]);


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
    const today = format(new Date(), 'yyyy-MM-dd');
    const [agendaItems, setAgendaItems] = useState<Section[]>([]);
    const [markedDates, setMarkedDates] = useState<MarkedDates>({});
    const {top} = useSafeAreaInsets();
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [selectedTransaction, setSelectedTransaction] = useState<any>({});
    const router = useRouter();
    const [overlayVisible, setOverlayVisible] = useState(false);
    const opacity = useSharedValue(0);
    const [month, setMonth] = useState<number | null>(null);
    const [year, setYear] = useState<number | null>(null);

    const [scrollY, setScrollY] = useState(0);
    const isButtonVisible = useSharedValue(false);
    const sectionListRef = useRef<SectionList>(null);

    useEffect(() => {
        if (overlayVisible) {
            opacity.value = withTiming(0.5, {duration: 300});
        } else {
            opacity.value = withTiming(0, {duration: 300});
        }
    }, [overlayVisible]);

    const handleScroll = (event: any) => {
        setScrollY(event.nativeEvent.contentOffset.y);
        setButtonVisibility(event.nativeEvent.contentOffset.y < event.nativeEvent.contentSize.height - event.nativeEvent.layoutMeasurement.height);
    };

    const buttonAnimatedStyle = useAnimatedStyle(() => {
        return {
            opacity: withTiming(isButtonVisible.value ? 1 : 0, { duration: 300 }),
        };
    });

    // const scrollToBottom = () => {
    //     console.log(sectionListRef.current?.props);
    //     const sectionIndex = sectionListRef.current?.props.sections.length - 1;
    //     const itemIndex = sectionListRef.current?.props.sections[sectionIndex].data.length - 1;
    //
    //     console.log(sectionIndex, itemIndex);
    //     if (sectionListRef.current) {
    //         sectionListRef.current.scrollToLocation({
    //             sectionIndex: 29,
    //             itemIndex: 0,
    //             animated: true,
    //         });
    //     }
    // };

    const onScrollToIndexFailed = (info: any) => {
        const wait = new Promise((resolve) => setTimeout(resolve, 500));
        wait.then(() => {
            sectionListRef.current?.scrollToLocation({
                sectionIndex: info.highestMeasuredFrameIndex,
                itemIndex: 0,
                animated: true,
            });
        });
    };

    const getItemLayout = (data: any, index: number) => ({
        length: 80, // height of each item
        offset: 80 * index,
        index,
    });


    const setButtonVisibility = (visible: boolean) => {
        isButtonVisible.value = visible;
    };


    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
        };
    });


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

    console.log(month);
    console.log(year);



    useEffect(() => {
        setOverlayVisible(true);
        const {start, end} = (month && year) ? getCustomMonthAndYear(month, year) : getCurrentMonth();
        console.log(start, end);
        const userId = auth().currentUser?.uid;
        const userRef = firestore().collection('users').doc(userId);

        const subscriber = firestore()
            .collection('transactions')
            .where('user_id', '==', userRef)
            .where('date', '>', start)
            .where('date', '<', end)
            .onSnapshot(async (documentSnapshot) => {
                const transactionsWithCategories = await Promise.all(documentSnapshot?.docs.map(async doc => {
                    const data = doc.data();
                    let categoryData = null;

                    if (data.category && data.category.get) {
                        const categoryDoc = await data.category.get();
                        categoryData = {id: categoryDoc.id, ...categoryDoc.data()};
                    }
                    return {
                        ...data,
                        id: doc.id,
                        date: doc.data().date?.toDate(),
                        category: categoryData
                    }
                }));

                console.log(transactionsWithCategories.length);

                // const updatedMarkedDates: any = {};
                //
                //
                // transactionsWithCategories.forEach((transaction) => {
                //     updatedMarkedDates[transaction.date.toISOString().split('T')[0]] = {
                //         marked: true,
                //         dotColor: Colors.primary
                //     };
                // });

                // setMarkedDates(updatedMarkedDates);


                // Group tasks by day
                const groupedByDay = transactionsWithCategories?.reduce((acc: {
                    [key: string]: any[]
                }, transaction) => {
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
                        if (transaction.category.type === 'expense') {
                            acc[code].total += transaction.amount;
                        }
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

                // const transactionsByCategory = agendaItems.reduce((acc, section) => {
                //     section.data.forEach(transaction => {
                //         const categoryTitle = transaction.category.title;
                //         if (!acc[categoryTitle]) {
                //             acc[categoryTitle] = [];
                //         }
                //         acc[categoryTitle].push(transaction);
                //     });
                //     return acc;
                // }, {});

                // const transactionsByCategory = agendaItems.reduce((acc, section) => {
                //     section.data.forEach(transaction => {
                //         const categoryTitle = transaction.category.title;
                //         if (!acc[categoryTitle]) {
                //             acc[categoryTitle] = 0;
                //         }
                //         acc[categoryTitle] += transaction.amount;
                //     });
                //     return acc;
                // }, {});

                // const transactionsByCategory = agendaItems.reduce((acc, section) => {
                //     section.data.forEach(transaction => {
                //         const categoryTitle = transaction.category.title;
                //         const currencyCode = transaction.currency.code;
                //         if (!acc[categoryTitle]) {
                //             acc[categoryTitle] = {};
                //         }
                //         if (!acc[categoryTitle][currencyCode]) {
                //             acc[categoryTitle][currencyCode] = 0;
                //         }
                //         acc[categoryTitle][currencyCode] += transaction.amount;
                //     });
                //     return acc;
                // }, {});

                // console.log('Transactions by category:', transactionsByCategory);
                setOverlayVisible(false);
            });

        // const transactions = await firestore()
        //     .collection('transactions')
        //     .where('user_id', '==', userRef)
        //     .where('date', '>', start)
        //     .where('date', '<', end)
        //     .get();
        return () => subscriber();
    }, [month, year]);

    async function onRemoveRow(transaction: any) {
        console.log(transaction);
        await sleep(500)
        const transactionDescription = `${transaction?.title || transaction.category?.title} = ${transaction.currency.symbol} ${transaction.amount}`;
        Alert.alert('Atencion!', `Estas seguro de eliminar esta transaccion?, (${transactionDescription})`, [
            {
                text: 'Cancelar',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel'
            },
            {
                text: 'Eliminar',
                style: 'destructive',
                onPress: async () => {
                    await firestore().collection('transactions').doc(transaction.id).delete();
                }
            }
        ])
    }

    // console.log(agendaItems);

    // const onViewableItemsChanged = ({ viewableItems }: { viewableItems: ViewToken[] }) => {
    //     if (viewableItems.length > 0) {
    //         const topItem = viewableItems[0].item;
    //         const top = viewableItems[0].index;
    //         console.log('Top item:', top);
    //     }
    // };

    const memoizedSectionList = useMemo(() => (
        <SectionList
            // ref={sectionListRef}
            keyExtractor={(item) => item.id}
            sections={agendaItems}
            renderItem={({ item }) => (
                <LayoutAnimationConfig>
                        <TransactionRow transaction={item} cb={() => onPressRow(item)} heightValue={80} onRemove={(t: any) => onRemoveRow(t)} />
                </LayoutAnimationConfig>
            )}
            renderSectionHeader={({ section }) => <TransactionRowHeader totals={section.title.totals} title={section.title.title} />}
            onScroll={handleScroll}
            getItemLayout={getItemLayout}
            onScrollToIndexFailed={onScrollToIndexFailed}
        />
    ), [agendaItems]);


    return (
        <View style={[styles.container, {paddingTop: top}]}>
            {overlayVisible && (
                <Animated.View style={[styles.overlay, animatedStyle]}>
                    <ActivityIndicator/>
                </Animated.View>
            )}

            {/*<SectionList*/}
            {/*    keyExtractor={(item) => item.id}*/}
            {/*    sections={agendaItems}*/}
            {/*    renderItem={({ item }) => (*/}
            {/*        <LayoutAnimationConfig>*/}
            {/*            <Animated.View entering={StretchInY}>*/}
            {/*                <TransactionRow transaction={item} cb={() => onPressRow(item)} heightValue={80} onRemove={(t: any) => onRemoveRow(t)} />*/}
            {/*            </Animated.View>*/}
            {/*        </LayoutAnimationConfig>*/}
            {/*    )}*/}
            {/*    renderSectionHeader={({ section }) => <TransactionRowHeader totals={section.title.totals} title={section.title.title} />}*/}
            {/*/>*/}

            <CalendarProvider
                date={today}
                todayBottomMargin={100}
                todayButtonStyle={{}}
                theme={{
                    todayButtonTextColor: '#000000',
                }}>
                <ExpandableCalendar
                    // TODO: Add year selector
                    // renderHeader={() => (
                    //     <RNDateTimePicker
                    //         value={new Date(today)}
                    //         mode="date"
                    //     />
                    // )}
                    onMonthChange={async (date) => {
                        console.log('month changed', date)
                        setMonth(date.month);
                        setYear(date.year);
                    }}
                    closeOnDayPress
                    // onRefresh={() => console.log('refreshing...')}
                    // refreshControl={
                    //     <RefreshControl
                    //         refreshing={false}
                    //         onRefresh={() => console.log('refreshing...')}
                    //         tintColor={Colors.primary}
                    //     />
                    // }
                    markedDates={{}}
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
                        arrowColor: Colors.primary
                    }}
                />

                {memoizedSectionList}

                {/*<Animated.View style={[styles.floatingButton, buttonAnimatedStyle]}>*/}
                {/*    <Pressable onPress={scrollToBottom} style={styles.button}>*/}
                {/*        <Ionicons name="arrow-down" size={24} color="#fff" />*/}
                {/*    </Pressable>*/}
                {/*</Animated.View>*/}

                {/*<FlashList*/}
                {/*    data={agendaItems}*/}
                {/*    estimatedItemSize={30}*/}
                {/*    renderItem={({item}) => {*/}
                {/*        return (*/}
                {/*            <View>*/}
                {/*                <TransactionRowHeader totals={item.title.totals} title={item.title.title}/>*/}
                {/*                {item.data.map((transaction) => (*/}
                {/*                    <LayoutAnimationConfig key={transaction.id}>*/}
                {/*                        <Animated.View entering={StretchInY}>*/}
                {/*                            <TransactionRow transaction={transaction} cb={() => onPressRow(transaction)} heightValue={90}*/}
                {/*                                            onRemove={(t: any) => onRemoveRow(t)}/>*/}
                {/*                        </Animated.View>*/}
                {/*                    </LayoutAnimationConfig>*/}
                {/*                ))}*/}
                {/*            </View>*/}
                {/*        )*/}
                {/*    }}*/}
                {/*    onViewableItemsChanged={onViewableItemsChanged}*/}
                {/*/>*/}

            </CalendarProvider>

            <View
                style={{height: 80}}
            />


            <Fab/>
            <TransactionResumeModal visible={modalVisible} onClose={() => setModalVisible(false)}
                                    transaction={selectedTransaction} onEdit={() => manageEdit()}
                                    onRemove={onRemoveRow}/>
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        fontSize: 16,
        fontWeight: 'bold',
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 111,
        backgroundColor: 'rgba(355, 355, 355, 0.9)',
    },
    floatingButton: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        backgroundColor: '#000',
        borderRadius: 50,
        padding: 10,
        zIndex: 100,
    },
    button: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});
