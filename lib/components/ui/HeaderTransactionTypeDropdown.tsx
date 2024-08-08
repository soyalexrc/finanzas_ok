import {StyleSheet, TouchableOpacity} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React from "react";
import * as DropdownMenu from "zeego/dropdown-menu";


export default function HeaderTransactionTypeDropdown() {
    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger>
                <TouchableOpacity style={styles.createButton}>
                    <MaterialCommunityIcons name="dots-horizontal" size={20} color="black"/>
                </TouchableOpacity>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content loop={false} side='bottom' sideOffset={0} align='center' alignOffset={0}
                                  collisionPadding={0} avoidCollisions={true}>
                <DropdownMenu.CheckboxItem key='expenses' value='on'>
                    <DropdownMenu.ItemTitle>Expenses</DropdownMenu.ItemTitle>
                    <DropdownMenu.ItemIndicator/>
                </DropdownMenu.CheckboxItem>
                <DropdownMenu.CheckboxItem key='incomes' value='off'>
                    <DropdownMenu.ItemTitle>Incomes</DropdownMenu.ItemTitle>
                    <DropdownMenu.ItemIndicator/>
                </DropdownMenu.CheckboxItem>
            </DropdownMenu.Content>
        </DropdownMenu.Root>
    )
}

const styles = StyleSheet.create({
    createButton: {
        borderRadius: 100,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: 'black',
        padding: 3
    }
})
