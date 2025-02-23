
import {Stack, useRouter} from "expo-router";
import {Text, TouchableOpacity} from "react-native";

export default function Layout() {
    const router = useRouter();
    return (
        <Stack>
            <Stack.Screen
                name="account"
                options={{
                    title: 'Cuenta',
                    headerLargeTitle: true,
                    headerShadowVisible: false,
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()}>
                            <Text style={{
                                color: 'red',
                                fontSize: 18,
                            }}>Volver</Text>
                        </TouchableOpacity>
                    ),
                }}
            />
        </Stack>
    )
}
