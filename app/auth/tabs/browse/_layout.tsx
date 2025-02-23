import { Stack } from "expo-router";

export default function Layout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    headerLargeTitle: true,
                    title: 'Explorar',
                    headerShadowVisible: false
                }}
            />
        </Stack>
    );
}
