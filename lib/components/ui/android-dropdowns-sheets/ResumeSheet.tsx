import {Sheet, Text} from "tamagui";
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import {
    selectSelectedAccountGlobal
} from "@/lib/store/features/accounts/accountsSlice";
import {getCurrentBalance, getTransactionsGroupedAndFiltered, getTransactionsGroupedAndFilteredV2} from "@/lib/db";
import {
    selectHomeViewTypeFilter, updateCurrentBalance, updateHomeViewTypeFilter,
    updateTransactionsGroupedByDate
} from "@/lib/store/features/transactions/transactionsSlice";
import {useSQLiteContext} from "expo-sqlite";
import {getCurrentMonth, getCurrentWeek} from "@/lib/helpers/date";
import {TouchableOpacity, useColorScheme} from "react-native";
import {useTranslation} from "react-i18next";
import {useState} from "react";
import {Entypo} from "@expo/vector-icons";

type Props = {
    open: boolean;
    setOpen: (value: boolean) => void;
}

export default function ResumeSheet({open, setOpen} : Props) {
    const db = useSQLiteContext();
    const schemeColor = useColorScheme();
    const [position, setPosition] = useState(0);
    const filterType = useAppSelector(selectHomeViewTypeFilter)
    const selectedAccount = useAppSelector(selectSelectedAccountGlobal);
    const dispatch = useAppDispatch();
    const {t} = useTranslation()


    async function handleSelectOption(type: 'Spent' | 'Revenue', date: 'month' | 'none') {
        dispatch(updateHomeViewTypeFilter({type, date}))
        // if (type !== 'Balance') {
            const {start, end} = getCurrentMonth();
            const transactions = await getTransactionsGroupedAndFilteredV2(db, start.toISOString(), end.toISOString(), type);
            dispatch(updateTransactionsGroupedByDate(transactions));
        // } else {
        //     const currentBalance = await getCurrentBalance(db);
        //     dispatch(updateCurrentBalance(currentBalance));
        // }
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
            snapPoints={[45]}
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
                <Text fontSize={20} mb={10} backgroundColor="$color1" pt={20} textAlign="center">{t('COMMON.SELECT')}</Text>

                {/*<TouchableOpacity onPress={() => handleSelectOption('Spent', 'week')} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15 }}>*/}
                {/*    <Text fontSize={17}>{t('HOME_RESUME_DROPDOWN.SPENT_THIS_WEEK')}</Text>*/}
                {/*    {*/}
                {/*        filterType.type === 'Spent' && filterType.date === "week" &&*/}
                {/*        <Entypo name="check" size={24} color={schemeColor === 'light' ? 'black' : 'white'} />*/}
                {/*    }*/}
                {/*</TouchableOpacity>*/}

                <TouchableOpacity onPress={() => handleSelectOption('Spent', 'month')} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15 }}>
                    <Text fontSize={17}>{t('HOME_RESUME_DROPDOWN.SPENT_THIS_MONTH')}</Text>
                    {
                        filterType.type === 'Spent' && filterType.date === "month" &&
                        <Entypo name="check" size={24} color={schemeColor === 'light' ? 'black' : 'white'} />
                    }
                </TouchableOpacity>

                {/*<TouchableOpacity onPress={() => handleSelectOption('Revenue', 'week')} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15 }}>*/}
                {/*    <Text fontSize={17}>{t('HOME_RESUME_DROPDOWN.REVENUE_THIS_WEEK')}</Text>*/}
                {/*    {*/}
                {/*        filterType.type === 'Revenue' && filterType.date === "week" &&*/}
                {/*        <Entypo name="check" size={24} color={schemeColor === 'light' ? 'black' : 'white'} />*/}
                {/*    }*/}
                {/*</TouchableOpacity>*/}

                <TouchableOpacity onPress={() => handleSelectOption('Revenue', 'month')} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15 }}>
                    <Text fontSize={17}>{t('HOME_RESUME_DROPDOWN.REVENUE_THIS_MONTH')}</Text>
                    {
                        filterType.type === 'Revenue' && filterType.date === "month" &&
                        <Entypo name="check" size={24} color={schemeColor === 'light' ? 'black' : 'white'} />
                    }
                </TouchableOpacity>

                {/*<TouchableOpacity onPress={() => handleSelectOption('Balance', 'none')} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15 }}>*/}
                {/*    <Text fontSize={17}>{t('HOME_RESUME_DROPDOWN.BALANCE')}</Text>*/}
                {/*    {*/}
                {/*        filterType.type === 'Balance' && filterType.date === "none" &&*/}
                {/*        <Entypo name="check" size={24} color={schemeColor === 'light' ? 'black' : 'white'} />*/}
                {/*    }*/}
                {/*</TouchableOpacity>*/}
            </Sheet.Frame>
        </Sheet>
    )
}
