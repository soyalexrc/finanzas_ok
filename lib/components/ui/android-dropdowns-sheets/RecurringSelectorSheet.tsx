import * as DropdownMenu from "zeego/dropdown-menu";
import {StyleSheet, Text, TouchableOpacity, useColorScheme, View} from "react-native";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import {onRecurrentSettingChange, selectCurrentTransaction} from "@/lib/store/features/transactions/transactionsSlice";
import {useTranslation} from "react-i18next";

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

export default function RecurringSelectorSheet() {
    const currentTransaction = useAppSelector(selectCurrentTransaction);
    const dispatch = useAppDispatch();
    const scheme = useColorScheme();
    const {t} = useTranslation()

    function onSelect(value: 'on' | 'mixed' | 'off', keyItem: string) {
        dispatch(onRecurrentSettingChange(keyItem));
    }

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger>
                <TouchableOpacity>
                    <MaterialCommunityIcons name="calendar-sync-outline" size={24} color={currentTransaction.recurrentDate === 'none' ? 'gray' : scheme === 'light' ? 'black' : 'white'}/>
                </TouchableOpacity>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content loop={false} side='bottom' sideOffset={0} align='center' alignOffset={0} collisionPadding={0} avoidCollisions={true}>
                <DropdownMenu.CheckboxItem key='none'
                                           value={currentTransaction.recurrentDate === 'none' ? 'on' : 'off'}
                                           onValueChange={(value) => onSelect(value, 'none')}>
                    <DropdownMenu.ItemTitle>{t('CREATE_TRANSACTION.RECURRENT_OPTIONS.NONE')}</DropdownMenu.ItemTitle>
                    <DropdownMenu.ItemIndicator/>
                </DropdownMenu.CheckboxItem>
                <DropdownMenu.CheckboxItem key='weekly'
                                           value={currentTransaction.recurrentDate === 'weekly' ? 'on' : 'off'}
                                           onValueChange={(value) => onSelect(value, 'weekly')}>
                    <DropdownMenu.ItemTitle>{t('CREATE_TRANSACTION.RECURRENT_OPTIONS.WEEKLY')}</DropdownMenu.ItemTitle>
                    <DropdownMenu.ItemIndicator/>
                </DropdownMenu.CheckboxItem>
                <DropdownMenu.CheckboxItem key='monthly'
                                           value={currentTransaction.recurrentDate === 'monthly' ? 'on' : 'off'}
                                           onValueChange={(value) => onSelect(value, 'monthly')}>
                    <DropdownMenu.ItemTitle>{t('CREATE_TRANSACTION.RECURRENT_OPTIONS.MONTHLY')}</DropdownMenu.ItemTitle>
                    <DropdownMenu.ItemIndicator/>
                </DropdownMenu.CheckboxItem>
                <DropdownMenu.CheckboxItem key='yearly'
                                           value={currentTransaction.recurrentDate === 'yearly' ? 'on' : 'off'}
                                           onValueChange={(value) => onSelect(value, 'yearly')}>
                    <DropdownMenu.ItemTitle>{t('CREATE_TRANSACTION.RECURRENT_OPTIONS.YEARLY')}</DropdownMenu.ItemTitle>
                    <DropdownMenu.ItemIndicator/>
                </DropdownMenu.CheckboxItem>
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
