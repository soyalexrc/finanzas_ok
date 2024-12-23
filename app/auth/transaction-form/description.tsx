import {
    Keyboard,
    Pressable,
    StyleSheet, Text, TextInput, TouchableOpacity,
    View
} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {useEffect, useState} from "react";
import {Stack, useNavigation, useRouter} from "expo-router";
import {Colors} from "@/lib/constants/colors";
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import {
    onChangeCategory,
    onChangesTitleAndDescription,
    selectCurrentTransaction
} from "@/lib/store/features/transactions/transactions.slice";

export default function Screen() {
    const {top} = useSafeAreaInsets();
    const router = useRouter();
    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const currentTransaction = useAppSelector(selectCurrentTransaction)
    const dispatch = useAppDispatch();

    console.log(currentTransaction)

    useEffect(() => {
        if (currentTransaction?.title) {
            setTitle(currentTransaction.title);
        }
        if (currentTransaction?.description) {
            setDescription(currentTransaction.description);
        }
    }, [currentTransaction.title, currentTransaction.description]);

    function onSave() {
        dispatch(onChangesTitleAndDescription({title, description}));
        router.back();
    }

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: 'Descripcion',
                    headerBackTitle: 'Atras',
                    headerRight: () => (
                        <TouchableOpacity onPress={onSave}>
                            <Text style={styles.saveButton}>Guardar</Text>
                        </TouchableOpacity>
                    )
                }}
            />
            <Pressable onPress={() => Keyboard.dismiss()} style={[styles.container, {paddingTop: top}]}>
                <View>
                    <Text>Titulo</Text>
                    <TextInput style={styles.input} value={title} onChangeText={setTitle} />
                </View>

                <View>
                    <Text>Descripcion</Text>
                    <TextInput multiline style={[styles.input, { height: 100 }]} value={description} onChangeText={setDescription} />
                </View>
            </Pressable>
        </View>
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
