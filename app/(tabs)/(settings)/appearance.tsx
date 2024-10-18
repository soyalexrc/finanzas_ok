import {ListItem, ScrollView, Separator, Text, View, YGroup} from "tamagui";
import CustomHeader from "@/lib/components/ui/CustomHeader";
import React from "react";
import {Alert, Platform, StyleSheet} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import AntDesign from '@expo/vector-icons/AntDesign';
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import {selectSettings, updateAppearance} from "@/lib/store/features/settings/settingsSlice";
import {useHeaderHeight} from "@react-navigation/elements";
import {saveString} from "@/lib/utils/storage";
import {useTranslation} from "react-i18next";
import {changeCurrentTheme, CustomTheme, selectCurrentCustomTheme} from "@/lib/store/features/ui/uiSlice";

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

]

export default function Screen() {
    const dispatch = useAppDispatch();
    const appearance = useAppSelector(selectSettings).appearance
    const customTheme = useAppSelector(selectCurrentCustomTheme)
    const headerHeight = useHeaderHeight()
    const isIos = Platform.OS === 'ios';
    const {t} = useTranslation()

    async function onPressAppearanceValue(value: 'system' | 'light' | 'dark') {
        dispatch(updateAppearance(value));
        await saveString('appearance', value);
    }

    async function changeCustomTheme(value: CustomTheme) {
        Alert.alert(t('COMMON.WARNING'), t('SETTINGS.COLORS.CHANGE_COLOR_MESSAGE'))
        await saveString('custom_theme', value);
        dispatch(changeCurrentTheme(value));
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

const styles = StyleSheet.create({
    button: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    }
})
