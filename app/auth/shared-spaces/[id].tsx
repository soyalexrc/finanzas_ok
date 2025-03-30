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
import {Entypo, Ionicons} from "@expo/vector-icons";
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
import Fab from "@/lib/components/transactions/Fab";
import {useSearchParams} from "expo-router/build/hooks";
import * as DropdownMenu from 'zeego/dropdown-menu'

export default function Screen() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const {id} = useLocalSearchParams<{ id: string }>();
    const params = useSearchParams();
    const title = params.get('title') ? decodeURIComponent(params.get('title') ?? '') : "Espacio compartido";

    const {token, user} = useAuth();
    const router = useRouter();
    const [overlayVisible, setOverlayVisible] = useState(false);
    const [canDelete, setCanDelete] = useState(false);
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

        validateDeletePermission();

        return () => subscription();
    }, []);

    async function validateDeletePermission() {
        if (!user) return;
        const spaceRef = firestore().collection('shared-spaces').doc(id);
        const doc = await spaceRef.get();
        const data = doc.data();
        const isOwner = data?.authorId === user._id;

        setCanDelete(isOwner)
    }


    async function onPressRow(transaction: any) {
        console.log('transaction prev', transaction)
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedTransaction({
            date: transaction?.created,
            amount: transaction?.amount,
            currency: transaction?.currency,
            author: transaction?.author,
            category: {
                id: transaction?.category?._id || '',
                title: transaction?.category.title || '',
                icon: transaction?.category?.icon || '',
                type: transaction?.category?.type || '',
                description: transaction?.category?.description || ''
            },
            description: transaction?.description || '',
            documents: [],
            images: transaction?.images || [],
            title: transaction?.title || '',
            _id: transaction?.transactionId,
            id: transaction.id
        });
        setModalVisible(true)
    }

    async function deleteSpace() {
        const title = params.get('title') ? decodeURIComponent(params.get('title') ?? '') : "";
        Alert.alert(`Eliminar espacio compartido ${title}`, 'Estas seguro de continuar? Se perderan las transacciones asociadas.', [
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
                        if (!id) return;

                        const spaceRef = firestore().collection('shared-spaces').doc(id);

                        //     delete all transaction from spaceRef
                        const transactionsRef = firestore().collection('shared-transactions').where('spaceId', '==', spaceRef);
                        const transactionsSnapshot = await transactionsRef.get();
                        const batch = firestore().batch();
                        transactionsSnapshot.forEach((doc) => {
                            batch.delete(doc.ref);
                        });
                        await batch.commit();

                        // delete space
                        await spaceRef.delete();

                        toast.success('Espacio eliminado correctamente', {
                            className: 'bg-green-500',
                            duration: 6000,
                            icon: <Ionicons name="checkmark-circle" size={24} color="green"/>,
                        })
                        router.back();
                    } catch (error: any) {
                        console.error('Error deleting space:', error);
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

// Debounced search update
//     const debouncedUpdateSearch = useCallback(
//         debounce((query: string) => {
//             setSearchTerm(query); // 🔹 Update the searchTerm state, triggering refetch
//         }, 500),
//         []
//     );


    function manageEdit() {
        router.push({
            pathname: '/auth/transaction-form',
            params: {spaceId: id, sharedTransactionId: selectedTransaction.id}
        });
    }

    async function onRemoveRow(transaction: any) {
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
                        const response = await api.delete(endpoints.transactions.delete + '/' + transaction.transactionId, {
                            headers: {
                                authorization: `Bearer ${token}`
                            }
                        })

                        if (response.status === 200) {
                            const result = await firestore()
                                .collection('shared-transactions')
                                .doc(transaction.id)
                                .delete();
                            console.log(result);
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
                    title,
                    headerShadowVisible: false,
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={24} color={Colors.primary}/>
                        </TouchableOpacity>
                    ),
                    headerRight: () => (
                        <DropdownMenu.Root key="lists-menu">
                            <DropdownMenu.Trigger>
                                <TouchableOpacity>
                                    <Entypo name="dots-three-horizontal" size={24} color='gray'/>
                                </TouchableOpacity>
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Content>
                                {
                                    canDelete &&
                                    <DropdownMenu.Item key="remove"
                                                       onSelect={deleteSpace}>
                                        <DropdownMenu.ItemIcon
                                            ios={{
                                                name: 'trash.fill', // required
                                                pointSize: 16,
                                                weight: 'semibold',
                                                scale: 'medium',
                                                // can also be a color string. Requires iOS 15+
                                                hierarchicalColor: {
                                                    dark: 'red',
                                                    light: 'red',
                                                },

                                                // alternative to hierarchical color. Requires iOS 15+
                                                paletteColors: [
                                                    {
                                                        dark: 'red',
                                                        light: 'red',
                                                    },
                                                ],
                                            }}
                                        >
                                        </DropdownMenu.ItemIcon>
                                        <DropdownMenu.ItemTitle>Eliminar espacio</DropdownMenu.ItemTitle>
                                    </DropdownMenu.Item>
                                }


                                <DropdownMenu.Arrow/>
                            </DropdownMenu.Content>
                        </DropdownMenu.Root>

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
                keyExtractor={(item, index) => item.title.title + index}
                renderItem={({item}) => {
                    return (
                        <View>
                            <TransactionRowHeader totals={item.title.totals} title={item.title.title}/>
                            {item.data.map((transaction: any) => (
                                <LayoutAnimationConfig key={transaction.id}>
                                    <Animated.View entering={StretchInY}>
                                        <TransactionRow transaction={transaction} cb={() => onPressRow(transaction)}
                                                        heightValue={90}
                                                        showPhoto={true}
                                                        allowDelete={user?._id === transaction?.author?._id}
                                                        onRemove={(t: any) => onRemoveRow(t)}/>
                                    </Animated.View>
                                </LayoutAnimationConfig>
                            ))}
                        </View>
                    )
                }}
                onScroll={handleScroll}
            />

            <Fab onPress={() => router.push({pathname: '/auth/transaction-form', params: {spaceId: id}})}/>

            <TransactionResumeModal visible={modalVisible} onClose={() => setModalVisible(false)}
                                    transaction={selectedTransaction} onEdit={() => manageEdit()}
                                    allowEdit={user?._id === selectedTransaction?.author?._id}
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

