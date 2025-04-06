import {
    FlatList,
    LogBox, RefreshControl,
    SafeAreaView, ScrollView,
    StyleSheet,
    Text, TextStyle, TouchableOpacity,
    View, ViewToken
} from "react-native";
import React, {Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from "react";
import {AgendaList, CalendarList, CalendarProvider, DateData, ExpandableCalendar} from "react-native-calendars";
import {Colors} from "@/lib/constants/colors";
import {LocaleConfig} from 'react-native-calendars';
import Animated, {useAnimatedStyle, useSharedValue, withTiming} from "react-native-reanimated";
import Fab from "@/lib/components/transactions/Fab";
import {Stack} from "expo-router";
import {Ionicons} from "@expo/vector-icons";
import {useCalendarEvents} from "@/lib/utils/api/calendar";
import {useAuth} from "@/lib/context/AuthContext";
import {endOfMonth, format, startOfMonth} from "date-fns";

LogBox.ignoreLogs([
    'Warning: ExpandableCalendar: Support for defaultProps will be removed from function components in a future major release.'
]);

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

const sampleDates = {
    '2025-03-03': {
        selected: true,
        selectedColor: 'transparent',
        // selectedColor: 'rgba(220,76,62,0.2)',
        selectedTextColor: '#000',
        marked: true,
        dots: [
            {key: "event1", color: Colors.primary},
            {key: "event2", color: 'yellow'},
            {key: "event3", color: 'green'},
        ]
    },
    '2025-03-10': {
        selected: true,
        selectedColor: 'rgba(220,76,62,0.2)',
        selectedTextColor: '#000',
        marked: true,
        dots: [
            {key: "event1", color: Colors.primary, checked: false},
            {key: "event3", color: 'green'},
            {key: "event4", color: 'gray'},
            {key: "event5", color: 'black'},
            {key: "event6", color: 'blue'},
            {key: "event7", color: 'purple'},
        ]
    },
    '2025-03-14': {
        selected: true,
        selectedColor: 'rgba(220,76,62,0.2)',
        selectedTextColor: '#000',
        marked: true,
        dots: [
            {key: "event1", color: Colors.primary},
        ]
    },
    '2025-03-20': {
        selected: true,
        selectedColor: 'rgba(220,76,62,0.2)',
        selectedTextColor: '#000',
        marked: true,
        dots: [
            {key: "event1", color: Colors.primary},
            {key: "event3", color: 'green'},
        ]
    },

}
// TODO color de marca de dia puede ser personalizable con sqlite
// TODO seleccion de color por item debe ser seleccionable (crear select de color)

export default function Screen() {
    const onDayPress = useCallback((day: DateData) => {
        console.log(day);
    }, []);

    const [refreshing, setRefreshing] = useState<boolean>(false);

    const [startDate, setStartDate] = useState(
        format(startOfMonth(new Date()), "yyyy-MM-dd'T'00:00:00.000'Z'")
    );

    const [endDate, setEndDate] = useState(
        format(endOfMonth(new Date()), "yyyy-MM-dd'T'23:59:59.999'Z'")
    );

    const {user, token} = useAuth();
    const {data, refetch, isLoading, error} = useCalendarEvents(user._id, token, startDate, endDate);


    const theme = {
        textDisabledColor: Colors.lightText,
        textMonthFontWeight: 'bold',
        textDayFontSize: 16,
        textMonthFontSize: 18,
        arrowColor: Colors.primary,
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
                backgroundColor: Colors.primary,
                borderWidth: 0.8,
                borderRadius: 100,
                borderColor: Colors.primary
            },
            todayText: {
                color: '#fff',
                fontWeight: '800'
            }
        }
    };

    const horizontalView = true;

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

    const viewableItems = useSharedValue<ViewToken[]>([])

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen
                options={{
                    headerShadowVisible: false,
                    title: '',
                    headerRight: () => (
                        <View style={{flexDirection: 'row', gap: 20}}>
                            <TouchableOpacity>
                                <Ionicons name="filter" size={24} color={Colors.dark}/>
                            </TouchableOpacity>
                            {/*<TouchableOpacity>*/}
                            {/*    <Ionicons name="settings" size={24} color={Colors.dark}/>*/}
                            {/*</TouchableOpacity>*/}
                        </View>
                    )
                }}
            />
            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={ async () => {
                            setRefreshing(true)
                            await refetch();
                            setTimeout(() => {
                                setRefreshing(false)
                            }, 500)
                        }}
                    />
                }
                style={styles.container}>

                <CalendarList
                    // testID={testIDs.calendarList.CONTAINER}
                    current={initialDate}
                    pastScrollRange={12}
                    futureScrollRange={9}
                    markingType="multi-dot"
                    onDayPress={onDayPress}
                    markedDates={data}
                    onMonthChange={async ({year, month}) => {
                        const newStartDate = startOfMonth(new Date(year, month - 1)).toISOString();
                        const newEndDate = endOfMonth(new Date(year, month - 1)).toISOString();

                        setStartDate(newStartDate);
                        setEndDate(newEndDate);

                        await refetch();
                        // Optionally, fetch transactions for the new date range
                        // await getTransactionsByMonth(month, year);
                    }}
                    renderHeader={!horizontalView ? renderCustomHeader : undefined}
                    calendarHeight={!horizontalView ? 390 : undefined}
                    // theme={!horizontalView ? theme : undefined}
                    theme={theme as any}
                    horizontal={horizontalView}
                    pagingEnabled={horizontalView}
                    staticHeader={horizontalView}
                />


                {/*<FlatList*/}
                {/*    data={data}*/}
                {/*    numColumns={2}*/}
                {/*    showsVerticalScrollIndicator={false}*/}
                {/*    contentContainerStyle={{ paddingTop: 40 }}*/}
                {/*    keyExtractor={(item, index) => index.toString()}*/}
                {/*    onViewableItemsChanged={({ viewableItems: vItems }) => {*/}
                {/*        viewableItems.value = vItems*/}
                {/*    }}*/}
                {/*    renderItem={({ item }) => <ListItem item={item} vItems={viewableItems} />}*/}
                {/*/>*/}

            </ScrollView>
            <Fab
                customBottom={17}
                onPress={() => {
                }}
            />
        </SafeAreaView>
    )
}

type ListItemProps = {
    vItems: Animated.SharedValue<ViewToken[]>,
    item: { id: number }
}

const ListItem: React.FC<ListItemProps> = React.memo(({item, vItems}) => {

    const animatedStyle = useAnimatedStyle(() => {
        const isVisible = Boolean(
            vItems.value
                .filter((item) => item.isViewable)
                .find((viewableItem) => viewableItem.index === item.id)
        );
        return {
            opacity: withTiming(isVisible ? 1 : 0),
        }
    }, [])

    return (
        <Animated.View
            style={[
                animatedStyle,
                {
                    height: 80,
                    width: '45%',
                    marginHorizontal: '2.5%',
                    backgroundColor: 'red',
                    alignSelf: 'center',
                    borderRadius: 15,
                    marginBottom: 20
                }
            ]}
        />
    )
})

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
