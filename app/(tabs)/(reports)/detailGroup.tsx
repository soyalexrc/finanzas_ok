import {ScrollView, Text, View} from "tamagui";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {useRouter} from "expo-router";
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import {selectDetailGroup} from "@/lib/store/features/transactions/reportSlice";
import * as ContextMenu from "zeego/context-menu";
import {Button} from "tamagui";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import {formatByThousands} from "@/lib/helpers/string";
import {updateCurrentTransaction} from "@/lib/store/features/transactions/transactionsSlice";
import {TransactionWithAmountNumber} from "@/lib/types/Transaction";
import {selectCategories, selectCategory} from "@/lib/store/features/categories/categoriesSlice";
import {selectAccountForm, selectAccounts} from "@/lib/store/features/accounts/accountsSlice";
import {selectSettings} from "@/lib/store/features/settings/settingsSlice";
import {useTranslation} from "react-i18next";
import {Platform} from "react-native";

export default function Screen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const accounts = useAppSelector(selectAccounts);
    const categories = useAppSelector(selectCategories);
    const detailGroup = useAppSelector(selectDetailGroup)
    const {hidden_feature_flag} = useAppSelector(selectSettings)
    const isIos = Platform.OS === 'ios';
    const {t} = useTranslation()

    function handlePress(item: TransactionWithAmountNumber) {
        dispatch(updateCurrentTransaction({
            amount: item.amount.toString(),
            notes: item.notes,
            id: item.id,
            hidden_amount: item.hidden_amount.toString(),
            is_hidden_transaction: item.is_hidden_transaction,
            category_id: item.category_id,
            recurrentDate: item.recurrentDate,
            account_id: item.account_id,
            date: item.date
        }))
        const category = categories.find((c) => c.id === item.category_id);
        const account = accounts.find((a) => a.id === item.account_id);
        dispatch(selectCategory(category!));
        dispatch(selectAccountForm(account!));
        router.push('/transactionCreateUpdate')
    }

    return (
        <ScrollView  backgroundColor="$color1" style={{ paddingTop: isIos ? insets.top + 50 : 0, flex: 1 }}>
            {
                detailGroup.transactions.map((item, i) => (
                    <ContextMenu.Root key={item.id}>
                        <ContextMenu.Trigger>
                            <Button backgroundColor='$background075' borderRadius={0} onPress={() => handlePress(item)} paddingHorizontal={20} gap={6} flexDirection="row" justifyContent="space-between" alignItems="center">
                                <Text fontSize={30}>{detailGroup.category.icon}</Text>
                                <View
                                    flex={1}
                                    flexDirection='row'
                                    alignItems='center'
                                    justifyContent='space-between'
                                >
                                    <View flexDirection='row' gap={10} alignItems='center'>
                                        {
                                            item.recurrentDate !== 'none' &&
                                            <FontAwesome6 name="arrow-rotate-left" size={16} color="gray"/>
                                        }
                                        <Text fontSize={18} fontWeight={500}>{detailGroup.category.title}</Text>
                                    </View>
                                    <Text>{item.account_symbol} {formatByThousands(hidden_feature_flag ? item.hidden_amount.toString() : item.amount.toString())}</Text>
                                </View>
                            </Button>
                        </ContextMenu.Trigger>
                        <ContextMenu.Content loop={false} alignOffset={0} collisionPadding={0}
                                             avoidCollisions={true}>
                            {
                                item.recurrentDate !== 'none' &&
                                <ContextMenu.Item key='recurring'>
                                    <ContextMenu.ItemTitle>{t('COMMON.STOP_RECURRING')}</ContextMenu.ItemTitle>
                                    <ContextMenu.ItemIcon
                                        ios={{
                                            name: 'xmark'
                                        }}
                                    />
                                </ContextMenu.Item>
                            }
                            <ContextMenu.Item key='duplicate' >
                                <ContextMenu.ItemTitle>{t('TRANSACTIONS.DUPLICATE')}</ContextMenu.ItemTitle>
                                <ContextMenu.ItemIcon
                                    ios={{
                                        name: 'doc.on.doc'
                                    }}
                                />
                            </ContextMenu.Item>
                            <ContextMenu.Item key='delete'  destructive>
                                <ContextMenu.ItemTitle>{t('COMMON.DELETE')}</ContextMenu.ItemTitle>
                                <ContextMenu.ItemIcon
                                    ios={{
                                        name: 'trash'
                                    }}
                                />
                            </ContextMenu.Item>
                        </ContextMenu.Content>
                    </ContextMenu.Root>
                ))
            }
        </ScrollView>
    )
}
