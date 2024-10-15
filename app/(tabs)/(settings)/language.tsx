import {ListItem, ScrollView, Separator, Text, View, YGroup} from "tamagui";
import CustomHeader from "@/lib/components/ui/CustomHeader";
import React from "react";
import {Platform, StyleSheet} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import AntDesign from '@expo/vector-icons/AntDesign';
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import {selectSettings, updateAppearance, updateSelectedLanguage} from "@/lib/store/features/settings/settingsSlice";
import {useHeaderHeight} from "@react-navigation/elements";
import {saveString} from "@/lib/utils/storage";
import {useTranslation} from "react-i18next";
import i18next from "i18next";

export default function Screen() {
    const dispatch = useAppDispatch();
    const { t } = useTranslation();
    const {selectedLanguage} = useAppSelector(selectSettings)
    const headerHeight = useHeaderHeight()
    const isIos = Platform.OS === 'ios';


    async function onPressAppearanceValue(value: string) {
        dispatch(updateSelectedLanguage(value));
        await saveString('selected_language', value);
        await i18next.changeLanguage(value);
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
