import {
    ActivityIndicator,
    FlatList,
    NativeSyntheticEvent,
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
import {useNavigation} from "expo-router";

export default function Screen() {
    const [categories, setCategories] = useState<any[]>([]);
    const [filteredCategories, setFilteredCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const {top} = useSafeAreaInsets();
    const navigation = useNavigation();

    const debouncedUpdateSearch = useCallback(
        debounce((query: string) => {
            const t = searchFilter(query);
            setFilteredCategories(t)
        }, 500),
        []
    );

    function searchFilter(query: string): any[] {
        if (!query) {
            return categories;
        }
        return categories.filter((category) => {
            return category.title.toLowerCase().includes(query.toLowerCase()) || category.description.toLowerCase().includes(query.toLowerCase());
        });
    }

    async function getCategories() {
        setLoading(true);
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
        }
    }

    useEffect(() => {
        getCategories();
    }, []);


    useLayoutEffect(() => {
        navigation.setOptions({
            headerSearchBarOptions: {
                onChangeText: (e: NativeSyntheticEvent<TextInputFocusEventData>) => debouncedUpdateSearch(e.nativeEvent.text),
            },
        })
    }, [navigation]);

    return (
        <View style={[styles.container, {paddingTop: top}]}>
            {
                loading &&
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <ActivityIndicator/>
                </View>
            }
            {
                !loading &&
                <FlatList
                    contentInsetAdjustmentBehavior="automatic"
                    data={filteredCategories}
                    renderItem={({item}) => <CategoryRow category={item}/>}
                    keyExtractor={(item) => item.id}
                />
            }
        </View>
    )
}

function CategoryRow({category}: any) {
    return (
        <TouchableOpacity style={styles.category}>
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
