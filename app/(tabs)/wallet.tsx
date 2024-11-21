import {Image, ScrollView, Text, useTheme, View, XStack, YStack} from "tamagui";
import React, {useEffect, useRef} from "react";
import {Animated, Dimensions, Platform, Pressable, StyleSheet, Touchable, TouchableOpacity} from "react-native";
import CustomHeader from "@/lib/components/ui/CustomHeader";
import * as Haptics from "expo-haptics";
import {getCustomMonth} from "@/lib/helpers/date";
import {Entypo} from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import Carousel from 'react-native-reanimated-carousel';
import {Account} from "@/lib/types/Transaction";
import {formatByThousands} from "@/lib/helpers/string";

const {width, height} = Dimensions.get('window');


export default function Screen() {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const insets = useSafeAreaInsets();
    const theme = useTheme();
    const isIos = Platform.OS === 'ios';


    const cards = [
        {type: 'Credit', source: 'visa', lastFour: '5168', bg: "#0f153b"},
        {type: 'Credit', source: 'mastercard', lastFour: '4289', bg: "#000000"},
        {type: 'Debit', source: 'visa', lastFour: '4878', bg: "#17A2A2"},
        {type: 'Credit', source: 'amex', lastFour: '4878', bg: "#bdbec2"},
        {type: 'Credit', source: 'discover', lastFour: '4878', bg: "#3f9328"},
        {type: '', source: '', lastFour: '', bg: '', isLast: true}
    ]

    const accounts: Account[] = [
        {
            id: 1,
            balance: 2500,
            currency_code: 'PEN',
            icon: '🏧',
            title: 'Cuenta de ahorro en soles',
            currency_symbol: 'S/',
            positive_state: 1
        },
        {
            id: 2,
            balance: 3300.34,
            currency_code: 'USD',
            icon: '💰',
            title: 'Cuenta de ahorro en Dolares',
            currency_symbol: '$',
            positive_state: 1,
        }
    ]

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300, // Adjust the duration as needed
            useNativeDriver: true,
        }).start();

    }, []);
    return (
        <View flex={1} backgroundColor="$color1">
            <Animated.View
                style={{
                    opacity: fadeAnim,
                    flex: 1,
                }}
            >
                <CustomHeader style={{paddingTop: insets.top}}>
                    <TouchableOpacity onPress={async () => {
                        await Haptics.selectionAsync()
                    }} style={{
                        flexDirection: 'row', alignItems: 'center', gap: 5,
                        backgroundColor: theme.color2?.val,
                        padding: 10,
                        borderRadius: 100
                    }}>
                        <Text>List of loans</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={async () => {
                        await Haptics.selectionAsync()
                    }} style={{
                        flexDirection: 'row', alignItems: 'center', gap: 5,
                        backgroundColor: theme.color2?.val,
                        padding: 10,
                        borderRadius: 100
                    }}>
                        <Text>Who owes me?</Text>
                    </TouchableOpacity>
                </CustomHeader>
                <ScrollView showsVerticalScrollIndicator={false} paddingTop={isIos ? insets.top + 50 : 0}>

                    <View style={{flex: 1}}>
                        <Carousel
                            loop={false}
                            width={width}
                            height={(width / 2) + 50}
                            data={cards}
                            mode="parallax"
                            modeConfig={{
                                parallaxScrollingScale: 0.9,
                                parallaxScrollingOffset: 70
                            }}
                            scrollAnimationDuration={500}
                            onSnapToItem={(index) => console.log('current index:', index)}
                            renderItem={({index, item}) => {
                                if (item.isLast) {
                                    return (
                                        <Pressable style={styles.carouselContent}>
                                            <View style={{ borderWidth: 1, borderStyle: 'solid', borderColor: theme.color3?.val, backgroundColor: theme.color2?.val,  width: '90%',
                                                height: height * 0.25,
                                                borderRadius: 20,
                                                padding: 30,
                                                alignSelf: 'center',
                                                justifyContent: 'center',
                                                alignItems: 'center'
                                            }}>
                                                <Text fontSize={20}>Add new</Text>
                                            </View>
                                        </Pressable>
                                    )
                                } else {
                                    return (
                                        <Pressable onPress={() => console.log('here')} style={styles.carouselContent}>
                                            <View style={[styles.creditCard, {backgroundColor: item.bg}]}>
                                                <View style={styles.creditAndVisaView}>
                                                    <Text style={styles.creditText}>{item.type}</Text>
                                                    {item.source === 'visa' &&
                                                        <Image source={require(`@/assets/images/visa.png`)}/>}
                                                    {item.source === 'mastercard' &&
                                                        <Image source={require(`@/assets/images/mastercard.png`)}/>}
                                                    {item.source === 'amex' && <Image width={60} height={30}
                                                                                      source={require(`@/assets/images/amex.png`)}/>}
                                                    {item.source === 'discover' && <Image width={60} height={30}
                                                                                          source={require(`@/assets/images/discover.png`)}/>}
                                                </View>
                                                <View style={styles.cardDetailsView}>
                                                    {/*<Text style={styles.cardDetailsText}>Just Malla</Text>*/}
                                                    <Text style={styles.cardDetailsText}>**** ****
                                                        **** {item.lastFour}</Text>
                                                </View>
                                            </View>
                                        </Pressable>
                                    )
                                }
                            }}
                        />
                    </View>

                    <YStack m={20}>
                        <Text fontSize={18} mb={10}>Accounts</Text>
                        {
                            accounts.map(account => (
                                <TouchableOpacity key={account.id} style={{marginBottom: 10}}>
                                    <XStack gap={15} alignItems="center" backgroundColor="$color2" p={16}
                                            borderRadius={12}>
                                        <Text fontSize={30}>{account.icon}</Text>
                                        <YStack>
                                            <Text fontSize={14}>{account.title}</Text>
                                            <Text
                                                fontSize={20}>{account.currency_symbol} {formatByThousands(String(account.balance))}</Text>
                                        </YStack>
                                    </XStack>
                                </TouchableOpacity>
                            ))
                        }
                    </YStack>
                </ScrollView>

            </Animated.View>
        </View>
    )
}


const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        justifyContent: 'center',
        alignItems: 'center',
    },
    creditCard: {
        width: '90%',
        height: height * 0.25,
        borderRadius: 20,
        padding: 30,
        justifyContent: 'space-between',
        alignSelf: 'center'
    },
    creditAndVisaView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    creditText: {
        color: '#FFFFFF',
        fontSize: 16,
        letterSpacing: 2,
        fontFamily: 'Ubuntu-Regular',
        includeFontPadding: false
    },
    cardDetailsView: {
        flexDirection: 'column'
    },
    cardDetailsText: {
        color: "#FFFFFF",
        fontFamily: "IBMPlexMono-Regular",
        fontSize: 16,
        letterSpacing: 2,
        paddingTop: '2.5%',
        includeFontPadding: false
    },
    carouselContent: {
        width: '100%',
        justifyContent: 'center',
        height: '100%'
    }

});
