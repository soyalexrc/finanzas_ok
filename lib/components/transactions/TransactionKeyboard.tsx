import {Dimensions, FlatList, TouchableOpacity, useWindowDimensions} from "react-native";
import {keypadData} from "@/lib/utils/data/transaction";
import {View, Text} from 'react-native';
import * as Haptics from "expo-haptics";
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import {onChangeAmount, selectCurrentTransaction} from "@/lib/store/features/transactions/transactions.slice";

export default function TransactionKeyboard() {
    const { height } = useWindowDimensions();
    const dispatch = useAppDispatch();
    const currentTransaction = useAppSelector(selectCurrentTransaction)

    const handleNumberPress = async (item: { id: string, value: string, isBackSpace?: boolean }) => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        if (item.isBackSpace) {
            let newAmount = currentTransaction.amount.slice(0, -1);
            if (newAmount === '') {
                newAmount = '0';
            }
            dispatch(onChangeAmount(newAmount))

        } else {
            let updatedAmount = currentTransaction.amount === '0' ? '' : currentTransaction.amount;
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
        <View style={{ height: 300 }}>
            <FlatList
                data={keypadData}
                contentContainerStyle={{justifyContent: 'center', marginHorizontal: 30}}
                keyExtractor={({id}) => id}
                numColumns={3}
                scrollEnabled={false}
                renderItem={({item}) => (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', margin: 3 }}>
                        <TouchableOpacity
                            onPress={() => handleNumberPress(item)}
                            style={{
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: 60,
                                width: 80,
                                borderRadius: 100,
                                // backgroundColor: '#ececec'
                            }}
                        >
                            <Text style={{ fontSize: 30 }} >{item.value}</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />
        </View>
    )
}
