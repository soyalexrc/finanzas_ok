import React, { useRef } from "react";
import {
    ActivityIndicator, FlatList, StyleSheet, Text, View,
    useWindowDimensions, Animated
} from "react-native";
import { formatByThousands, formatWithDecimals } from "@/lib/helpers/string";
import { CurrencyV2 } from "@/lib/store/features/transactions/currencies.slice";
import {Colors} from "@/lib/constants/colors";

type Props = {
    currency: CurrencyV2;
    data: {
        totalCurrentMonth: number;
        totalSpentOnYear: number;
        totalLastMonth: number;
        totalLastWeek: number;
    };
    loading: boolean;
};

export default function StatisticsByCurrencyList({ currency, data, loading }: Props) {
    const { width } = useWindowDimensions();
    const scrollX = useRef(new Animated.Value(0)).current; // Track scroll position

    if (loading) {
        return (
            <View style={{ height: 300 }}>
                <ActivityIndicator />
            </View>
        );
    }

    const customData = [
        { title: "Gastado este mes", value: data.totalCurrentMonth },
        { title: "Gastado el mes pasado", value: data.totalLastMonth },
        { title: "Gastado la semana pasada", value: data.totalLastWeek },
        { title: "Gastado este año", value: data.totalSpentOnYear },
    ];

    return (
        <View>
            <FlatList
                data={customData}
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled
                snapToAlignment="center"
                snapToInterval={width}
                decelerationRate="fast"
                keyExtractor={(_, index) => index.toString()}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: false }
                )}
                renderItem={({ item }) => (
                    <View style={[styles.containerSmall, { width }]}>
                        <View style={{ alignItems: "center" }}>
                            <Text>{item.title}</Text>
                            <View style={{ marginBottom: 4, flexDirection: "row" }}>
                                <Text style={{ fontSize: 40 }}>{currency?.symbol}</Text>
                                <Text style={{ fontSize: 50 }}>
                                    {formatByThousands(formatWithDecimals(item.value)?.amount)}
                                </Text>
                                <Text style={{ fontSize: 40 }}>
                                    .{formatWithDecimals(item.value)?.decimals || "-"}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}
            />

            {/* Pagination Dots */}
            <View style={styles.paginationContainer}>
                {customData.map((_, index) => {
                    const dotOpacity = scrollX.interpolate({
                        inputRange: [
                            (index - 1) * width,
                            index * width,
                            (index + 1) * width,
                        ],
                        outputRange: [0.3, 1, 0.3],
                        extrapolate: "clamp",
                    });

                    return (
                        <Animated.View
                            key={index}
                            style={[styles.dot, { opacity: dotOpacity }]}
                        />
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    containerSmall: {
        height: 250,
        justifyContent: "center",
        alignItems: "center",
    },
    paginationContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 10,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.primary,
        marginHorizontal: 5,
    },
});
