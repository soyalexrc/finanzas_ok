import {Pressable, StyleSheet} from "react-native";
import {updateLayoutModalState} from "@/lib/store/features/ui/uiSlice";
import {useAppDispatch} from "@/lib/store/hooks";

export default function CustomBackdrop() {
    const dispatch = useAppDispatch();

    function closeModal() {
        dispatch(updateLayoutModalState(false));
    }

    return (
        <Pressable onPress={closeModal} style={styles.backdrop} />
    )
}

const styles = StyleSheet.create({
    backdrop: {
        position: 'absolute',
        zIndex: 10,
        backgroundColor: 'black',
        opacity: 0.2,
        left: 0,
        top: 0,
        width: '100%',
        height: '100%'
    }
})
