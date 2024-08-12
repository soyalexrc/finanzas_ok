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
import {TransactionsGroupedByCategory, TransactionWithAmountNumber} from "@/lib/types/Transaction";

export default function Screen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const detailGroup = useAppSelector(selectDetailGroup)

    function handlePress(item: TransactionWithAmountNumber) {
        dispatch(updateCurrentTransaction({
            amount: item.amount.toString(),
            notes: item.notes,
            id: item.id,
            category_id: item.category_id,
            recurrentDate: item.recurrentDate,
            account_id: item.account_id,
            date: item.date
        }))
        router.push('/transactionCreateUpdate')
    }

    return (
        <ScrollView  backgroundColor="$color1" style={{ paddingTop: insets.top + 50, flex: 1 }}>
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
                                    <Text>S/ {formatByThousands(item.amount.toString())}</Text>
                                </View>
                            </Button>
                        </ContextMenu.Trigger>
                        <ContextMenu.Content loop={false} alignOffset={0} collisionPadding={0}
                                             avoidCollisions={true}>
                            {
                                item.recurrentDate !== 'none' &&
                                <ContextMenu.Item key='recurring'>
                                    <ContextMenu.ItemTitle>Stop Recurring</ContextMenu.ItemTitle>
                                    <ContextMenu.ItemIcon
                                        ios={{
                                            name: 'xmark'
                                        }}
                                    />
                                </ContextMenu.Item>
                            }
                            <ContextMenu.Item key='duplicate' >
                                <ContextMenu.ItemTitle>Duplicate</ContextMenu.ItemTitle>
                                <ContextMenu.ItemIcon
                                    ios={{
                                        name: 'doc.on.doc'
                                    }}
                                />
                            </ContextMenu.Item>
                            <ContextMenu.Item key='delete'  destructive>
                                <ContextMenu.ItemTitle>Delete</ContextMenu.ItemTitle>
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
