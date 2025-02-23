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
import TransactionResumeModal from "@/lib/components/modals/TransactionResumeModal";
import {FlashList} from "@shopify/flash-list";
import {useAuth} from "@/lib/context/AuthContext";
import {useRawTransactions} from "@/lib/utils/api/transactions";
import {getCurrentMonth} from "@/lib/helpers/date";

export default function Screen() {
    const currentTransaction = useAppSelector(selectCurrentTransaction);
    const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [refreshing, setRefreshing] = useState<boolean>(true);
    const router = useRouter();
    const {bottom} = useSafeAreaInsets();
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [selectedTransaction, setSelectedTransaction] = useState<any>({});
    const {user, token} = useAuth();
    const [dateFrom, setDateFrom] = useState<string>(getCurrentMonth().start.toISOString());
    const [dateTo, setDateTo] = useState<string>(getCurrentMonth().end.toISOString());
    const [searchTerm, setSearchTerm] = useState<string>('')

    const {data: transactions, refetch, isFetching} = useRawTransactions(user?._id ?? '', dateFrom, dateTo, searchTerm, token);
    const navigation = useNavigation();

    console.log('transactions', transactions)

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


    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refetch()
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    }, []);


    return (
        <SafeAreaView style={[styles.container]}>
            {
                isFetching &&
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <ActivityIndicator/>
                </View>
            }
            {
                !isFetching &&
                <FlashList
                    data={transactions}
                    estimatedItemSize={80}
                    contentInsetAdjustmentBehavior="automatic"
                    ListHeaderComponent={<Text style={{ margin: 10 }}>{transactions?.length} Resultados</Text>}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}
                    keyExtractor={(item: any) => item._id}
                    renderItem={({item}) => (
                        <LayoutAnimationConfig>
                            <Animated.View entering={StretchInY}>
                                <TransactionRow transaction={item} cb={() => onPressRow(item)}/>
                            </Animated.View>
                        </LayoutAnimationConfig>
                    )}
                    ListFooterComponent={<View style={{ height: bottom }} />}
                />
            }
            <Fab/>
            {/*<TransactionResumeModal visible={modalVisible} onClose={() => setModalVisible(false)} transaction={selectedTransaction} onEdit={() => manageEdit()} />*/}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    icon: {
        color: '#000',
    },
})
