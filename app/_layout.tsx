import {useFonts} from 'expo-font';
import {Slot, Stack, useRouter, useSegments} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {useEffect} from 'react';
import 'react-native-reanimated';
import NetInfo from '@react-native-community/netinfo';
import Providers from "@/lib/components/Providers";
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import {changeNetworkState} from "@/lib/store/features/network/networkSlice";
import {useAuth, useUser} from "@clerk/clerk-expo";
import {loadString, saveString} from "@/lib/utils/storage";
import {Appearance, StatusBar, useColorScheme} from "react-native";
import {selectSettings, updateAppearance} from "@/lib/store/features/settings/settingsSlice";
import {getLocales} from "expo-localization";
import {View} from "tamagui";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const InitialLayout = () => {
  const dispatch = useAppDispatch();
  const { isLoaded, isSignedIn } = useAuth();
  const appearance = useAppSelector(selectSettings).appearance;
  const {user, isLoaded: isUserLoaded} = useUser()
  const segments = useSegments();
  const router = useRouter();
  const colorScheme = useColorScheme()

  const [loaded, error] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  })


  useEffect(() => {
    if (error) throw error;
  }, [error]);

    useEffect(() => {
      if (appearance !== 'system') {
        Appearance.setColorScheme(appearance);
      } else {
        Appearance.setColorScheme(null)
      }
    }, [appearance]);

  useEffect(() => {
    validateAppearanceFromStorage();
    const unsubscribe = NetInfo.addEventListener(
        state => dispatch(changeNetworkState(state))
    )
    return () => {
      unsubscribe()
    }
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    if (!isLoaded) return;
    validateSignInStatus();

  }, [isSignedIn]);

  async function validateSignInStatus() {
    const inAuthGroup = segments[0] === '(tabs)';
    if (isSignedIn && !inAuthGroup) {
      await saveString('userId', user!.id);
      // if users sign then validate if users already have a db version  with date and ask the user if it wants to restore the data
      // await sleep(5000);
      router.replace('/(tabs)');
    } else if (!isSignedIn) {
      router.replace('/');
    }
  }

  if (!loaded && !isLoaded) {
    return <Slot />;
  }

  async function validateAppearanceFromStorage() {
    const valueFromStorage = await loadString('appearance');
    if (valueFromStorage) {
        dispatch(updateAppearance(valueFromStorage as 'system' | 'light' | 'dark'));
    }
  }

  console.log(colorScheme)

  return (
      <>
        <StatusBar barStyle={appearance === 'system' ? (colorScheme === 'dark' ? 'light-content' : 'dark-content') : appearance === 'light' ? 'dark-content' : 'light-content'} />
        <Stack initialRouteName="index">
          <Stack.Screen name="index" options={{headerShown: false}}/>
          <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
          <Stack.Screen name="transactionCreateUpdate" options={{presentation: 'fullScreenModal', headerShown: false, animation: "slide_from_bottom"}}/>
          <Stack.Screen name="emojiSelection" options={{presentation: 'modal', headerShown: false, animation: "slide_from_bottom"}}/>
          <Stack.Screen name="+not-found"/>
        </Stack>
      </>
  )
}

export default function RootLayout() {
  return (
      <Providers>
        <InitialLayout />
      </Providers>
  );
}
