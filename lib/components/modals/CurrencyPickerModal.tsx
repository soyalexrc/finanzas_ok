import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import currencies from '@/lib/utils/data/currencies';
import {Currency} from "@/lib/types/transaction";

interface CurrencyPickerModalProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (currency: Currency) => void;
}

const CurrencyPickerModal: React.FC<CurrencyPickerModalProps> = ({ visible, onClose, onSelect }) => {
    const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);

    const handleSelect = (currency: Currency) => {
        setSelectedCurrency(currency);
        onSelect(currency);
        onClose();
    };

    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalBackground}>
                <View style={styles.modalContent}>
                    <Text style={styles.title}>Selecciona Moneda</Text>
                    <FlatList
                        data={currencies}
                        keyExtractor={(item) => item.code}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.currencyItem}
                                onPress={() => handleSelect(item)}
                            >
                                <Text style={styles.currencyText}>{item.symbol} - {item.name}</Text>
                            </TouchableOpacity>
                        )}
                    />
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeButtonText}>Cerrar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '90%',
        height: '80%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    currencyItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    currencyText: {
        fontSize: 16,
    },
    closeButton: {
        marginTop: 20,
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#007BFF',
        borderRadius: 5,
    },
    closeButtonText: {
        color: 'white',
        fontSize: 16,
    },
});

export default CurrencyPickerModal;
