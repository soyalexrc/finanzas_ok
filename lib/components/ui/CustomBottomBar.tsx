import {Platform, View} from "react-native";
import {BlurView} from "expo-blur";
import React from "react";
import {useTheme} from "@react-navigation/native";

export default function CustomBottomBar() {
    const isIos = Platform.OS === 'ios';
    const colors = useTheme().colors;

    return (
        <View style={{ flex: 1 }}>
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
                        <View style={{ flex: 1, backgroundColor: colors.background }} />
                }

            </View>
        </View>
    )
}
