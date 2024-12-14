import {Input, ScrollView, Text, useTheme, View, XStack, YStack} from "tamagui";
import {Platform, TouchableOpacity, useColorScheme} from "react-native";
import {useHeaderHeight} from "@react-navigation/elements";
import {Entypo} from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import React, {useCallback, useState} from "react";
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import {useTranslation} from "react-i18next";
import { debounce } from "lodash";
import {searchTransactions} from "@/lib/db";
import {useSQLiteContext} from "expo-sqlite";
import {Category, FullTransaction, Transaction} from "@/lib/types/Transaction";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import {formatByThousands} from "@/lib/helpers/string";
import {selectSettings} from "@/lib/store/features/settings/settingsSlice";
import * as Haptics from "expo-haptics";
import {updateCurrency, updateCurrentTransaction} from "@/lib/store/features/transactions/transactionsSlice";
import {selectCategory} from "@/lib/store/features/categories/categoriesSlice";
import {useRouter} from "expo-router";

export default function Screen() {
    const db = useSQLiteContext();
    const isIos = Platform.OS === 'ios';
    const headerHeight = useHeaderHeight();
    const schemeColor = useColorScheme();
    const theme = useTheme();
    const dispatch = useAppDispatch();
    const { t } = useTranslation();
    const [query, setQuery] = useState<string>('')
    const [type, setType] = useState<'all' | 'expense' | 'income'>('all');
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const {hidden_feature_flag} = useAppSelector(selectSettings);
    const router = useRouter();
    function onPressType() {
        setType(type === 'all' ? 'expense' : type === 'expense' ? 'income' : 'all');

        const t = searchTransactions(db, query, type);
        setTransactions(t)

    }

    const debouncedUpdateSearch = useCallback(
        debounce((query: string) => {
            const t = searchTransactions(db, query, type);
            setTransactions(t)
        }, 500),
        [type]
    );

    function handleInputChange(text: string) {
        setQuery(text);
        debouncedUpdateSearch(text);
    }

    async function handlePress(t: Transaction) {
        await Haptics.selectionAsync();
        dispatch(updateCurrentTransaction({
            ...t,
        }));
        const category = db.getFirstSync('SELECT * FROM categories WHERE title = ?', [t.category]);
        dispatch(selectCategory(category as Category));
        dispatch(updateCurrency({symbol: t.currency_symbol_t, code: t.currency_code_t}))
        // dispatch(selectAccountForm(t.account));
        router.push('/transactionCreateUpdate')
    }

    return (
        <ScrollView flex={1} backgroundColor="$color1" showsVerticalScrollIndicator={false}
                    stickyHeaderIndices={[0]}>
            <YStack px={10} backgroundColor="$color1" paddingTop={isIos ? headerHeight + 20 : 20}>
                <XStack gap={10}>
                    <TouchableOpacity
                        onPress={onPressType}
                        style={{
                            flexDirection: 'row',
                            gap: 5,
                            paddingVertical: 10,
                            paddingHorizontal: 20,
                            backgroundColor: theme.color2?.val,
                            borderRadius: 100
                        }}>
                        <Text>{type === 'expense' ? t('COMMON.EXPENSE') : type === 'income' ? t('COMMON.INCOME') : t('COMMON.ALL')}</Text>
                        <Entypo name="select-arrows" size={18}
                                color={schemeColor === 'light' ? 'black' : 'white'}/>
                    </TouchableOpacity>
                    {/*<TouchableOpacity style={{*/}
                    {/*    flexDirection: 'row',*/}
                    {/*    gap: 5,*/}
                    {/*    paddingVertical: 10,*/}
                    {/*    paddingHorizontal: 20,*/}
                    {/*    backgroundColor: theme.color2?.val,*/}
                    {/*    borderRadius: 100*/}
                    {/*}}>*/}
                    {/*    <Text>Date</Text>*/}
                    {/*    <Entypo name="select-arrows" size={18}*/}
                    {/*            color={schemeColor === 'light' ? 'black' : 'white'}/>*/}
                    {/*</TouchableOpacity>*/}
                </XStack>
                <View position="relative">
                    <Feather style={{ position: 'absolute', top: '35%', left: 15, zIndex: 99 }} name="search" size={24} color={schemeColor === 'light' ? 'black' : 'white'}/>
                    <Input flex={1} onChangeText={handleInputChange} placeholder={t('COMMON.SEARCH')} my={20} style={{ paddingLeft: 50 }} />
                </View>
            </YStack>
            <YStack px={10} pt={20} gap={10}>
                {transactions.map((transaction, index) => (
                    <TouchableOpacity
                        onPress={() => handlePress(transaction)}
                        key={transaction.id}
                        style={{
                            flexDirection: 'row',
                            paddingHorizontal: 20,
                            gap: 15,
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}
                    >
                        <Text fontSize={30}>{transaction.category_icon}</Text>
                        <View
                            flex={1}
                            flexDirection='row'
                            alignItems='center'
                            justifyContent='space-between'
                        >
                            <View flexDirection='row' gap={10} alignItems='center' flex={0.7}>
                                {
                                    transaction.recurrentDate !== 'none' &&
                                    <FontAwesome6 name="arrow-rotate-left" size={16} color="gray"/>
                                }
                                <YStack>
                                    <Text fontSize={18} fontWeight={500}>{transaction.category}</Text>
                                    {
                                        transaction.notes &&
                                        <Text fontSize={14} color="gray">{transaction.notes}</Text>
                                    }
                                </YStack>
                            </View>
                            <Text flex={0.3} textAlign="right" fontSize={16} style={[transaction.category_type === 'income' && { color: theme.green10Dark?.val}]}>{transaction.currency_symbol_t} {formatByThousands(hidden_feature_flag ? String(transaction.hidden_amount) : String(transaction.amount))}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </YStack>
        </ScrollView>
    )
}
