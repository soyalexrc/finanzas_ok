import {
    Keyboard,
    Pressable,
    StyleSheet, Text, TextInput, TouchableOpacity,
    View
} from "react-native";
import * as Haptics from 'expo-haptics';
import {Stack, useRouter} from "expo-router";
import {Colors, DATE_COLORS} from "@/lib/constants/colors";
import {Ionicons} from "@expo/vector-icons";
import {addDays, addMonths, addWeeks, format, isToday, nextSaturday, subDays} from "date-fns";
import DateTimePicker from '@react-native-community/datetimepicker';
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import {onChangeDate, selectCurrentTransaction} from "@/lib/store/features/transactions/transactions.slice";
import {es} from "date-fns/locale";
import {useEffect, useState} from "react";

export default function Screen() {
    const router = useRouter();
    const currentTransaction = useAppSelector(selectCurrentTransaction)
    const dispatch = useAppDispatch();
    const [date, setDate] = useState<Date>(new Date());

    const onSave = async (date: Date, goBack = false) => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const dateString = date.toISOString();
        dispatch(onChangeDate(dateString));
        if (goBack) router.back();
    };

    console.log(currentTransaction.date);

    useEffect(() => {
        if (!isToday(currentTransaction.date)) {
            setDate(new Date(currentTransaction.date));
        }
    }, [currentTransaction.date]);


    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: 'Seleccionar Fecha',
                    headerBackTitle: 'Atras',
                }}
            />

            <View style={styles.quickButtons}>
                <TouchableOpacity
                    style={styles.quickButton}
                    onPress={async () => {
                        await onSave(subDays(new Date(), 1), true);
                    }}>
                    <Ionicons name="today-outline" size={20} color={DATE_COLORS.yesterday}/>
                    <Text style={styles.quickButtonText}>Ayer</Text>
                    <Text style={styles.quickButtonDate}>{format(subDays(new Date(), 1), 'EEE', {locale: es})}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.quickButton}
                    onPress={async () => {
                        await onSave(new Date(), true);
                    }}>
                    <Ionicons name="today-outline" size={20} color={DATE_COLORS.today}/>
                    <Text style={styles.quickButtonText}>Hoy</Text>
                    <Text style={styles.quickButtonDate}>{format(new Date(), 'EEE', {locale: es})}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.quickButton}
                    onPress={async () => {
                        await onSave(addDays(new Date(), 1), true);
                    }}>
                    <Ionicons name="calendar-outline" size={20} color={DATE_COLORS.tomorrow}/>
                    <Text style={styles.quickButtonText}>Manana</Text>
                    <Text style={styles.quickButtonDate}>{format(addDays(new Date(), 1), 'EEE', {locale: es})}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.quickButton}
                    onPress={async () => {
                        await onSave(nextSaturday(new Date()), true);
                    }}>
                    <Ionicons name="calendar-outline" size={20} color={DATE_COLORS.weekend}/>
                    <Text style={styles.quickButtonText}>Este fin de semana</Text>
                    <Text style={styles.quickButtonDate}>{format(nextSaturday(new Date()), 'EEE', {locale: es})}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.quickButton}
                    onPress={async () => {
                        await onSave(addWeeks(new Date(), 1), true);
                    }}>
                    <Ionicons name="calendar-outline" size={20} color={DATE_COLORS.other}/>
                    <Text style={styles.quickButtonText}>La Proxima semana</Text>
                    <Text style={styles.quickButtonDate}>{format(addWeeks(new Date(), 1), 'EEE', {locale: es})}</Text>
                </TouchableOpacity>
            </View>

            <DateTimePicker
                testID="dateTimePicker"
                maximumDate={addMonths(new Date(), 1)}
                value={date}
                mode={'date'}
                locale="es"
                onChange={async (_, selectedDate) => {
                    const currentDate = selectedDate || new Date();
                    await onSave(currentDate, true);
                }}
                accentColor={Colors.primary}
                display="inline"
                style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    quickButtons: {
        width: '100%',
        gap: 30,
        paddingVertical: 20,
        marginBottom: 20,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: Colors.lightBorder,
    },
    quickButton: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        paddingHorizontal: 16,
        // backgroundColor: 'red'
    },
    quickButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
    },
    quickButtonDate: {
        fontSize: 16,
        color: Colors.dark,
    },
});
