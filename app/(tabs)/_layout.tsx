import { useRouter} from 'expo-router';
import {Tabs} from '@/lib/components/ui/Tabs';


// import {resetCurrentTransaction} from "@/lib/store/features/transactions/transactionsSlice";
import {useAppDispatch} from "@/lib/store/hooks";
// import * as Haptics from "expo-haptics";
import {useTheme} from "tamagui";

export default function TabLayout() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const theme = useTheme();
    // async function onPressNewTransaction() {
    //     await Haptics.selectionAsync();
    //     dispatch(resetCurrentTransaction());
    //     router.push('/transactionCreateUpdate');
    // }

    return (
        <Tabs ignoresTopSafeArea hapticFeedbackEnabled screenOptions={{
            tabBarActiveTintColor: theme.color10?.val,
            // tabBarStyle: isIos ? {
            //     position: 'absolute',
            //     borderTopWidth: 0,
            //     paddingHorizontal: 30
            // } : {borderTopWidth: 0, elevation: 0, paddingHorizontal: 30},
            tabBarItemStyle: {
                height: 60,
                marginTop: 2,
            },
        }}>
            <Tabs.Screen
                name="home"
                options={{
                    title: 'Resume',
                    tabBarIcon: () => ({ sfSymbol: 'house' }),
                }}
            />
            <Tabs.Screen
                name="paymentScheduling"
                options={{
                    title: 'Upcoming',
                    tabBarIcon: () => ({ sfSymbol: 'calendar' }),
                }}
            />
            <Tabs.Screen
                name="wallet"
                options={{
                    title: 'Wallet',
                    tabBarIcon: () => ({ sfSymbol: 'wallet.bifold.fill' }),
                }}
            />
            <Tabs.Screen
                name="search"
                options={{
                    title: 'Search',
                    tabBarIcon: () => ({ sfSymbol: 'magnifyingglass' }),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: () => ({ sfSymbol: 'gear' }),
                }}
            />
        </Tabs>
        // <Tabs
        //     screenOptions={{
        //         tabBarActiveTintColor: theme.color10?.val,
        //         tabBarStyle: isIos ? {
        //             position: 'absolute',
        //             borderTopWidth: 0,
        //             paddingHorizontal: 30
        //         } : {borderTopWidth: 0, elevation: 0, paddingHorizontal: 30},
        //         tabBarItemStyle: {
        //             height: 60,
        //             marginTop: 2,
        //         },
        //         tabBarBackground: () => <CustomBottomBar/>
        //     }}>
        //     <Tabs.Screen
        //         name="index"
        //         options={{
        //             title: '',
        //             headerShown: false,
        //             tabBarIcon: ({color, focused}) => (
        //                 <Feather name="clock" size={28} color={color}/>
        //             ),
        //         }}
        //     />
        //     <Tabs.Screen
        //         name="paymentScheduling"
        //         options={{
        //             title: '',
        //             headerShown: false,
        //             tabBarIcon: ({color}) => (
        //                 <Entypo name="calendar" size={28} color={color}/>
        //             )
        //         }}
        //     />
        //     <Tabs.Screen
        //         name="action"
        //         options={{
        //             title: '',
        //             tabBarIcon: () => (
        //                 <TouchableOpacity onPress={onPressNewTransaction}
        //                     style={{
        //                         backgroundColor: theme.color10?.val,
        //                         width: 40,
        //                         height: 40,
        //                         borderRadius: 25,
        //                         justifyContent: 'center',
        //                         alignItems: 'center',
        //                         position: 'absolute',
        //                         // bottom: 5,
        //                         // zIndex: 100,
        //                         // shadowColor: '#000',
        //                         // shadowOffset: {
        //                         //     width: 0,
        //                         //     height: 2,
        //                         // },
        //                         // shadowOpacity: 0.25,
        //                         // shadowRadius: 3.84,
        //                         // elevation: 5,
        //                     }}
        //                 >
        //                     <Feather name="plus" size={20} color="white"/>
        //                 </TouchableOpacity>
        //             )
        //         }}
        //         listeners={() => ({
        //             tabPress: e => {
        //                 e.preventDefault();
        //             }
        //         })}
        //     />
        //     <Tabs.Screen
        //         name="wallet"
        //         options={{
        //             title: '',
        //             headerShown: false,
        //             tabBarIcon: ({color}) => (
        //                 <Entypo name="wallet" size={28} color={color}/>
        //             )
        //         }}
        //     />
        //     <Tabs.Screen
        //         name="(reports)"
        //         options={{
        //             headerShown: false,
        //             title: '',
        //             tabBarItemStyle: {
        //                 display: 'none'
        //             },
        //             tabBarIcon: ({color, focused}) => (
        //                 <Feather name="bar-chart" size={28} color={color}/>
        //             ),
        //         }}
        //         listeners={() => ({
        //             tabPress: e => {
        //                 e.preventDefault();
        //                 Alert.alert(t('COMMON.WARNING'), t('COMMON.MESSAGES.SCREEN_UNDER_DEVELOPMENT'))
        //             }
        //         })}
        //     />
        //     <Tabs.Screen
        //         name="(settings)"
        //         options={{
        //             title: '',
        //             headerShown: false,
        //             tabBarIcon: ({color, focused}) => (
        //                 <Feather name="(settings)" size={28} color={color}/>
        //             ),
        //         }}
        //     />
        // </Tabs>
    );
}
