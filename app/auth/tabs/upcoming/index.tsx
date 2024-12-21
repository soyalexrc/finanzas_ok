import {Button, Text, View} from "react-native";
import auth from "@react-native-firebase/auth";

export default function Screen() {

    const signOut = async () => {
        await auth().signOut();
    }

    return (
        <View>
            <Text>Upcoming Screen</Text>
            <Button onPress={signOut} title="Sign out" />
        </View>
    )
}
