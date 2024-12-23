import {
    ActivityIndicator,
    FlatList,
    NativeSyntheticEvent, RefreshControl, SafeAreaView,
    StyleSheet,
    Text,
    TextInputFocusEventData,
    TouchableOpacity,
    View
} from "react-native";
import {debounce} from "lodash";
import {useCallback, useEffect, useLayoutEffect, useState} from "react";
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
import Animated, {LayoutAnimationConfig, StretchInY} from "react-native-reanimated";
import TransactionRow from "@/lib/components/transactions/TransactionRow";
import * as Haptics from "expo-haptics";
import Fab from "@/lib/components/transactions/Fab";
import TransactionResumeModal from "@/lib/components/ui/modals/TransactionResumeModal";

export default function Screen() {
    const currentTransaction = useAppSelector(selectCurrentTransaction);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(true);
    const router = useRouter();
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [selectedTransaction, setSelectedTransaction] = useState<any>({});

    const debouncedUpdateSearch = useCallback(
        debounce((query: string) => {
            const t = searchFilter(query);
            setFilteredTransactions(t)
        }, 500),
        [transactions]
    );

    function searchFilter(query: string): any[] {
        if (!query) {
            return transactions;
        }
        return transactions.filter((t) => {
            return t.title.toLowerCase().includes(query.toLowerCase()) || t.description.toLowerCase().includes(query.toLowerCase());
        });
    }

    async function getTransactions(isFirstTime = true) {
        if (isFirstTime) setLoading(true);
        const userId = auth().currentUser?.uid;

        if (userId) {
            const userRef = firestore().collection('users').doc(userId);
            const result = await firestore()
                .collection('transactions')
                .where('user_id', '==', userRef)
                .get();

            const data = await Promise.all(result.docs.map(async doc => {
                const transactionData = doc.data();
                let categoryData = null;

                if (transactionData.category && transactionData.category.get) {
                    const categoryDoc = await transactionData.category.get();
                    categoryData = { id: categoryDoc.id, ...categoryDoc.data() };
                }

                return {
                    id: doc.id,
                    ...transactionData,
                    date: transactionData.date?.toDate(),
                    category: categoryData
                };
            }));

            setLoading(false);
            setTransactions(data);
            setFilteredTransactions(data);
            setRefreshing(false);
        }
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

    function manageEdit() {
        router.push('/auth/transaction-form');
    }


    useEffect(() => {
        getTransactions();
    }, []);

    return (
        <SafeAreaView style={[styles.container]}>
            <Stack.Screen
                options={{
                    title: 'Buscar',
                    headerLargeTitle: true,
                    headerBackTitle: 'Atras',
                    headerSearchBarOptions: {
                        placeholder: 'Buscar',
                        onChangeText: (e: NativeSyntheticEvent<TextInputFocusEventData>) => debouncedUpdateSearch(e.nativeEvent.text),
                    },
                }}
            />
            {
                loading &&
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <ActivityIndicator/>
                </View>
            }
            {
                !loading &&
                <FlatList
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => {
                                setRefreshing(true)
                                setTimeout(() => {
                                    getTransactions(false);
                                }, 1000);
                            }}
                        />
                    }
                    contentInsetAdjustmentBehavior="automatic"
                    data={filteredTransactions}
                    renderItem={({item}) => (
                        <LayoutAnimationConfig>
                            <Animated.View entering={StretchInY}>
                                <TransactionRow transaction={item} cb={() => onPressRow(item)}/>
                            </Animated.View>
                        </LayoutAnimationConfig>
                    )}
                    keyExtractor={(item) => item.id}
                />
            }
            <Fab/>
            <TransactionResumeModal visible={modalVisible} onClose={() => setModalVisible(false)} transaction={selectedTransaction} onEdit={() => manageEdit()} />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#fff'
    },
})
