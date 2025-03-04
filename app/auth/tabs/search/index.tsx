import {
    ActivityIndicator, Alert,
    FlatList, LogBox,
    NativeSyntheticEvent, Platform, Pressable, RefreshControl, SafeAreaView,
    StyleSheet,
    Text,
    TextInputFocusEventData,
    TouchableOpacity,
    View
} from "react-native";
import {debounce} from "lodash";
import {useCallback, useEffect, useLayoutEffect, useRef, useState} from "react";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {Stack, useFocusEffect, useNavigation, useRouter} from "expo-router";
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import {
    onChangeCategory,
    onChangeNotes,
    selectCurrentTransaction
} from "@/lib/store/features/transactions/transactions.slice";
import {Colors} from "@/lib/constants/colors";
import {Ionicons} from "@expo/vector-icons";
import Animated, {
    LayoutAnimationConfig,
    StretchInY,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from "react-native-reanimated";
import TransactionRow from "@/lib/components/transactions/TransactionRow";
import * as Haptics from "expo-haptics";
import Fab from "@/lib/components/transactions/Fab";
import TransactionResumeModal from "@/lib/components/modals/TransactionResumeModal";
import {FlashList} from "@shopify/flash-list";
import {useAuth} from "@/lib/context/AuthContext";
import {useRawTransactions, useTransactionsGroupedByDay} from "@/lib/utils/api/transactions";
import {getCurrentMonth, getCustomMonthAndYear, getCustomMonthRange} from "@/lib/helpers/date";
import sleep from "@/lib/helpers/sleep";
import api from "@/lib/utils/api";
import endpoints from "@/lib/utils/api/endpoints";
import {toast} from "sonner-native";
import {CalendarProvider, ExpandableCalendar, LocaleConfig} from "react-native-calendars";
import TransactionRowHeader from "@/lib/components/transactions/TransactionRowHeader";
import {format} from "date-fns";
import {es} from "date-fns/locale";
import {MarkedDates} from "react-native-calendars/src/types";

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
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [selectedTransaction, setSelectedTransaction] = useState<any>({});
    const router = useRouter();
    const [overlayVisible, setOverlayVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const opacity = useSharedValue(0);
    // const [month, setMonth] = useState<number | null>(null);
    // const [year, setYear] = useState<number | null>(null);

    const isIos = Platform.OS === 'ios';
    const {user, token} = useAuth();
    const [showScrollToTopButton, setShowScrollToTopButton] = useState(false);
    // const isButtonVisible = useSharedValue(false);
    const flashListRef = useRef<any>(null);

    // const currentTransaction = useAppSelector(selectCurrentTransaction);
    const [dateFrom, setDateFrom] = useState<string>(getCurrentMonth().start.toISOString());
    const [dateTo, setDateTo] = useState<string>(getCurrentMonth().end.toISOString());
    const [searchTerm, setSearchTerm] = useState<string>('')

    const {data: transactions, refetch, isFetching} = useTransactionsGroupedByDay(user?._id ?? '', dateFrom, dateTo, searchTerm, token);
    const navigation = useNavigation();



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



    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
        };
    });


    async function onPressRow(transaction: any) {
        console.log('transaction prev', transaction)
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


    useLayoutEffect(() => {
        navigation.setOptions({
            headerSearchBarOptions: {
                autoCapitalize: 'none',
                inputType: 'text',
                placeholder: 'Buscar',
                onChangeText: (e: NativeSyntheticEvent<TextInputFocusEventData>) => debouncedUpdateSearch(e.nativeEvent.text),
            },
            headerRight: () => (
                <TouchableOpacity>
                    <Ionicons name="filter" size={24} style={styles.icon} />
                </TouchableOpacity>
            )
        })
    }, []);

// Debounced search update
    const debouncedUpdateSearch = useCallback(
        debounce((query: string) => {
            setSearchTerm(query); // 🔹 Update the searchTerm state, triggering refetch
        }, 500),
        []
    );


    function manageEdit() {
        router.push('/auth/transaction-form');
    }


    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refetch()
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    }, []);


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
                            await refetch()
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



    return (
        <SafeAreaView style={[styles.container]}>
            {overlayVisible && (
                <Animated.View style={[styles.overlay, animatedStyle]}>
                    <ActivityIndicator/>
                </Animated.View>
            )}


            <FlashList
                data={transactions}
                estimatedItemSize={200}
                ref={flashListRef}
                contentInsetAdjustmentBehavior="automatic"
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => onRefresh()}
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


            {/*{isIos && <View style={{height: 80}}/>}*/}


            <Fab/>
            <TransactionResumeModal visible={modalVisible} onClose={() => setModalVisible(false)}
                                    transaction={selectedTransaction} onEdit={() => manageEdit()}
                                    onRemove={onRemoveRow}/>

            <Animated.View style={[styles.floatingButton, buttonAnimatedStyle, {bottom: isIos ? 100 : 20}]}>
                <Pressable onPress={scrollToTop} style={styles.button}>
                    <Ionicons name="arrow-up" size={24} color="#fff"/>
                </Pressable>
            </Animated.View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        position: 'relative'
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
    icon: {
        color: Colors.dark
    }
});
