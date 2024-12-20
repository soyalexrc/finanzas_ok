import {
    Keyboard,
    Pressable,
    StyleSheet, Text, TextInput, TouchableOpacity,
    View
} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {useEffect} from "react";
import {useNavigation, useRouter} from "expo-router";
import {Colors} from "@/lib/constants/colors";

export default function Screen() {
    const {top} = useSafeAreaInsets();
    const navigation = useNavigation();
    const router = useRouter();

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.saveButton}>Guardar</Text>
                </TouchableOpacity>
            )
        })
    }, []);

    return (
        <Pressable onPress={() => Keyboard.dismiss()} style={[styles.container, {paddingTop: top}]}>
            <View>
                <Text>Titulo</Text>
                <TextInput style={styles.input} />
            </View>

            <View>
                <Text>Descripcion</Text>
                <TextInput multiline style={[styles.input, { height: 100 }]} />
            </View>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#fff'
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        margin: 10,
        backgroundColor: '#f0f0f0',
    },
    saveButton: {
        color: Colors.primary,
        fontWeight: 'bold',
        fontSize: 18,
    }
})
