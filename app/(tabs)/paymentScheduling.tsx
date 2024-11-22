import {Button, ListItem, ScrollView, Text, useTheme, View, XStack} from "tamagui";
import React, {memo, useCallback, useEffect, useRef, useState} from "react";
import {Alert, Animated, Platform, Pressable, StyleSheet, TouchableOpacity, useColorScheme} from "react-native";
import CustomHeader from "@/lib/components/ui/CustomHeader";
import * as Haptics from "expo-haptics";
import {getCustomMonth} from "@/lib/helpers/date";
import {Entypo, Fontisto} from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {
    Agenda,
    AgendaEntry, AgendaList,
    AgendaSchedule,
    CalendarProvider,
    DateData,
    ExpandableCalendar, LocaleConfig,
    WeekCalendar
} from "react-native-calendars";
import {format} from "date-fns";
import {agendaItems, getMarkedDates} from "@/lib/utils/data/agendaItems";
import {getTheme, themeColor, lightThemeColor} from '@/lib/utils/data/theme';
import AgendaItem from "@/lib/components/paymentsSchedule/AgendaItem";
import {colorScheme} from "vite-plugin-entry-shaking-debugger/.storybook/theming";

const leftArrowIcon = require('@/assets/icons/previous.png');
const rightArrowIcon = require('@/assets/icons/next.png');

