import {StyleSheet, View, Text, TouchableOpacity, ScrollView, useColorScheme, Platform} from 'react-native';
import {BlurView} from "expo-blur";
import HeaderDropDownMenu from "@/lib/components/layout/AccountSelectDropdown";
import React, {useState} from "react";
import {useRouter} from "expo-router";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import HeaderTransactionTypeDropdown from "@/lib/components/HeaderTransactionTypeDropdown";
import ReportsResumeItems from "@/lib/components/ReportsResumeItems";
import CustomHeader from "@/lib/components/ui/CustomHeader";

const data = [
  {
    id: "001",
    category: {
      id: 1,
      label: "Groceries",
      icon: "cart"
    },
    isScheduled: true,
    qty: 2,
    value: "80.00"
  },
  {
    id: "002",
    category: {
      id: 2,
      label: "Dining",
      icon: "cutlery"
    },
    qty: 1,
    isScheduled: false,
    value: "23.15"
  },
  {
    id: "003",
    category: {
      id: 3,
      label: "Transportation",
      icon: "bus"
    },
    qty: 1,
    isScheduled: false,
    value: "24.20"
  },
  {
    id: "004",
    category: {
      id: 4,
      label: "Utilities",
      icon: "plug"
    },
    qty: 1,
    isScheduled: false,
    value: "38.99"
  },
  {
    id: "005",
    category: {
      id: 2,
      label: "Dining",
      icon: "cutlery"
    },
    qty: 1,
    isScheduled: false,
    value: "54.00"
  },
  {
    id: "006",
    category: {
      id: 5,
      label: "Shopping",
      icon: "shopping-bag"
    },
    qty: 1,
    isScheduled: false,
    value: "28.50"
  },
  {
    id: "019",
    category: {
      id: 6,
      label: "Personal Care",
      icon: "spa"
    },
    qty: 1,
    isScheduled: false,
    value: "15.00"
  }
  // ... and so on for at least 10 entries
];


export default function ReportScreen() {
  const router = useRouter();
  const schemeColor = useColorScheme()
  const insets = useSafeAreaInsets()
  const isIos = Platform.OS === 'ios';
  const [selectedItem, setSelectedItem] = useState<string>('0')

  function handleDropDownTriggerPress(value: 'on' | 'mixed' | 'off', keyItem: string) {
    setSelectedItem(keyItem);
  }
  return (
      <View style={styles.container}>
        <CustomHeader style={ { paddingTop: insets.top }}>
          <HeaderDropDownMenu />
          <HeaderTransactionTypeDropdown />
        </CustomHeader>
        <ScrollView showsVerticalScrollIndicator={false} style={{ backgroundColor: schemeColor === 'light' ? 'white' : 'black', paddingTop: isIos ? insets.top + 50 : 0 }}>

          {/*Resumen de monto segun filtro (semana, mes, ano)*/}
          <View style={{ paddingHorizontal: 10, marginBottom: 20 }}>
            <Text style={{ fontSize: 36 }}>S/ 520.00</Text>
            <View style={{ flexDirection: 'row', gap: 15, marginTop: 5 }}>
              <Text style={{ fontSize: 16, color: 'gray' }}>Spent this week</Text>
              <View style={{ flexDirection: 'row', gap: 5}}>
               <View style={{ borderRadius: 100, backgroundColor: '#fce1e1', padding: 3 }}>
                 <MaterialCommunityIcons name="arrow-up" size={16} color="#fa3737" />
               </View>
                <Text style={{ fontSize: 16, color: '#fa3737' }}>5,320%</Text>
              </View>
            </View>
          </View>

          {/*Grafica*/}
          <View style={{ height: 200, margin: 10, backgroundColor: 'lightgray' }} />

          {/*Filtros de semana, mes, ano*/}
          <View style={{ flexDirection: 'row', paddingHorizontal: 10, gap: 10, marginVertical: 10 }}>
            <TouchableOpacity style={{ borderStyle: 'solid', borderColor: 'lightgray', borderWidth: 1, borderRadius: 5, paddingVertical: 8, paddingHorizontal: 15}}>
              <Text style={{ fontSize: 16 }}>Week</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ paddingVertical: 8, paddingHorizontal: 15}}>
              <Text style={{ fontSize: 16, color: 'gray' }}>Month</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ paddingVertical: 8, paddingHorizontal: 15}}>
              <Text style={{ fontSize: 16, color: 'gray' }}>Year</Text>
            </TouchableOpacity>
          </View>

          {/*divider*/}
          <View style={{ height: 1, backgroundColor: 'lightgray', marginVertical: 10, marginHorizontal: 20 }} />

          {/*Lista de items*/}
          <ReportsResumeItems data={data} onPress={(id) => router.push('/(tabs)/(reports)/detailGroup')} />
          <View style={{ height: 200 }} />
        </ScrollView>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
