import {Button, Input, ScrollView, Text, useTheme, View, XStack, YStack} from "tamagui";
import {Platform, TouchableOpacity, useColorScheme} from "react-native";
import {useHeaderHeight} from "@react-navigation/elements";
import {Entypo} from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import React from "react";

export default function Screen() {
    const isIos = Platform.OS === 'ios';
    const headerHeight = useHeaderHeight();
    const schemeColor = useColorScheme();
    const theme = useTheme();

    return (
        <ScrollView flex={1} backgroundColor="$color1" showsVerticalScrollIndicator={false}
                    stickyHeaderIndices={[0]}
                    paddingTop={isIos ? headerHeight + 20 : 20}>
            <YStack px={10}>
                <XStack gap={10}>
                    <TouchableOpacity style={{
                        flexDirection: 'row',
                        gap: 5,
                        paddingVertical: 10,
                        paddingHorizontal: 20,
                        backgroundColor: theme.color2?.val,
                        borderRadius: 100
                    }}>
                        <Text>Expense</Text>
                        <Entypo name="select-arrows" size={18}
                                color={schemeColor === 'light' ? 'black' : 'white'}/>
                    </TouchableOpacity>
                    <TouchableOpacity style={{
                        flexDirection: 'row',
                        gap: 5,
                        paddingVertical: 10,
                        paddingHorizontal: 20,
                        backgroundColor: theme.color2?.val,
                        borderRadius: 100
                    }}>
                        <Text>Date</Text>
                        <Entypo name="select-arrows" size={18}
                                color={schemeColor === 'light' ? 'black' : 'white'}/>
                    </TouchableOpacity>
                </XStack>
               <View position="relative">
                   <Feather style={{ position: 'absolute', top: '35%', left: 15, zIndex: 99 }} name="search" size={24} color={schemeColor === 'light' ? 'black' : 'white'}/>
                   <Input flex={1} placeholder={`Search`} my={20} style={{ paddingLeft: 50 }} />
               </View>
            </YStack>
        </ScrollView>
    )
}
