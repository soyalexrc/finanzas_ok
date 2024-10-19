import {TouchableOpacity, StyleSheet} from "react-native";
import {View, Text} from 'tamagui';
import {useState} from "react";
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
import {Category} from "@/lib/types/Transaction";
import {Sheet} from "tamagui";

type Props = {
    open: boolean
    setOpen: (value: boolean) => void
}

export default function CategoriesBottomSheet({open, setOpen}: Props) {
    const dispatch = useAppDispatch();
    const categories = useAppSelector(selectCategories);
    const accounts = useAppSelector(selectAccounts);
    const selectedCategory = useAppSelector(selectSelectedCategory);
    const selectedAccount = useAppSelector(selectSelectedAccountForm);
    const [position, setPosition] = useState(0);

    function handlePressCategory(category: Category) {
        dispatch(selectCategory(category));
        setOpen(false);
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
            snapPoints={[60]}
            snapPointsMode='percent'
            dismissOnSnapToBottom
            zIndex={100_000}
            animation="quick"
        >
            <Sheet.Overlay
                animation="quick"
                enterStyle={{ opacity: 0 }}
                exitStyle={{ opacity: 0 }}
            />

            <Sheet.Handle />

            <Sheet.ScrollView backgroundColor="$background" showsVerticalScrollIndicator={false} borderTopLeftRadius={12} borderTopRightRadius={12}>
                <Text textAlign="center" marginVertical={15} fontSize={16} fontWeight="bold" color="$gray10Dark">EXPENSES</Text>
                <View flexDirection="row" flexWrap="wrap" rowGap={20} columnGap={10}>
                    {categories.filter(c => c.type === 'expense')?.map(item => (
                        <TouchableOpacity onPress={() => handlePressCategory(item)} key={item.id} style={[localStyles.item, selectedCategory.id === item.id && localStyles.selectedItem]}>
                            <Text style={{fontSize: 40}}>{item.icon}</Text>
                            <Text>{textShortener(item.title)}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <Text textAlign="center" marginTop={50} marginBottom={15} fontSize={16} fontWeight="bold" color="$gray10Dark">INCOMES</Text>
                <View flexDirection="row" flexWrap="wrap" rowGap={20} columnGap={10}>
                    {categories.filter(c => c.type === 'income').map(item => (
                        <TouchableOpacity onPress={() => handlePressCategory(item)} key={item.id}
                                          style={[localStyles.item, selectedCategory.id === item.id && localStyles.selectedItem]}>
                            <Text style={{fontSize: 40}}>{item.icon}</Text>
                            <Text>{textShortener(item.title)}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <Text textAlign="center" marginTop={50} marginBottom={15} fontSize={16} fontWeight="bold" color="$gray10Dark">ACCOUNTS</Text>
                <View flexDirection="row" flexWrap="wrap" rowGap={20} columnGap={10}>
                    {accounts.map(item => (
                        <TouchableOpacity onPress={() => {
                        }} key={item.id} style={[localStyles.item, selectedAccount.id === item.id && localStyles.selectedItem]}>
                            <Text style={{fontSize: 40}}>{item.icon}</Text>
                            <Text>{textShortener(item.title, 15)}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <View style={{height: 100}}/>
            </Sheet.ScrollView>
        </Sheet>
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
