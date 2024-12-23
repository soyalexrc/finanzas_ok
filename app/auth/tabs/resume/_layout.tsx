import { Stack } from "expo-router";

export default function Layout() {
    return (
        <Stack screenOptions={{ headerShadowVisible: false }}>
            <Stack.Screen name="index" options={{
                title: 'Resumen',
                headerLargeTitle: true
            }} />
        </Stack>
    );
}
