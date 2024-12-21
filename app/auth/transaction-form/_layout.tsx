import {Stack} from "expo-router";

export default function Layout() {
    return (
        <Stack>
            <Stack.Screen name="account"/>
            <Stack.Screen
                name="category"
                options={{
                    title: 'Seleccionar Categoria',
                    headerBackTitle: 'Atras'
                }}
            />
            <Stack.Screen
                name="description"
                options={{
                    title: 'Descripcion',
                    headerBackTitle: 'Atras'
                }}
            />
            <Stack.Screen
                name="documents"
                options={{
                    title: 'Documentos',
                    headerBackTitle: 'Atras'
                }}
            />
        </Stack>
    )
}
