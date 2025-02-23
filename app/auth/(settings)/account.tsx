import {SafeAreaView, ScrollView, StyleSheet, View} from "react-native";

export default function Screen() {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.container}>

            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    }
})
