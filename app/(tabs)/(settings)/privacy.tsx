import {ListItem, ScrollView, Separator, Switch, Text, View, YGroup} from "tamagui";
import React from "react";
import {Platform, StyleSheet} from "react-native";
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import {
    selectSettings,
    updateAppearance,
    updateHiddenFeatureFlag,
    updateOnboardingState
} from "@/lib/store/features/settings/settingsSlice";
import {useHeaderHeight} from "@react-navigation/elements";
import {save, saveString} from "@/lib/utils/storage";
import {useTranslation} from "react-i18next";


export default function Screen() {
    const dispatch = useAppDispatch();
    const {hidden_feature_flag, isOnboardingShown} = useAppSelector(selectSettings)
    const headerHeight = useHeaderHeight()
    const isIos = Platform.OS === 'ios';
    const {t} = useTranslation();

    async function handleChangeSetting(value: boolean) {
        const saved = await save('hidden_feature_flag', value);
        if (saved) {
            dispatch(updateHiddenFeatureFlag(value));
        }
    }


    return (
        <ScrollView flex={1} backgroundColor="$color1" showsVerticalScrollIndicator={false}
                    paddingTop={isIos ? headerHeight + 20 : 20}>
            <YGroup alignSelf="center" bordered marginHorizontal={16} marginBottom={40} separator={<Separator/>}>
                <YGroup.Item>
                    <ListItem
                        title={t('SETTINGS.PRIVACY.OPTIONS.HIDDEN_FLAG')}
                        iconAfter={
                            <Switch size="$2" defaultChecked={hidden_feature_flag}
                                    onCheckedChange={(value) => handleChangeSetting(value)}>
                                <Switch.Thumb animation="quicker"/>
                            </Switch>
                        }
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
