import {Text, View, YStack} from "tamagui";
import {Redirect} from "expo-router";
import {useAuth} from "@clerk/clerk-expo";
import BottomLoginSheet from "@/lib/components/auth/BottomLoginSheet";

export default function Screen() {
    const { isSignedIn } = useAuth()

    if (isSignedIn) {
        return <Redirect href={'/(tabs)'} />
    }
    return (
        <YStack flex={1} position="relative" backgroundColor="$color1">
            <BottomLoginSheet />
        </YStack>
    )
}
