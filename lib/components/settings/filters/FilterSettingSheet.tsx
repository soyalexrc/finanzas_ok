import {Button, Input, Sheet, Text, XStack, YStack} from "tamagui";
import React, {useEffect, useState} from "react";
import {useSQLiteContext} from "expo-sqlite";
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import {selectLimit, updateLimit} from "@/lib/store/features/transactions/filterSlice";
import {Keyboard, Pressable} from "react-native";
import {updateSettingByKey} from "@/lib/db";
import {useTranslation} from "react-i18next";

type Props = {
    open: boolean;
    setOpen: (value: boolean) => void;
}

export default function FilterSettingSheet({open, setOpen}: Props) {
    const db = useSQLiteContext();
    const [position, setPosition] = useState(0);
    const limit = useAppSelector(selectLimit);
    const dispatch = useAppDispatch();
    const {t} = useTranslation()
    const [filterLimit, setFilterLimit] = useState<string>(String(limit));

    useEffect(() => {
        setFilterLimit(String(limit))
    }, [open]);

    function onPressDone() {
        updateSettingByKey(db, 'filter_limit', filterLimit);
        dispatch(updateLimit(Number(filterLimit)));
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
            snapPoints={[80]}
            snapPointsMode='percent'
            dismissOnSnapToBottom
            zIndex={100_000}
        >
            <Sheet.Overlay
                enterStyle={{opacity: 0}}
                exitStyle={{opacity: 0}}
            />

            <Sheet.Handle/>
            <Sheet.ScrollView borderTopLeftRadius={12} borderTopRightRadius={12} backgroundColor="$color1" px={10} stickyHeaderIndices={[0]}>
                <XStack justifyContent="flex-end" backgroundColor="$color1" p={10}>
                    <Button size="$3" onPress={onPressDone}>
                        <Text>{t('COMMON.DONE')}</Text>
                    </Button>
                </XStack>
                <Pressable onPress={() => Keyboard.dismiss()}>
                    <YStack p={10} gap={10}>
                        <Text>{t('SETTINGS.FILTERS.LABELS.LIMIT')}</Text>
                        <Input keyboardType="numeric" size="$4" value={filterLimit} onChangeText={setFilterLimit}/>
                    </YStack>
                </Pressable>
            </Sheet.ScrollView>
        </Sheet>
    )
}
