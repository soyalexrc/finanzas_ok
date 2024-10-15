import {ListItem, ScrollView, Separator, Text, View, YGroup} from "tamagui";
import CustomHeader from "@/lib/components/ui/CustomHeader";
import React from "react";
import {Platform, StyleSheet} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import AntDesign from '@expo/vector-icons/AntDesign';
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import {selectSettings, updateAppearance} from "@/lib/store/features/settings/settingsSlice";
import {useHeaderHeight} from "@react-navigation/elements";
import {saveString} from "@/lib/utils/storage";
import {useTranslation} from "react-i18next";

export default function Screen() {
    const dispatch = useAppDispatch();
    const appearance = useAppSelector(selectSettings).appearance
    const headerHeight = useHeaderHeight()
    const isIos = Platform.OS === 'ios';
    const {t} = useTranslation()

    async function onPressAppearanceValue(value: 'system' | 'light' | 'dark') {
        dispatch(updateAppearance(value));
        await saveString('appearance', value);
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
