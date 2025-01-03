import {TouchableOpacity} from "react-native";
import {View, Text} from 'tamagui';
import {textShortener} from "@/lib/helpers/string";
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import {selectAccountForm, selectAccounts} from "@/lib/store/features/accounts/accountsSlice";
import React, {useState} from "react";
import {Account} from "@/lib/types/Transaction";
import {Sheet} from "tamagui";
import {useRouter} from "expo-router";
import {useTranslation} from "react-i18next";
import {resetCategoryCreateUpdate} from "@/lib/store/features/categories/categoriesSlice";
import * as Haptics from "expo-haptics";

type Props = {
    open: boolean
    setOpen: (value: boolean) => void
}

export default function AccountsBottomSheet({ open, setOpen }: Props) {
    const dispatch = useAppDispatch();
    const accounts = useAppSelector(selectAccounts);
    const [position, setPosition] = useState(0);
    const router = useRouter();
    const {t} = useTranslation();

    function handlePressAccount(account: Account) {
        dispatch(selectAccountForm(account));
        setOpen(false);
    }

    async function goToCreateAccount() {
        await Haptics.selectionAsync();
        dispatch(resetCategoryCreateUpdate());
        router.push('/(tabs)/(settings)')
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
        >
            <Sheet.Overlay
                enterStyle={{ opacity: 0 }}
                exitStyle={{ opacity: 0 }}
            />

            <Sheet.Handle />

            <Sheet.ScrollView backgroundColor="$background" showsVerticalScrollIndicator={false} borderTopLeftRadius={12} borderTopRightRadius={12}>
                <Text textAlign="center" marginVertical={15} fontSize={16} fontWeight="bold">{t('COMMON.ACCOUNT')}</Text>
                <View flexDirection="row" flexWrap="wrap" rowGap={20} columnGap={10}>
                    {accounts?.map(item => (
                        <TouchableOpacity onPress={() => handlePressAccount(item)} key={item.id} style={{ justifyContent: 'center', width: '23%', alignItems: 'center' }}>
                            <Text style={{ fontSize: 40 }}>{item.icon}</Text>
                            <Text>{textShortener(item.title, 15)}</Text>
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity onPress={goToCreateAccount} style={{ justifyContent: 'center', width: '23%', alignItems: 'center' }}>
                        <Text style={{fontSize: 40}}>+</Text>
                        <Text>{t('COMMON.NEW')}</Text>
                    </TouchableOpacity>
                </View>
            </Sheet.ScrollView>
        </Sheet>
    )
}
