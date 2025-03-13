import React, {Fragment, useEffect} from 'react';
import {
    Button,
    Modal, Platform, SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import Animated, {useAnimatedStyle, useSharedValue, withTiming} from "react-native-reanimated";
import {Ionicons} from "@expo/vector-icons";
import {Colors} from "@/lib/constants/colors";
import * as Haptics from 'expo-haptics';
import {format} from "date-fns";
import {Image} from 'expo-image';
import {useAppDispatch} from "@/lib/store/hooks";
import {PayloadAction} from "@reduxjs/toolkit";
import {
    addDocumentToCurrentTransaction, addImageToCurrentTransaction,
    onChangeAmount,
    onChangeCategory,
    onChangeDate, onChangeId,
    onChangesTitleAndDescription
} from "@/lib/store/features/transactions/transactions.slice";
import {es} from "date-fns/locale";

const blurhash =
    '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';


type Props = {
    visible: boolean;
    onClose: () => void;
    transaction: any;
    onEdit: () => void;
    onRemove: (t: any) => void;
    allowEdit?: boolean
}

export default function TransactionResumeModal({visible, onClose, transaction, onEdit, onRemove, allowEdit = true}: Props) {
    const heightValue = (transaction.images?.length > 0 && transaction.documents?.length > 0) ? 600 :
        (transaction.images?.length > 0 || transaction.documents?.length > 0) ? 550 : 450;
    // const heightValue = 600;
    console.log('transaction', transaction);
    const isIos = Platform.OS === 'ios';
    const translateY = useSharedValue(heightValue);
    const backgroundOpacity = useSharedValue(0);
    const dispatch = useAppDispatch();

    function startAnimation() {
        translateY.value = withTiming(0, {duration: 200});
        backgroundOpacity.value = withTiming(0.5, {duration: 200});
    }

    function endAnimation() {
        translateY.value = withTiming(heightValue, {duration: 200});
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
        dispatch(onChangeDate(new Date(transaction.date).toISOString()));
        dispatch(onChangeAmount(String(transaction.amount)));
        dispatch(onChangeId(transaction._id));
        dispatch(onChangeCategory(transaction.category));
        dispatch(onChangesTitleAndDescription({title: transaction.title, description: transaction.description}));

        if (transaction.documents.length > 0) {
            transaction.documents.forEach((document: any) => {
                dispatch(addDocumentToCurrentTransaction(document));
            });
        }

        if (transaction.images.length > 0) {
            transaction.images?.forEach((image: any) => {
                dispatch(addImageToCurrentTransaction(image));
            });
        }





        endAnimation();
        setTimeout(() => {
            onClose();
            onEdit();
        }, 200);
    }

    async function manageDelete(t: any) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        endAnimation();
        setTimeout(() => {
            onClose();
            onRemove(t);
        }, 200);
    }

    if (isIos) {
        return (
            <Modal
                transparent={true}
                visible={visible}
                animationType="none"
                onRequestClose={manageClose}
            >
                <Animated.View style={[styles.modalBackground, animatedBackgroundStyle]}>
                    <Animated.View style={[styles.modalContent, { height: heightValue }, animatedStyle]}>
                        <View style={{alignItems: 'flex-end'}}>
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
                            <Text style={styles.title}>{transaction?.title || 'Gasto sin titulo'}</Text>
                            <Text style={styles.description}>{transaction?.description || 'Gasto sin descripcion'}</Text>

                            <View style={{height: 30}}/>

                            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                                <Text style={styles.cellTitle}>Categoria</Text>
                                <View style={styles.categoryWrapper}>
                                    <Text>{transaction?.category?.icon}</Text>
                                    <Text>{transaction?.category?.title}</Text>
                                </View>
                            </View>

                            <View style={{
                                flexDirection: 'row',
                                marginBottom: 10,
                                marginTop: 5,
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <Text style={styles.cellTitle}>Monto</Text>
                                <View style={{flexDirection: 'row', gap: 4, alignItems: 'center'}}>
                                    <Text style={styles.amount}>{transaction?.currency?.symbol} {transaction.amount}</Text>
                                    <Text style={styles.currencyCode}>({transaction?.currency?.code})</Text>
                                </View>

                            </View>

                            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                                <Text style={styles.cellTitle}>Fecha</Text>
                                {
                                    transaction.date &&
                                    <Text style={styles.date}>{format(transaction.date, 'PPP', { locale: es })}</Text>
                                }
                            </View>

                            {
                                transaction.images?.length > 0 &&
                                <Fragment>
                                    <Text style={styles.subtitle}>Imagenes</Text>
                                    <ScrollView horizontal style={styles.imagesContainer}>
                                        {transaction.images.map((image: string, index: number) => (
                                            <Image
                                                key={index}
                                                style={styles.image}
                                                source={{uri: image}}
                                                placeholder={{ blurhash }}
                                                transition={400}
                                            />
                                        ))}
                                    </ScrollView>
                                </Fragment>
                            }

                            {
                                transaction.documents?.length > 0 &&
                                <Fragment>
                                    <Text style={styles.subtitle}>Documentos</Text>
                                    <View style={styles.documentsContainer}>
                                        {transaction.documents.map((document: any, index: number) => (
                                            <TouchableOpacity key={index}>
                                                <Text  style={styles.document}>{document.title}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </Fragment>
                            }

                            <View style={{height: 70}}/>
                        </ScrollView>
                        {
                            allowEdit &&
                            <View style={styles.floatingButtonsContainer}>
                                <TouchableOpacity style={styles.floatingButton} onPress={manageEdit}>
                                    <Ionicons name="pencil" size={24} color="white"/>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.floatingButton} onPress={() => manageDelete(transaction)}>
                                    <Ionicons name="trash" size={24} color="white"/>
                                </TouchableOpacity>
                            </View>
                        }
                    </Animated.View>
                </Animated.View>
            </Modal>
        )
    }

    return (
       <SafeAreaView>
           <Modal
               transparent={true}
               visible={visible}
               animationType="none"
               onRequestClose={manageClose}
           >
               <Animated.View style={[styles.modalBackground, animatedBackgroundStyle]}>
                   <Animated.View style={[styles.modalContent, { height: heightValue }, animatedStyle]}>
                       <View style={{alignItems: 'flex-end'}}>
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
                           <Text style={styles.title}>{transaction?.title || 'Gasto sin titulo'}</Text>
                           <Text style={styles.description}>{transaction?.description || 'Gasto sin descripcion'}</Text>

                           <View style={{height: 30}}/>

                           <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                               <Text style={styles.cellTitle}>Categoria</Text>
                               <View style={styles.categoryWrapper}>
                                   <Text>{transaction?.category?.icon}</Text>
                                   <Text>{transaction?.category?.title}</Text>
                               </View>
                           </View>

                           <View style={{
                               flexDirection: 'row',
                               marginBottom: 10,
                               marginTop: 5,
                               justifyContent: 'space-between',
                               alignItems: 'center'
                           }}>
                               <Text style={styles.cellTitle}>Monto</Text>
                               <View style={{flexDirection: 'row', gap: 4, alignItems: 'center'}}>
                                   <Text style={styles.amount}>{transaction?.currency?.symbol} {transaction.amount}</Text>
                                   <Text style={styles.currencyCode}>({transaction?.currency?.code})</Text>
                               </View>

                           </View>

                           <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                               <Text style={styles.cellTitle}>Fecha</Text>
                               {
                                   transaction.date &&
                                   <Text style={styles.date}>{format(transaction.date, 'PPP', { locale: es })}</Text>
                               }
                           </View>

                           {
                               transaction.images?.length > 0 &&
                               <Fragment>
                                   <Text style={styles.subtitle}>Imagenes</Text>
                                   <ScrollView horizontal style={styles.imagesContainer}>
                                       {transaction.images.map((image: string, index: number) => (
                                           <Image
                                               key={index}
                                               style={styles.image}
                                               source={{uri: image}}
                                               placeholder={{ blurhash }}
                                               transition={400}
                                           />
                                       ))}
                                   </ScrollView>
                               </Fragment>
                           }

                           {
                               transaction.documents?.length > 0 &&
                               <Fragment>
                                   <Text style={styles.subtitle}>Documentos</Text>
                                   <View style={styles.documentsContainer}>
                                       {transaction.documents.map((document: any, index: number) => (
                                           <TouchableOpacity key={index}>
                                               <Text  style={styles.document}>{document.title}</Text>
                                           </TouchableOpacity>
                                       ))}
                                   </View>
                               </Fragment>
                           }

                           <View style={{height: 70}}/>
                       </ScrollView>
                       <View style={styles.floatingButtonsContainer}>
                           <TouchableOpacity style={styles.floatingButton} onPress={manageEdit}>
                               <Ionicons name="pencil" size={24} color="white"/>
                           </TouchableOpacity>
                           <TouchableOpacity style={styles.floatingButton} onPress={() => manageDelete(transaction)}>
                               <Ionicons name="trash" size={24} color="white"/>
                           </TouchableOpacity>
                       </View>
                   </Animated.View>
               </Animated.View>
           </Modal>
       </SafeAreaView>
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
    },
    floatingButtonsContainer: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        flexDirection: 'row',
        gap: 10,
    },
    floatingButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
});
