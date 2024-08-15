import {ListItem, ScrollView, Separator, Text, View, YGroup} from "tamagui";
import CustomHeader from "@/lib/components/ui/CustomHeader";
import React from "react";
import {Platform, StyleSheet} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import AntDesign from '@expo/vector-icons/AntDesign';
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import {selectSettings, updateAppearance} from "@/lib/store/features/settings/settingsSlice";

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
    const insets = useSafeAreaInsets();
    const isIos = Platform.OS === 'ios';
    const dispatch = useAppDispatch();
    const appearance = useAppSelector(selectSettings).appearance

    return (
        <View flex={1} backgroundColor="$color1">
            <CustomHeader style={{paddingTop: isIos ? insets.top + 20 : insets.top}} centered={true}>
                <Text fontSize="$6">Appereance</Text>
            </CustomHeader>
            <ScrollView showsVerticalScrollIndicator={false} paddingTop={isIos ? insets.top + 80 : 20}>
                <YGroup alignSelf="center" bordered marginHorizontal={16} marginBottom={40} separator={<Separator/>}>
                    {
                        data.map(item => (
                            <YGroup.Item key={item.id}>
                                <ListItem
                                    hoverTheme
                                    pressTheme
                                    title={item.title}
                                    onPress={() => dispatch(updateAppearance(item.value))}
                                    iconAfter={<AntDesign name='check' size={20}
                                                          color={appearance === item.value ? 'black' : 'transparent'}/>}
                                />
                            </YGroup.Item>

                        ))
                    }
                </YGroup>

            </ScrollView>

        </View>
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
