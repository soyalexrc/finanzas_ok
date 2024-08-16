import {ScrollView, Text, View, YStack} from "tamagui";
import {Platform, StyleSheet, TouchableOpacity} from "react-native";
import {useHeaderHeight} from "@react-navigation/elements";
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import {
    selectAccounts,
    updateAccountCreateUpdate
} from "@/lib/store/features/accounts/accountsSlice";
import {formatByThousands} from "@/lib/helpers/string";
import {useSQLiteContext} from "expo-sqlite";
import {getAmountOfTransactionsByAccountId} from "@/lib/db";
import {Account} from "@/lib/types/Transaction";
import {useRouter} from "expo-router";
import {changeEmoji} from "@/lib/store/features/ui/uiSlice";

export default function Screen() {
    const db = useSQLiteContext();
    const headerHeight = useHeaderHeight()
    const isIos = Platform.OS === 'ios';
    const accounts = useAppSelector(selectAccounts);
    const dispatch = useAppDispatch();
    const router = useRouter();

    function onPressAccount(account: Account) {
        dispatch(updateAccountCreateUpdate(account));
        dispatch(changeEmoji(account.icon))
        router.push('/createEditAccount')
    }

    return (
        <ScrollView flex={1} backgroundColor="$color1" showsVerticalScrollIndicator={false}
                    paddingTop={isIos ? headerHeight + 20 : headerHeight}>
            {
                accounts.map(account => (
                    <TouchableOpacity style={styles.item} key={account.id} onPress={() => onPressAccount(account)}>
                        <Text fontSize={40}>{account.icon}</Text>
                        <View
                            flex={1}
                            flexDirection='row'
                            alignItems='center'
                            justifyContent='space-between'
                            borderBottomWidth={1}
                            pb={5}
                            borderColor='$color2'
                        >
                            <YStack gap={4}>
                                <Text fontSize={18} fontWeight="bold">{account.title}</Text>
                                <Text color="$gray10Dark">{getAmountOfTransactionsByAccountId(db, account.id)} Transactions</Text>
                            </YStack>
                            <Text fontSize={18}>{account.currency_symbol} {formatByThousands(account.balance.toString())} {account.currency_code}</Text>
                        </View>
                    </TouchableOpacity>
                ))
            }
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    item: {
        borderRadius: 0,
        paddingHorizontal: 20,
        marginBottom: 10,
        gap: 20,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    }
})
