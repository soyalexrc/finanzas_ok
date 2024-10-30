import {TouchableOpacity, StyleSheet} from "react-native";
import {View, Text, XStack, ToggleGroup} from 'tamagui';
import React, {useState} from "react";
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import {
    resetCategoryCreateUpdate,
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
import {useTranslation} from "react-i18next";
import {useRouter} from "expo-router";
import * as Haptics from "expo-haptics";

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
    const {t} = useTranslation();
    const [categoryType, setCategoryType] = useState<string>('expense')
    const router = useRouter();

    function handlePressCategory(category: Category) {
        dispatch(selectCategory(category));
        setOpen(false);
    }

    async function goToCreateCategory() {
        await Haptics.selectionAsync();
        dispatch(resetCategoryCreateUpdate());
        router.push('/(tabs)/(settings)/createEditCategory')
    }

    async function goToCreateAccount() {
        await Haptics.selectionAsync();
        dispatch(resetCategoryCreateUpdate());
        router.push('/(tabs)/(settings)/createEditAccount')
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

            <Sheet.ScrollView stickyHeaderIndices={[0]} backgroundColor="$background" showsVerticalScrollIndicator={false} borderTopLeftRadius={12} borderTopRightRadius={12}>
                <XStack backgroundColor='$color1' justifyContent="center">
                    <ToggleGroup
                        margin={10}
                        value={categoryType}
                        onValueChange={setCategoryType}
                        orientation="horizontal"
                        type="single"
                    >
                        <ToggleGroup.Item value="expense" aria-label="Filter by week">
                            <Text>{t('COMMON.EXPENSE')}</Text>
                        </ToggleGroup.Item>
                        <ToggleGroup.Item value="income" aria-label="Filter by year">
                            <Text>{t('COMMON.INCOME')}</Text>
                        </ToggleGroup.Item>
                        <ToggleGroup.Item value="account" aria-label="Filter by year">
                            <Text>{t('COMMON.ACCOUNT')}</Text>
                        </ToggleGroup.Item>
                    </ToggleGroup>
                </XStack>
                <View flexDirection="row" flexWrap="wrap" rowGap={20} columnGap={10}>
                    {categories.filter(c => c.type === categoryType)?.map(item => (
                        <TouchableOpacity onPress={() => handlePressCategory(item)} key={item.id} style={[localStyles.item, selectedCategory.id === item.id && localStyles.selectedItem]}>
                            <Text style={{fontSize: 40}}>{item.icon}</Text>
                            <Text>{textShortener(item.title)}</Text>
                        </TouchableOpacity>
                    ))}
                    {
                        categoryType !== 'account' &&
                        <TouchableOpacity onPress={goToCreateCategory} style={[localStyles.item]}>
                            <Text style={{fontSize: 40}}>+</Text>
                            <Text>{t('COMMON.NEW')}</Text>
                        </TouchableOpacity>
                    }
                </View>
                {
                    categoryType === 'account' &&
                    <View flexDirection="row" flexWrap="wrap" rowGap={20} columnGap={10}>
                        {accounts.map(item => (
                            <TouchableOpacity onPress={() => {
                            }} key={item.id} style={[localStyles.item, selectedAccount.id === item.id && localStyles.selectedItem]}>
                                <Text style={{fontSize: 40}}>{item.icon}</Text>
                                <Text>{textShortener(item.title, 15)}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity style={[localStyles.item]} onPress={goToCreateAccount}>
                            <Text style={{fontSize: 40}}>+</Text>
                            <Text>{t('COMMON.NEW')}</Text>
                        </TouchableOpacity>
                    </View>
                }
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
