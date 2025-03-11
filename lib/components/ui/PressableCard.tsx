import Animated, {StyleProps, useAnimatedStyle, useSharedValue, withSpring} from "react-native-reanimated";
import {Pressable, StyleSheet, TouchableOpacity, View} from "react-native";
import React from "react";

type Props = {
    shadow: boolean
    onPress: () => void;
    children: React.ReactNode
    extraStyles?: StyleProps
}

export default function PressableCard({shadow, onPress, children, extraStyles}: Props) {
    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{scale: scale.value}],
        };
    });

    const handlePressIn = () => {
        scale.value = withSpring(0.98, {damping: 10});
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, {damping: 10});
    };
    return (
        <Animated.View style={[animatedStyle]}>
            <Pressable
                onPressOut={handlePressOut}
                onPressIn={handlePressIn}
                style={[ styles.card, shadow && styles.shadow, extraStyles]}
                onPress={onPress}
            >
                {children}
            </Pressable>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 15,
        borderStyle: 'solid',
        borderColor: '#e7e7e7',
        borderWidth: 1,
    },
    shadow: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 5, // For Android
    }
})
