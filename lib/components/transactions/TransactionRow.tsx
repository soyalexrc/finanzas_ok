import {LogBox, Pressable, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import ReanimatedSwipeable, {
    SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';
import Reanimated, {
    SharedValue,
    useAnimatedStyle,
    runOnJS,
    useAnimatedReaction,
    configureReanimatedLogger,
    ReanimatedLogLevel,
    useSharedValue,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {Ionicons} from "@expo/vector-icons";
import {Fragment, memo, useCallback, useMemo, useRef} from "react";
import {Colors} from "@/lib/constants/colors";
import {formatByThousands} from "@/lib/helpers/string";
import {Image} from "expo-image";

configureReanimatedLogger({
    level: ReanimatedLogLevel.warn,
    strict: false, // Reanimated runs in strict mode by default
});


function LeftAction({drag, cb}: { drag: SharedValue<number>, cb: () => void }) {
    const hasReachedThresholdUp = useSharedValue(false);
    const hasReachedThresholdDown = useSharedValue(false);

    useAnimatedReaction(
        () => {
            return drag.value;
        },
        (dragValue) => {
            if (Math.abs(dragValue) > .17 && !hasReachedThresholdUp.value) {
                // runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
                runOnJS(cb)();
                hasReachedThresholdUp.value = true;
                hasReachedThresholdDown.value = false;
            } else if (Math.abs(dragValue) < .17 && !hasReachedThresholdDown.value) {
                // runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
                hasReachedThresholdDown.value = true;
                hasReachedThresholdUp.value = false;
            }
        }
    );

    const animatedStyle = useAnimatedStyle(() => {
        if (Math.abs(drag.value) > .17) {
            return {
                backgroundColor: 'red',
            };
        }
        return {
            backgroundColor: '#8b8a8a',
        };
    });

    return (
        <Reanimated.View style={[{flex: 1}]}>
            <Reanimated.View style={[styles.leftAction, animatedStyle]}>
                <Ionicons name="trash-outline" size={26} color="#fff"/>
            </Reanimated.View>
        </Reanimated.View>
    );
}

const TransactionRow = ({transaction, cb, heightValue = 80, onRemove, showPhoto = false}: any) => {
    const reanimatedRef = useRef<SwipeableMethods>(null);
    const heightAnim = useSharedValue(heightValue); // Approximate height of row
    const opacityAnim = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            height: heightAnim.value,
            opacity: opacityAnim.value,
        };
    });

    function handleLeftAction() {
        onRemove(transaction)
    }

    return (
        <Fragment>
            <Reanimated.View style={animatedStyle}>
                <ReanimatedSwipeable
                    ref={reanimatedRef}
                    containerStyle={styles.swipeable}
                    friction={2}
                    enableTrackpadTwoFingerGesture
                    // renderRightActions={RightAction}
                    renderLeftActions={(value) =>  <LeftAction drag={value} cb={handleLeftAction} />}
                >
                    <Pressable style={styles.container} onPress={cb}>
                        <View style={styles.row}>
                            <View style={{
                                width: 30,
                                height: 30,
                                backgroundColor: '#f0f0f0',
                                borderRadius: 6,
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                <Text style={styles.icon}>{transaction?.category?.icon}</Text>
                            </View>
                            {/*<BouncyCheckbox*/}
                            {/*    textContainerStyle={{ display: 'none' }}*/}
                            {/*    size={25}*/}
                            {/*    fillColor={task.project_color}*/}
                            {/*    unFillColor="#FFFFFF"*/}
                            {/*    textStyle={{ color: '#000', fontSize: 16, textDecorationLine: 'none' }}*/}
                            {/*    onPress={markAsCompleted}*/}
                            {/*/>*/}
                            <View style={{flex: 0.9}}>
                                <Text style={styles.title}>{transaction.title || transaction.category.title}</Text>
                                {transaction.description && <Text style={styles.description}>{transaction.description}</Text>}
                            </View>
                        </View>
                        {
                            showPhoto && transaction.author &&
                            <View style={{ position: 'absolute', backgroundColor: 'transparent', right: 10, top: 10 }}>
                                {transaction.author.photoUrl ? (
                                    <Image
                                        source={{ uri: transaction.author.photoUrl }}
                                        style={{ width: 20, height: 20, borderRadius: 10 }}
                                    />
                                ) : (
                                    <View
                                        style={{
                                            width: 20,
                                            height: 20,
                                            borderRadius: 10,
                                            backgroundColor: Colors.primary, // You can use a dynamic color if needed
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>
                                            {transaction.author.name?.charAt(0).toUpperCase()}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        }
                        <Text style={styles.amount}>{transaction.currency.symbol} {formatByThousands(String(transaction.amount))}</Text>
                    </Pressable>

                </ReanimatedSwipeable>
            </Reanimated.View>

        </Fragment>
    )
};

export default memo(TransactionRow);

const styles = StyleSheet.create({
    container: {
        padding: 14,
        backgroundColor: '#fff',
        position: 'relative',
        // borderBottomWidth: StyleSheet.hairlineWidth,
        // borderBottomColor: Colors.lightBorder,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'red',
        marginRight: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checked: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: Colors.primary,
    },
    title: {
        fontSize: 18,
    },
    description: {
        fontSize: 12,
        color: 'gray',
    },
    amount: {
        fontSize: 14,
        alignSelf: 'flex-end',
    },
    swipeable: {
        backgroundColor: '#fff',
    },
    rightAction: {
        height: 90,
        backgroundColor: '#8b8a8a',
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingHorizontal: 16,
        flex: 1,
    },

    leftAction: {
        height: 90,
        backgroundColor: '#8b8a8a',
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingHorizontal: 16,
        flex: 1,
    },
    icon: {
        fontSize: 20,
    }
});
