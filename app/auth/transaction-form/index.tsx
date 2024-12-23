import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {Stack, useRouter} from "expo-router";
import TransactionKeyboard from "@/lib/components/transactions/TransactionKeyboard";
import {Colors} from "@/lib/constants/colors";
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import {resetCurrentTransaction, selectCurrentTransaction} from "@/lib/store/features/transactions/transactions.slice";
import {formatByThousands} from "@/lib/helpers/string";
import {getDateObject} from "@/lib/helpers/date";
import * as Haptics from 'expo-haptics';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';



export default function Screen() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const currentTransaction = useAppSelector(selectCurrentTransaction);

    async function onSave() {
        const categoryRef = firestore().collection('categories').doc(currentTransaction.category.id);
        const userReference = firestore().collection('users').doc(auth().currentUser?.uid);

        if (currentTransaction.id) {
            await firestore()
                .collection('transactions')
                .doc(currentTransaction.id)
                .update({
                    title: currentTransaction.title,
                    description: currentTransaction.description,
                    category: categoryRef,
                    documents: currentTransaction.documents,
                    images: currentTransaction.images,
                    amount: parseFloat(currentTransaction.amount),
                    date: new Date(currentTransaction.date),
                    updatedAt: new Date(),
                    currency: {
                        code: 'USD',
                        symbol: '$'
                    }
                });
            dispatch(resetCurrentTransaction())
            router.back();
        } else {
            await firestore()
                .collection('transactions')
                .add({
                    title: currentTransaction.title,
                    description: currentTransaction.description,
                    category: categoryRef,
                    documents: currentTransaction.documents,
                    images: currentTransaction.images,
                    amount: parseFloat(currentTransaction.amount),
                    date: new Date(currentTransaction.date),
                    user_id: userReference,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    currency: {
                        code: 'USD',
                        symbol: '$'
                    }
                });
            dispatch(resetCurrentTransaction())
            router.back();
        }
    }

    async function onCancel() {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        dispatch(resetCurrentTransaction())
        router.back();
    }

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    headerRight: () => (
                        <TouchableOpacity style={styles.doneButton} onPress={onSave}>
                            <Text style={styles.doneButtonText}>Guardar</Text>
                        </TouchableOpacity>
                    ),
                    headerLeft: () => (
                        <TouchableOpacity onPress={onCancel}>
                            <Text style={styles.backButton}>Cancelar</Text>
                        </TouchableOpacity>
                    ),
                    headerShadowVisible: false,
                    title: ''
                }}
            />
            <View style={{flex: 1}}>
                <View style={{
                    flex: 1,
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
                        <Text style={{fontSize: 50}}>{formatByThousands(String(currentTransaction.amount))}</Text>
                    </View>
                    <View>
                        <Text>USD</Text>
                    </View>
                </View>


                <View style={{height: 50, marginBottom: 10,}}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.actionButtonsContainer}
                        keyboardShouldPersistTaps="always">

                        <Pressable
                            onPress={() => router.push('/auth/transaction-form/date')}
                            style={({ pressed }) => {
                                return [
                                    styles.outlinedButton,
                                    { backgroundColor: pressed ? Colors.lightBorder : 'transparent' },
                                    { borderColor: getDateObject(currentTransaction.date).color },
                                ];
                            }}>
                            <Ionicons
                                name="calendar-outline"
                                size={20}
                                color={getDateObject(currentTransaction.date).color}
                            />
                            <Text
                                style={[styles.outlinedButtonText]}>
                                {getDateObject(currentTransaction.date).name}
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={() => router.push('/auth/transaction-form/category')}
                            style={({ pressed }) => {
                                return [
                                    styles.outlinedButton,
                                    { backgroundColor: pressed ? Colors.lightBorder : 'transparent' },
                                ];
                            }}>
                            {  currentTransaction.category?.icon ? <Text style={{ fontSize: 20 }}>{currentTransaction.category?.icon}</Text> : <Ionicons name="flag-outline" size={20} color={Colors.dark} />}
                            <Text style={styles.outlinedButtonText}>{currentTransaction.category?.title || 'Categoria'}</Text>
                        </Pressable>
                        <Pressable
                            onPress={() => router.push('/auth/transaction-form/description')}
                            style={({ pressed }) => {
                                return [
                                    styles.outlinedButton,
                                    { backgroundColor: pressed ? Colors.lightBorder : 'transparent' },
                                ];
                            }}>
                            <Ionicons name={currentTransaction.title || currentTransaction.description ? 'document-text' : 'document-text-outline'} size={20} color={Colors.dark} />
                            <Text style={styles.outlinedButtonText}>Descripcion</Text>
                        </Pressable>
                        <Pressable
                            onPress={() => router.push('/auth/transaction-form/evidences')}
                            style={({ pressed }) => {
                                return [
                                    styles.outlinedButton,
                                    { backgroundColor: pressed ? Colors.lightBorder : 'transparent' },
                                ];
                            }}>
                            <Ionicons name={(currentTransaction.images.length > 0 || currentTransaction.documents.length > 0) ? 'file-tray-full-outline' : 'file-tray-outline'} size={20} color={Colors.dark} />
                            <Text style={styles.outlinedButtonText}>Evidencias</Text>
                        </Pressable>
                        <Pressable
                            style={({ pressed }) => {
                                return [
                                    styles.outlinedButton,
                                    { backgroundColor: pressed ? Colors.lightBorder : 'transparent' },
                                ];
                            }}>
                            <Ionicons name="ellipsis-vertical" size={20} color={Colors.dark} />
                            <Text style={styles.outlinedButtonText}>Mas opciones</Text>
                        </Pressable>
                    </ScrollView>
                </View>

                <TransactionKeyboard/>

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
        backgroundColor: Colors.primary,
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 4,
    },
    doneButtonText: {
        color: "#fff",
        fontWeight: 'bold',
        fontSize: 18,
    },
    backButton: {
        color: 'red',
        fontSize: 18,
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
    },
    outlinedButton: {
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: Colors.lightBorder,
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 4,
    },
    outlinedButtonText: {
        color: Colors.dark,
        fontSize: 14,
        marginLeft: 2,
        fontWeight: '500',
    },

})
