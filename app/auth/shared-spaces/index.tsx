import {Text, TouchableOpacity, View} from "react-native";
import {Stack, useRouter} from "expo-router";

export default function Screen() {
    const router = useRouter();
    return (
        <View>
            <Stack.Screen
                options={{
                    title: 'Espacios compartidos',
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()}>
                            <Text>Atras</Text>
                        </TouchableOpacity>
                    )
                }}
            />
            <Text>Lista</Text>
        </View>
    )
}
