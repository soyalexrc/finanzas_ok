import {BottomSheetModal, BottomSheetTextInput} from "@gorhom/bottom-sheet";
import { StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import {Account, selectAccountForm} from "@/lib/store/features/accounts/accountsSlice";
import {selectLayoutModalState, updateLayoutModalState} from "@/lib/store/features/ui/uiSlice";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";

type Props = {
    children: React.ReactNode,
    styles: any
}

export default function NotesBottomSheet({children, styles}: Props) {
    const [editMode, setEditMode] = useState<boolean>(false);
    const dispatch = useAppDispatch();
    const isModalOpen = useAppSelector(selectLayoutModalState);
    const snapPoints = useMemo(() => ['25%'], []);
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

    function handleButtonToggle() {
        if (editMode) {
            ref.current?.snapToPosition('25%')
        }
        setEditMode(!editMode);
    }

    useEffect(() => {
        if (!isModalOpen) {
            ref.current?.close();
            setEditMode(false);
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
                keyboardBehavior="interactive"
                onChange={handleSheetChanges}
            >
                {
                    editMode &&
                    <BottomSheetTextInput autoFocus multiline={true} numberOfLines={3} style={localStyles.input} />
                }
                {
                    !editMode &&
                    <View style={{ height: 100, margin: 10 }}>
                        <Text style={{ fontSize: 16, lineHeight: 20, }}>sample</Text>
                    </View>
                }
                <TouchableOpacity onPress={handleButtonToggle} style={{ backgroundColor: 'black', padding: 12, marginHorizontal: 10, borderRadius: 12 }}>
                    <Text style={{ textAlign: 'center', color: 'white', fontWeight: 'bold', fontSize: 16 }}>{editMode ? 'Save' : 'Edit'}</Text>
                </TouchableOpacity>
            </BottomSheetModal>
        </>

    )
}

const localStyles = StyleSheet.create({
    input: {
        marginTop: 8,
        marginBottom: 10,
        borderRadius: 10,
        fontSize: 16,
        lineHeight: 20,
        padding: 15,
        margin: 10,
        height: 100,
        backgroundColor: 'rgba(151, 151, 151, 0.1)',
    },
})
