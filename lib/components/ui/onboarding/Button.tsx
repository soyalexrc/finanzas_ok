import {
    ImageURISource,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import React, { useCallback } from 'react';
import Animated, {
    useAnimatedStyle,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import {load, save} from "@/lib/utils/storage";
import {useRouter} from "expo-router";
import {useAppDispatch} from "@/lib/store/hooks";
import {updateOnboardingState} from "@/lib/store/features/settings/settingsSlice";
import {useTheme} from "tamagui";
import {useTranslation} from "react-i18next";

type Props = {
    currentIndex: Animated.SharedValue<number>;
    length: number;
    flatListRef: any;
};
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const Button = ({ currentIndex, length, flatListRef }: Props) => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const {t} = useTranslation()
    const theme = useTheme();
    const rnBtnStyle = useAnimatedStyle(() => {
        return {
            width:
                currentIndex.value === length - 1 ? withSpring(140) : withSpring(60),
            height: 60,
        };
    }, [currentIndex, length]);

    const rnTextStyle = useAnimatedStyle(() => {
        return {
            opacity:
                currentIndex.value === length - 1 ? withTiming(1) : withTiming(0),
            transform: [
                {
                    translateX:
                        currentIndex.value === length - 1 ? withTiming(0) : withTiming(100),
                },
            ],
        };
    }, [currentIndex, length]);

    const imageAnimatedStyle = useAnimatedStyle(() => {
        return {
            opacity:
                currentIndex.value !== length - 1 ? withTiming(1) : withTiming(0),
            transform: [
                {
                    translateX:
                        currentIndex.value !== length - 1 ? withTiming(0) : withTiming(100),
                },
            ],
        };
    }, [currentIndex, length]);

    const onPress = useCallback(async () => {
        if (currentIndex.value === length - 1) {
            const result = await save('is_onboarding_shown', true)
            if (result) {
                router.replace('/(tabs)');
                dispatch(updateOnboardingState(true))
            }
            return;
        } else {
            flatListRef?.current?.scrollToIndex({
                index: currentIndex.value + 1,
            });
        }
    }, []);
    return (
        <AnimatedPressable style={[styles.container, rnBtnStyle, { backgroundColor: theme.color10.val }]} onPress={onPress}>
            <Animated.Text style={[styles.textStyle, rnTextStyle, { color: theme.color12.val }]}>
                {t('COMMON.GET_STARTED')}
            </Animated.Text>
            <Animated.Image
                source={require('../../../../assets/icons/arrow-right.png')}
                style={[styles.imageStyle, imageAnimatedStyle]}
            />
        </AnimatedPressable>
    );
};

export default Button;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    textStyle: {
        position: 'absolute',
        fontWeight: '600',
        fontSize: 16,
    },
    imageStyle: {
        width: 24,
        height: 24,
        position: 'absolute',
    },
});
