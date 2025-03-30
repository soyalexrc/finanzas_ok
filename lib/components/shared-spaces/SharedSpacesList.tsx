import {FlatList, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View} from "react-native";
import {FlashList} from "@shopify/flash-list";
import PressableCard from "@/lib/components/ui/PressableCard";
import {Image} from "expo-image";
import {format} from "date-fns";
import {es} from "date-fns/locale";
import {formatCurrency} from "@/lib/helpers/number";
import {Colors} from "@/lib/constants/colors";
import {useRouter} from "expo-router";
import {useAuth} from "@/lib/context/AuthContext";
import {Fragment, useEffect, useState} from "react";
import {useLocales} from "expo-localization";
import firestore from "@react-native-firebase/firestore";
import {textShortener} from "@/lib/helpers/string";

type Props = {
    horizontal?: boolean;
}

export default function SharedSpacesList({horizontal = false}: Props) {
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


    if (horizontal) {
        return (
            <Fragment>
                {
                    spaces.length > 0 &&
                    <View style={{ marginHorizontal: 14, marginBottom: 20, marginTop: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 20, fontWeight: 'bold', }}>Espacios compartidos</Text>
                        <TouchableOpacity onPress={() => router.push('/auth/shared-spaces')}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: Colors.primary}}>Ver mas</Text>
                        </TouchableOpacity>
                    </View>
                }
                <View style={{ height: 300 }}>
                    <FlatList
                        data={spaces}
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        ItemSeparatorComponent={() => <View style={{width: 16}}/>}
                        // estimatedItemSize={100}
                        contentContainerStyle={{padding: 10}}
                        keyExtractor={(item) => item.id}
                        renderItem={({item}) => (
                            <ItemCard
                                item={item}
                                goToDetail={() => router.push(`/auth/shared-spaces/${item.id}?title=${encodeURIComponent(item.title)}`)}
                                languageTag={locales[0].languageTag}
                                horizontal={true}
                            />
                        )}
                    />
                </View>
            </Fragment>
        )
    }

    if (spaces.length === 0) {
        return (
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <Text style={{fontSize: 18, fontWeight: 'bold', color: Colors.dark}}>No tienes espacios compartidos</Text>
                <TouchableOpacity style={{ backgroundColor: Colors.primary, padding: 8, borderRadius: 6, marginTop: 10 }} onPress={() => router.push('/auth/shared-spaces/create')}>
                    <Text style={{fontSize: 16, fontWeight: 'bold', color: '#fff'}}>Crear uno</Text>
                </TouchableOpacity>
            </View>
        )
    }


    return (
        <FlashList
            data={spaces}
            estimatedItemSize={100}
            contentContainerStyle={{padding: 10}}
            keyExtractor={(item) => item.id}
            renderItem={({item}) => (
                <ItemCard
                    item={item}
                    goToDetail={() => router.push(`/auth/shared-spaces/${item.id}?title=${encodeURIComponent(item.title)}`)}
                    languageTag={locales[0].languageTag}
                />
            )}
        />
    )
}

type ItemCardProps = {
    item: any,
    goToDetail: () => void,
    languageTag: string,
    horizontal?: boolean
}

const ItemCard = ({item, goToDetail, languageTag, horizontal = false}: ItemCardProps) => {
    const { width } = useWindowDimensions();

    return (
        <PressableCard
            onPress={goToDetail}
            shadow extraStyles={[styles.space, { width: horizontal ? width * 0.8 : width - 20, height: 185 }]}>
            <View style={{alignItems: 'center', justifyContent: 'center'}}>
                <Image source={{uri: item.poster}} style={styles.poster}/>
                {/*<View style={styles.statusBadge}>*/}
                {/*    <Text style={styles.statusText}>{item.status}</Text>*/}
                {/*</View>*/}
            </View>
            <View style={{flex: 1}}>
                <Text style={styles.spaceDate}>{format(item.created, 'dd MMMM yyyy', {locale: es})}</Text>
                <Text style={styles.spaceTitle}>{item.title}</Text>
                <Text style={{marginBottom: 10}}>{textShortener(item.description, 100)}</Text>
                {
                    item.totals?.map((total: any) => (
                        <View style={{flexDirection: 'row', gap: 4, alignItems: 'center',}}
                              key={total.amount.toString()}>
                            {/*<Text style={{ fontWeight: 'bold'}}>{total.currency.code} {}</Text>*/}
                            <Text
                                style={{fontSize: 16}}>{formatCurrency(total.amount, total.currency.code, languageTag)}</Text>
                        </View>
                    ))
                }

                <View style={{flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10}}>
                    {item.participantsDetail?.map((participant: any) => (
                        <View
                            style={{flexDirection: 'row', gap: 4, alignItems: 'center'}}
                            key={participant._id}
                        >
                            {participant.photoUrl ? (
                                <Image
                                    source={{uri: participant.photoUrl}}
                                    style={{width: 20, height: 20, borderRadius: 10}}
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
                                    <Text style={{color: '#fff', fontSize: 12, fontWeight: 'bold'}}>
                                        {participant.name?.charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                            )}
                        </View>
                    ))}
                </View>

            </View>
        </PressableCard>
    )
}

const styles = StyleSheet.create({
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
        marginBottom: 15,
    }
})
