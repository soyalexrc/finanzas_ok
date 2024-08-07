import {FlatList, Text, TouchableOpacity, View} from "react-native";
import {keypadData} from "@/lib/utils/data/transaction";
import {onChangeAmount, selectCurrentTransaction} from "@/lib/store/features/transactions/transactionsSlice";
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";

export default function TransactionKeyboard() {
    const dispatch = useAppDispatch();
    const currentTransaction = useAppSelector(selectCurrentTransaction)

    const handleNumberPress = (item: { id: string, value: string, isBackSpace?: boolean }) => {
        if (item.isBackSpace) {
            let newAmount = currentTransaction.amount.slice(0, -1);
            if (newAmount === '') {
                newAmount = '0';
            }
            dispatch(onChangeAmount(newAmount))
        } else {
            let updatedAmount = currentTransaction.amount === '0' ? '' : currentTransaction.amount
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

            dispatch(onChangeAmount(updatedAmount));
        }
    };


    return (
        <View style={{flex: 1}}>
            <FlatList
                data={keypadData}
                contentContainerStyle={{flex: 1, justifyContent: 'center', marginHorizontal: 30}}
                keyExtractor={({id}) => id}
                numColumns={3}
                scrollEnabled={false}
                renderItem={({item}) => (
                    <View style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        margin: 5
                    }}>
                        <TouchableOpacity onPress={() => handleNumberPress(item)} style={{
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: 70,
                            width: 70
                        }}>
                            <Text style={{fontSize: 30, color: 'gray'}}>{item.value}</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />
        </View>
    )
}
