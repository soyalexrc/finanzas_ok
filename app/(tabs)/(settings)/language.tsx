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
            <CustomHeader style={{paddingTop: isIos ? insets.top + 20 : insets.top}} centered={true}>
                <Text fontSize="$6">Language</Text>
            </CustomHeader>
        </View>
    )
}
