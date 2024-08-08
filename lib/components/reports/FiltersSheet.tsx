import React, {useState} from "react";
import {Button, Sheet, Text, TextArea, View} from "tamagui";
import {Platform} from "react-native";

type Props = {
    open: boolean;
    setOpen: (value: boolean) => void;
}

export default function ReportsSheet({open, setOpen}: Props) {
    const [position, setPosition] = useState(0);
    const isIos = Platform.OS === 'ios';
    return (
        <Sheet
            forceRemoveScrollEnabled={open}
            modal={false}
            open={open}
            dismissOnOverlayPress
            onOpenChange={setOpen}
            position={position}
            onPositionChange={setPosition}
            snapPoints={[75]}
            snapPointsMode='percent'
            dismissOnSnapToBottom
            zIndex={100_000}
            animation="medium"
        >
            <Sheet.Overlay
                animation="lazy"
                enterStyle={{ opacity: 0 }}
                exitStyle={{ opacity: 0 }}
            />

            <Sheet.Handle />

            <Sheet.ScrollView  showsVerticalScrollIndicator={false} backgroundColor="$background">
                <Text textAlign="center" marginVertical={15} fontSize={16} fontWeight="bold" color="$gray10Dark">Filters</Text>
                {
                    Array.from({length: 20}).map((_, index) => (
                        <View key={index} padding={10} flexDirection="row" justifyContent="space-between" alignItems="center">
                            <Text>Filter {index + 1}</Text>
                            <Button onPress={() => {}}>
                                <Text>Apply</Text>
                            </Button>
                        </View>
                        ))
                }
                <View height={isIos ? 100 : 0} />

            </Sheet.ScrollView>
        </Sheet>
    )
}
