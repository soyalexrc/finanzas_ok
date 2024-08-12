import {useColorScheme, Platform} from 'react-native';
import {View, Text, ScrollView, ToggleGroup, XStack, Button, YStack} from 'tamagui';
import React, {useEffect, useState} from "react";
import {useRouter} from "expo-router";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import CustomHeader from "@/lib/components/ui/CustomHeader";
import {formatByThousands} from "@/lib/helpers/string";
import HeaderTransactionTypeDropdown from "@/lib/components/ui/HeaderTransactionTypeDropdown";
import AccountSelectDropdown from "@/lib/components/ui/AccountSelectDropdown";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import ReportsSheet from "@/lib/components/reports/FiltersSheet";
import {Feather} from "@expo/vector-icons";
import {getTransactions} from "@/lib/db";
import {useSQLiteContext} from "expo-sqlite";
import {useDispatch, useSelector} from "react-redux";
import {
  selectChartPoints,
  selectTransactionsGroupedByCategory, updateChartPoints, updateDetailGroup,
  updateTransactionsGroupedByCategory
} from "@/lib/store/features/transactions/reportSlice";
import {ChartPoints, TransactionsGroupedByCategory, TransactionWithAmountNumber} from "@/lib/types/Transaction";
import {calculateTotalTransactions} from "@/lib/helpers/operations";

export default function ReportScreen() {
  const db = useSQLiteContext();
  const dispatch = useDispatch();
  const chartPoints = useSelector(selectChartPoints);
  const transactions = useSelector(selectTransactionsGroupedByCategory);
  const router = useRouter();
  const schemeColor = useColorScheme()
  const insets = useSafeAreaInsets()
  const isIos = Platform.OS === 'ios';
  const [openFiltersSheet, setOpenFiltersSheet] = useState<boolean>(false);

  function handlePress(item: TransactionsGroupedByCategory) {
    dispatch(updateDetailGroup(item));
    router.push('/(tabs)/(reports)/detailGroup')
  }

  useEffect(() => {
    findTransactionsForReport()
  }, []);


  async function findTransactionsForReport() {
    const {amountsGroupedByDate, transactionsGroupedByCategory} = await getTransactions(db);
    dispatch(updateTransactionsGroupedByCategory(transactionsGroupedByCategory));
    dispatch(updateChartPoints(amountsGroupedByDate))
  }

  function calculateTotalFromChartPoints(points: ChartPoints[]) {
    return points.reduce((acc, item) => acc + item.total, 0).toFixed(2)
  }

  return (
      <YStack flex={1} backgroundColor="$color1">
        <CustomHeader style={ { paddingTop: insets.top }}>
          <AccountSelectDropdown />
          <Button onPress={() => setOpenFiltersSheet(true)} height="$2" borderRadius="$12">
            <FontAwesome name="filter" size={20} color={schemeColor === 'light' ? 'black' : 'white'}/>
          </Button>
          {/*<HeaderTransactionTypeDropdown />*/}
        </CustomHeader>
        <ScrollView
            stickyHeaderIndices={[0]}
            showsVerticalScrollIndicator={false}
            paddingTop={isIos ? insets.top + 35 : 0 }
        >

          {/*Resumen de monto segun filtro (semana, mes, ano)*/}
          <View padding={10} backgroundColor="$color1">
            <Text fontSize={36} >S/ {formatByThousands(calculateTotalFromChartPoints(chartPoints))}</Text>
          </View>

          <View paddingHorizontal={10} marginBottom={20} flexDirection="row" gap={15} marginTop={5}>
            <Text fontSize={16} color="$gray10Dark">Spent this week</Text>
            <View flexDirection="row" gap={5}>
              <View borderRadius={100} padding={3} backgroundColor="$red3Light">
                <MaterialCommunityIcons name="arrow-up" size={16} color="#fa3737" />
              </View>
              <Text fontSize={16} color="$red9Dark">5,320%</Text>
            </View>
          </View>


          {/*Grafica*/}
          <View height={200} margin={10} backgroundColor="$gray12Dark"/>

          {/*Filtros de semana, mes, ano*/}
          <XStack justifyContent="center">
            <ToggleGroup
                marginTop={10}
                marginBottom={20}
                orientation="horizontal"
                id="simple-filter"
                type="single"
            >
              <ToggleGroup.Item value="15" aria-label="Filter by week">
                <Text>Last 15 days</Text>
              </ToggleGroup.Item>
              <ToggleGroup.Item value="45" aria-label="Filter by month">
                <Text>Last 45 days</Text>
              </ToggleGroup.Item>
              <ToggleGroup.Item value="60" aria-label="Filter by year">
                <Text>Last 60 days</Text>
              </ToggleGroup.Item>
            </ToggleGroup>
          </XStack>

          {/*Lista de items*/}
          {
            transactions.map((item, index) => (
                <Button icon={<Text fontSize={30}>{item.category.icon}</Text>} key={item.category.title + index} backgroundColor='$background075' borderRadius={0} onPress={() => handlePress(item)} paddingHorizontal={20} gap={6} flexDirection="row" justifyContent="space-between" alignItems="center">
                  <View
                      flex={1}
                      flexDirection='row'
                      alignItems='center'
                      justifyContent='space-between'
                  >
                    <View flexDirection='row' gap={10} alignItems='center'>
                      {/*{*/}
                      {/*    item.recurrentDate !== 'none' &&*/}
                      {/*    <FontAwesome6 name="arrow-rotate-left" size={16} color="gray"/>*/}
                      {/*}*/}
                      <Text fontSize={18} fontWeight={500}>{item.category.title}</Text>
                      {
                          item.transactions.length > 0 &&
                          <Text fontSize={14} color="$gray10Dark">x {item.transactions.length}</Text>
                      }
                    </View>
                    <Text>S/ {formatByThousands(calculateTotalTransactions(item.transactions))}</Text>
                  </View>
                </Button>
            ))
          }
          <View height={200} />
        </ScrollView>
        <ReportsSheet open={openFiltersSheet} setOpen={setOpenFiltersSheet} />
      </YStack>
  );
}
