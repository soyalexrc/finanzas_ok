import {
    Button,
    ListItem,
    ScrollView,
    Separator,
    Switch,
    Text,
    useIsomorphicLayoutEffect,
    View,
    XStack,
    YGroup
} from "tamagui";
import React, {useEffect, useState} from "react";
import {Alert, Platform} from "react-native";
import {useHeaderHeight} from "@react-navigation/elements";
import {useTranslation} from "react-i18next";
import * as Notifications from "expo-notifications";
import * as Linking from 'expo-linking';
import {useFocusEffect} from "expo-router";
import DatePicker from "react-native-date-picker";
import {formatDate} from "@/lib/helpers/date";
import {onChangeDate} from "@/lib/store/features/transactions/transactionsSlice";
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import {selectSettings, updateNotificationsScheduling} from "@/lib/store/features/settings/settingsSlice";
import {save} from "@/lib/utils/storage";
import {formatTimeBasedOnHourAndMinute} from "@/lib/helpers/string";
import * as Haptics from "expo-haptics";

export default function Screen() {
    const headerHeight = useHeaderHeight()
    const dispatch = useAppDispatch();
    const {notifications} = useAppSelector(selectSettings);
    const isIos = Platform.OS === 'ios';
    const {t} = useTranslation();
    const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
    const {selectedLanguage} = useAppSelector(selectSettings)
    const [showCalendar, setShowCalendar] = useState<boolean>(false);

    async function handleChangeActiveNotificationScheduling(value: boolean) {
        await save('notifications_scheduling', {...notifications.scheduling, active: value});
        dispatch(updateNotificationsScheduling({ ...notifications.scheduling, active: value }));

        if (value) {
            await scheduleDailyNotification(notifications.scheduling.hour, notifications.scheduling.minute)
        } else {
            await Notifications.cancelAllScheduledNotificationsAsync();
        }

    }

    async function handleChangeSetting(value: boolean) {
        await Haptics.selectionAsync();
        try {
            if (value) {
                if (Platform.OS === 'android') {
                    await Notifications.setNotificationChannelAsync('default', {
                        name: 'default',
                        importance: Notifications.AndroidImportance.MAX,
                        vibrationPattern: [0, 250, 250, 250],
                        lightColor: '#FF231F7C',
                    });
                }

                const {status, canAskAgain} = await Notifications.requestPermissionsAsync();

                if (status === 'granted') {
                    setNotificationsEnabled(true);
                }

                if (status === 'denied' && !canAskAgain) {
                    await Linking.openSettings();
                }


            } else {
                await Linking.openSettings();
            }
        } catch (e) {
            console.error(e);
        }


    }

    async function getPermissionsStatus() {
        const { status } = await Notifications.getPermissionsAsync();
        setNotificationsEnabled(status === 'granted')
    }

    useEffect(() => {
        getPermissionsStatus();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            getPermissionsStatus();
        }, 5000)

        return () => {
            clearInterval(interval)
        }
    }, []);

    async function scheduleDailyNotification(hour: number, minute: number, displayPopup = false) {
        await Haptics.selectionAsync();
        await Notifications.cancelAllScheduledNotificationsAsync();
        const notification = {
            title: t('SETTINGS.NOTIFICATIONS.OPTIONS.NOTIFICATION_TITLE'),
            body: t('SETTINGS.NOTIFICATIONS.OPTIONS.NOTIFICATION_BODY'),
            data: {},
        };

        const trigger: Notifications.NotificationTriggerInput = {
            repeats: true,
            hour,
            minute
        };

        try {
            const schedulingResult = await Notifications.scheduleNotificationAsync({
                content: notification,
                trigger,
            });
            if (displayPopup) {
                Alert.alert(t('COMMON.WARNING'), t('SETTINGS.NOTIFICATIONS.OPTIONS.SCHEDULING_OK'),  [
                    { style: 'default', text: 'Ok' }
                ])
            }
            console.log('Daily notification scheduled:', schedulingResult);
        } catch (error) {
            console.error('Error scheduling daily notification:', error);
        }
    }

    return (
        <>
            <ScrollView flex={1} backgroundColor="$color1" showsVerticalScrollIndicator={false}
                        paddingTop={isIos ? headerHeight + 20 : 20}>
                <YGroup alignSelf="center" bordered marginHorizontal={16} marginBottom={40} separator={<Separator/>}>
                    <YGroup.Item>
                        <ListItem
                            hoverTheme
                            pressTheme
                            title={t('SETTINGS.NOTIFICATIONS.OPTIONS.ENABLE')}
                            iconAfter={
                                <Switch size="$2" checked={notificationsEnabled} onCheckedChange={(value) => handleChangeSetting(value)}>
                                    <Switch.Thumb animation="quicker" />
                                </Switch>
                            }
                        />
                    </YGroup.Item>
                </YGroup>

                {
                    notificationsEnabled &&
                    <YGroup alignSelf="center" bordered marginHorizontal={16} marginBottom={40} separator={<Separator/>}>
                        <YGroup.Item>
                            <ListItem
                                hoverTheme
                                pressTheme
                                title={t('SETTINGS.NOTIFICATIONS.OPTIONS.ENABLE_DAILY')}
                                iconAfter={
                                    <Switch size="$2" checked={notifications.scheduling.active} onCheckedChange={(value) => handleChangeActiveNotificationScheduling(value)}>
                                        <Switch.Thumb animation="quicker" />
                                    </Switch>
                                }
                            />
                        </YGroup.Item>
                        {
                            notifications.scheduling.active &&
                            <YGroup.Item>
                                <ListItem
                                    hoverTheme
                                    pressTheme
                                    onPress={() => setShowCalendar(true)}
                                    title={t('SETTINGS.NOTIFICATIONS.OPTIONS.SCHEDULING')}
                                    iconAfter={
                                        <XStack>
                                            <Text>{formatTimeBasedOnHourAndMinute(notifications.scheduling.hour, notifications.scheduling.minute)}</Text>
                                        </XStack>
                                    }
                                />
                            </YGroup.Item>
                        }
                    </YGroup>
                }

            </ScrollView>
            <DatePicker
                modal
                mode="time"
                date={new Date(new Date().setHours(notifications.scheduling.hour, notifications.scheduling.minute))}
                locale={selectedLanguage}
                title={t('REPORTS_SHEET.SELECT_TIME')}
                cancelText={t('COMMON.CANCEL')}
                confirmText={t('COMMON.CONFIRM')}
                open={showCalendar}
                onConfirm={async (result) => {
                    const timeZonedDate = formatDate(result)
                    const hour = timeZonedDate.getHours();
                    const minute = timeZonedDate.getMinutes()
                    const res = await save('notifications_scheduling', {hour, minute});

                    if (res) {
                        dispatch(updateNotificationsScheduling({ hour, minute, active: true }))
                        await scheduleDailyNotification(hour, minute, true)
                    }

                    setShowCalendar(false)
                }}
                onCancel={() => {
                    setShowCalendar(false)
                }}
            />
        </>
    )
}
