import * as DropdownMenu from "zeego/dropdown-menu";
import {Sheet, Text, View} from "tamagui";
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import {
    selectAccountGlobally,
    selectAccounts,
    selectSelectedAccountGlobal
} from "@/lib/store/features/accounts/accountsSlice";
import {Account} from "@/lib/types/Transaction";
import {getCurrentBalance, getTransactionsGroupedAndFiltered} from "@/lib/db";
import {
    selectHomeViewTypeFilter, updateCurrentBalance, updateHomeViewTypeFilter,
    updateTransactionsGroupedByDate
} from "@/lib/store/features/transactions/transactionsSlice";
import {useSQLiteContext} from "expo-sqlite";
import {getCurrentMonth, getCurrentWeek} from "@/lib/helpers/date";
import {Touchable, TouchableOpacity, useColorScheme} from "react-native";
import {useTranslation} from "react-i18next";
import {useState} from "react";
import {Entypo} from "@expo/vector-icons";
import {formatAccountTitle} from "@/lib/helpers/string";

type Props = {
    open: boolean;
    setOpen: (value: boolean) => void;
    fn: (value: 'total' | 'visible') => void
    tab: 'total' | 'visible'
}

export default function HiddenFlagSheet({open, setOpen, fn, tab} : Props) {
    const schemeColor = useColorScheme();
    const [position, setPosition] = useState(0);
    const {t} = useTranslation()

    return (
        <Sheet
            forceRemoveScrollEnabled={open}
            modal={false}
            open={open}
            dismissOnOverlayPress
            onOpenChange={setOpen}
            position={position}
            onPositionChange={setPosition}
            snapPoints={[25]}
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

                <TouchableOpacity onPress={() => fn('total')} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15 }}>
                    <Text fontSize={17}>{t('CREATE_TRANSACTION.HIDDEN_FEATURE.SEE_TOTAL')}</Text>
                    {
                        tab === 'total' &&
                        <Entypo name="check" size={24} color={schemeColor === 'light' ? 'black' : 'white'} />
                    }
                </TouchableOpacity>

                <TouchableOpacity onPress={() => fn('visible')} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15 }}>
                    <Text fontSize={17}>{t('CREATE_TRANSACTION.HIDDEN_FEATURE.SEE_VISIBLE')}</Text>
                    {
                        tab === 'visible' &&
                        <Entypo name="check" size={24} color={schemeColor === 'light' ? 'black' : 'white'} />
                    }
                </TouchableOpacity>

            </Sheet.Frame>
        </Sheet>
    )
}
