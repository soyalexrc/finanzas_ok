import {Platform, StyleProp, StyleSheet, View, ViewStyle} from "react-native";
import {BlurView} from "expo-blur";

export default function CustomHeader({ children, style, centered = false }: { children: React.ReactNode, style?: StyleProp<ViewStyle>, centered?: boolean }) {
    const isIos = Platform.OS === 'ios';

    if (isIos) {
        return (
            <BlurView intensity={100} tint='prominent' style={[styles.headerIos, centered ? styles.spaceCentered : styles.spaceBetween, style]}>
                {children}
            </BlurView>
        )
    } else {
        return (
            <View style={[styles.header, centered ? styles.spaceCentered : styles.spaceBetween, style]}>
                {children}
            </View>
        )
    }
}

const styles = StyleSheet.create({
    headerIos: {
        position: 'absolute',
        top: 0,
        right: 0,
        left: 0,
        zIndex: 100,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingBottom: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        height: 80,
        paddingHorizontal: 15,
        paddingBottom: 10,
    },
    spaceBetween: {
        justifyContent: 'space-between',
    },
    spaceCentered: {
        justifyContent: 'center',
    }
})
