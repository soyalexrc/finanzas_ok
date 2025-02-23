import {
    Platform,
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
import {toast} from 'sonner-native';
import {
    onChangeDate,
    resetCurrentTransaction,
    selectCurrency,
    selectCurrentTransaction, updateCurrency
} from "@/lib/store/features/transactions/transactions.slice";
import {formatByThousands} from "@/lib/helpers/string";
import {fDateTimeUTC, fTimestampUTC, getDateObject} from "@/lib/helpers/date";
import * as Haptics from 'expo-haptics';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import CurrencyPickerModal from "@/lib/components/modals/CurrencyPickerModal";
import {useEffect, useState} from "react";
import {Currency} from "@/lib/types/transaction";
import {addMonths, isToday} from "date-fns";
import DateTimePicker from "@react-native-community/datetimepicker";
import api from "@/lib/utils/api";
import endpoints from "@/lib/utils/api/endpoints";
import {load, loadString} from "@/lib/utils/storage";
import {CurrencyV2} from "@/lib/store/features/transactions/currencies.slice";
import {useQueryClient} from "@tanstack/react-query";
import {useAuth} from "@/lib/context/AuthContext";



export default function Screen() {
    const router = useRouter();
    const isIos = Platform.OS === 'ios';
    const dispatch = useAppDispatch();
    const queryClient = useQueryClient()
    const currentTransaction = useAppSelector(selectCurrentTransaction);
    const currency = useAppSelector(selectCurrency);
    const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
    const [date, setDate] = useState<Date>(new Date());
    const {user, token} = useAuth();
    const [showDatePicker, setShowDatePicker] = useState(false);

    const handleDateButtonPress = () => {
        setShowDatePicker(true);
    };
    const onSaveDate = async (date: Date) => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const dateString = date.toISOString();
        dispatch(onChangeDate(dateString));
        setShowDatePicker(false);
    };

    async function onSave() {
        const payload = {
            title: currentTransaction.title,
            description: currentTransaction.description,
            category: currentTransaction.category?._id,
            documents: currentTransaction.documents,
            images: currentTransaction.images,
            amount: parseFloat(currentTransaction.amount),
            date: currentTransaction.date,
            user: user?._id ?? '',
            currency: currency._id
        }
        console.log('payload', payload);

        if (currentTransaction._id) {
            try {
                const response = await api.patch(endpoints.transactions.update + '/' + currentTransaction._id, payload, {
                    headers: {
                        authorization: `Bearer ${token}`
                    }
                })

                if (response.status === 200 || response.status === 201) {
                    toast.success(response.data.message || 'Se actualizo la transaccion con exito', {
                        className: 'bg-success-500',
                        // description: 'Por favor completa el campo de titulo',
                        duration: 6000,
                        icon: <Ionicons name="checkmark-circle" size={24} color="green"/>,
                    });
                    await queryClient.invalidateQueries({ queryKey: ['monthlyStatistics', 'statisticsByCurrencyAndYear', 'yearlyExpensesByCategory'] })
                    // await queryClient.refetchQueries({ queryKey: ['monthlyStatistics', 'statisticsByCurrencyAndYear', 'yearlyExpensesByCategory'] })
                    dispatch(resetCurrentTransaction())
                    router.back();
                } else {
                    toast.error('Ocurrio un error', {
                        className: 'bg-red-500',
                        description: response.data.message,
                        duration: 6000,
                        icon: <Ionicons name="close-circle" size={24} color="red"/>,
                    });
                }
            } catch (error: any) {
                console.log(error);
                toast.error('Ocurrio un error', {
                    className: 'bg-red-500',
                    description: error.message,
                    duration: 6000,
                    icon: <Ionicons name="close-circle" size={24} color="red"/>,
                });
            }
        } else {
            try {
                const response = await api.post(endpoints.transactions.create, payload, {
                    headers: {
                        authorization: `Bearer ${token}`
                    }
                })

                if (response.status === 200 || response.status === 201) {
                    toast.success(response.data.message || 'Se registro la transaccion con exito', {
                        className: 'bg-success-500',
                        // description: 'Por favor completa el campo de titulo',
                        duration: 6000,
                        icon: <Ionicons name="checkmark-circle" size={24} color="green"/>,
                    });
                    await queryClient.invalidateQueries({ queryKey: ['monthlyStatistics', 'statisticsByCurrencyAndYear', 'yearlyExpensesByCategory'] })
                    // await queryClient.refetchQueries({ queryKey: ['monthlyStatistics', 'statisticsByCurrencyAndYear', 'yearlyExpensesByCategory'] })
                    dispatch(resetCurrentTransaction())
                    router.back();
                } else {
                    toast.error('Ocurrio un error', {
                        className: 'bg-red-500',
                        description: response.data.message,
                        duration: 6000,
                        icon: <Ionicons name="close-circle" size={24} color="red"/>,
                    });
                }
            } catch (error: any) {
                console.log(error);
                toast.error('Ocurrio un error', {
                    className: 'bg-red-500',
                    description: error.message,
                    duration: 6000,
                    icon: <Ionicons name="close-circle" size={24} color="red"/>,
                });
            }
        }
    }

    async function onCancel() {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        dispatch(resetCurrentTransaction())
        router.back();
    }

    async function  handlePressCurrency() {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push('/auth/currency-selection')
    }

    function onSelectCurrency(currency: CurrencyV2) {
        dispatch(updateCurrency(currency));
    }

    function onPressDate() {
        if (isIos) {
            router.push('/auth/transaction-form/date')
        } else {
            setShowDatePicker(true)
        }
    }

    useEffect(() => {
        if (!isToday(currentTransaction.date)) {
            setDate(new Date(currentTransaction.date));
        }
    }, [currentTransaction.date]);

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
                        <Text style={{marginTop: 10, marginRight: 4, fontSize: 35, fontWeight: 'bold', color: 'gray'}}>{currency.symbol}</Text>
                        <Text style={{fontSize: 50}}>{formatByThousands(String(currentTransaction.amount))}</Text>
                    </View>
                    <TouchableOpacity onPress={handlePressCurrency}>
                        <Text>{currency.code}</Text>
                    </TouchableOpacity>
                </View>


                <View style={{height: 50, marginBottom: 10,}}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.actionButtonsContainer}
                        keyboardShouldPersistTaps="always">

                        <Pressable
                            onPress={onPressDate}
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
            {showDatePicker && (
                <DateTimePicker
                    testID="dateTimePicker"
                    maximumDate={addMonths(new Date(), 1)}
                    value={date}
                    mode={'date'}
                    locale="es"
                    onTouchCancel={() => setShowDatePicker(false)}
                    onChange={async (_, selectedDate) => {
                        const currentDate = selectedDate || new Date();
                        await onSaveDate(currentDate);
                    }}
                    accentColor={Colors.primary}
                    display="inline"
                    style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                />
            )}
            <CurrencyPickerModal visible={currencyModalVisible} onClose={() => setCurrencyModalVisible(false)} onSelect={onSelectCurrency} />
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
