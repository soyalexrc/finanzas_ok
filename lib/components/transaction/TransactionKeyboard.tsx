import {FlatList} from "react-native";
import {keypadData} from "@/lib/utils/data/transaction";
import {
    onChangeAmount, onChangeDate,
    onChangeHiddenAmount,
    selectCurrentTransaction
} from "@/lib/store/features/transactions/transactionsSlice";
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import {View, Text, Button} from 'tamagui';

export default function TransactionKeyboard({tab}: { tab: 'total' | 'visible' }) {
    const dispatch = useAppDispatch();
    const currentTransaction = useAppSelector(selectCurrentTransaction)

    const handleNumberPress = (item: { id: string, value: string, isBackSpace?: boolean }) => {
        if (item.isBackSpace) {
            let newAmount = tab === 'total' ? currentTransaction.amount.slice(0, -1) : currentTransaction.hidden_amount.slice(0, -1);
            if (newAmount === '') {
                newAmount = '0';
            }
            if (tab === 'total') {
                dispatch(onChangeAmount(newAmount))
            } else {
                dispatch(onChangeHiddenAmount(newAmount))
            }
        } else {
            let updatedAmount = tab === 'total' ? currentTransaction.amount === '0' ? '' : currentTransaction.amount : currentTransaction.hidden_amount === '0' ? '' : currentTransaction.hidden_amount
            if (item.value === '.') {
                // Ensure only one decimal point
                if (!updatedAmount.includes('.')) {
                    updatedAmount += item.value;
                }
            } else {
                updatedAmount += item.value;
            }
            const decimalIndex = updatedAmount.indexOf('.');
            if (decimalIndex !== -1 && updatedAmount.length - decimalIndex > 3) return;

            if (tab === 'total') {
                dispatch(onChangeAmount(updatedAmount));
            } else {
                dispatch(onChangeHiddenAmount(updatedAmount));
            }
        }
    };


    return (
        <View flex={1} marginTop={-30} style={{ zIndex: -1 }}>
            <FlatList
                data={keypadData}
                contentContainerStyle={{flex: 1, justifyContent: 'center', marginHorizontal: 30}}
                keyExtractor={({id}) => id}
                numColumns={3}
                scrollEnabled={false}
                renderItem={({item}) => (
                    <View flex={1} justifyContent="center" alignItems="center" margin={3}>
                        <Button
                            onPress={() => handleNumberPress(item)}
                            justifyContent="center"
                            alignItems="center"
                            height={60}
                            width={80}
                            borderRadius="$12"
                            backgroundColor="$background025"
                        >
                            <Text fontSize={30} color="$gray10Dark">{item.value}</Text>
                        </Button>
                    </View>
                )}
            />
        </View>
    )
}
