import {useState} from "react";
import {TouchableOpacity, useColorScheme} from "react-native";
import {ScrollView, Separator, Sheet, Text} from "tamagui";
import {Entypo} from "@expo/vector-icons";
import {Locale} from "expo-localization";
import currencies from '@/lib/utils/data/currencies';
import {useTranslation} from "react-i18next";

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
    const {t} = useTranslation()
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
        >
            <Sheet.Overlay
                enterStyle={{opacity: 0}}
                exitStyle={{opacity: 0}}
            />
            <Sheet.Frame borderTopLeftRadius={12} borderTopRightRadius={12} backgroundColor="$color1" px={10} pb={20}>
                <Text fontSize={20} mb={10} backgroundColor="$color1" pt={20} textAlign="center">{t('COMMON.SELECT')}</Text>

                <ScrollView flex={1} showsVerticalScrollIndicator={false}>
                    {
                        locales.map(locale => (
                                <TouchableOpacity accessible={true} accessibilityLabel={`Local currency detected: ${locale.currencyCode}`} key={locale.currencyCode!} onPress={() => onSelect(locale.currencyCode!, locale.currencySymbol!)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15 }}>
                                    <Text fontSize={17}>{locale.currencyCode ?? 'NO CODE...'} ({locale.currencySymbol ?? ''})</Text>
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
                                <Text fontSize={17}>{code} ({symbol})</Text>
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

