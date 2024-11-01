import {ListItem, ScrollView, Separator, Text, View, YGroup} from "tamagui";
import React from "react";
import {Platform} from "react-native";
import AntDesign from '@expo/vector-icons/AntDesign';
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import {selectSettings, updateSelectedLanguage} from "@/lib/store/features/settings/settingsSlice";
import {useHeaderHeight} from "@react-navigation/elements";
import {useTranslation} from "react-i18next";
import i18next from "i18next";
import {useSQLiteContext} from "expo-sqlite";
import {updateSettingByKey} from "@/lib/db";

export default function Screen() {
    const dispatch = useAppDispatch();
    const db = useSQLiteContext()
    const { t } = useTranslation();
    const {selectedLanguage} = useAppSelector(selectSettings)
    const headerHeight = useHeaderHeight()
    const isIos = Platform.OS === 'ios';


    async function onPressAppearanceValue(value: string) {
        const result = updateSettingByKey(db, 'selected_language', value);
        if (result) {
            dispatch(updateSelectedLanguage(value));
            await i18next.changeLanguage(value);
        }
    }

    return (
        <ScrollView flex={1} backgroundColor="$color1" showsVerticalScrollIndicator={false}
                    paddingTop={isIos ? headerHeight + 20 : 20}>
            <YGroup alignSelf="center" bordered marginHorizontal={16} marginBottom={40} separator={<Separator/>}>
                <YGroup.Item>
                    <ListItem
                        hoverTheme
                        pressTheme
                        title={t('SETTINGS.LANGUAGE.OPTIONS.ENGLISH')}
                        onPress={() => onPressAppearanceValue('en')}
                        iconAfter={<AntDesign name='check' size={20}
                                              color={selectedLanguage === 'en' ? 'black' : 'transparent'}/>}
                    />
                </YGroup.Item>
                <YGroup.Item>
                    <ListItem
                        hoverTheme
                        pressTheme
                        title={t('SETTINGS.LANGUAGE.OPTIONS.SPANISH')}
                        onPress={() => onPressAppearanceValue('es')}
                        iconAfter={<AntDesign name='check' size={20}
                                              color={selectedLanguage === 'es' ? 'black' : 'transparent'}/>}
                    />
                </YGroup.Item>
                <YGroup.Item>
                    <ListItem
                        hoverTheme
                        pressTheme
                        title={t('SETTINGS.LANGUAGE.OPTIONS.FRENCH')}
                        onPress={() => onPressAppearanceValue('fr')}
                        iconAfter={<AntDesign name='check' size={20}
                                              color={selectedLanguage === 'fr' ? 'black' : 'transparent'}/>}
                    />
                </YGroup.Item>
                <YGroup.Item>
                    <ListItem
                        hoverTheme
                        pressTheme
                        title={t('SETTINGS.LANGUAGE.OPTIONS.JAPANESE')}
                        onPress={() => onPressAppearanceValue('ja')}
                        iconAfter={<AntDesign name='check' size={20}
                                              color={selectedLanguage === 'ja' ? 'black' : 'transparent'}/>}
                    />
                </YGroup.Item>
                <YGroup.Item>
                    <ListItem
                        hoverTheme
                        pressTheme
                        title={t('SETTINGS.LANGUAGE.OPTIONS.CHINESE')}
                        onPress={() => onPressAppearanceValue('zh')}
                        iconAfter={<AntDesign name='check' size={20}
                                              color={selectedLanguage === 'zh' ? 'black' : 'transparent'}/>}
                    />
                </YGroup.Item>
                <YGroup.Item>
                    <ListItem
                        hoverTheme
                        pressTheme
                        title={t('SETTINGS.LANGUAGE.OPTIONS.GERMAN')}
                        onPress={() => onPressAppearanceValue('de')}
                        iconAfter={<AntDesign name='check' size={20}
                                              color={selectedLanguage === 'de' ? 'black' : 'transparent'}/>}
                    />
                </YGroup.Item>
            </YGroup>
        </ScrollView>

    )
}