LocaleConfig.locales['fr'] = {
    monthNames: [
        'Janvier',
        'Février',
        'Mars',
        'Avril',
        'Mai',
        'Juin',
        'Juillet',
        'Août',
        'Septembre',
        'Octobre',
        'Novembre',
        'Décembre'
    ],
    monthNamesShort: ['Janv.', 'Févr.', 'Mars', 'Avril', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'],
    dayNames: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
    dayNamesShort: ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'],
    today: "Aujourd'hui"
};

LocaleConfig.defaultLocale = 'fr';

const ITEMS: any[] = agendaItems;

export default function Screen() {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const insets = useSafeAreaInsets();
    const theme = useTheme();
    const isIos = Platform.OS === 'ios';
    const colorScheme = useColorScheme(); // Get the current color scheme
    const [items, setItems] = useState<any>(
        {
            '2024-10-12': [{
                title: 'Pago de recibo de luz',
                status: false,
                date: '2024-10-12',
                message: 'Pago mensual de la electricidad.',
                amount: '150.00',
                currency_symbol: 'S/',
                currency_code: 'PEN',
                icon: '💡'
            }],
            '2024-10-22': [{
                title: 'Compra de supermercado',
                status: true,
                date: '2024-10-22',
                message: 'Compra semanal de alimentos y productos básicos.',
                amount: '200.00',
                currency_symbol: 'S/',
                currency_code: 'PEN',
                icon: '🛒'
            }],
            '2024-10-23': [{
                title: 'Pago de internet',
                status: false,
                date: '2024-10-23',
                message: 'Pago mensual del servicio de internet.',
                amount: '100.00',
                currency_symbol: 'S/',
                currency_code: 'PEN',
                icon: '🌐'
            }],
            '2024-10-24': [],
            '2024-10-25': [{
                title: 'Cena en restaurante',
                status: false,
                date: '2024-10-25',
                message: 'Cena con amigos en un restaurante.',
                amount: '75.00',
                currency_symbol: 'S/',
                currency_code: 'PEN',
                icon: '🍽️'
            }, {
                title: 'Compra de ropa',
                status: true,
                date: '2024-10-25',
                message: 'Compra de ropa nueva para la temporada.',
                amount: '300.00',
                currency_symbol: 'S/',
                currency_code: 'PEN',
                icon: '👗'
            }],
            '2024-10-26': [{
                title: 'Pago de gimnasio',
                status: false,
                date: '2024-10-26',
                message: 'Pago mensual del gimnasio.',
                amount: '50.00',
                currency_symbol: 'S/',
                currency_code: 'PEN',
                icon: '🏋️'
            }, {
                title: 'Compra de libros',
                status: true,
                date: '2024-10-26',
                message: 'Compra de libros para el estudio.',
                amount: '120.00',
                currency_symbol: 'S/',
                currency_code: 'PEN',
                icon: '📚'
            }],
            '2024-10-27': [{
                title: 'Pago de agua',
                status: true,
                date: '2024-10-27',
                message: 'Pago mensual del servicio de agua.',
                amount: '80.00',
                currency_symbol: 'S/',
                currency_code: 'PEN',
                icon: '🚰'
            }, {
                title: 'Compra de electrónicos',
                status: false,
                date: '2024-10-27',
                message: 'Compra de nuevos dispositivos electrónicos.',
                amount: '500.00',
                currency_symbol: 'S/',
                currency_code: 'PEN',
                icon: '💻'
            }],
            '2024-10-28': [{
                title: 'Pago de alquiler',
                status: false,
                date: '2024-10-28',
                message: 'Pago mensual del alquiler del departamento.',
                amount: '1000.00',
                currency_symbol: 'S/',
                currency_code: 'PEN',
                icon: '🏠'
            }, {
                title: 'Compra de muebles',
                status: false,
                date: '2024-10-28',
                message: 'Compra de nuevos muebles para la casa.',
                amount: '700.00',
                currency_symbol: 'S/',
                currency_code: 'PEN',
                icon: '🛋️'
            }],
            '2024-10-29': [{
                title: 'Pago de seguro',
                status: true,
                date: '2024-10-29',
                message: 'Pago mensual del seguro de salud.',
                amount: '250.00',
                currency_symbol: 'S/',
                currency_code: 'PEN',
                icon: '🩺'
            }, {
                title: 'Compra de regalos',
                status: false,
                date: '2024-10-29',
                message: 'Compra de regalos para cumpleaños.',
                amount: '150.00',
                currency_symbol: 'S/',
                currency_code: 'PEN',
                icon: '🎁'
            }],
            '2024-10-30': [{
                title: 'Pago de teléfono',
                status: true,
                date: '2024-10-30',
                message: 'Pago mensual del servicio de telefonía móvil.',
                amount: '60.00',
                currency_symbol: 'S/',
                currency_code: 'PEN',
                icon: '📱'
            }, {
                title: 'Compra de entradas',
                status: false,
                date: '2024-10-30',
                message: 'Compra de entradas para el cine.',
                amount: '40.00',
                currency_symbol: 'S/',
                currency_code: 'PEN',
                icon: '🎟️'
            }]
        }
    )

    // const renderDay = (day) => {
    //     console.log(day);
    //     if (day) {
    //         return <Text style={styles.customDay}>{day.getDay()}</Text>;
    //     }
    //     return <View style={styles.dayItem}/>;
    // };

    // const renderItem = useCallback(({item}: any) => {
    //     const isLongItem = item.itemCustomHeightType === 'LongEvent';
    //     return <View style={{paddingTop: isLongItem ? 40 : 0}}><AgendaItem item={item}/></View>;
    // }, []);

    const ListItem = memo(({reservation}: any) => {
        return (
            <Pressable
                testID="item"
                disabled={reservation.status}
                style={[styles.item, {backgroundColor: theme.color1?.val, borderStyle: 'solid', borderWidth: 1, borderColor: reservation.status ? '#18c60c' : '#f29e18'}]}
                onPress={async () => {
                    await Haptics.selectionAsync()
                    Alert.alert('Pagar', '¿Desea marcar este pago como pagado?', [
                        {
                            text: 'Cancelar',
                            isPreferred: true,
                            onPress: () => console.log('Cancel Pressed'),
                            style: 'destructive'
                        },
                        {
                            text: 'Aceptar',
                            onPress: () => {
                                setItems((prevItems: any) => {
                                    const newItems = {...prevItems};
                                    console.log(reservation)
                                    console.log(newItems[reservation.date])
                                    newItems[reservation.date].map((item: any) => {
                                        if (item.title === reservation.title) {
                                            item.status = true;
                                        }
                                    });
                                    return newItems;
                                });
                            }
                        }
                    ])
                }}
            >
                <XStack justifyContent="center" mb={10}>
                    <Text fontSize={30}>{reservation.icon}</Text>
                </XStack>
                <Text fontSize={18} mb={10}>{reservation.title}</Text>
                {reservation.message && (
                    <Text fontSize={14}>{reservation.message}</Text>
                )}
                <XStack justifyContent="space-between" alignItems="center" mt={20}>
                    <View>
                        {reservation.status && <Fontisto name="checkbox-active" size={24} color="#18c60c"/>}
                        {!reservation.status && <Fontisto name="checkbox-passive" size={24} color="#f29e18"/>}
                    </View>
                    <Text fontSize={24}>{reservation.currency_symbol} {reservation.amount}</Text>
                </XStack>
            </Pressable>
        )
    })

    const renderItem = (reservation: any) => {
        return <ListItem reservation={reservation} />;
    };

    const renderEmptyData = () => {
        return (
            <View flex={1} justifyContent="center" alignItems="center">
                <TouchableOpacity
                    onPress={() => Alert.alert('No events today')}
                >
                    <Text>No events on this day...</Text>
                </TouchableOpacity>
            </View>
        );
    };

    // const renderEmptyDate = () => {
    //     return (
    //         <View style={styles.emptyDate}>
    //             <Text>This is empty date!</Text>
    //         </View>
    //     );
    // };
    //
    // const rowHasChanged = (r1: AgendaEntry, r2: AgendaEntry) => {
    //     return r1.name !== r2.name;
    // };

    // function timeToString(time: number) {
    //     const date = new Date(time);
    //     return date.toISOString().split('T')[0];
    // }

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300, // Adjust the duration as needed
            useNativeDriver: true,
        }).start();
    }, []);

    useEffect(() => {
        // Force re-render when the theme changes
        setItems({...items});
    }, [colorScheme]);

    return (
        <View flex={1} backgroundColor="$color1">
            <Animated.View
                style={{
                    opacity: fadeAnim,
                    flex: 1,
                }}
            >
                <CustomHeader style={{paddingTop: insets.top}}>
                    <View/>
                    <TouchableOpacity onPress={async () => {
                        await Haptics.selectionAsync()
                    }} style={{
                        flex:1,
                        flexDirection: 'row', alignItems: 'center', gap: 5,
                        backgroundColor: theme.color2?.val,
                        padding: 10,
                        justifyContent: 'center',
                        borderRadius: 100
                    }}>
                        <Text>Register payment + </Text>
                    </TouchableOpacity>
                </CustomHeader>
                <View paddingTop={isIos ? insets.top + 40 : 0} flex={1}>
                    <Agenda
                        theme={{
                            backgroundColor: '#ec8115',
                            contentStyle: {
                                backgroundColor: '#adadad'
                            },
                            agendaKnobColor: theme.color10?.val,
                            calendarBackground: theme.color1?.val,
                            reservationsBackgroundColor: theme.color2?.val,
                            todayBackgroundColor: theme.color5?.val,
                            selectedDayBackgroundColor: theme.color10?.val,
                            dotColor: theme.color10?.val,
                            selectedDotColor: theme.color11?.val,
                            textSectionTitleColor: theme.color10?.val,
                            dayTextColor: theme.color12?.val,
                            textInactiveColor: '#797979',
                            textDisabledColor: '#797979',
                            todayTextColor: theme.color12?.val,
                            selectedDayTextColor: theme.color12?.val,
                            agendaDayTextColor: theme.color10?.val,
                            monthTextColor: theme.color12?.val,
                            agendaDayNumColor: theme.color12?.val,
                            textMonthFontSize: 16,
                            textMonthFontFamily: 'HelveticaNeue',
                            textMonthFontWeight: 'bold' as const,
                            textDayHeaderFontSize: 12,
                            textDayHeaderFontFamily: 'HelveticaNeue',
                            textDayHeaderFontWeight: 'normal' as const,
                            textDayFontSize: 18,
                            textDayFontFamily: 'HelveticaNeue',
                            textDayFontWeight: '500' as const,
                            textDayStyle: {marginTop: Platform.OS === 'android' ? 2 : 4},
                            dotStyle: {marginTop: -1}
                        }}
                        items={items}
                        // loadItemsForMonth={(month) => {
                        //     console.log('trigger items loading', month);
                        // } }
                        // onCalendarToggled={calendarOpened => {
                        //     console.log(calendarOpened);
                        // }}
                        // onDayPress={day => {
                        //     console.log('day pressed');
                        // }}
                        // onDayChange={day => {
                        //     console.log('day changed');
                        // }}
                        // selected={format(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ssXXX')}
                        // pastScrollRange={50}
                        // futureScrollRange={50}
                        renderItem={renderItem}
                        renderEmptyDate={() => {
                            return <View/>;
                        }}
                        renderEmptyData={renderEmptyData}
                        // rowHasChanged={rowHasChanged}
                        showClosingKnob
                        // markedDates={{
                        //     '2024-10-16': {selected: true, marked: true},
                        //     '2024-10-17': {marked: true},
                        //     '2024-10-18': {disabled: true}
                        // }}
                        // refreshing={false}
                        //
                        // onRefresh={() => console.log('refreshing...')}
                        // markingType={'period'}
                        // markedDates={{
                        //    '2017-05-08': {textColor: '#43515c'},
                        //    '2017-05-09': {textColor: '#43515c'},
                        //    '2017-05-14': {startingDay: true, endingDay: true, color: 'blue'},
                        //    '2017-05-21': {startingDay: true, color: 'blue'},
                        //    '2017-05-22': {endingDay: true, color: 'gray'},
                        //    '2017-05-24': {startingDay: true, color: 'gray'},
                        //    '2017-05-25': {color: 'gray'},
                        //    '2017-05-26': {endingDay: true, color: 'gray'}}}
                        // monthFormat={'yyyy'}
                        // theme={{calendarBackground: 'red', agendaKnobColor: 'green'}}
                        // renderDay={(day, item) => {
                        //     return <View />;
                        // }}                        // hideExtraDays={false}
                        // showOnlySelectedDayItems
                        // reservationsKeyExtractor={this.reservationsKeyExtractor}
                    />
                </View>
                {
                    isIos && <View height={80}/>
                }
            </Animated.View>
        </View>
    )
}

const styles = StyleSheet.create({
    item: {
        flex: 1,
        borderRadius: 5,
        padding: 10,
        marginRight: 10,
        marginTop: 17
    },
    emptyDate: {
        height: 15,
        flex: 1,
        paddingTop: 30
    },
    customDay: {
        margin: 10,
        fontSize: 24,
        color: 'green'
    },
    dayItem: {
        marginLeft: 34
    },
});
