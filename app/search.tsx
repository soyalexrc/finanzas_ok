import {ScrollView, Text, View} from "tamagui";
import {Platform} from "react-native";
import {useHeaderHeight} from "@react-navigation/elements";

export default function Screen() {
    const isIos = Platform.OS === 'ios';
    const headerHeight = useHeaderHeight();
    return (
        <ScrollView flex={1} backgroundColor="$color1" showsVerticalScrollIndicator={false}
                    paddingTop={isIos ? headerHeight + 20 : 20}>
            <Text>Screen</Text>
        </ScrollView>
    )
}
