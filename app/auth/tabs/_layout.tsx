import {withLayoutContext} from "expo-router";
import {
    createNativeBottomTabNavigator,
    NativeBottomTabNavigationEventMap,
    NativeBottomTabNavigationOptions
} from '@bottom-tabs/react-navigation';
import usePlatform from "@/lib/hooks/usePlatform";
import {Colors} from "@/lib/constants/colors";

const {Navigator} = createNativeBottomTabNavigator();

export const Tabs =
    withLayoutContext<NativeBottomTabNavigationOptions, typeof Navigator, any, NativeBottomTabNavigationEventMap>(Navigator);


export default function Layout() {
    const platform = usePlatform();

    return (
        <Tabs
            ignoresTopSafeArea
            hapticFeedbackEnabled
            translucent={true}
            barTintColor={platform === 'android' ? '#fff' : undefined}
            tabBarActiveTintColor={Colors.primary}
            tabBarInactiveTintColor="#888"
            activeIndicatorColor={Colors.primaryLight}
        >
            <Tabs.Screen
                name="resume"
                options={{
                    title: 'Resumen',
                    tabBarActiveTintColor: Colors.primary,
                    tabBarIcon: ({focused}) => platform === 'android' ? require('@/assets/icons/resume.svg') : ({sfSymbol: 'house'}),
                }}
            />
            <Tabs.Screen
                name="upcoming"
                options={{
                    tabBarActiveTintColor: Colors.primary,
                    title: 'Calendario',
                    tabBarIcon: () => platform === 'android' ? require('@/assets/icons/upcoming.svg') : ({sfSymbol: 'calendar'}),
                }}
            />
            <Tabs.Screen
                name="search"
                options={{
                    tabBarActiveTintColor: Colors.primary,
                    title: 'Buscar',
                    tabBarIcon: ({ focused }) => platform === 'android' ? require('@/assets/icons/search.svg') : ({
                        sfSymbol: focused ? 'text.magnifyingglass' : 'magnifyingglass',
                    }),
                }}
            />
            <Tabs.Screen
                name="browse"
                options={{
                    tabBarActiveTintColor: Colors.primary,
                    title: 'Explorar',
                    tabBarIcon: ({ focused }) => platform === 'android' ? require('@/assets/icons/browse.svg') : ({
                        sfSymbol: focused ? 'doc.text.image.fill' : 'doc.text.image',
                    }),
                }}
            />
        </Tabs>
    )
}
