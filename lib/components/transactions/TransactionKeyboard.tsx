import {Dimensions, FlatList, TouchableOpacity, useWindowDimensions} from "react-native";
import {keypadData} from "@/lib/utils/data/transaction";
import {View, Text} from 'react-native';

export default function TransactionKeyboard() {
    const { height } = useWindowDimensions();

    const handleNumberPress = (item: { id: string, value: string, isBackSpace?: boolean }) => {
       return;
        // if (item.isBackSpace) {
        //     let newAmount = tab === 'total' ? currentTransaction.amount.slice(0, -1) : currentTransaction.hidden_amount.slice(0, -1);
        //     if (newAmount === '') {
        //         newAmount = '0';
        //     }
        //     if (tab === 'total') {
        //         dispatch(onChangeAmount(newAmount))
        //     } else {
        //         dispatch(onChangeHiddenAmount(newAmount))
        //     }
        // } else {
        //     let updatedAmount = tab === 'total' ? currentTransaction.amount === '0' ? '' : currentTransaction.amount : currentTransaction.hidden_amount === '0' ? '' : currentTransaction.hidden_amount
        //     if (item.value === '.') {
        //  //        Ensure only one decimal point
                // if (!updatedAmount.includes('.')) {
                //     updatedAmount += item.value;
                // }
            // } else {
            //     updatedAmount += item.value;
            // }
            // const decimalIndex = updatedAmount.indexOf('.');
            // if (decimalIndex !== -1 && updatedAmount.length - decimalIndex > 3) return;
            //
            // if (tab === 'total') {
            //     dispatch(onChangeAmount(updatedAmount));
            // } else {
            //     dispatch(onChangeHiddenAmount(updatedAmount));
            // }
        // }
    };


    return (
        <View style={{ flex: 1, marginTop: height <= 812 ? -30 : 0}}>
            <FlatList
                data={keypadData}
                contentContainerStyle={{flex: 1, justifyContent: 'center', marginHorizontal: 30}}
                keyExtractor={({id}) => id}
                numColumns={3}
                scrollEnabled={false}
                renderItem={({item}) => (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', margin: 3 }}>
                        <TouchableOpacity
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
