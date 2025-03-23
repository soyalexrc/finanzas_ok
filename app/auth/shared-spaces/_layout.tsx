import {Stack} from "expo-router";

export default function Layout() {
    return (
        <Stack>
            <Stack.Screen
                name="create"
                options={{
                    headerShadowVisible: false,
                    presentation: 'modal'
                }}
            />
        </Stack>
    )
}
