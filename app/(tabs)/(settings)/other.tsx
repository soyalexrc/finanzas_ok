import {ListItem, ScrollView, Separator, Switch, Text, View, YGroup} from "tamagui";
import CustomHeader from "@/lib/components/ui/CustomHeader";
import React from "react";
import {Platform, StyleSheet} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import AntDesign from '@expo/vector-icons/AntDesign';
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import {selectSettings, updateAppearance, updateHiddenFeatureFlag} from "@/lib/store/features/settings/settingsSlice";
import {useHeaderHeight} from "@react-navigation/elements";
import {save, saveString} from "@/lib/utils/storage";

const data: { id: number, title: string, value: 'system' | 'light' | 'dark' }[] = [
    {
        id: 1,
        title: 'System',
        value: 'system'
    },
    {
        id: 2,
        title: 'Dark',
        value: 'dark'
    },
    {
        id: 3,
        title: 'Light',
        value: 'light'
    }
]

export default function Screen() {
    const dispatch = useAppDispatch();
    const {hidden_feature_flag} = useAppSelector(selectSettings)
    const appearance = useAppSelector(selectSettings).appearance
    const headerHeight = useHeaderHeight()
    const isIos = Platform.OS === 'ios';

    async function handleChangeSetting(setting: string, value: boolean) {
        const saved = await save('hidden_feature_flag', value);
        if  (saved) {
            dispatch(updateHiddenFeatureFlag(value));
        }
    }

    async function onPressAppearanceValue(value: 'system' | 'light' | 'dark') {
        dispatch(updateAppearance(value));
        await saveString('appearance', value);
    }

    return (
        <ScrollView flex={1} backgroundColor="$color1" showsVerticalScrollIndicator={false}
                    paddingTop={isIos ? headerHeight + 20 : headerHeight}>
            <YGroup alignSelf="center" bordered marginHorizontal={16} marginBottom={40} separator={<Separator/>}>
                <YGroup.Item>
                    <ListItem
                        title="Operate based on hidden amounts"
                        iconAfter={
                            <Switch size="$2" defaultChecked={hidden_feature_flag} onCheckedChange={(value) => handleChangeSetting('hidden_feature_flag', value)}>
                                <Switch.Thumb animation="quicker" />
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
