import * as DropdownMenu from "zeego/dropdown-menu";
import {ScrollView, Sheet, Text, View} from "tamagui";
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import {
    selectAccountGlobally,
    selectAccounts,
    selectSelectedAccountGlobal
} from "@/lib/store/features/accounts/accountsSlice";
import {Account} from "@/lib/types/Transaction";
import {getTransactionsGroupedAndFiltered} from "@/lib/db";
import {
    selectHomeViewTypeFilter,
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
}

export default function AccountSelectSheet({open, setOpen} : Props) {
    const db = useSQLiteContext();
    const schemeColor = useColorScheme();
    const [position, setPosition] = useState(0);
    const accounts = useAppSelector(selectAccounts);
    const filterType = useAppSelector(selectHomeViewTypeFilter)
    const selectedAccount = useAppSelector(selectSelectedAccountGlobal);
    const dispatch = useAppDispatch();
    const {t} = useTranslation()

    async function onSelectAccount(account?: Account) {
        const {start, end} = filterType.date === 'week' ? getCurrentWeek() : getCurrentMonth()
        if (!account) {
            dispatch(selectAccountGlobally({
                title: 'All accounts',
                id: 0,
                balance: 0,
                icon: '',
                positive_state: 1,
                currency_code: '',
                currency_symbol: ''
            }));
            const transactions = await getTransactionsGroupedAndFiltered(db, start.toISOString(), end.toISOString(), filterType.type, 0);
            dispatch(updateTransactionsGroupedByDate(transactions));
        } else {
            dispatch(selectAccountGlobally(account));
            const transactions = await getTransactionsGroupedAndFiltered(db, start.toISOString(), end.toISOString(), filterType.type, account.id);
            dispatch(updateTransactionsGroupedByDate(transactions));
        }
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
            snapPoints={[50]}
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
                <Text fontSize={20} mb={10} backgroundColor="$color1" pt={20} textAlign="center">{t('SETTINGS.ACCOUNTS.TITLE')}</Text>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <TouchableOpacity onPress={() => onSelectAccount()} key='0' style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15 }}>
                        <View flexDirection="row">
                            <View w={25} />
                            <Text fontSize={17}>{t('COMMON.ALL_ACCOUNTS')}</Text>
                        </View>
                        {
                            selectedAccount.id === 0 &&
                            <Entypo name="check" size={24} color={schemeColor === 'light' ? 'black' : 'white'} />
                        }
                    </TouchableOpacity>
                    {
                        accounts?.map((account) => (
                            <TouchableOpacity onPress={() => onSelectAccount(account)} key={String(account.id)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15 }}>
                                <Text fontSize={17}>{formatAccountTitle(account, true, t('COMMON.ALL_ACCOUNTS'))}</Text>
                                {
                                    selectedAccount.id === account.id &&
                                    <Entypo name="check" size={24} color={schemeColor === 'light' ? 'black' : 'white'} />
                                }
                            </TouchableOpacity>
                        ))
                    }
                </ScrollView>
            </Sheet.Frame>
        </Sheet>
    )
}
