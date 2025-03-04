import {
    ActivityIndicator,
    Alert,
    Button,
    LogBox, Platform, Pressable,
    RefreshControl, SafeAreaView, ScrollView, SectionList,
    StyleSheet,
    Text, TextStyle,
    TouchableWithoutFeedback,
    View, ViewToken
} from "react-native";
import auth from "@react-native-firebase/auth";
import {Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from "react";
import {AgendaList, CalendarList, CalendarProvider, DateData, ExpandableCalendar} from "react-native-calendars";
import {Colors} from "@/lib/constants/colors";
import {parse, format} from 'date-fns';
import Fab from "@/lib/components/transactions/Fab";
import TransactionRow from "@/lib/components/transactions/TransactionRow";
import {MarkedDates} from "react-native-calendars/src/types";
import {getCurrentMonth, getCustomMonth, getCustomMonthAndYear, getCustomMonthRangeWithYear} from "@/lib/helpers/date";
import firestore from "@react-native-firebase/firestore";
import {es} from "date-fns/locale";
import {useFocusEffect, useNavigation, useRouter} from "expo-router";
import {LocaleConfig} from 'react-native-calendars';
import {useSafeAreaInsets} from "react-native-safe-area-context";
import TransactionRowHeader from "@/lib/components/transactions/TransactionRowHeader";
import Animated, {
    LayoutAnimationConfig, runOnJS,
    StretchInY, useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import TransactionResumeModal from "@/lib/components/modals/TransactionResumeModal";
import sleep from "@/lib/helpers/sleep";
import {FlashList} from "@shopify/flash-list";
import {Ionicons} from "@expo/vector-icons";
import {load, loadString} from "@/lib/utils/storage";
import api from "@/lib/utils/api";
import endpoints from "@/lib/utils/api/endpoints";
import {toast} from "sonner-native";
import {useAuth} from "@/lib/context/AuthContext";

LogBox.ignoreLogs([
    'Warning: ExpandableCalendar: Support for defaultProps will be removed from function components in a future major release.'
]);


interface Section {
    title: {
        title: string;
        totals: any[]
    };
    data: any[];
}


LocaleConfig.locales['es'] = {
    monthNames: [
        'Enero',
        'Febrero',
        'Marzo',
        'Abril',
        'Mayo',
        'Junio',
        'Julio',
        'Agosto',
        'Septiembre',
        'Octubre',
        'Noviembre',
        'Diciembre'
    ],
    monthNamesShort: ['Ene.', 'Feb.', 'Mar.', 'Abr.', 'May.', 'Jun.', 'Jul.', 'Ago.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'],
    dayNames: ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'],
    dayNamesShort: ['Dom.', 'Lun.', 'Mar.', 'Mie.', 'Jue.', 'Vie.', 'Sab.'],
    today: "Hoy"
};

LocaleConfig.defaultLocale = 'es';

const initialDate = '2025-03-03';
const nextWeekDate = '2025-03-10';
const nextMonthDate = '2025-04-03';

export default function Screen() {
    const [selected, setSelected] = useState(initialDate);
    const marked = useMemo(() => {
        return {
            [nextWeekDate]: {
                selected: selected === nextWeekDate,
                selectedColor: Colors.primary,
                marked: true,
                dots: [
                    { key: "event1", color: Colors.primary },
                    { key: "event2", color: 'blue' },
                    { key: "event3", color: 'green' },
                ]
            },
            [nextMonthDate]: {
                selected: selected === nextMonthDate,
                selectedColor: Colors.primary,
                marked: true,
                dots: [
                    { key: "event1", color: Colors.primary },
                    { key: "event3", color: 'green' },
                ]
            },
            [selected]: {
                selected: true,
                disableTouchEvent: true,
                selectedColor: Colors.primary,
            }
        };
    }, [selected]);

    const onDayPress = useCallback((day: DateData) => {
        setSelected(day.dateString);
    }, []);

    const theme = {
        stylesheet: {
            calendar: {
                header: {
                    dayHeader: {
                        fontWeight: '600',
                        color: Colors.primary
                    }
                }
            }
        },
        'stylesheet.day.basic': {
            today: {
                borderColor: Colors.primary,
                borderWidth: 0.8
            },
            todayText: {
                color: Colors.primary,
                fontWeight: '800'
            }
        }
    };

    const horizontalView = false;

    function renderCustomHeader(date: any) {
        const header = date.toString('MMMM yyyy');
        const [month, year] = header.split(' ');
        const textStyle: TextStyle = {
            fontSize: 18,
            fontWeight: 'bold',
            paddingTop: 10,
            paddingBottom: 10,
            color: Colors.primary,
            paddingRight: 5
        };

        return (
            <View style={styles.header}>
                <Text style={[styles.month, textStyle]}>{`${month}`}</Text>
                <Text style={[styles.year, textStyle]}>{year}</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <CalendarList
                // testID={testIDs.calendarList.CONTAINER}
                current={initialDate}
                pastScrollRange={12}
                futureScrollRange={24}
                markingType="multi-dot"
                onDayPress={onDayPress}
                markedDates={marked}
                renderHeader={!horizontalView ? renderCustomHeader : undefined}
                calendarHeight={!horizontalView ? 390 : undefined}
                theme={!horizontalView ? theme : undefined}
                horizontal={horizontalView}
                pagingEnabled={horizontalView}
                staticHeader={horizontalView}
            />
        </SafeAreaView>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background
    },
    header: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        marginTop: 10,
        marginBottom: 10
    },
    month: {
        marginLeft: 5
    },
    year: {
        marginRight: 5
    }
});
