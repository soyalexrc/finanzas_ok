import {BottomSheetModal, BottomSheetScrollView} from "@gorhom/bottom-sheet";
import {Text, TouchableOpacity, View} from "react-native";
import {textShortener} from "@/lib/helpers/string";
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import {
    Category,
    selectCategory,
    selectSelectedCategory
} from "@/lib/store/features/categories/categoriesSlice";
import {Account, selectAccountForm, selectAccounts} from "@/lib/store/features/accounts/accountsSlice";
import {selectLayoutModalState, updateLayoutModalState} from "@/lib/store/features/ui/uiSlice";
import {useCallback, useEffect, useMemo, useRef} from "react";


type Props = {
    children: React.ReactNode,
    styles: any
}

export default function AccountsBottomSheet({ styles, children }: Props) {
    const dispatch = useAppDispatch();
    const accounts = useAppSelector(selectAccounts);
    const isModalOpen = useAppSelector(selectLayoutModalState);
    const selectedCategory = useAppSelector(selectSelectedCategory);
    const snapPoints = useMemo(() => ['40%'], []);
    const ref = useRef<BottomSheetModal>(null);

    const handlePressOpenModal = useCallback(() => {
        dispatch(updateLayoutModalState(true));
        ref.current?.present();
    }, []);

    const handleSheetChanges = useCallback((index: number) => {
        if (index < 0) {
            dispatch(updateLayoutModalState(false));
        }
    }, []);

    function handlePressAccount(account: Account) {
        dispatch(selectAccountForm(account));
        dispatch(updateLayoutModalState(false));
        ref.current?.close();
    }

    useEffect(() => {
        if (!isModalOpen) {
            ref.current?.close();
        }
    }, [isModalOpen]);

    return (
        <>
            <TouchableOpacity style={styles} onPress={handlePressOpenModal}>
                {children}
            </TouchableOpacity>
            <BottomSheetModal
                ref={ref}
                index={0}
                snapPoints={snapPoints}
                onChange={handleSheetChanges}
            >
                <BottomSheetScrollView showsVerticalScrollIndicator={false}>
                    <Text style={{ textAlign: 'center', marginVertical: 15, fontSize: 16, fontWeight: 'bold', color: 'gray' }}>ACCOUNTS</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: 20, columnGap: 10 }}>
                        {accounts?.map(item => (
                            <TouchableOpacity onPress={() => handlePressAccount(item)} key={item.id} style={{ justifyContent: 'center', width: '23%', alignItems: 'center' }}>
                                <Text style={{ fontSize: 40 }}>{item.icon}</Text>
                                <Text>{textShortener(item.title, 15)}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={{ height: 100 }} />

                </BottomSheetScrollView>
            </BottomSheetModal>
        </>
    )
}
