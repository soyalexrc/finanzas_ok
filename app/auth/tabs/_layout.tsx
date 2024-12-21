import {withLayoutContext} from "expo-router";
import {
    createNativeBottomTabNavigator,
    NativeBottomTabNavigationEventMap,
    NativeBottomTabNavigationOptions
} from '@bottom-tabs/react-navigation';
import usePlatform from "@/lib/hooks/usePlatform";

const {Navigator} = createNativeBottomTabNavigator();

export const Tabs =
    withLayoutContext<NativeBottomTabNavigationOptions, typeof Navigator, any, NativeBottomTabNavigationEventMap>(Navigator);


export default function Layout() {
    const platform = usePlatform();

    return (
        <Tabs ignoresTopSafeArea hapticFeedbackEnabled translucent={true} barTintColor={platform === 'android' ? 'lightgray' : undefined} >
            <Tabs.Screen
                name="resume"
                options={{
                    title: 'Resume',
                    tabBarActiveTintColor: 'green',
                    tabBarIcon: () => platform === 'android' ? require('@/assets/icons/resume.svg') : ({sfSymbol: 'house'}),
                }}
            />
            <Tabs.Screen
                name="upcoming"
                options={{
                    tabBarActiveTintColor: 'green',
                    title: 'Upcoming',
                    tabBarIcon: () => platform === 'android' ? require('@/assets/icons/upcoming.svg') : ({sfSymbol: 'calendar'}),
                }}
            />
            <Tabs.Screen
                name="search"
                options={{
                    tabBarActiveTintColor: 'green',
                    title: 'Search',
                    tabBarIcon: ({ focused }) => platform === 'android' ? require('@/assets/icons/search.svg') : ({
                        sfSymbol: focused ? 'text.magnifyingglass' : 'magnifyingglass',
                    }),
                }}
            />
            <Tabs.Screen
                name="browse"
                options={{
                    tabBarActiveTintColor: 'green',
                    title: 'Browse',
                    tabBarIcon: ({ focused }) => platform === 'android' ? require('@/assets/icons/browse.svg') : ({
                        sfSymbol: focused ? 'doc.text.image.fill' : 'doc.text.image',
                    }),
                }}
            />
        </Tabs>
    )
}
