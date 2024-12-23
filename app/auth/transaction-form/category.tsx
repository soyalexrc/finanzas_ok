import {
    ActivityIndicator,
    FlatList,
    NativeSyntheticEvent, RefreshControl,
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

export default function Screen() {
    const currentTransaction = useAppSelector(selectCurrentTransaction);
    const [categories, setCategories] = useState<any[]>([]);
    const [filteredCategories, setFilteredCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(true);
    const {top} = useSafeAreaInsets();
    const router = useRouter();

    const debouncedUpdateSearch = useCallback(
        debounce((query: string) => {
            const t = searchFilter(query);
            console.log('filtered', t);
            setFilteredCategories(t)
        }, 500),
        [categories]
    );

    function searchFilter(query: string): any[] {
        if (!query || !categories.length) {
            return categories;
        }
        return categories.filter((category) => {
            const titleMatch = category.title?.toLowerCase().includes(query.toLowerCase());
            const descriptionMatch = category.description?.toLowerCase().includes(query.toLowerCase());
            return titleMatch || descriptionMatch;
        });
    }

    async function getCategories(isFirstTime = true) {
        if (isFirstTime) setLoading(true);
        const userId = auth().currentUser?.uid;

        if (userId) {
            const userRef = firestore().collection('users').doc(userId);
            const result = await firestore()
                .collection('categories')
                .where('userId', '==', userRef)
                .get();

            const data = result.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            setLoading(false);
            setCategories(data);
            setFilteredCategories(data);
            setRefreshing(false);
        }
    }

    useFocusEffect(
        useCallback(() => {
            getCategories();
        }, [])
    );

    return (
        <View style={[styles.container, {paddingTop: top}]}>
            <Stack.Screen
                options={{
                    title: 'Seleccionar Categoria',
                    headerBackTitle: 'Atras',
                    headerRight: () => (
                        <TouchableOpacity onPress={() => router.push('/auth/transaction-form/new-category')}>
                            <Ionicons name="add-circle" color={Colors.primary} size={30} />
                        </TouchableOpacity>
                    ),
                    headerSearchBarOptions: {
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
                                    getCategories(false);
                                }, 1000);
                            }}
                        />
                    }
                    contentInsetAdjustmentBehavior="automatic"
                    data={filteredCategories}
                    renderItem={({item}) => <CategoryRow category={item} cb={() => router.back()} selected={currentTransaction.category} />}
                    keyExtractor={(item) => item.id}
                />
            }
        </View>
    )
}

function CategoryRow({category, cb, selected}: any) {
    const dispatch = useAppDispatch();

    const onPressCategory = () => {
        if (selected.id === category.id) {
            cb();
            return;
        }
        dispatch(onChangeCategory({
            id: category.id,
            title: category.title,
            description: category.description,
            icon: category.icon,
            type: category.type,
        }));
        cb();
    }

    return (
        <TouchableOpacity style={[styles.category, selected.id === category.id && styles.selectedCategory]} onPress={onPressCategory}>
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <View>
                <Text style={styles.categoryTitle}>{category.title}</Text>
                <Text style={styles.categoryDescription}>{category.description}</Text>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#fff'
    },
    category: {
        flexDirection: 'row',
        gap: 10,
        padding: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'lightgray'
    },
    selectedCategory: {
        backgroundColor: '#f3f3f3',
        borderRadius: 8,
        padding: 10
    },
    categoryIcon: {
        fontSize: 30
    },
    categoryTitle: {
        fontSize: 16,
        fontWeight: 'bold'
    },
    categoryDescription: {
        fontSize: 14,
        color: 'gray'
    }
})
