import {ListItem, ScrollView, Separator, Switch, Text, View, YGroup} from "tamagui";
import React, {useState} from "react";
import {Platform} from "react-native";
import {useHeaderHeight} from "@react-navigation/elements";
import {useTranslation} from "react-i18next";
import Entypo from "@expo/vector-icons/Entypo";
import {useBiometricAuth} from "@/lib/hooks/useBiometricAuth";
import {useRouter} from "expo-router";
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import {selectSettings, updateOnboardingState} from "@/lib/store/features/settings/settingsSlice";
import {updateSettingByKey} from "@/lib/db";
import {useSQLiteContext} from "expo-sqlite";
import FilterSettingSheet from "@/lib/components/settings/filters/FilterSettingSheet";

export default function Screen() {
    const headerHeight = useHeaderHeight()
    // const db = useSQLiteContext()
    const isIos = Platform.OS === 'ios';
    const db = useSQLiteContext()
    // const dispatch = useDispatch()
    const {t} = useTranslation();
    const {authenticate} = useBiometricAuth()
    const router = useRouter();
    const [openFilterSheet, setOpenFilterSheet] = useState<boolean>(false);
    const { isOnboardingShown } = useAppSelector(selectSettings)
    const dispatch = useAppDispatch()

    async function handleChangeSetting(value: boolean) {
            const result = updateSettingByKey(db, 'is_onboarding_shown', String(value))
            if (result) {
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
        <>
            <ScrollView flex={1} backgroundColor="$color1" showsVerticalScrollIndicator={false}
                        paddingTop={isIos ? headerHeight + 20 : 20}>
                <YGroup alignSelf="center" bordered marginHorizontal={16} marginBottom={40} separator={<Separator/>}>
                    <YGroup.Item>
                        <ListItem
                            title={t('SETTINGS.OTHER.OPTIONS.RESET_ONBOARDING')}
                            iconAfter={
                                <Switch size="$2" checked={isOnboardingShown} onCheckedChange={(value) => handleChangeSetting(value)}>
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
                            onPress={() => setOpenFilterSheet(true)}
                            title={t('SETTINGS.FILTERS.TITLE')}
                            iconAfter={<Entypo name="chevron-small-right" size={24}/>}
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
            <FilterSettingSheet open={openFilterSheet} setOpen={setOpenFilterSheet} />
        </>


    )
}
