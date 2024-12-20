import {
    Keyboard,
    Pressable,
    StyleSheet, Text, TextInput, TouchableOpacity,
    View
} from "react-native";
import * as Haptics from 'expo-haptics';
import {useEffect, useState} from "react";
import {Stack, useNavigation, useRouter} from "expo-router";
import {Colors, DATE_COLORS} from "@/lib/constants/colors";
import {Ionicons} from "@expo/vector-icons";
import {addDays, addWeeks, format, nextSaturday} from "date-fns";
import DateTimePicker from '@react-native-community/datetimepicker';

export default function Screen() {
    const router = useRouter();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState('');

    useEffect(() => {
        if (selectedDate) {
            setCurrentDate(new Date(selectedDate));
        }
    }, [selectedDate]);

    const onSave = async (date: Date, goBack = false) => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const dateString = date.toISOString();
        setSelectedDate(dateString);
        if (goBack) router.dismiss();
    };


    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: 'Seleccionar Fecha',
                    headerBackTitle: 'Atras',
                    headerRight: () => (
                        <TouchableOpacity onPress={() => onSave(currentDate, true)}>
                            <Text style={styles.doneButton}>Done</Text>
                        </TouchableOpacity>
                    ),
                }}
            />

            <View style={styles.quickButtons}>
                <TouchableOpacity
                    style={styles.quickButton}
                    onPress={() => {
                        onSave(new Date());
                    }}>
                    <Ionicons name="today-outline" size={20} color={DATE_COLORS.today} />
                    <Text style={styles.quickButtonText}>Hoy</Text>
                    <Text style={styles.quickButtonDate}>{format(new Date(), 'EEE')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.quickButton}
                    onPress={() => {
                        onSave(addDays(new Date(), 1));
                    }}>
                    <Ionicons name="calendar-outline" size={20} color={DATE_COLORS.tomorrow} />
                    <Text style={styles.quickButtonText}>Manana</Text>
                    <Text style={styles.quickButtonDate}>{format(addDays(new Date(), 1), 'EEE')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.quickButton}
                    onPress={() => {
                        onSave(nextSaturday(new Date()));
                    }}>
                    <Ionicons name="calendar-outline" size={20} color={DATE_COLORS.weekend} />
                    <Text style={styles.quickButtonText}>Este fin de semana</Text>
                    <Text style={styles.quickButtonDate}>{format(nextSaturday(new Date()), 'EEE')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.quickButton}
                    onPress={() => {
                        onSave(addWeeks(new Date(), 1));
                    }}>
                    <Ionicons name="calendar-outline" size={20} color={DATE_COLORS.other} />
                    <Text style={styles.quickButtonText}>La Proxima semana</Text>
                    <Text style={styles.quickButtonDate}>{format(addWeeks(new Date(), 1), 'EEE')}</Text>
                </TouchableOpacity>
            </View>

            <DateTimePicker
                testID="dateTimePicker"
                value={new Date(currentDate)}
                mode={'date'}
                onChange={(event, selectedDate) => {
                    const currentDate = selectedDate || new Date();
                    onSave(currentDate);
                }}
                accentColor={Colors.primary}
                display="inline"
                style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
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
    doneButton: {
        color: Colors.primary,
        fontWeight: 'bold',
        fontSize: 18,
    },
    quickButtons: {
        width: '100%',
        gap: 30,
        paddingVertical: 20,
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
