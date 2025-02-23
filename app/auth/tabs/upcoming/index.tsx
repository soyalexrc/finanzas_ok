import {
    ActivityIndicator,
    Alert,
    Button,
    LogBox, Platform, Pressable,
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
import {load, loadString} from "@/lib/utils/storage";
import api from "@/lib/utils/api";
import endpoints from "@/lib/utils/api/endpoints";
import {toast} from "sonner-native";
import {useAuth} from "@/lib/context/AuthContext";

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
    const [refreshing, setRefreshing] = useState(false);
    const opacity = useSharedValue(0);
    const [month, setMonth] = useState<number | null>(null);
    const [year, setYear] = useState<number | null>(null);

    const isIos = Platform.OS === 'ios';
    const {user, token} = useAuth();
    const [showScrollToTopButton, setShowScrollToTopButton] = useState(false);
    const isButtonVisible = useSharedValue(false);
    const flashListRef = useRef<any>(null);

    useEffect(() => {
        if (overlayVisible) {
            opacity.value = withTiming(0.5, {duration: 300});
        } else {
            opacity.value = withTiming(0, {duration: 300});
        }
    }, [overlayVisible]);

    const handleScroll = (event: any) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        setShowScrollToTopButton(offsetY > 500); // Show button when scrolled down 100 pixels
    };


// Function to scroll to the top
    const scrollToTop = () => {
        flashListRef.current?.scrollToIndex({index: 0, animated: true});
    };

