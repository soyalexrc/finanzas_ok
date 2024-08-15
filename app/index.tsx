import {Image, Text, View, YStack, ZStack} from "tamagui";
import {Redirect} from "expo-router";
import {useAuth} from "@clerk/clerk-expo";
import BottomLoginSheet from "@/lib/components/auth/BottomLoginSheet";
import {useEffect, useRef, useState} from "react";
import {FlatList, Platform, StatusBar, Dimensions, StyleSheet, Animated} from "react-native";
import {loadString} from "@/lib/utils/storage";

const images = [
    // {id: '1', image: require('@/assets/images/signin/image-1.jpg')},
    {id: '2', image: require('@/assets/images/signin/image-2.jpg')},
    // {id: '3', image: require('@/assets/images/signin/image-3.jpg')},
    // {id: '4', image: require('@/assets/images/signin/image-4.jpg')},
    {id: '5', image: require('@/assets/images/signin/image-5.jpg')},
    // {id: '6', image: require('@/assets/images/signin/image-6.jpg')},
    // {id: '7', image: require('@/assets/images/signin/image-7.jpg')},
    {id: '8', image: require('@/assets/images/signin/image-8.jpg')},
    {id: '9', image: require('@/assets/images/signin/image-9.jpg')},
];

const { height, width } = Dimensions.get('screen');

export default function Screen() {
    const {isSignedIn} = useAuth()
    const isIos = Platform.OS === 'ios';

    const scrollX = useRef(new Animated.Value(0)).current;

    const imageW = width * 0.8;
    const imageH = imageW * 1.64

    // if (isSignedIn) {
    //     return <Redirect href={'/(tabs)'}/>
    // }

    return (
        <YStack flex={1} position="relative" backgroundColor="$color1">
            <StatusBar hidden />
            <View flex={0.9}>
                <View style={[StyleSheet.absoluteFillObject]}>
                    {images.map((item, index) => {
                        const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
                        const opacity = scrollX.interpolate({
                            inputRange,
                            outputRange: [0, 1, 0]
                        });
                        return (
                            <Animated.Image
                                key={`image-${item.id}`}
                                source={item.image}
                                style={[
                                    StyleSheet.absoluteFillObject,
                                    {
                                        opacity
                                    }
                                ]}
                                blurRadius={50}
                            />
                        )
                    })}
                </View>
                <Animated.FlatList
                    data={images}
                    scrollEnabled
                    horizontal
                    pagingEnabled
                    keyExtractor={(image) => image.id}
                    onScroll={Animated.event(
                        [{nativeEvent: {contentOffset: {x: scrollX}}}],
                        {useNativeDriver: true}
                    )}
                    renderItem={({item}) => (
                        <View width={width} height={height - 150} justifyContent="center" alignItems="center">
                            <Image
                                source={item.image}
                                width={imageW}
                                height={imageH}
                                borderRadius={16}
                            />
                        </View>
                    )}
                />
            </View>
            <BottomLoginSheet/>
        </YStack>
    )
}
