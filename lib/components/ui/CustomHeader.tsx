import {Platform, StyleProp, StyleSheet, View, ViewStyle} from "react-native";
import {BlurView} from "expo-blur";
import {useSafeAreaInsets} from "react-native-safe-area-context";

export default function CustomHeader({ children, style }: { children: React.ReactNode, style?: StyleProp<ViewStyle> }) {
    const isIos = Platform.OS === 'ios';
    const insets = useSafeAreaInsets();

    if (isIos) {
        return (
            <BlurView intensity={100} tint='prominent' style={[styles.headerIos, style]}>
                {children}
            </BlurView>
        )
    } else {
        return (
            <View style={[styles.header, style]}>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingBottom: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 80,
        paddingHorizontal: 15,
        paddingBottom: 10,
    }
})