// Animated style for the button
    const buttonAnimatedStyle = useAnimatedStyle(() => {
        return {
            opacity: withTiming(showScrollToTopButton ? 1 : 0, {duration: 300}),
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

    // const onScrollToIndexFailed = (info: any) => {
    //     const wait = new Promise((resolve) => setTimeout(resolve, 500));
    //     wait.then(() => {
    //         sectionListRef.current?.scrollToLocation({
    //             sectionIndex: info.highestMeasuredFrameIndex,
    //             itemIndex: 0,
    //             animated: true,
    //         });
    //     });
    // };

    const getItemLayout = (data: any, index: number) => ({
        length: 80, // height of each item
        offset: 80 * index,
        index,
    });


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
            _id: transaction?._id
        });
        setModalVisible(true)
    }


    useEffect(() => {
        getTransactions();
    }, [month, year]);


    async function getTransactions(loading = true) {
        if (loading) setOverlayVisible(true);
        try {
            const {start, end} = (month && year) ? getCustomMonthAndYear(month, year) : getCurrentMonth();
            console.log(start, end);
            // const userRef = firestore().collection('users').doc(userId);

            const payload = {
                userId: user?._id ?? '',
                dateFrom: start.toISOString(),
                dateTo: end.toISOString()
            }

            console.log('payload', payload);

            const response = await api.post(endpoints.transactions.listByUser, payload, {
                headers: {
                    authorization: `Bearer ${token}`
                }
            })


            const trs = response.data;
            console.log('trs', trs)

            const updatedMarkedDates: any = {};


            trs.forEach((transaction: any) => {
                updatedMarkedDates[transaction.date.split('T')[0]] = {
                    marked: true,
                    dotColor: Colors.primary
                };
            });
            //
            setMarkedDates(updatedMarkedDates);


            console.log('markedDates', updatedMarkedDates);


            // Group tasks by day
            const groupedByDay: any = trs?.reduce((acc: {
                [key: string]: any[]
            }, transaction: any) => {
                const day = format(new Date(transaction.date || new Date()), 'd MMM · eeee', {locale: es});
                if (!acc[day]) {
                    acc[day] = [];
                }
                acc[day].push(transaction);
                return acc;
            }, {});

            console.log('groupedByDay', groupedByDay);


            // Convert grouped data to sections array
            const listData: any[] = Object.entries(groupedByDay || {}).map(([day, transactions]: any) => {
                const totals = transactions.reduce((acc: {
                    [key: string]: { code: string, symbol: string, total: number }
                }, transaction: any) => {
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

            console.log('listData', listData);


            // Sort sections by date
            listData.sort((a, b) => {
                const dateA = new Date(a.data[0].date || new Date());
                const dateB = new Date(b.data[0].date || new Date());
                return dateB.getTime() - dateA.getTime();
            });

            console.log('listDataSort', listData);


            setAgendaItems(listData);

            if (loading) {
                setOverlayVisible(false);
                setRefreshing(false);
            }


        } catch (error) {
            console.error(error);
        }
    }

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
                    try {
                        const response = await api.delete(endpoints.transactions.delete + '/' + transaction._id, {
                            headers: {
                                authorization: `Bearer ${token}`
                            }
                        })

                        if (response.status === 200) {
                            toast.success(response.data.message, {
                                className: 'bg-green-500',
                                duration: 6000,
                                icon: <Ionicons name="checkmark-circle" size={24} color="green"/>,
                            })
                            await getTransactions(false)
                        }
                    } catch (error: any) {
                        toast.error('Ocurrio un error', {
                            className: 'bg-red-500',
                            description: error.message,
                            duration: 6000,
                            icon: <Ionicons name="close-circle" size={24} color="red"/>,
                        });
                    }
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
                // todayButtonStyle={{
                //     bottom: isIos ? 100 : -100
                // }}
                // showTodayButton={true}
                theme={{
                    todayButtonTextColor: '#000000',
                }}>
                <ExpandableCalendar
                    // TODO: Add year selector
                    disablePan={true}
                    // renderHeader={() => (
                    //     <RNDateTimePicker
                    //         value={new Date(today)}
                    //         mode="date"
                    //     />
                    // )}
                    onDayPress={(date) => {
                        console.log(date);
                    }}
                    onMonthChange={async (date) => {
                        console.log('month changed', date)
                        setMonth(date.month);
                        setYear(date.year);
                    }}
                    // closeOnDayPress
                    // onRefresh={() => console.log('refreshing...')}
                    // refreshControl={
                    //     <RefreshControl
                    //         refreshing={false}
                    //         onRefresh={() => console.log('refreshing...')}
                    //         tintColor={Colors.primary}
                    //     />
                    // }
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
                        arrowColor: Colors.primary
                    }}
                />

                <FlashList
                    data={agendaItems}
                    estimatedItemSize={50}
                    ref={flashListRef}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => {
                                getTransactions(false)
                                    .then(() => {
                                        setTimeout(() => {
                                            setRefreshing(false)
                                        }, 2000)
                                    })
                            }}
                            tintColor={Colors.primary}
                        />
                    }
                    renderItem={({item}) => {
                        return (
                            <View>
                                <TransactionRowHeader totals={item.title.totals} title={item.title.title}/>
                                {item.data.map((transaction) => (
                                    <LayoutAnimationConfig key={transaction._id}>
                                        <Animated.View entering={StretchInY}>
                                            <TransactionRow transaction={transaction} cb={() => onPressRow(transaction)}
                                                            heightValue={90}
                                                            onRemove={(t: any) => onRemoveRow(t)}/>
                                        </Animated.View>
                                    </LayoutAnimationConfig>
                                ))}
                            </View>
                        )
                    }}
                    onScroll={handleScroll}
                />

            </CalendarProvider>

            {isIos && <View style={{height: 80}}/>}


            <Fab/>
            <TransactionResumeModal visible={modalVisible} onClose={() => setModalVisible(false)}
                                    transaction={selectedTransaction} onEdit={() => manageEdit()}
                                    onRemove={onRemoveRow}/>

            <Animated.View style={[styles.floatingButton, buttonAnimatedStyle, {bottom: isIos ? 100 : 20}]}>
                <Pressable onPress={scrollToTop} style={styles.button}>
                    <Ionicons name="arrow-up" size={24} color="#fff"/>
                </Pressable>
            </Animated.View>
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
