import {tokens} from '@tamagui/config/v3'
import * as defaultTheme from '@/lib/styles/green'
import * as redTheme from '@/lib/styles/red'
import * as blueTheme from '@/lib/styles/blue'
import * as yellowTheme from '@/lib/styles/yellow'
import * as purpleTheme from '@/lib/styles/purple'
import * as blackTheme from '@/lib/styles/black'
import {createTamagui, Variable} from "tamagui";
import defaultConfig from '@tamagui/config/v3';
import {CustomTheme} from "@/lib/store/features/ui/uiSlice";


type ConfigTamaguiTheme = { [p: string]: { [p: string]: string | number | Variable<any> } } | undefined


const dynamicTamaguiConfig = (theme: CustomTheme) => {
    let themes: any = {};

    switch (theme) {
        case 'red':
            themes = redTheme;
            break;
        case 'green':
            themes = defaultTheme;
            break;
        case 'blue':
            themes = blueTheme;
            break;
        case 'yellow':
            themes = yellowTheme;
            break;
        case 'purple':
            themes = purpleTheme;
            break;
        case 'black':
            themes = blackTheme;
            break;
        default:
            themes = defaultTheme
    }

    return createTamagui({
        ...defaultConfig,
        tokens,
        themes,
    })
}

const tamaguiConfig = createTamagui({
    ...defaultConfig,
    tokens,
    themes: defaultTheme as any,
    // ...the rest of your config
})

export type TamaguiConfig = typeof tamaguiConfig

declare module 'tamagui' {
    // or '@tamagui/core'
    // overrides TamaguiCustomConfig so your custom types
    // work everywhere you import `tamagui`
    interface TamaguiCustomConfig extends TamaguiConfig {
    }
}

export default dynamicTamaguiConfig;

