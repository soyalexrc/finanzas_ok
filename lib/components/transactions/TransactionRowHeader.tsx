import {StyleSheet, Text, View} from "react-native";
import {formatByThousands} from "@/lib/helpers/string";

export default function TransactionRowHeader({ section }: any) {
    return (
        <View style={styles.header}>
                <Text style={styles.headerText}>{section.title}</Text>
            <View style={{ flexDirection: 'row', gap: 15 }}>
                {
                    section.totals.map((total: any, index: number) => (
                        <Text style={styles.headerText} key={index}>{total.symbol} {formatByThousands(String(total.total))}</Text>
                    ))
                }
            </View>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    headerText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        padding: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'lightgray',
    },
});
