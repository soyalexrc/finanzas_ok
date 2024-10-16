import {useState} from "react";
import {TouchableOpacity, useColorScheme, View} from "react-native";
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import {
    onRecurrentSettingChange,
    selectCurrentTransaction,
} from "@/lib/store/features/transactions/transactionsSlice";
import {useTranslation} from "react-i18next";
import {Sheet, Text} from "tamagui";
import {Entypo} from "@expo/vector-icons";

type Props = {
    open: boolean;
    setOpen: (value: boolean) => void;
}


export default function RecurringSelectorSheet({open, setOpen}: Props) {
    const currentTransaction = useAppSelector(selectCurrentTransaction);
    const scheme = useColorScheme();
    const [position, setPosition] = useState(0);
    const dispatch = useAppDispatch();
    const {t} = useTranslation()


    function onSelect(keyItem: string) {
        dispatch(onRecurrentSettingChange(keyItem));
    }

    return (

        <Sheet
            forceRemoveScrollEnabled={open}
            modal={false}
            open={open}
            dismissOnOverlayPress
            onOpenChange={setOpen}
            position={position}
            onPositionChange={setPosition}
            snapPoints={[35]}
            snapPointsMode='percent'
            dismissOnSnapToBottom
            zIndex={100_000}
            animation="quick"
        >
            <Sheet.Overlay
                animation="quick"
                enterStyle={{opacity: 0}}
                exitStyle={{opacity: 0}}
            />
            <Sheet.Frame borderTopLeftRadius={12} borderTopRightRadius={12} backgroundColor="$color1" px={10} pb={20}>
                <Text fontSize={20} mb={10} backgroundColor="$color1" pt={20} textAlign="center">Seleccionar</Text>

                <TouchableOpacity onPress={() => onSelect('none')} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15 }}>
                    <Text fontSize={17}>{t('CREATE_TRANSACTION.RECURRENT_OPTIONS.NONE')}</Text>
                    {
                        currentTransaction.recurrentDate === 'none' &&
                        <Entypo name="check" size={24} color={scheme === 'light' ? 'black' : 'white'} />
                    }
                </TouchableOpacity>

                <TouchableOpacity onPress={() => onSelect('weekly')} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15 }}>
                    <Text fontSize={17}>{t('CREATE_TRANSACTION.RECURRENT_OPTIONS.WEEKLY')}</Text>
                    {
                        currentTransaction.recurrentDate === 'weekly' &&
                        <Entypo name="check" size={24} color={scheme === 'light' ? 'black' : 'white'} />
                    }
                </TouchableOpacity>

                <TouchableOpacity onPress={() => onSelect('monthly')} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15 }}>
                    <Text fontSize={17}>{t('CREATE_TRANSACTION.RECURRENT_OPTIONS.MONTHLY')}</Text>
                    {
                        currentTransaction.recurrentDate === 'monthly' &&
                        <Entypo name="check" size={24} color={scheme === 'light' ? 'black' : 'white'} />
                    }
                </TouchableOpacity>

                <TouchableOpacity onPress={() => onSelect('yearly')} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15 }}>
                    <Text fontSize={17}>{t('CREATE_TRANSACTION.RECURRENT_OPTIONS.YEARLY')}</Text>
                    {
                        currentTransaction.recurrentDate === 'yearly' &&
                        <Entypo name="check" size={24} color={scheme === 'light' ? 'black' : 'white'} />
                    }
                </TouchableOpacity>
            </Sheet.Frame>
        </Sheet>
        // <DropdownMenu.Root>
        //     <DropdownMenu.Trigger>
        //         <TouchableOpacity>
        //             <MaterialCommunityIcons name="calendar-sync-outline" size={24} color={currentTransaction.recurrentDate === 'none' ? 'gray' : scheme === 'light' ? 'black' : 'white'}/>
        //         </TouchableOpacity>
        //     </DropdownMenu.Trigger>
        //     <DropdownMenu.Content loop={false} side='bottom' sideOffset={0} align='center' alignOffset={0} collisionPadding={0} avoidCollisions={true}>
        //         <DropdownMenu.CheckboxItem key='none'
        //                                    value={currentTransaction.recurrentDate === 'none' ? 'on' : 'off'}
        //                                    onValueChange={(value) => onSelect(value, 'none')}>
        //             <DropdownMenu.ItemTitle>{t('CREATE_TRANSACTION.RECURRENT_OPTIONS.NONE')}</DropdownMenu.ItemTitle>
        //             <DropdownMenu.ItemIndicator/>
        //         </DropdownMenu.CheckboxItem>
        //         <DropdownMenu.CheckboxItem key='weekly'
        //                                    value={currentTransaction.recurrentDate === 'weekly' ? 'on' : 'off'}
        //                                    onValueChange={(value) => onSelect(value, 'weekly')}>
        //             <DropdownMenu.ItemTitle>{t('CREATE_TRANSACTION.RECURRENT_OPTIONS.WEEKLY')}</DropdownMenu.ItemTitle>
        //             <DropdownMenu.ItemIndicator/>
        //         </DropdownMenu.CheckboxItem>
        //         <DropdownMenu.CheckboxItem key='monthly'
        //                                    value={currentTransaction.recurrentDate === 'monthly' ? 'on' : 'off'}
        //                                    onValueChange={(value) => onSelect(value, 'monthly')}>
        //             <DropdownMenu.ItemTitle>{t('CREATE_TRANSACTION.RECURRENT_OPTIONS.MONTHLY')}</DropdownMenu.ItemTitle>
        //             <DropdownMenu.ItemIndicator/>
        //         </DropdownMenu.CheckboxItem>
        //         <DropdownMenu.CheckboxItem key='yearly'
        //                                    value={currentTransaction.recurrentDate === 'yearly' ? 'on' : 'off'}
        //                                    onValueChange={(value) => onSelect(value, 'yearly')}>
        //             <DropdownMenu.ItemTitle>{t('CREATE_TRANSACTION.RECURRENT_OPTIONS.YEARLY')}</DropdownMenu.ItemTitle>
        //             <DropdownMenu.ItemIndicator/>
        //         </DropdownMenu.CheckboxItem>
        //     </DropdownMenu.Content>
        // </DropdownMenu.Root>

    )
}

