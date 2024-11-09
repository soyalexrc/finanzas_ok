import React, {useEffect, useRef, useState} from "react";
import {Animated, Platform, Pressable, StyleSheet, TouchableOpacity, useColorScheme} from "react-native";
import {View, ScrollView, Text, useTheme} from 'tamagui';
import {Entypo} from "@expo/vector-icons";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {useAppSelector} from "@/lib/store/hooks";
import CustomHeader from "@/lib/components/ui/CustomHeader";
import ResumeDropDown from "@/lib/components/home/ResumeDropDown";
import HomeResumeItems from "@/lib/components/home/HomeResumeItems";
import AccountSelectDropdown from "@/lib/components/ui/AccountSelectDropdown";
import {selectSelectedAccountGlobal} from "@/lib/store/features/accounts/accountsSlice";
import AccountSelectSheet from "@/lib/components/ui/android-dropdowns-sheets/AccountSelectSheet";
import {formatAccountTitle} from "@/lib/helpers/string";
import {useTranslation} from "react-i18next";
import ResumeSheet from "@/lib/components/ui/android-dropdowns-sheets/ResumeSheet";
import TransactionSelectionOptionsSheet
    from "@/lib/components/ui/android-dropdowns-sheets/TransactionSelectionOptionsSheet";
import {FullTransaction} from "@/lib/types/Transaction";
import * as Haptics from "expo-haptics";
import Feather from "@expo/vector-icons/Feather";
import {useRouter} from "expo-router";
import {formatDate, getCustomMonth} from "@/lib/helpers/date";
import {format} from "date-fns";
import {enUS, es} from "date-fns/locale";
import {selectSettings} from "@/lib/store/features/settings/settingsSlice";


export default function HomeScreen() {
    const router = useRouter();
    const isIos = Platform.OS === 'ios';
    const insets = useSafeAreaInsets();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [accountsSheetOpen, setAccountsSheetOpen] = useState<boolean>(false);
    const [resumeSheetOpen, setResumeSheetOpen] = useState<boolean>(false);
    const [transactionSelectionOpen, setTransactionSelectionOpen] = useState<boolean>(false);
    const [selectedGroupId, setSelectedGroupId] = useState<number>(0);
    const [selectedTransaction, setSelectedTransaction] = useState<FullTransaction>();
    const { selectedLanguage } = useAppSelector(selectSettings);
    const theme = useTheme();
    const scheme = useColorScheme();

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300, // Adjust the duration as needed
            useNativeDriver: true,
        }).start();

    }, []);

    async function onSelectTransaction(t: FullTransaction, groupId: number) {
        setTransactionSelectionOpen(true);
        setSelectedTransaction(t)
        setSelectedGroupId(groupId)
    }

    async function handleTouchResume() {
        await Haptics.selectionAsync();
        setResumeSheetOpen(true)
    }


    async function handleTouchAccountsSelector() {
        await Haptics.selectionAsync();
        setAccountsSheetOpen(true)
    }

    return (
        <View flex={1} backgroundColor="$color1">
            <Animated.View
                style={{
                    opacity: fadeAnim,
                    flex: 1,
                }}
            >

                <CustomHeader style={{paddingTop: insets.top}}>
                    {/*{isIos && <AccountSelectDropdown/>}*/}
                    {/*{*/}
                    {/*    !isIos &&*/}
                    {/*    <TouchableOpacity onPress={handleTouchAccountsSelector}*/}
                    {/*                      style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>*/}
                    {/*        <Text*/}
                    {/*            fontSize={16}>{formatAccountTitle(selectedAccount, true, t('COMMON.ALL_ACCOUNTS'))}</Text>*/}
                    {/*        <Entypo name="select-arrows" size={18} color={scheme === 'light' ? 'black' : 'white'}/>*/}
                    {/*    </TouchableOpacity>*/}
                    {/*}*/}
                    <TouchableOpacity
                        onPress={() => {
                            const {start, end} = getCustomMonth(2);
                            console.log({ start, end })
                        }}
                          style={{
                              flexDirection: 'row', alignItems: 'center', gap: 5,
                              backgroundColor: theme.color2?.val,
                              padding: 10,
                              borderRadius: 100
                          }}>
                        <Text
                            fontSize={16}>
                            {format(formatDate(new Date()), 'MMMM', {locale: selectedLanguage === 'es' ? es : enUS})}
                        </Text>
                        <Entypo name="select-arrows" size={18} color={scheme === 'light' ? 'black' : 'white'}/>
                    </TouchableOpacity>
                    <TouchableOpacity
                        // onPress={() => router.push('/search')}
                        style={{
                            flexDirection: 'row', alignItems: 'center', gap: 5,
                            backgroundColor: theme.color2?.val,
                            padding: 10,
                            borderRadius: 100
                        }}>
                        <Feather name="search" size={24} color={scheme === 'light' ? 'black' : 'white'}/>
                    </TouchableOpacity>
                </CustomHeader>
                <ScrollView showsVerticalScrollIndicator={false} paddingTop={isIos ? insets.top + 50 : 0}>
                    <ResumeDropDown fn={handleTouchResume}/>
                    {/*<Button onPress={() => signOut()}>Sign out</Button>*/}
                    {/*    Lista de items por semana, mes y cada dia como separator con el total*/}
                    <HomeResumeItems fn={(t, groupId) => onSelectTransaction(t, groupId)}/>
                    <View style={{height: 200}}/>
                </ScrollView>
                {!isIos && <AccountSelectSheet setOpen={setAccountsSheetOpen} open={accountsSheetOpen}/>}
                {!isIos && <ResumeSheet open={resumeSheetOpen} setOpen={setResumeSheetOpen}/>}
                {!isIos && <TransactionSelectionOptionsSheet open={transactionSelectionOpen}
                                                             setOpen={setTransactionSelectionOpen}
                                                             item={selectedTransaction} itemGroupId={selectedGroupId}
                                                             resetData={() => {
                                                                 setSelectedGroupId(0);
                                                                 setSelectedTransaction(undefined)
                                                             }}/>}
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    createButton: {
        borderRadius: 100,
        padding: 3
    }
})

