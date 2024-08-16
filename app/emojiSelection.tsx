import {Text, ToggleGroup, View, XStack} from "tamagui";
import {
    animalsAndNature,
    foodAndDrink,
    smileys,
    people,
    objects,
    travel,
    symbols,
    flags,
    activities
} from '@/lib/utils/data/emojis';
import {FlashList} from "@shopify/flash-list";
import {TouchableOpacity} from "react-native";
import {useState} from "react";
import {useAppDispatch} from "@/lib/store/hooks";
import {changeEmoji} from "@/lib/store/features/ui/uiSlice";
import {useRouter} from "expo-router";

const data = [
    {
        icon: '😃',
        value: 'smileys',
    },
    {
        icon: '👱',
        value: 'people',
    },
    {
        icon: '🐻',
        value: 'animals',
    },
    {
        icon: '🍔',
        value: 'food',
    },
    {
        icon: '⚽',
        value: 'activities',
    },
    {
        icon: '🚀',
        value: 'travel',
    },
    {
        icon: '💡',
        value: 'objects',
    },
    {
        icon: '💕',
        value: 'symbols',
    },
    {
        icon: '🎌',
        value: 'flags',
    }
]

export default function Screen() {
    const [category, setCategory] = useState('smileys');
    const dispatch = useAppDispatch();
    const router = useRouter();

    function getCurrentCategory() {
        switch (category) {
            case 'smileys':
                return smileys;
            case 'people':
                return people;
            case 'animals':
                return animalsAndNature;
            case 'food':
                return foodAndDrink;
            case 'activities':
                return activities;
            case 'travel':
                return travel;
            case 'objects':
                return objects;
            case 'symbols':
                return symbols;
            case 'flags':
                return flags;
        }
    }

    function onPickEmoji(emoji: string) {
        dispatch(changeEmoji(emoji));
        router.back();
    }

    return (
        <View flex={1} backgroundColor="$color1">
            <XStack justifyContent='center' p={20}>
                <Text fontSize={20}>Emoji</Text>
            </XStack>

            <XStack justifyContent="center" mb={10}>
                <ToggleGroup
                    orientation="horizontal"
                    type="single" // since this demo switches between loosen types
                    size="$3"
                    value={category}
                    onValueChange={(value) => setCategory(value)}
                    disableDeactivation={true}
                >
                    {
                        data.map(item => (
                            <ToggleGroup.Item key={item.value} value={item.value} aria-label="Symbols">
                                <Text fontSize={18}>{item.icon}</Text>
                            </ToggleGroup.Item>
                        ))
                    }
                </ToggleGroup>
            </XStack>

                <FlashList
                    data={getCurrentCategory()}
                    estimatedItemSize={500}
                    numColumns={6}
                    keyExtractor={(item) => item}
                    renderItem={({item}) => (
                        <TouchableOpacity onPress={() => onPickEmoji(item)} style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                            <Text style={{fontSize: 30}}>{item}</Text>
                        </TouchableOpacity>
                    )}
                />


            <View height={20}/>
        </View>
    )
}
