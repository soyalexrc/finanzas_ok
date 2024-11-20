import {ScrollView, Text, View} from "tamagui";
import React, {useEffect, useRef} from "react";
import {Animated, Platform, TouchableOpacity} from "react-native";
import CustomHeader from "@/lib/components/ui/CustomHeader";
import * as Haptics from "expo-haptics";
import {getCustomMonth} from "@/lib/helpers/date";
import {Entypo} from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import {useSafeAreaInsets} from "react-native-safe-area-context";

export default function Screen() {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const insets = useSafeAreaInsets();
    const isIos = Platform.OS === 'ios';

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300, // Adjust the duration as needed
            useNativeDriver: true,
        }).start();

    }, []);
    return (
        <View flex={1} backgroundColor="$color1">
            <Animated.View
                style={{
                    opacity: fadeAnim,
                    flex: 1,
                }}
            >
                <CustomHeader centered style={{paddingTop: insets.top}}>
                    <View>
                        <Text>Wallet</Text>
                    </View>
                </CustomHeader>
                <ScrollView showsVerticalScrollIndicator={false} paddingTop={isIos ? insets.top + 50 : 0}>
                    <Text>This screen is under development.</Text>
                </ScrollView>

            </Animated.View>
        </View>
    )
}
