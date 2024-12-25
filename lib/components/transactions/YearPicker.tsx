import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

interface YearPickerModalProps {
    visible: boolean;
    onClose: () => void;
    selectedYear: number;
    onYearChange: (year: number) => void;
}

function YearPickerModal({ visible, onClose, selectedYear, onYearChange }: YearPickerModalProps) {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 2020 + 1 }, (_, i) => 2020 + i);
    return (
        <Modal
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Selecciona un anio</Text>
                    <Picker
                        style={{width: '100%'}}
                        selectedValue={selectedYear}
                        onValueChange={(itemValue) => onYearChange(itemValue)}
                    >
                        {years.map((year) => (
                            <Picker.Item key={year} label={year.toString()} value={year} />
                        ))}
                    </Picker>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Text style={styles.closeButtonText}>Aceptar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

export default function YearPickerButton() {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    return (
        <View>
            <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.button}>
                <Text style={styles.buttonText}>Select Year</Text>
            </TouchableOpacity>
            <YearPickerModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                selectedYear={selectedYear}
                onYearChange={(year) => setSelectedYear(year)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: 300,
        padding: 20,
        backgroundColor: '#FFF',
        borderRadius: 10,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        marginBottom: 10,
    },
    closeButton: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#007BFF',
        borderRadius: 5,
    },
    closeButtonText: {
        color: '#FFF',
        fontSize: 16,
    },
});
