import {FlatList, StyleSheet, Text, View} from "react-native";
import {useMonthlyTotalsByCategory} from "@/lib/utils/api/transactions";
import {useEffect} from "react";
import PressableCard from "@/lib/components/ui/PressableCard";
import {CurrencyV2} from "@/lib/store/features/transactions/currencies.slice";

type Props = {
    data: any[]
    loading: boolean;
    error: any;
    currency: CurrencyV2
}

export default function TotalsByMonthPerCategoryList({data, loading, error, currency}: Props) {
    return (
        <View style={styles.container}>
            <FlatList
                showsHorizontalScrollIndicator={false}
                data={data}
                horizontal
                ItemSeparatorComponent={() => <View style={{width: 16}}/>}
                keyExtractor={(item, index) => (item.value + index).toString()}
                renderItem={({ item }) => (
                    <PressableCard onPress={() => {}} shadow={true} extraStyles={styles.card}>
                        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                            <View style={styles.iconWrapper}>
                                <Text style={styles.icon}>{item.category.icon}</Text>
                            </View>
                            <Text style={styles.title}>{item.category.title}</Text>
                        </View>
                        <Text style={styles.price}>{currency.symbol} {item.value}</Text>
                    </PressableCard>
                )}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        margin: 8
    },
    card: {
        padding: 12,
        justifyContent: 'center',
        marginVertical: 16,
        width: 250,
        minHeight: 100,
        gap: 6,
    },
    icon: {
        fontSize: 18,
    },
    title: {
        fontSize: 16,
        flex: 1,
        flexWrap: 'wrap',
    },
    price: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    iconWrapper: {
        width: 30,
        height: 30,
        backgroundColor: '#f0f0f0',
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center'
    }
})
