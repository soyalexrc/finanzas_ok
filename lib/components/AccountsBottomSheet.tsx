import {TouchableOpacity} from "react-native";
import {View, Text} from 'tamagui';
import {textShortener} from "@/lib/helpers/string";
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import {
    selectSelectedCategory
} from "@/lib/store/features/categories/categoriesSlice";
import {selectAccountForm, selectAccounts} from "@/lib/store/features/accounts/accountsSlice";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {Account} from "@/lib/types/Transaction";
import {Sheet} from "tamagui";

type Props = {
    open: boolean
    setOpen: (value: boolean) => void
}

export default function AccountsBottomSheet({ open, setOpen }: Props) {
    const dispatch = useAppDispatch();
    const accounts = useAppSelector(selectAccounts);
    const selectedCategory = useAppSelector(selectSelectedCategory);
    const [position, setPosition] = useState(0);

    function handlePressAccount(account: Account) {
        dispatch(selectAccountForm(account));
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
            snapPoints={[40]}
            snapPointsMode='percent'
            dismissOnSnapToBottom
            zIndex={100_000}
            animation="medium"
        >
            <Sheet.Overlay
                animation="lazy"
                enterStyle={{ opacity: 0 }}
                exitStyle={{ opacity: 0 }}
            />

            <Sheet.Handle />

            <Sheet.ScrollView backgroundColor="$background" showsVerticalScrollIndicator={false}>
                <Text textAlign="center" marginVertical={15} fontSize={16} fontWeight="bold" color="$gray10Dark">ACCOUNTS</Text>
                <View flexDirection="row" flexWrap="wrap" rowGap={20} columnGap={10}>
                    {accounts?.map(item => (
                        <TouchableOpacity onPress={() => handlePressAccount(item)} key={item.id} style={{ justifyContent: 'center', width: '23%', alignItems: 'center' }}>
                            <Text style={{ fontSize: 40 }}>{item.icon}</Text>
                            <Text>{textShortener(item.title, 15)}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </Sheet.ScrollView>
        </Sheet>
    )
}
