import {View} from "tamagui";
import {useAnimatedRef, useAnimatedScrollHandler, useSharedValue} from "react-native-reanimated";
import {Animated, ImageURISource, NativeScrollEvent, NativeSyntheticEvent, StyleSheet, ViewToken} from "react-native";
import {useCallback} from "react";
import ListItem from "@/lib/components/ui/onboarding/ListItem";
import PaginationElement from "@/lib/components/ui/onboarding/PaginationElement";
import Button from "@/lib/components/ui/onboarding/Button";
import {useSafeAreaInsets} from "react-native-safe-area-context";

const pages = [
    {
        text: 'Trusted by millions of people, part of one part',
        image: require('../assets/images/signin/image-1.jpg'),
    },
    {
        text: 'Spend money abroad, and track your expense',
        image: require('../assets/images/signin/image-2.jpg'),
    },
    {
        text: 'Receive Money From Anywhere In The World',
        image: require('../assets/images/signin/image-3.jpg'),
    },
];

export default function Screen() {
    const x = useSharedValue(0);
    const insets = useSafeAreaInsets();
    const flatListIndex = useSharedValue(0);
    const flatListRef = useAnimatedRef<
        Animated.FlatList<{
            text: string;
            image: ImageURISource;
        }>
    >();

    const onViewableItemsChanged = useCallback(
        ({viewableItems}: { viewableItems: ViewToken[] }) => {
            flatListIndex.value = viewableItems[0].index ?? 0;
        },
        []
    );

    const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        // Your custom onScroll logic here
        // console.log(event.nativeEvent.contentOffset);
        x.value = event.nativeEvent.contentOffset.x;
    };

    // console.log(x.value);

    const renderItem = useCallback(
        ({
             item,
             index,
         }: {
            item: { text: string; image: ImageURISource };
            index: number;
        }) => {
            return <ListItem item={item} index={index} x={x}/>;
        },
        [x]
    );

    return (
        <View flex={1} backgroundColor="$color1" paddingBottom={insets.bottom}
              justifyContent="center" alignItems="center">
            <Animated.FlatList
                ref={flatListRef}
                horizontal
                onScroll={onScroll}
                scrollEventThrottle={16}
                pagingEnabled={true}
                data={pages}
                keyExtractor={(_, index) => index.toString()}
                bounces={false}
                renderItem={renderItem}
                showsHorizontalScrollIndicator={false}
                onViewableItemsChanged={onViewableItemsChanged}
            />
            <View justifyContent="space-between" flexDirection="row" width="100%" paddingHorizontal={30}>
                <PaginationElement length={pages.length} x={x}/>
                <Button
                    currentIndex={flatListIndex}
                    length={pages.length}
                    flatListRef={flatListRef}
                />
            </View>
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    bottomContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
});
