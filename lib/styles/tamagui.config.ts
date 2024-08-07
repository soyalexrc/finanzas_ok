import * as themes from '@/lib/styles/theme-output';
import { tokens } from '@tamagui/config/v3'
import {createTamagui} from "tamagui";
import defaultConfig from '@tamagui/config/v3';

const tamaguiConfig = createTamagui({
    ...defaultConfig,
    tokens,
    themes,
    // ...the rest of your config
})

export type TamaguiConfig = typeof tamaguiConfig

declare module 'tamagui' {
    // or '@tamagui/core'
    // overrides TamaguiCustomConfig so your custom types
    // work everywhere you import `tamagui`
    interface TamaguiCustomConfig extends TamaguiConfig {}
}

export default tamaguiConfig;

