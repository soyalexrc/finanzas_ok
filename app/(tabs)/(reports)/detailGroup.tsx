import {ScrollView, Text, View} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {useRouter} from "expo-router";

const data = [
    {
        id: "001",
        category: {
            id: 1,
            label: "Groceries",
            icon: "cart"
        },
        isScheduled: true,
        value: "40.00"
    },
    {
        id: "002",
        category: {
            id: 2,
            label: "Groceries",
            icon: "cart"
        },
        isScheduled: false,
        value: "30.00"
    },
];


export default function Screen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    return (
        <ScrollView style={{ paddingTop: insets.top + 50, backgroundColor: 'white', flex: 1 }}>
            {/*<ReportsResumeItems onPress={(id) => router.push('/transactionCreateUpdate') } data={data} />*/}
        </ScrollView>
    )
}
