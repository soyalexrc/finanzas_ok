import {Stack} from "expo-router";
import React from "react";
import CustomHeader from "@/lib/components/ui/CustomHeader";

export default function SettingsLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name="index"
            />
        </Stack>
    )
}
