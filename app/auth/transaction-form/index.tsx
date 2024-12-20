import {
    Dimensions,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View
} from "react-native";
import usePlatform from "@/lib/hooks/usePlatform";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {AntDesign, Entypo, FontAwesome, Ionicons} from "@expo/vector-icons";
import {Stack, useRouter} from "expo-router";
import TransactionKeyboard from "@/lib/components/transactions/TransactionKeyboard";
import {Colors} from "@/lib/constants/colors";

const actionsRow = [
    {
        id: '1',
        label: 'Fecha',
        icon: <Entypo name="select-arrows" size={20} color="#000"/>,
        href: '/auth/transaction-form/date'
    },
    {
        id: '2',
        label: 'Categoria',
        icon: <Entypo name="select-arrows" size={20} color="#000"/>,
        href: '/auth/transaction-form/category'
    },
    {
        id: '3',
        label: 'Description',
        icon: <FontAwesome name="commenting-o" size={20} color="#000"/>,
        href: '/auth/transaction-form/description'
    },
    {
        id: '4',
        label: 'Evidencias',
        icon: <Ionicons name="camera" size={20} color="black"/>,
        href: '/auth/transaction-form/camera'
    },
    {
        id: '5',
        label: 'Documentos',
        icon: <Ionicons name="document-attach-outline" size={20} color="black"/>,
        href: '/auth/transaction-form/documents'
    },
    {
        id: '6',
        label: 'Mas Opciones',
        icon:  <Entypo name="dots-three-vertical" size={20} color="black"/>,
        href: '/auth/transaction-form/more-options',
    }
]


export default function Screen() {
    const platform = usePlatform();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const {height} = useWindowDimensions();
    const isSmallPhone = height <= 812;
    const isMediumPhone = height > 812 && height < 855

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    headerRight: () => (
                        <TouchableOpacity>
                            <Text style={styles.doneButton}>Guardar</Text>
                        </TouchableOpacity>
                    ),
                    headerLeft: () => (
                        <TouchableOpacity>
                            <Text style={styles.backButton}>Atras</Text>
                        </TouchableOpacity>
                    ),
                    headerShadowVisible: false,
                    title: ''
                }}
            />
            <View style={{flex: 1}}>
                <View style={{
                    flex: isSmallPhone ? 0.5 : isMediumPhone ? 0.4 : 0.45,
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        gap: 2,
                        marginBottom: 10
                    }}>
                        <Text style={{marginTop: 10, fontSize: 35, fontWeight: 'bold', color: 'gray'}}>$</Text>
                        <Text style={{fontSize: 50}}>1,500.23</Text>
                    </View>
                    <View>
                        <Text>USD</Text>
                    </View>
                </View>
                <View style={{flex: isSmallPhone ? 0.5 : isMediumPhone ? 1.5 : 1.45}}>
                    <View style={{ height: 80 }}>
                        <FlatList
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            data={actionsRow}
                            ItemSeparatorComponent={() => <View style={{width: 10}}/>}
                            keyExtractor={(item) => item.id}
                            renderItem={({item}) => (
                                <TouchableOpacity
                                    onPress={() => router.push(item.href as any)}
                                    style={[
                                        styles.categoriesWrapper, {
                                            backgroundColor: 'lightgray',
                                            padding: 10,
                                            marginVertical: 20,
                                            borderRadius: 12
                                        }
                                    ]}
                                >
                                    <View style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        flex: 1,
                                        gap: 5
                                    }}>
                                        <Text style={{fontSize: 16}}>{item.label}</Text>
                                        {item.icon}
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                    <View style={{flexDirection: 'row', gap: 5, alignItems: 'center', paddingHorizontal: 5}}>


                    </View>
                    <TransactionKeyboard/>
                </View>

            </View>
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10
    },
    calendarButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3
    },
    headerRightSide: {
        flexDirection: 'row',
        gap: 20
    },
    saveButton: {
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        width: 70,
        height: 30
    },
    accountsWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'space-between',
        paddingVertical: 10
    },
    categoriesWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        paddingVertical: 10
    },
    doneButton: {
        color: Colors.primary,
        fontWeight: 'bold',
        fontSize: 18,
    },
    backButton: {
        // it must be a blue
        color: '#007AFF',
        fontSize: 18,
    }

})
