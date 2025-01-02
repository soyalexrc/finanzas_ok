import {StyleSheet, Text, View} from "react-native";
import {formatByThousands} from "@/lib/helpers/string";

type Props = {
    totals: any[],
    title: string;
}

export default function TransactionRowHeader({ totals, title }: Props) {
    return (
        <View style={styles.header}>
                <Text style={styles.headerText}>{title}</Text>
            <View style={{ flexDirection: 'row', gap: 15 }}>
                {
                    totals?.map((total: any, index: number) => (
                        <Text style={styles.headerText} key={index + total + title}>{total.symbol} {formatByThousands(String(total.total))}</Text>
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
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'lightgray',
    },
});
