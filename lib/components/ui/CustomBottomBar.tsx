import {Platform} from "react-native";
import {BlurView} from "expo-blur";
import React from "react";
import {useTheme} from "@react-navigation/native";
import {View} from 'tamagui';

export default function CustomBottomBar() {
    const isIos = Platform.OS === 'ios';
    const colors = useTheme().colors;

    return (
        <View flex={1}>
            <View
                style={{
                    width: '100%',
                    height: '100%',
                    overflow: 'hidden',
                }}
            >
                {
                    isIos
                    ?
                        <BlurView
                            intensity={100}
                            tint='prominent'
                            style={{ flex: 1 }}
                        />
                    :
                        <View flex={1} backgroundColor="$background" />
                }

            </View>
        </View>
    )
}
