import React, {useEffect} from 'react';
import {Button, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Animated, {useAnimatedStyle, useSharedValue, withTiming} from "react-native-reanimated";
import {Ionicons} from "@expo/vector-icons";
import {Colors} from "@/lib/constants/colors";
import * as Haptics from 'expo-haptics';
import {format} from "date-fns";
import {Image} from 'expo-image';

const blurhash =
    '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';


type Props = {
    visible: boolean;
    onClose: () => void;
    transaction: any;
    onEdit: () => void;
}

export default function TransactionResumeModal({visible, onClose, transaction, onEdit}: Props) {
    const translateY = useSharedValue(500);
    const backgroundOpacity = useSharedValue(0);

    function startAnimation() {
        translateY.value = withTiming(0, {duration: 200});
        backgroundOpacity.value = withTiming(0.5, {duration: 200});
    }

    function endAnimation() {
        translateY.value = withTiming(500, {duration: 200});
        backgroundOpacity.value = withTiming(0, {duration: 200});
    }

    useEffect(() => {
        if (visible) {
            startAnimation()
        }
    }, [visible]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{translateY: translateY.value}],
        };
    });

    const animatedBackgroundStyle = useAnimatedStyle(() => {
        return {
            backgroundColor: `rgba(0, 0, 0, ${backgroundOpacity.value})`,
        };
    });

    async function manageClose() {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        endAnimation();
        setTimeout(() => {
            onClose();
        }, 200);
    }


    async function manageEdit() {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        endAnimation();
        setTimeout(() => {
            onClose();
            onEdit();
        }, 200);
    }

    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="none"
            onRequestClose={manageClose}
        >
            <Animated.View style={[styles.modalBackground, animatedBackgroundStyle]}>
                <Animated.View style={[styles.modalContent, animatedStyle]}>
                    <View style={{justifyContent: 'space-between', flexDirection: 'row', gap: 20}}>
                        <TouchableOpacity onPress={manageEdit} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <Ionicons name="pencil" size={20} color="blue"/>
                            <Text>Editar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={manageClose}>
                            <Ionicons name="close-circle" size={35} color={Colors.primary}/>
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false}>
                        <View
                            style={{
                                width: 60,
                                height: 60,
                                borderRadius: 100,
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: '#f0f0f0',
                                marginBottom: 10
                            }}
                        >
                            <Text style={{fontSize: 40}}>{transaction?.category?.icon}</Text>
                        </View>
                        <Text style={styles.title}>{transaction?.title}</Text>
                        <Text style={styles.description}>{transaction?.description}</Text>

                        <View style={{ height: 30 }} />

                        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                            <Text style={styles.cellTitle}>Categoria</Text>
                            <View style={styles.categoryWrapper}>
                                <Text>{transaction?.category?.icon}</Text>
                                <Text>{transaction?.category?.title}</Text>
                            </View>
                        </View>

                        <View style={{flexDirection: 'row', marginBottom: 10, marginTop: 5, justifyContent: 'space-between', alignItems: 'center'}}>
                            <Text style={styles.cellTitle}>Monto</Text>
                            <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
                                <Text style={styles.amount}>{transaction?.currency?.symbol} {transaction.amount}</Text>
                                <Text style={styles.currencyCode}>({transaction?.currency?.code})</Text>
                            </View>

                        </View>

                        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                            <Text style={styles.cellTitle}>Fecha</Text>
                            {
                                transaction.date &&
                                <Text style={styles.date}>{format(transaction.date, 'PPP')}</Text>
                            }
                        </View>

                        <Text style={styles.subtitle}>Imagenes</Text>
                        <View style={styles.imagesContainer}>
                            {transaction.images?.map((image: string, index: number) => (
                                <Image
                                    key={index}
                                    source={image}
                                    style={styles.image}
                                    placeholder={{ blurhash }}
                                    transition={400}
                                />
                            ))}
                        </View>

                        <Text style={styles.subtitle}>Documentos</Text>
                        <View style={styles.documentsContainer}>
                            {transaction.documents?.map((document: string, index: number) => (
                                <Text key={index} style={styles.document}>{document.title}</Text>
                            ))}
                        </View>

                        <View style={{ height: 50 }} />
                    </ScrollView>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'flex-end', // Align the modal at the bottom
        alignItems: 'center',
    },
    modalContent: {
        width: '100%',
        padding: 20,
        height: 500,
        backgroundColor: 'white',
        borderRadius: 10,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
    },
    description: {
        fontSize: 16,
        color: 'gray',
        marginTop: 10,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        textAlign: 'center'
    },
    amount: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 10,
    },
    date: {
        fontSize: 14,
        color: 'gray',
        marginTop: 10,
    },
    currencyCode: {
        fontSize: 14,
        color: 'gray',
        marginTop: 10,
    },
    imagesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 10,
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 10,
        marginRight: 10,
        marginBottom: 10,
    },
    documentsContainer: {
        marginTop: 10,
    },
    document: {
        fontSize: 14,
        color: 'blue',
        textDecorationLine: 'underline',
        marginBottom: 5,
    },
    cellTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    categoryWrapper: {
        flexDirection: "row",
        padding: 10,
        backgroundColor: '#f6f6f6',
        alignItems: 'center',
        borderRadius: 6,
        gap: 5,
    }
});
