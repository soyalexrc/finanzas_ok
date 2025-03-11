import { Stack } from "expo-router";
import {TouchableOpacity, View} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {Colors} from "@/lib/constants/colors";

export default function Layout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{
                headerShadowVisible: false,
                title: '',
                headerRight: () => (
                    <View style={{ flexDirection: 'row', gap: 20 }}>
                        <TouchableOpacity>
                            <Ionicons name="filter" size={24} color={Colors.dark}/>
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <Ionicons name="settings" size={24} color={Colors.dark}/>
                        </TouchableOpacity>
                    </View>
                )
            }} />
        </Stack>
    );
}
