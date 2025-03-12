import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {Stack, useRouter} from "expo-router";
import {Ionicons} from "@expo/vector-icons";
import {Colors} from "@/lib/constants/colors";
import {useEffect, useState} from "react";
import firestore from "@react-native-firebase/firestore";
import {useAuth} from "@/lib/context/AuthContext";
import {FlashList} from "@shopify/flash-list";
import {Image} from "expo-image";
import {format} from "date-fns";
import PressableCard from "@/lib/components/ui/PressableCard";
import {es} from "date-fns/locale";
import {formatCurrency} from "@/lib/helpers/number";
import {useLocales} from "expo-localization";

export default function Screen() {
    const router = useRouter();
    const {user} = useAuth();
    const [spaces, setSpaces] = useState<any[]>([])
    const locales = useLocales()

    useEffect(() => {
        const subscription = firestore()
            .collection('shared-spaces')
            .where('participants', 'array-contains', user._id)
            .onSnapshot(documentSnapshot => {
                setSpaces(documentSnapshot.docs.map(doc => {
                    const data = doc.data();
                    const created = data.created ? data.created.toDate() : null;
                    return {...data, id: doc.id, created}
                }))
            });

        return () => subscription();
    }, []);

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
                        <TouchableOpacity onPress={() => router.back()}>
                            <Ionicons name="add" size={28} color={Colors.primary}/>
                        </TouchableOpacity>
                    )
                }}
            />
            <FlashList
                data={spaces}
                estimatedItemSize={100}
                contentContainerStyle={{ padding: 10 }}
                keyExtractor={(item) => item.id}
                renderItem={({item}) => (
                    <PressableCard onPress={() => router.push(`/auth/shared-spaces/${item.id}?title=${encodeURIComponent(item.title)}`)} shadow extraStyles={styles.space}>
                        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                            <Image source={{uri: item.poster}} style={styles.poster}/>
                            {/*<View style={styles.statusBadge}>*/}
                            {/*    <Text style={styles.statusText}>{item.status}</Text>*/}
                            {/*</View>*/}
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.spaceDate}>{format(item.created, 'dd MMMM yyyy', { locale: es })}</Text>
                            <Text style={styles.spaceTitle}>{item.title}</Text>
                            <Text style={{ marginBottom: 10 }}>{item.description}</Text>
                            {
                                item.totals.map((total: any) => (
                                    <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center', }} key={total.amount.toString()}>
                                        {/*<Text style={{ fontWeight: 'bold'}}>{total.currency.code} {}</Text>*/}
                                        <Text style={{ fontSize: 16 }}>{formatCurrency(total.amount, total.currency.code, locales[0].languageTag)}</Text>
                                    </View>
                                ))
                            }

                            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 }}>
                                {item.participantsDetail.map((participant: any) => (
                                    <View
                                        style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}
                                        key={participant._id}
                                    >
                                        {participant.photoUrl ? (
                                            <Image
                                                source={{ uri: participant.photoUrl }}
                                                style={{ width: 20, height: 20, borderRadius: 10 }}
                                            />
                                        ) : (
                                            <View
                                                style={{
                                                    width: 20,
                                                    height: 20,
                                                    borderRadius: 10,
                                                    backgroundColor: Colors.primary, // You can use a dynamic color if needed
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>
                                                    {participant.name?.charAt(0).toUpperCase()}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                ))}
                            </View>

                        </View>
                    </PressableCard>
                )}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.background,
        flex: 1,
    },
    poster: {
        width: 80,
        height: 80,
        borderRadius: 12
    },
    spaceTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    spaceDate: {
        fontWeight: 'bold',
        color: Colors.dark,
        textAlign: 'right',
    },
    statusBadge: {
        backgroundColor: Colors.backgroundAlt,
        padding: 5,
        borderRadius: 5,
    },
    statusText: {
        color: Colors.dark,
        fontWeight: 'bold',
    },
    space: {
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    }
})
