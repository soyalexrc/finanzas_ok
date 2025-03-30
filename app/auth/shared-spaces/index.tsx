import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {Stack, useRouter} from "expo-router";
import {Ionicons} from "@expo/vector-icons";
import {Colors} from "@/lib/constants/colors";
import SharedSpacesList from "@/lib/components/shared-spaces/SharedSpacesList";

export default function Screen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: 'Espacios compartidos',
                    headerShadowVisible: false,
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={24} color={Colors.primary}/>
                        </TouchableOpacity>
                    ),
                    headerRight: () => (
                        <TouchableOpacity onPress={() => router.push('/auth/shared-spaces/create')}>
                            <Ionicons name="add" size={28} color={Colors.primary}/>
                        </TouchableOpacity>
                    )
                }}
            />
            <SharedSpacesList />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.background,
        flex: 1,
    }
})
