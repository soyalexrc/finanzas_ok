import {ListItem, ScrollView, Separator, Switch, Text, View, YGroup} from "tamagui";
import React from "react";
import {Platform, StyleSheet} from "react-native";
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import {
    selectSettings,
    updateOnboardingState
} from "@/lib/store/features/settings/settingsSlice";
import {useHeaderHeight} from "@react-navigation/elements";
import {save, saveString} from "@/lib/utils/storage";
import {useTranslation} from "react-i18next";
import Entypo from "@expo/vector-icons/Entypo";
import {useBiometricAuth} from "@/lib/hooks/useBiometricAuth";
import {useRouter} from "expo-router";


export default function Screen() {
    const dispatch = useAppDispatch();
    const {isOnboardingShown} = useAppSelector(selectSettings)
    const headerHeight = useHeaderHeight()
    const isIos = Platform.OS === 'ios';
    const {t} = useTranslation();
    const {authenticate} = useBiometricAuth()
    const router = useRouter();

    async function handleChangeSetting(value: boolean) {
            const saved = await save('is_onboarding_shown', value);
            if (saved) {
                dispatch(updateOnboardingState(value))
            }
    }

    async function goToPrivacy() {
        const isAuthenticated = await authenticate()

        if (isAuthenticated) {
            router.push('/privacy')
        }
    }

    return (
        <ScrollView flex={1} backgroundColor="$color1" showsVerticalScrollIndicator={false}
                    paddingTop={isIos ? headerHeight + 20 : 20}>
            <YGroup alignSelf="center" bordered marginHorizontal={16} marginBottom={40} separator={<Separator/>}>
                <YGroup.Item>
                    <ListItem
                        title={t('SETTINGS.OTHER.OPTIONS.RESET_ONBOARDING')}
                        iconAfter={
                            <Switch size="$2" defaultChecked={isOnboardingShown} onCheckedChange={(value) => handleChangeSetting(value)}>
                                <Switch.Thumb animation="quicker" />
                            </Switch>
                        }
                    />
                </YGroup.Item>
            </YGroup>

            <YGroup alignSelf="center" bordered marginHorizontal={16} marginBottom={40} separator={<Separator/>}>
                <YGroup.Item>
                    <ListItem
                        hoverTheme
                        pressTheme
                        onPress={goToPrivacy}
                        title={t('SETTINGS.PRIVACY.TITLE')}
                        iconAfter={<Entypo name="chevron-small-right" size={24}/>}
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
