import {BottomSheetModal, BottomSheetScrollView} from "@gorhom/bottom-sheet";
import {Text, TouchableOpacity, View, StyleSheet} from "react-native";
import {useCallback, useEffect, useMemo, useRef} from "react";
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import {
    selectCategories,
    selectCategory,
    selectSelectedCategory
} from "@/lib/store/features/categories/categoriesSlice";
import {textShortener} from "@/lib/helpers/string";
import {
    selectAccounts,
    selectSelectedAccountForm
} from "@/lib/store/features/accounts/accountsSlice";
import {selectLayoutModalState, updateLayoutModalState} from "@/lib/store/features/ui/uiSlice";
import {Category} from "@/lib/types/Transaction";

type Props = {
    children: React.ReactNode,
    styles: any
}

export default function CategoriesBottomSheet({children, styles}: Props) {
    const dispatch = useAppDispatch();
    const categories = useAppSelector(selectCategories);
    const accounts = useAppSelector(selectAccounts);
    const isModalOpen = useAppSelector(selectLayoutModalState);
    const selectedCategory = useAppSelector(selectSelectedCategory);
    const selectedAccount = useAppSelector(selectSelectedAccountForm);
    const snapPoints = useMemo(() => ['60%'], []);
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

    function handlePressCategory(category: Category) {
        dispatch(selectCategory(category));
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
                    <Text style={{
                        textAlign: 'center',
                        marginVertical: 15,
                        fontSize: 16,
                        fontWeight: 'bold',
                        color: 'gray'
                    }}>EXPENSES</Text>
                    <View style={{flexDirection: 'row', flexWrap: 'wrap', rowGap: 20, columnGap: 10}}>
                        {categories.filter(c => c.type === 'expense')?.map(item => (
                            <TouchableOpacity onPress={() => handlePressCategory(item)} key={item.id} style={[localStyles.item, selectedCategory.id === item.id && localStyles.selectedItem]}>
                                <Text style={{fontSize: 40}}>{item.icon}</Text>
                                <Text>{textShortener(item.title)}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <Text style={{
                        textAlign: 'center',
                        marginBottom: 15,
                        marginTop: 50,
                        fontSize: 16,
                        fontWeight: 'bold',
                        color: 'gray'
                    }}>INCOMES</Text>
                    <View style={{flexDirection: 'row', flexWrap: 'wrap', rowGap: 20, columnGap: 10}}>
                        {categories.filter(c => c.type === 'income').map(item => (
                            <TouchableOpacity onPress={() => handlePressCategory(item)} key={item.id}
                                              style={[localStyles.item, selectedCategory.id === item.id && localStyles.selectedItem]}>
                                <Text style={{fontSize: 40}}>{item.icon}</Text>
                                <Text>{textShortener(item.title)}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={{
                        textAlign: 'center',
                        marginBottom: 15,
                        marginTop: 50,
                        fontSize: 16,
                        fontWeight: 'bold',
                        color: 'gray'
                    }}>ACCOUNTS</Text>
                    <View style={{flexDirection: 'row', flexWrap: 'wrap', rowGap: 20, columnGap: 10}}>
                        {accounts.map(item => (
                            <TouchableOpacity onPress={() => {
                            }} key={item.id} style={[localStyles.item, selectedAccount.id === item.id && localStyles.selectedItem]}>
                                <Text style={{fontSize: 40}}>{item.icon}</Text>
                                <Text>{textShortener(item.title, 15)}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={{height: 100}}/>

                </BottomSheetScrollView>
            </BottomSheetModal>
        </>
    )
}

const localStyles = StyleSheet.create({
    item: {
        justifyContent: 'center',
        width: '23%',
        alignItems: 'center'
    },
    selectedItem: {

    }
})
