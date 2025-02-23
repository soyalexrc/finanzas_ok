import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { CurrencyV2, selectCurrenciesList } from "@/lib/store/features/transactions/currencies.slice";
import { useRouter } from "expo-router";
import { selectCurrency, updateCurrency } from "@/lib/store/features/transactions/transactions.slice";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { useAuth } from "@/lib/context/AuthContext";
import api from "@/lib/utils/api";
import endpoints from "@/lib/utils/api/endpoints";
import {toast} from "sonner-native";
import {load, save} from "@/lib/utils/storage";

export default function Screen() {
    const currencies = useAppSelector(selectCurrenciesList);
    const selectedCurrency = useAppSelector(selectCurrency);
    const dispatch = useAppDispatch();
    const { user, token, setUser } = useAuth();
    const router = useRouter();
    const [tab, setTab] = useState<number>(0);

    const handleSelect = (currency: CurrencyV2) => {
        dispatch(updateCurrency(currency));
        router.back();
    };

    async function toggleFavorite(currencyId: string) {
        const payload = {
            userId: user._id,
            currencyId
        }
        try {
            const response = await api.post(endpoints.user.markFavCurrency, payload, {
                headers: {
                    authorization: `Bearer ${token}`
                }
            })

            if (response.status === 200 || response.status === 201) {
                const newUser = {
                    ...user,
                    favCurrencies: response.data.favCurrencies
                }
                await save('user', newUser);
                setUser(newUser)
                toast.success(response.data.message, {
                    className: 'bg-green-500',
                    duration: 6000,
                    icon: <Ionicons name="checkmark-circle" size={24} color="green"/>,
                })
            } else {
                toast.error('Ocurrio un error', {
                    className: 'bg-red-500',
                    description: response.data.message,
                    duration: 6000,
                    icon: <Ionicons name="close-circle" size={24} color="red"/>,
                });
            }

        } catch (error: any) {
            toast.error('Ocurrio un error', {
                className: 'bg-red-500',
                description: error.message,
                duration: 6000,
                icon: <Ionicons name="close-circle" size={24} color="red"/>,
            });
        }
    }

    // Filter currencies based on the selected tab
    const displayedCurrencies = currencies
        .filter(currency => (tab === 0 ? user?.favCurrencies?.includes(currency._id) : true)) // Filter for favorites if tab === 0
        .slice() // Create a shallow copy before sorting
        .sort((a, b) => {
            const aIsFav = user?.favCurrencies?.includes(a._id) ? -1 : 1;
            const bIsFav = user?.favCurrencies?.includes(b._id) ? -1 : 1;
            return aIsFav - bIsFav; // Moves favorites to the top
        });


    return (
        <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.container}>
            <SegmentedControl
                values={['Favoritas', 'Todas']}
                selectedIndex={tab}
                style={{ marginBottom: 10 }}
                onChange={(event) => setTab(event.nativeEvent.selectedSegmentIndex)}
            />

            {displayedCurrencies?.map(currency => {
                const isSelected = currency._id === selectedCurrency?._id;
                const isFavorite = user?.favCurrencies?.includes(currency._id);

                return (
                    <View key={currency._id} style={styles.row}>
                        <TouchableOpacity onPress={() => toggleFavorite(currency._id)} style={styles.iconButton}>
                            <Ionicons
                                name={isFavorite ? "star" : "star-outline"}
                                size={22}
                                color={isFavorite ? "#FFD700" : "#B0B0B0"}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.currencyItem, isSelected && styles.selectedItem]}
                            onPress={() => handleSelect(currency)}
                        >
                            <Text style={[styles.currencyText, isSelected && styles.selectedText]}>
                                {currency.code} - {currency.name} ({currency.symbol})
                            </Text>
                        </TouchableOpacity>
                    </View>
                );
            })}
            <View style={{ height: 100 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 5,
    },
    currencyItem: {
        flex: 1,
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 8,
        elevation: 2, // Subtle shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    selectedItem: {
        backgroundColor: '#007AFF', // Highlight color (blue)
    },
    currencyText: {
        fontSize: 16,
        color: '#333',
    },
    selectedText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    iconButton: {
        marginRight: 10,
    },
});
