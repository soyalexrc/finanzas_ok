import {useState} from "react";
import {TouchableOpacity, useColorScheme, View} from "react-native";
import {ScrollView, Separator, Sheet, Text} from "tamagui";
import {Entypo} from "@expo/vector-icons";
import {Locale} from "expo-localization";
import currencies from '@/lib/utils/data/currencies';

type Props = {
    open: boolean;
    setOpen: (value: boolean) => void;
    locales: Locale[];
    currentCode: string
    onSelect: (code: string, symbol: string) => void
}


export default function CurrenciesSheet({open, setOpen, locales, currentCode, onSelect}: Props) {
    const scheme = useColorScheme();
    const [position, setPosition] = useState(0);

    return (

        <Sheet
            forceRemoveScrollEnabled={open}
            modal={false}
            open={open}
            dismissOnOverlayPress
            onOpenChange={setOpen}
            position={position}
            onPositionChange={setPosition}
            snapPoints={[60]}
            snapPointsMode='percent'
            dismissOnSnapToBottom
            zIndex={100_000}
            animation="quick"
        >
            <Sheet.Overlay
                animation="quick"
                enterStyle={{opacity: 0}}
                exitStyle={{opacity: 0}}
            />
            <Sheet.Frame borderTopLeftRadius={12} borderTopRightRadius={12} backgroundColor="$color1" px={10} pb={20}>
                <Text fontSize={20} mb={10} backgroundColor="$color1" pt={20} textAlign="center">Seleccionar</Text>

                <ScrollView flex={1} showsVerticalScrollIndicator={false}>
                    {
                        locales.map(locale => (
                                <TouchableOpacity key={locale.currencyCode!} onPress={() => onSelect(locale.currencyCode!, locale.currencySymbol!)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15 }}>
                                    <Text fontSize={17}>{locale.currencyCode ?? 'NO CODE...'}</Text>
                                    {
                                        currentCode === locale.currencyCode &&
                                        <Entypo name="check" size={24} color={scheme === 'light' ? 'black' : 'white'} />
                                    }
                                </TouchableOpacity>
                            ))
                    }
                    <Separator />

                    {
                        currencies.map(({ code, symbol }) => (
                            <TouchableOpacity key={code} onPress={() => onSelect(code, symbol)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15 }}>
                                <Text fontSize={17}>{code}</Text>
                                {
                                    currentCode === code &&
                                    <Entypo name="check" size={24} color={scheme === 'light' ? 'black' : 'white'} />
                                }
                            </TouchableOpacity>
                        ))
                    }
                </ScrollView>
            </Sheet.Frame>
        </Sheet>
    )
}

