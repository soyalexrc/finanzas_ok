import { StyleSheet} from "react-native";
import {Button, Input, Text, TextArea, View} from 'tamagui';
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import {useEffect, useState} from "react";
import {Sheet} from "tamagui";
import {onChangeNotes, selectCurrentTransaction} from "@/lib/store/features/transactions/transactionsSlice";

type Props = {
    open: boolean;
    setOpen: (value: boolean) => void;
}

export default function NotesBottomSheet({open, setOpen}: Props) {
    const [editMode, setEditMode] = useState<boolean>(false);
    const [position, setPosition] = useState(0);
    const dispatch = useAppDispatch();
    const currentTransaction = useAppSelector(selectCurrentTransaction)
    const [text, setText] = useState<string>('');

    function handleButtonToggle() {
        if (editMode) {
            dispatch(onChangeNotes(text));
        }
        setEditMode(!editMode);
    }

    useEffect(() => {
        setText(currentTransaction.notes);
    }, []);

    return (
        <Sheet
            forceRemoveScrollEnabled={open}
            modal={false}
            open={open}
            dismissOnOverlayPress
            onOpenChange={setOpen}
            position={position}
            onPositionChange={setPosition}
            snapPoints={[35]}
            moveOnKeyboardChange
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

            <Sheet.Frame backgroundColor="$background">
                <Text textAlign="center" marginVertical={15} fontSize={16} fontWeight="bold" color="$gray10Dark">Notes</Text>

                {
                    editMode &&
                    <TextArea
                        autoFocus
                        size='$4'
                        value={text}
                        marginHorizontal={10}
                        marginBottom={15}
                        marginTop={10}
                        padding={15}
                        onChangeText={setText}
                    />
                }
                {
                    !editMode &&
                    <View height={100} margin={10} >
                        <Text fontSize={16} lineHeight={20}>{text}</Text>
                    </View>
                }
                <Button padding={12} marginHorizontal={10} onPress={handleButtonToggle}>
                    <Text style={{ textAlign: 'center', color: 'white', fontWeight: 'bold', fontSize: 16 }}>{editMode ? 'Save' : 'Edit'}</Text>
                </Button>
            </Sheet.Frame>
        </Sheet>
    )

}
