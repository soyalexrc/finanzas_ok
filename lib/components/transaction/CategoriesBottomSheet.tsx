import {TouchableOpacity, StyleSheet, Platform, useColorScheme, FlatList} from "react-native";
import {View, Text, XStack, ToggleGroup, useTheme} from 'tamagui';
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
import Entypo from '@expo/vector-icons/Entypo';

type Props = {
    open: boolean
    setOpen: (value: boolean) => void
}

export default function CategoriesBottomSheet({open, setOpen}: Props) {
    const dispatch = useAppDispatch();
    const scheme = useColorScheme()
    const categories = useAppSelector(selectCategories);
    const isIos = Platform.OS === 'ios';
    const selectedCategory = useAppSelector(selectSelectedCategory);
    const [position, setPosition] = useState(0);
    const {t} = useTranslation();
    const [categoryType, setCategoryType] = useState<string>('expense')
    const router = useRouter();
    const theme = useTheme();

    function handlePressCategory(category: Category) {
        dispatch(selectCategory(category));
        setOpen(false);
    }

    async function goToCreateCategory() {
        await Haptics.selectionAsync();
        dispatch(resetCategoryCreateUpdate());
        router.replace('/');
        router.push('/(tabs)/(settings)');
        setTimeout(() => {
            router.push('/(tabs)/(settings)/categories');
        }, 300)
    }

    // async function goToCreateAccount() {
    //     await Haptics.selectionAsync();
    //     dispatch(resetCategoryCreateUpdate());
    //     router.push('/(tabs)/(settings)/createEditAccount')
    // }

    return (
        <Sheet
            forceRemoveScrollEnabled={open}
            modal={false}
            open={open}
            dismissOnOverlayPress
            onOpenChange={setOpen}
            position={position}
            onPositionChange={setPosition}
            snapPoints={[90]}
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

            <Sheet.Handle/>

            <Sheet.Frame  backgroundColor="$background" borderTopLeftRadius={12} borderTopRightRadius={12}>
                <View backgroundColor="$color1">
                    <ToggleGroup
                        margin={10}
                        value={categoryType}
                        onValueChange={setCategoryType}
                        height={isIos ? 41 : 50}
                        orientation="horizontal"
                        type="single"
                    >
                        <ToggleGroup.Item flex={1} value="expense" aria-label="expese categories tab filter">
                            <Text>{t('COMMON.EXPENSE')}</Text>
                        </ToggleGroup.Item>
                        <ToggleGroup.Item flex={1} value="income" aria-label="income categories tab filter">
                            <Text>{t('COMMON.INCOME')}</Text>
                        </ToggleGroup.Item>
                    </ToggleGroup>
                </View>
                <FlatList
                    data={categories.filter(c => c.type === categoryType)}
                    numColumns={4}
                    showsVerticalScrollIndicator={false}
                    columnWrapperStyle={{
                        justifyContent: 'space-between'
                    }}
                    renderItem={({item}) => (
                        <TouchableOpacity onPress={() => handlePressCategory(item)}
                                          style={[localStyles.item, selectedCategory.id === item.id && localStyles.selectedItem]}>
                            <Text style={{fontSize: 40}}>{item.icon}</Text>
                            <Text>{textShortener(item.title)}</Text>
                        </TouchableOpacity>
                    )}
                />
                {/*<View flexDirection="row" flexWrap="wrap" rowGap={20} columnGap={10}>*/}
                {/*    {categories.filter(c => c.type === categoryType)?.map(item => (*/}
                {/*        <TouchableOpacity onPress={() => handlePressCategory(item)} key={item.id}*/}
                {/*                          style={[localStyles.item, selectedCategory.id === item.id && localStyles.selectedItem]}>*/}
                {/*            <Text style={{fontSize: 40}}>{item.icon}</Text>*/}
                {/*            <Text>{textShortener(item.title)}</Text>*/}
                {/*        </TouchableOpacity>*/}
                {/*    ))}*/}
                {/*</View>*/}
                <View style={{height: 10}}/>
                <TouchableOpacity onPress={goToCreateCategory} style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'row',
                    marginBottom: 20,
                    backgroundColor: theme.color5?.val,
                    marginHorizontal: 20,
                    height: 50,
                    gap: 5,
                    borderRadius: 10,
                }}>
                    <Entypo name="plus" size={24} color={ scheme === 'light' ? 'black' : 'white'} />
                    <Text>{t('SETTINGS.CATEGORIES.PLACE_HOLDER')}</Text>
                </TouchableOpacity>
            </Sheet.Frame>
        </Sheet>
    )

}

const localStyles = StyleSheet.create({
    item: {
        justifyContent: 'center',
        width: '23%',
        alignItems: 'center'
    },
    selectedItem: {}
})
