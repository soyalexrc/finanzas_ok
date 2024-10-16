import * as DropdownMenu from "zeego/dropdown-menu";
import {StyleSheet, TouchableOpacity, useColorScheme} from "react-native";
import {Entypo} from "@expo/vector-icons";
import * as ContextMenu from "zeego/context-menu";
import {useTranslation} from "react-i18next";


export default function TransactionsSettingsDropdown({resetTab, fn}: {resetTab: () => void, fn: () => void}) {
    const scheme = useColorScheme();
    const {t} = useTranslation()




    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger>
                <TouchableOpacity>
                    <Entypo name="dots-three-horizontal" size={24}
                            color={scheme === 'light' ? 'black' : 'white'}/>
                </TouchableOpacity>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content loop={false} side='bottom' sideOffset={0} align='center' alignOffset={0} collisionPadding={0} avoidCollisions={true}>
                {/*<DropdownMenu.CheckboxItem key="hidden_feature"*/}
                {/*                           value={currentTransaction.is_hidden_transaction > 0 ? 'on' : 'off'}*/}
                {/*                           onValueChange={(value) => onSelect(value, 'hidden_feature')}>*/}
                {/*    <DropdownMenu.ItemTitle>Is hidden transaction</DropdownMenu.ItemTitle>*/}
                {/*    <DropdownMenu.ItemIndicator/>*/}
                {/*</DropdownMenu.CheckboxItem>*/}
                    <ContextMenu.Item key='delete' destructive
                                      onSelect={fn}>
                        <ContextMenu.ItemTitle>{t('COMMON.DELETE')}</ContextMenu.ItemTitle>
                        <ContextMenu.ItemIcon
                            ios={{
                                name: 'trash'
                            }}
                        />
                    </ContextMenu.Item>
            </DropdownMenu.Content>
        </DropdownMenu.Root>

    )
}
