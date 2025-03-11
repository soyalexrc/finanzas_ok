import {
    ActivityIndicator,
    Alert, Platform,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import {Stack, useLocalSearchParams, useRouter} from "expo-router";
import {Ionicons} from "@expo/vector-icons";
import {Colors} from "@/lib/constants/colors";
import {useCallback, useEffect, useRef, useState} from "react";
import firestore from "@react-native-firebase/firestore";
import {format} from "date-fns";
import {es} from "date-fns/locale";
import {Section} from "@/lib/utils/api/transactions";
import Animated, {
    LayoutAnimationConfig,
    StretchInY,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from "react-native-reanimated";
import {FlashList} from "@shopify/flash-list";
import TransactionRowHeader from "@/lib/components/transactions/TransactionRowHeader";
import TransactionRow from "@/lib/components/transactions/TransactionRow";
import * as Haptics from "expo-haptics";
import {debounce} from "lodash";
import sleep from "@/lib/helpers/sleep";
import api from "@/lib/utils/api";
import endpoints from "@/lib/utils/api/endpoints";
import {toast} from "sonner-native";
import {useAuth} from "@/lib/context/AuthContext";
import TransactionResumeModal from "@/lib/components/modals/TransactionResumeModal";

export default function Screen() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const { id } = useLocalSearchParams<{ id: string }>();
    const {token} = useAuth();
    const router = useRouter();
    const [overlayVisible, setOverlayVisible] = useState(false);
    const flashListRef = useRef<any>(null);
    const opacity = useSharedValue(0);
    const [selectedTransaction, setSelectedTransaction] = useState<any>({});
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [showScrollToTopButton, setShowScrollToTopButton] = useState(false);
    const isIos = Platform.OS === 'ios';

    useEffect(() => {
        if (overlayVisible) {
            opacity.value = withTiming(0.5, {duration: 300});
        } else {
            opacity.value = withTiming(0, {duration: 300});
        }
    }, [overlayVisible]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
        };
    });

    const buttonAnimatedStyle = useAnimatedStyle(() => {
        return {
            opacity: withTiming(showScrollToTopButton ? 1 : 0, {duration: 300}),
        };
    });

    const handleScroll = (event: any) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        setShowScrollToTopButton(offsetY > 500); // Show button when scrolled down 100 pixels
    };


// Function to scroll to the top
    const scrollToTop = () => {
        flashListRef.current?.scrollToIndex({index: 0, animated: true});
    };



    useEffect(() => {
        if (!id) return;
        const spaceRef = firestore().collection('shared-spaces').doc(id);
        const subscription = firestore()
            .collection('shared-transactions')
            .where('spaceId', '==', spaceRef)
            .onSnapshot((documentSnapshot: any) => {
                const rawTransactions = documentSnapshot.docs.map((doc: any) => {
                    const data = doc.data();
                    const created = data.created ? data.created.toDate() : null;
                    return {...data, id: doc.id, created}
                })

                const groupedByDay = rawTransactions?.reduce((acc: { [key: string]: any[] }, transaction: any) => {
                    const day = format(new Date(transaction.created || new Date()), 'd MMM · eeee', {locale: es});
                    if (!acc[day]) {
                        acc[day] = [];
                    }
                    acc[day].push(transaction);
                    return acc;
                }, {});

                const listData: Section[] = Object.entries(groupedByDay || {}).map(([day, transactions]: [string, any]) => {
                    const totals: any = transactions?.reduce((acc: {
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

                // Sort sections by date
                listData.sort((a, b) => {
                    const dateA = new Date(a.data[0].created || new Date());
                    const dateB = new Date(b.data[0].created || new Date());
                    return dateA.getTime() - dateB.getTime();
                });

                setTransactions(listData);

            });

        return () => subscription();
    }, []);

    console.log('transactions', transactions)

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

// Debounced search update
//     const debouncedUpdateSearch = useCallback(
//         debounce((query: string) => {
//             setSearchTerm(query); // 🔹 Update the searchTerm state, triggering refetch
//         }, 500),
//         []
//     );


    function manageEdit() {
        router.push('/auth/transaction-form');
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
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: 'Espacios compartidos',
                    headerShadowVisible: false,
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={30} color={Colors.primary}/>
                        </TouchableOpacity>
                    ),
                    headerRight: () => (
                        <TouchableOpacity onPress={() => router.push({ pathname: '/auth/transaction-form', params: { spaceId: id } })}>
                            <Ionicons name="add" size={30} color={Colors.primary}/>
                        </TouchableOpacity>
                    )
                }}
            />
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
                keyExtractor={(item) => item.title.title}
                renderItem={({item}) => {
                    return (
                        <View>
                            <TransactionRowHeader totals={item.title.totals} title={item.title.title}/>
                            {item.data.map((transaction: any) => (
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
        backgroundColor: Colors.background,
        flex: 1,
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
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 111,
        backgroundColor: 'rgba(355, 355, 355, 0.9)',
    },
})

