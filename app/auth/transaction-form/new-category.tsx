import {Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import {Stack, useRouter} from "expo-router";
import {Colors} from "@/lib/constants/colors";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {useState} from "react";
import {Entypo, Ionicons} from "@expo/vector-icons";
import EmojiPicker, {type EmojiType, es, useRecentPicksPersistence} from 'rn-emoji-keyboard'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {STORAGE} from "@/lib/constants/storage";
import * as Haptics from 'expo-haptics';
import {toast} from 'sonner-native';
import firestore from '@react-native-firebase/firestore';
import auth from "@react-native-firebase/auth";

export default function Screen() {
    const {top} = useSafeAreaInsets();
    const router = useRouter();
    const [emojiKeyboardOpen, setEmojiKeyboardOpen] = useState<boolean>(false)

    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [selectedEmoji, setSelectedEmoji] = useState<string>('🎁')
    const [type, setType] = useState<string>('Gasto')

    useRecentPicksPersistence({
        initialization: () => AsyncStorage.getItem(STORAGE.EMOJI_PERSISTANCE).then((item) => JSON.parse(item || '[]')),
        onStateChange: (next) => AsyncStorage.setItem(STORAGE.EMOJI_PERSISTANCE, JSON.stringify(next)),
    })

    const handlePick = async (emojiObject: EmojiType) => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        setSelectedEmoji(emojiObject.emoji)
    }

    async function onSave() {

        if (!title) {
            toast.error('Titulo es requerido', {
                className: 'bg-red-500',
                description: 'Por favor completa el campo de titulo',
                duration: 6000,
                icon: <Ionicons name="close-circle" size={24} color="red"/>,
            });
            return;
        }

        if (!description) {
            toast.error('Descripcion es requerida', {
                className: 'bg-red-500',
                description: 'Por favor completa el campo de descripcion',
                duration: 6000,
                icon: <Ionicons name="close-circle" size={24} color="red"/>,
            });
            return;
        }

        await firestore()
            .collection('categories')
            .add({
                title,
                description,
                type: type === 'Gasto' ? 'expense' : 'income',
                icon: selectedEmoji,
                userId: firestore().doc(`users/${auth().currentUser?.uid}`),
            })

        toast.success('Se guardo la categoria con exito!', {
            className: 'bg-green-500',
            duration: 6000,
            icon: <Ionicons name="checkmark-circle" size={24} color="green"/>,
        });

        router.back();
    }

    return (
        <ScrollView style={styles.container}>
            <Stack.Screen
                options={{
                    title: 'Nueva Categoria',
                    headerBackTitle: 'Atras',
                    headerRight: () => (
                        <TouchableOpacity onPress={onSave}>
                            <Text style={styles.doneButton}>Guardar</Text>
                        </TouchableOpacity>
                    ),
                }}
            />

            <View style={{alignItems: 'center', marginVertical: 20}}>
                <TouchableOpacity
                    onPress={async () => {
                        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                        setEmojiKeyboardOpen(true)
                    }}
                    style={{
                        width: 100,
                        height: 100,
                        borderRadius: 100,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: '#f0f0f0',
                    }}
                >
                    <Text style={{fontSize: 50}}>{selectedEmoji}</Text>
                </TouchableOpacity>
            </View>

            <Pressable onPress={() => Keyboard.dismiss()} style={[styles.container]}>
                <View>
                    <Text>Titulo</Text>
                    <TextInput style={styles.input} value={title} onChangeText={setTitle}/>
                </View>

                <View>
                    <Text>Descripcion</Text>
                    <TextInput multiline style={[styles.input, {height: 100}]} value={description}
                               onChangeText={setDescription}/>
                </View>

                <View>
                    <Text>Tipo</Text>
                    <TouchableOpacity
                        onPress={async () => {
                            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                            setType(type === 'Gasto' ? 'Ingreso' : 'Gasto')
                        }}
                        style={[styles.input, {flexDirection: 'row', justifyContent: 'space-between'}]}
                    >
                        <Text>{type}</Text>
                        <Entypo name="select-arrows" size={20} color={Colors.primary}/>
                    </TouchableOpacity>
                </View>
            </Pressable>

            <EmojiPicker
                onEmojiSelected={handlePick}
                open={emojiKeyboardOpen}
                onClose={() => setEmojiKeyboardOpen(false)}
                translation={es}
                enableSearchBar
                enableRecentlyUsed
            />

        </ScrollView>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#fff'
    },
    doneButton: {
        color: Colors.primary,
        fontWeight: 'bold',
        fontSize: 18,
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

