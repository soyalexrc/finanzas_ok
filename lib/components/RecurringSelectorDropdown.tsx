import * as DropdownMenu from "zeego/dropdown-menu";
import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import {onRecurrentSettingChange, selectCurrentTransaction} from "@/lib/store/features/transactions/transactionsSlice";
import {useTheme} from "@react-navigation/native";

type Props = {
    groups: Item[];
    onSelect: (value: 'on' | 'mixed' | 'off', keyItem: string) => void;
    selectedItem: string;
}

type Item = {
    key: string;
    items: Array<{
        key: string;
        title: string;
        icon: string;
        iconAndroid: string;
    }>
}

const items = [
    {
        key: 'none',
        title: 'None'
    },
    {
        key: 'weekly',
        title: 'Weekly'
    },
    {
        key: 'monthly',
        title: 'Monthly'
    },
    {
        key: 'yearly',
        title: 'Yearly'
    },

]

export default function RecurringSelectorDropdown() {
    const currentTransaction = useAppSelector(selectCurrentTransaction);
    const dispatch = useAppDispatch();
    const colors = useTheme().colors;


    function onSelect(value: 'on' | 'mixed' | 'off', keyItem: string) {
        dispatch(onRecurrentSettingChange(keyItem));
    }

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger>
                <TouchableOpacity>
                    <MaterialCommunityIcons name="calendar-sync-outline" size={24} color={currentTransaction.recurrentDate === 'none' ? 'gray' : colors.text}/>
                </TouchableOpacity>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content loop={false} side='bottom' sideOffset={0} align='center' alignOffset={0} collisionPadding={0} avoidCollisions={true}>
                {
                    items.map(item => (
                        <DropdownMenu.CheckboxItem key={item.key}
                                                   value={currentTransaction.recurrentDate === item.key ? 'on' : 'off'}
                                                   onValueChange={(value) => onSelect(value, item.key)}>
                            <DropdownMenu.ItemTitle>{item.title}</DropdownMenu.ItemTitle>
                            <DropdownMenu.ItemIndicator/>
                        </DropdownMenu.CheckboxItem>
                    ))
                }
            </DropdownMenu.Content>
        </DropdownMenu.Root>

    )
}

const styles = StyleSheet.create({
    container: {
        height: 300,
        justifyContent: 'center',
        alignItems: 'center'
    },
    fs32: {
        fontSize: 32
    },
    fwBold: {
        fontWeight: 'bold'
    },
    fs18: {
        fontSize: 18
    },
    fw64: {
        fontSize: 64
    },
    fw18: {
        fontSize: 18
    },
    opacityMedium: {
        opacity: 0.5
    }
})
