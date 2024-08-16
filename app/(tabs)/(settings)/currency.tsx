import {Text, View} from "tamagui";
import CustomHeader from "@/lib/components/ui/CustomHeader";
import React from "react";
import {Platform} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";

export default function Screen() {
    const insets = useSafeAreaInsets();
    const isIos = Platform.OS === 'ios';

    return (
        <View flex={1}>
        </View>
    )
}
