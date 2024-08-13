import {View, Text, ScrollView, YGroup, ListItem, Separator, Square, GetThemeValueForKey, XStack} from 'tamagui';
import CustomHeader from "@/lib/components/ui/CustomHeader";
import React from "react";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {Platform} from "react-native";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import {AntDesign} from "@expo/vector-icons";

export default function SettingsScreen() {
    const insets = useSafeAreaInsets();
    const isIos = Platform.OS === 'ios';

    return (
        <View backgroundColor="$color1" flex={1}>
            <CustomHeader style={{paddingTop: insets.top}} centered={true}>
                <Text fontSize="$6">Settings</Text>
            </CustomHeader>

            <ScrollView showsVerticalScrollIndicator={false} paddingTop={isIos ? insets.top + 50 : 20}>
                <YGroup alignSelf="center" bordered marginHorizontal={16} marginBottom={40}  separator={<Separator />}>
                    <YGroup.Item>
                        <ListItem
                            hoverTheme
                            pressTheme
                            title="Appereance"
                            icon={<IconWrapper bgColor="black" icon={<MaterialIcons name='dark-mode' size={20} color="white" />} />}
                            iconAfter={<Entypo name="chevron-small-right" size={24} />}
                        />
                    </YGroup.Item>
                    <YGroup.Item>
                        <ListItem
                            hoverTheme
                            pressTheme
                            title="Notifications"
                            icon={<IconWrapper bgColor="$red9Light" icon={<MaterialIcons name='notifications' size={20} color="white" />} />}
                            iconAfter={<Entypo name="chevron-small-right" size={24} />}
                        />
                    </YGroup.Item>
                    <YGroup.Item>
                        <ListItem
                            hoverTheme
                            pressTheme
                            title="Common Currency"
                            icon={<IconWrapper bgColor="$green9Light" icon={<MaterialIcons name='attach-money' size={20} color="white" />} />}
                            iconAfter={<Entypo name="chevron-small-right" size={24} />}
                        />
                    </YGroup.Item>
                    <YGroup.Item>
                        <ListItem
                            hoverTheme
                            pressTheme
                            title="Language"
                            icon={<IconWrapper bgColor="$blue9Light" icon={<MaterialIcons name='language' size={20} color="white" />} />}
                            iconAfter={<Entypo name="chevron-small-right" size={24} />}
                        />
                    </YGroup.Item>
                </YGroup>

                <YGroup alignSelf="center" bordered marginHorizontal={16} marginBottom={40}  separator={<Separator />}>
                    <YGroup.Item>
                        <ListItem
                            hoverTheme
                            pressTheme
                            title="Accounts"
                            icon={<IconWrapper bgColor="$blue11Light" icon={<MaterialIcons name='account-balance-wallet' size={20} color="white" />} />}
                            iconAfter={<Entypo name="chevron-small-right" size={24} />}
                        />
                    </YGroup.Item>
                    <YGroup.Item>
                        <ListItem
                            hoverTheme
                            pressTheme
                            title="Categories"
                            icon={<IconWrapper bgColor="$orange10Light" icon={<MaterialIcons name='format-list-bulleted' size={20} color="white" />} />}
                            iconAfter={<Entypo name="chevron-small-right" size={24} />}
                        />
                    </YGroup.Item>
                    <YGroup.Item>
                        <ListItem
                            disabled
                            hoverTheme
                            pressTheme
                            title="Import Data"
                            icon={<IconWrapper bgColor="$pink10Light" icon={<MaterialIcons name='file-upload' size={20} color="white" />} />}
                            iconAfter={<Entypo name="chevron-small-right" size={24} />}
                        />
                    </YGroup.Item>
                    <YGroup.Item>
                        <ListItem
                            hoverTheme
                            pressTheme
                            title="Export Data"
                            icon={<IconWrapper bgColor="$purple10Light" icon={<MaterialIcons name='file-download' size={20} color="white" />} />}
                            iconAfter={<Entypo name="chevron-small-right" size={24} />}
                        />
                    </YGroup.Item>
                    <YGroup.Item>
                        <ListItem
                            hoverTheme
                            pressTheme
                            title="Erase Data"
                            icon={<IconWrapper bgColor="$red11Light" icon={<MaterialIcons name='delete-forever' size={20} color="white" />} />}
                            iconAfter={<Entypo name="chevron-small-right" size={24} />}
                        />
                    </YGroup.Item>
                </YGroup>

                <YGroup alignSelf="center" bordered marginHorizontal={16} marginBottom={40}  separator={<Separator />}>
                    <YGroup.Item>
                        <ListItem
                            hoverTheme
                            pressTheme
                            title="Contact Developer"
                            icon={<IconWrapper bgColor="$blue8Light" icon={<MaterialIcons name='email' size={20} color="white" />} />}
                            iconAfter={<Entypo name="chevron-small-right" size={24} />}
                        />
                    </YGroup.Item>
                    <YGroup.Item>
                        <ListItem
                            hoverTheme
                            pressTheme
                            title="Rate app on App Store"
                            icon={<IconWrapper bgColor="$orange9Light" icon={<MaterialIcons name='star' size={20} color="white" />} />}
                            iconAfter={<Entypo name="chevron-small-right" size={24} />}
                        />
                    </YGroup.Item>
                    <YGroup.Item>
                        <ListItem
                            hoverTheme
                            pressTheme
                            title="Share with Friends"
                            icon={<IconWrapper bgColor="$blue10Light" icon={<FontAwesome6 name='share' size={20} color="white" />} />}
                            iconAfter={<Entypo name="chevron-small-right" size={24} />}
                        />
                    </YGroup.Item>
                    <YGroup.Item>
                        <ListItem
                            hoverTheme
                            pressTheme
                            title="Follow @finanzasokapp"
                            icon={<IconWrapper bgColor="$blue8Light" icon={<AntDesign name='twitter' size={20} color="white" />} />}
                            iconAfter={<Entypo name="chevron-small-right" size={24} />}
                        />
                    </YGroup.Item>
                    <YGroup.Item>
                        <ListItem
                            hoverTheme
                            pressTheme
                            title="Support Developer"
                            icon={<IconWrapper bgColor="$red10Light" icon={<Entypo name='heart' size={20} color="white" />} />}
                            iconAfter={<Entypo name="chevron-small-right" size={24} />}
                        />
                    </YGroup.Item>
                </YGroup>

                <XStack justifyContent="center" gap={5} alignSelf="center">
                    <Text color="$gray10Dark">Version x.x.x (xxx)</Text>
                    <Text color="$gray10Dark">•</Text>
                    <Text>Terms</Text>
                    <Text color="$gray10Dark">•</Text>
                    <Text>Privacy</Text>
                </XStack>

               <XStack justifyContent="center" alignItems="center" gap={4} marginTop={10}>
                   <Text color="$gray10Dark">Made with </Text>
                   <Entypo name='heart' size={16} color="red" />
                   <Text color="$gray10Dark">by @desarrollowebconalex</Text>
               </XStack>

                <View height={isIos ? 200 : 50} />

            </ScrollView>
        </View>
    )
}

function IconWrapper({ icon, bgColor }: {icon: React.ReactNode, bgColor:  GetThemeValueForKey<"backgroundColor">}) {
    return (
        <Square backgroundColor={bgColor} borderRadius={4} p={2} width={24}>
            {icon}
        </Square>
    )
}
