import {useState} from "react";
import {TouchableOpacity, useColorScheme} from "react-native";
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
        >
            <Sheet.Overlay
                enterStyle={{opacity: 0}}
                exitStyle={{opacity: 0}}
            />
            <Sheet.Frame borderTopLeftRadius={12} borderTopRightRadius={12} backgroundColor="$color1" px={10} pb={20}>
                <Text fontSize={20} mb={10} backgroundColor="$color1" pt={20} textAlign="center">{t('COMMON.SELECT')}</Text>

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
    )
}

