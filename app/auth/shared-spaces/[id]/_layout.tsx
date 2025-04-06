import {Stack} from "expo-router";

export default function Layout() {
    return (
        <Stack>
            <Stack.Screen
                name="edit"
                options={{
                    headerShadowVisible: false,
                    presentation: 'modal'
                }}
            />
            <Stack.Screen
                name="participants"
                options={{
                    headerShadowVisible: false,
                    presentation: 'modal'
                }}
            />
        </Stack>
    )
}
