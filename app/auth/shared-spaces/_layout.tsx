import {Stack} from "expo-router";

export default function Layout() {
    return (
        <Stack>
            <Stack.Screen
                name="create"
                options={{
                    title: 'Crear espacio compartido',
                    headerShadowVisible: false,
                    presentation: 'modal'
                }}
            />
        </Stack>
    )
}
