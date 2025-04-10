import {Platform, StyleSheet, TouchableOpacity} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import {useAppDispatch} from "@/lib/store/hooks";
import {resetCurrentTransaction} from "@/lib/store/features/transactions/transactions.slice";
import {Colors} from "@/lib/constants/colors";

const isIos = Platform.OS === 'ios';

type Props = {
    onPress?: () => void;
    customBottom?: number;
}

const Fab = ({onPress, customBottom}: Props) => {
    const router = useRouter();
    const dispatch = useAppDispatch();

    const bottom = customBottom ? customBottom : isIos ? 50 : 20;

    const defaultOnPress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        dispatch(resetCurrentTransaction());
        router.push('/auth/transaction-form');
    };

    return (
        <TouchableOpacity style={[styles.fab, {bottom}]} activeOpacity={0.8} onPress={onPress ? onPress : defaultOnPress}>
            <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
    );
};

export default Fab;

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        zIndex: 100,
        right: 14,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
    },
});
