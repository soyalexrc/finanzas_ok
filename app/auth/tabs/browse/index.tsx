import {Button, Text, View} from "react-native";
import auth from "@react-native-firebase/auth";
import {useRouter} from "expo-router";
import {remove} from "@/lib/utils/storage";

export default function Screen() {
    const router = useRouter();
    const signOut = async () => {
        await remove('access_token')
        await remove('user');

        router.replace('/')
    }

    return (
        <View style={{ marginTop: 100 }}>
            <Text>Browse Screen</Text>
            <Button onPress={signOut} title="Sign out" />
        </View>
    )
}
