import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';

export default function FloatingLogo() {
    const translateY = useSharedValue(0);

    translateY.value = withRepeat(
        withTiming(-10, { duration: 1000 }),
        -1,
        true // Alternate between -10 and 10
    );

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    return (
        <View style={styles.top}>
            <Animated.Image
                source={require('@/assets/images/icon.png')}
                style={[styles.image, animatedStyle]}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    top: {
        width: '100%',
        height: 300,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    image: {
        width: 200,
        height: 200,
    },
});
