import {Button, Text, TextArea} from 'tamagui';
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import {useEffect, useState} from "react";
import {Sheet} from "tamagui";
import {onChangeNotes, selectCurrentTransaction} from "@/lib/store/features/transactions/transactionsSlice";
import {useTranslation} from "react-i18next";
import {Keyboard, Platform} from "react-native";

type Props = {
    open: boolean;
    setOpen: (value: boolean) => void;
}

export default function NotesBottomSheet({open, setOpen}: Props) {
    const [position, setPosition] = useState(0);
    const dispatch = useAppDispatch();
    const currentTransaction = useAppSelector(selectCurrentTransaction)
    const [text, setText] = useState<string>('');
    const {t} = useTranslation()
    const isIos = Platform.OS === 'ios';
    function handleButtonToggle() {
        // if (editMode) {
            dispatch(onChangeNotes(text));
            setOpen(false);
            Keyboard.dismiss();
        // }
        // setEditMode(!editMode);
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
            snapPoints={isIos ? [35] : [42]}
            moveOnKeyboardChange
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

            <Sheet.Frame backgroundColor="$background" borderTopLeftRadius={12} borderTopRightRadius={12}>
                <Text nativeID="notesLabel" textAlign="center" marginVertical={15} fontSize={16} fontWeight="bold">{t('CREATE_TRANSACTION.NOTE')}</Text>

                {/*{*/}
                {/*    editMode &&*/}
                    <TextArea
                        accessible={true}
                        accessibilityLabel="Comments about transaction"
                        accessibilityHint="Write some comments about the transaction being registered"
                        accessibilityLabelledBy="notesLabel"
                        size='$4'
                        value={text}
                        marginHorizontal={10}
                        marginBottom={15}
                        marginTop={10}
                        padding={15}
                        onChangeText={setText}
                    />
                {/*}*/}
                {/*{*/}
                {/*    !editMode &&*/}
                {/*    <View height={100} margin={10} >*/}
                {/*        <Text fontSize={16} lineHeight={20}>{text}</Text>*/}
                {/*    </View>*/}
                {/*}*/}
                <Button accesible={true}  accessibilityLabel="Save note changes" accessibilityHint="This will save the comments about the transaction that you wrote"  padding={12} marginHorizontal={10} onPress={handleButtonToggle}>
                    <Text style={{ textAlign: 'center', fontSize: 16 }}>{t('CREATE_TRANSACTION.SAVE')}</Text>
                </Button>
            </Sheet.Frame>
        </Sheet>
    )

}
