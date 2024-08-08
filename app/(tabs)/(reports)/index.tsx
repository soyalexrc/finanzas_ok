import {StyleSheet, TouchableOpacity, useColorScheme, Platform} from 'react-native';
import {View, Text, ScrollView, ToggleGroup, XStack, Button} from 'tamagui';
import HeaderDropDownMenu from "@/lib/components/layout/AccountSelectDropdown";
import React, {useState} from "react";
import {useRouter} from "expo-router";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import HeaderTransactionTypeDropdown from "@/lib/components/HeaderTransactionTypeDropdown";
import CustomHeader from "@/lib/components/ui/CustomHeader";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import {formatByThousands} from "@/lib/helpers/string";

const data = [
  {
    id: "001",
    category: {
      id: 1,
      title: "Groceries",
      icon: "🥑"
    },
    recurrentDate: 'weekly',
    qty: 2,
    amount: "80.00"
  },
  {
    id: "002",
    category: {
      id: 2,
      title: "Dining",
      icon: "🍽️"
    },
    qty: 1,
    recurrentDate: 'none',
    amount: "23.15"
  },
  {
    id: "003",
    category: {
      id: 3,
      title: "Transportation",
      icon: "🚌"
    },
    qty: 1,
    recurrentDate: 'none',
    amount: "24.20"
  },
  {
    id: "004",
    category: {
      id: 4,
      title: "Utilities",
      icon: "🚙"
    },
    qty: 1,
    recurrentDate: 'none',
    amount: "38.99"
  },
  {
    id: "005",
    category: {
      id: 2,
      title: "Dining",
      icon: "🍽️"
    },
    qty: 1,
    recurrentDate: 'none',
    amount: "54.00"
  },
  {
    id: "006",
    category: {
      id: 5,
      title: "Shopping",
      icon: "🛍️"
    },
    qty: 1,
    recurrentDate: 'none',
    amount: "28.50"
  },
  {
    id: "019",
    category: {
      id: 6,
      title: "Personal Care",
      icon: "💄"
    },
    qty: 1,
    recurrentDate: 'none',
    amount: "15.00"
  }
  // ... and so on for at least 10 entries
];


export default function ReportScreen() {
  const router = useRouter();
  const schemeColor = useColorScheme()
  const insets = useSafeAreaInsets()
  const isIos = Platform.OS === 'ios';


  function handlePress(item: any) {
    router.push('/(tabs)/(reports)/detailGroup')
  }

  return (
      <View flex={1} backgroundColor="$color2">
        <CustomHeader style={ { paddingTop: insets.top }}>
          <HeaderDropDownMenu />
          <HeaderTransactionTypeDropdown />
        </CustomHeader>
        <ScrollView showsVerticalScrollIndicator={false} paddingTop={isIos ? insets.top + 50 : 0 }>

          {/*Resumen de monto segun filtro (semana, mes, ano)*/}
          <View paddingHorizontal={10} marginBottom={20}>
            <Text fontSize={36} >S/ 520.00</Text>
            <View flexDirection="row" gap={15} marginTop={5}>
              <Text fontSize={16} color="$gray10Dark">Spent this week</Text>
              <View flexDirection="row" gap={5}>
               <View borderRadius={100} padding={3} backgroundColor="$red3Light">
                 <MaterialCommunityIcons name="arrow-up" size={16} color="#fa3737" />
               </View>
                <Text fontSize={16} color="$red9Dark">5,320%</Text>
              </View>
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
                disableDeactivation={true}
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
            data.map(item => (
                <Button key={item.id} backgroundColor='$background0' borderRadius={0} onPress={() => handlePress(item)} paddingHorizontal={20} gap={6} flexDirection="row" justifyContent="space-between" alignItems="center">
                  <Text fontSize={30}>{item.category.icon}</Text>
                  <View
                      flex={1}
                      flexDirection='row'
                      alignItems='center'
                      justifyContent='space-between'
                      paddingVertical={10}
                  >
                    <View flexDirection='row' gap={10} alignItems='center'>
                      {/*{*/}
                      {/*    item.recurrentDate !== 'none' &&*/}
                      {/*    <FontAwesome6 name="arrow-rotate-left" size={16} color="gray"/>*/}
                      {/*}*/}
                      <Text fontSize={18} fontWeight={500}>{item.category.title}</Text>
                      {
                          item.qty &&
                          <Text fontSize={14} color="$gray10Dark">x {item.qty}</Text>
                      }
                    </View>
                    <Text>S/ {formatByThousands(item.amount)}</Text>
                  </View>
                </Button>
            ))
          }
          <View height={200} />
        </ScrollView>
      </View>
  );
}
