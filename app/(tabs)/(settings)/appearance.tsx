import {ListItem, ScrollView, Separator, Text, View, YGroup} from "tamagui";
import React from "react";
import {Alert, Platform} from "react-native";
import AntDesign from '@expo/vector-icons/AntDesign';
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import {selectSettings, updateAppearance} from "@/lib/store/features/settings/settingsSlice";
import {useHeaderHeight} from "@react-navigation/elements";
import {useTranslation} from "react-i18next";
import {changeCurrentTheme, CustomTheme, selectCurrentCustomTheme} from "@/lib/store/features/ui/uiSlice";
import * as Updates from 'expo-updates'
import {updateSettingByKey} from "@/lib/db";
import {useSQLiteContext} from "expo-sqlite";

const themes = [
    {
        color: 'hsla(104, 60%, 55%, 1)',
        type: 'green',
        translation: 'GREEN'
    },
    {
        color: 'hsla(227, 60%, 50%, 1)',
        type: 'blue',
        translation: 'BLUE'
    },
    {
        color: 'hsla(0, 61%, 55%, 1)',
        type: 'red',
        translation: 'RED'
    },
    {
        color: 'hsla(43, 60%, 50%, 1)',
        type: 'yellow',
        translation: 'YELLOW'
    },
    {
        color: 'hsla(256, 60%, 50%, 1)',
        type: 'purple',
        translation: 'PURPLE'
    },
    {
        color: 'hsla(0, 0%, 0%, 1)',
        type: 'black',
        translation: 'BLACK'
    },

]

export default function Screen() {
    const dispatch = useAppDispatch();
    const db = useSQLiteContext()
    const appearance = useAppSelector(selectSettings).appearance
    const customTheme = useAppSelector(selectCurrentCustomTheme)
    const headerHeight = useHeaderHeight()
    const isIos = Platform.OS === 'ios';
    const {t} = useTranslation()

    async function onPressAppearanceValue(value: 'system' | 'light' | 'dark') {
        const result = updateSettingByKey(db,'appearance', value);
        if (result) {
            dispatch(updateAppearance(value));
        }
        // await saveString('appearance', value);
    }

    async function changeCustomTheme(value: CustomTheme) {
        Alert.alert(t('COMMON.WARNING'), t('SETTINGS.COLORS.CHANGE_COLOR_MESSAGE'), [
            {style: 'destructive', text: t('COMMON.CANCEL'), isPreferred: true},
            {
                style: 'default',
                text: t('COMMON.ACCEPT'),
                isPreferred: false,
                onPress: async () => {
                    const result = updateSettingByKey(db, 'custom_theme', value);
                    // await saveString('custom_theme', value);
                    if (result) {
                        dispatch(changeCurrentTheme(value));
                        await Updates.reloadAsync()
                    }
                }
            }

        ])

    }

    return (
        <ScrollView flex={1} backgroundColor="$color1" showsVerticalScrollIndicator={false}
                    paddingTop={isIos ? headerHeight + 20 : 20}>
            <YGroup alignSelf="center" bordered marginHorizontal={16} marginBottom={40} separator={<Separator/>}>
                <YGroup.Item>
                    <ListItem
                        hoverTheme
                        pressTheme
                        title={t('SETTINGS.APPEARANCE.OPTIONS.SYSTEM')}
                        onPress={() => onPressAppearanceValue('system')}
                        iconAfter={<AntDesign name='check' size={20}
                                              color={appearance === 'system' ? 'black' : 'transparent'}/>}
                    />
                </YGroup.Item>
                <YGroup.Item>
                    <ListItem
                        hoverTheme
                        pressTheme
                        title={t('SETTINGS.APPEARANCE.OPTIONS.DARK')}
                        onPress={() => onPressAppearanceValue('dark')}
                        iconAfter={<AntDesign name='check' size={20}
                                              color={appearance === 'dark' ? 'white' : 'transparent'}/>}
                    />
                </YGroup.Item>
                <YGroup.Item>
                    <ListItem
                        hoverTheme
                        pressTheme
                        title={t('SETTINGS.APPEARANCE.OPTIONS.LIGHT')}
                        onPress={() => onPressAppearanceValue('light')}
                        iconAfter={<AntDesign name='check' size={20}
                                              color={appearance === 'light' ? 'black' : 'transparent'}/>}
                    />
                </YGroup.Item>
            </YGroup>

            <YGroup alignSelf="center" bordered marginHorizontal={16} marginBottom={40} separator={<Separator/>}>
                {
                    themes.map(theme => (
                        <YGroup.Item key={theme.color}>
                            <ListItem
                                hoverTheme
                                pressTheme
                                icon={<View w={25} h={25} backgroundColor={theme.color} borderRadius={100} />}
                                title={t(`SETTINGS.COLORS.${theme.translation}`)}
                                onPress={() => changeCustomTheme(theme.type)}
                                iconAfter={<AntDesign name='check' size={20} color={customTheme === theme.type ? appearance === 'system' ? 'black' : 'white' : 'transparent'}/>}
                            />
                        </YGroup.Item>
                    ))
                }
            </YGroup>


        </ScrollView>

    )
}
