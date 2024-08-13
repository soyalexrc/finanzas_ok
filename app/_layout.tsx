import {useFonts} from 'expo-font';
import {Stack, useRouter, useSegments} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {useEffect} from 'react';
import 'react-native-reanimated';
import NetInfo from '@react-native-community/netinfo';
import Providers from "@/lib/components/Providers";
import {useAppDispatch, useAppSelector} from "@/lib/store/hooks";
import {changeNetworkState} from "@/lib/store/features/network/networkSlice";
import {getAllAccounts, getAllCategories, getTransactionsGroupedAndFiltered} from "@/lib/db";
import {useSQLiteContext} from "expo-sqlite";
import {
  selectAccountGlobally,
  selectSelectedAccountGlobal,
  updateAccountsList
} from "@/lib/store/features/accounts/accountsSlice";
import {updateCategoriesList} from "@/lib/store/features/categories/categoriesSlice";
import {
  selectHomeViewTypeFilter,
  updateTransactionsGroupedByDate
} from "@/lib/store/features/transactions/transactionsSlice";
import {getCurrentWeek} from "@/lib/helpers/date";
import {useAuth} from "@clerk/clerk-expo";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const InitialLayout = () => {
  const dispatch = useAppDispatch();
  const selectedAccount = useAppSelector(selectSelectedAccountGlobal);
  const filterType = useAppSelector(selectHomeViewTypeFilter)
  const db = useSQLiteContext();
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const [loaded, error] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  })

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
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
      updateStore();
    }
  }, [loaded]);

  useEffect(() => {
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === '(tabs)';

    if (isSignedIn && !inAuthGroup) {
      router.replace('/(tabs)');
    } else if (!isSignedIn) {
      router.replace('/');
    }
  }, [isSignedIn]);

  async function updateStore() {
    try {
      dispatch(updateAccountsList(getAllAccounts(db)))
      dispatch(updateCategoriesList(getAllCategories(db)));
      const {start, end} = getCurrentWeek();
      const transactions = await getTransactionsGroupedAndFiltered(db, start.toISOString(), end.toISOString(), filterType.type, selectedAccount.id);
      dispatch(updateTransactionsGroupedByDate(transactions));
    } catch (err) {
      console.log(err);
    }
  }

  if (!loaded && !isLoaded) {
    return null;
  }

  return (
      <Stack>
        <Stack.Screen name="index" options={{headerShown: false}}/>
        <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
        <Stack.Screen name="transactionCreateUpdate" options={{presentation: 'fullScreenModal', headerShown: false, animation: "slide_from_bottom"}}/>
        <Stack.Screen name="+not-found"/>
      </Stack>
  )
}

export default function RootLayout() {
  return (
      <Providers>
        <InitialLayout />
      </Providers>
  );
}
