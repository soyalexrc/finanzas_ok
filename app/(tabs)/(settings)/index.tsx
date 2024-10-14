import {View, Text, ScrollView, YGroup, ListItem, Separator, Square, GetThemeValueForKey, XStack} from 'tamagui';
import React from "react";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {Alert, Linking, Platform} from "react-native";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import {AntDesign} from "@expo/vector-icons";
import {useRouter} from "expo-router";
import {useHeaderHeight} from "@react-navigation/elements";
import * as MailComposer from 'expo-mail-composer';

export default function Screen() {
    const insets = useSafeAreaInsets();
    const isIos = Platform.OS === 'ios';
    const router = useRouter();
    const headerHeight = useHeaderHeight();

    async function sentEmail() {
        try {
            const isAvailable = await MailComposer.isAvailableAsync();
            if (!isAvailable) {
                Alert.alert('Error', 'Email is not available on this device');
                return;
            } else {
                await MailComposer.composeAsync({
                    subject: 'FinanzasOK - Contact Developer',
                    body: 'Hi Alex, I would like to ask you about...'
                });
            }
        } catch (error) {
            console.error('Error sending email', error)
        }
    }

    return (
        <View backgroundColor="$color1" flex={1}>
            {/*<CustomHeader style={{paddingTop: isIos ? insets.top + 20 : insets.top}} centered={true}>*/}
            {/*    <Text fontSize="$6">Settings</Text>*/}
            {/*</CustomHeader>*/}

            <ScrollView showsVerticalScrollIndicator={false} paddingTop={isIos ? headerHeight + 20 : headerHeight}>
                <YGroup alignSelf="center" bordered marginHorizontal={16} marginBottom={40}  separator={<Separator />}>
                    <YGroup.Item>
                        <ListItem
                            hoverTheme
                            pressTheme
                            onPress={() => router.push('/appearance')}
                            title="Appereance"
                            icon={<IconWrapper bgColor="black" icon={<MaterialIcons name='dark-mode' size={20} color="white" />} />}
                            iconAfter={<Entypo name="chevron-small-right" size={24} />}
                        />
                    </YGroup.Item>
                    <YGroup.Item>
                        <ListItem
                            hoverTheme
                            pressTheme
                            disabled
                            title="Notifications"
                            onPress={() => router.push('/notifications')}
                            icon={<IconWrapper bgColor="$red9Light" icon={<MaterialIcons name='notifications' size={20} color="white" />} />}
                            iconAfter={<Entypo name="chevron-small-right" size={24} />}
                        />
                    </YGroup.Item>
                    {/*<YGroup.Item>*/}
                    {/*    <ListItem*/}
                    {/*        hoverTheme*/}
                    {/*        pressTheme*/}
                    {/*        title="Currency"*/}
                    {/*        onPress={() => router.push('/currency')}*/}
                    {/*        icon={<IconWrapper bgColor="$green9Light" icon={<MaterialIcons name='attach-money' size={20} color="white" />} />}*/}
                    {/*        iconAfter={<Entypo name="chevron-small-right" size={24} />}*/}
                    {/*    />*/}
                    {/*</YGroup.Item>*/}
                    <YGroup.Item>
                        <ListItem
                            hoverTheme
                            pressTheme
                            title="Language"
                            disabled
                            onPress={() => router.push('/language')}
                            icon={<IconWrapper bgColor="$blue9Light" icon={<MaterialIcons name='language' size={20} color="white" />} />}
                            iconAfter={<Entypo name="chevron-small-right" size={24} />}
                        />
                    </YGroup.Item>
                    <YGroup.Item>
                        <ListItem
                            hoverTheme
                            pressTheme
                            title="Other"
                            onPress={() => router.push('/other')}
                            icon={<IconWrapper bgColor="$yellow10Light" icon={<MaterialIcons name='settings' size={20} color="white" />} />}
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
                            onPress={() => router.push('/accounts')}
                            icon={<IconWrapper bgColor="$blue11Light" icon={<MaterialIcons name='account-balance-wallet' size={20} color="white" />} />}
                            iconAfter={<Entypo name="chevron-small-right" size={24} />}
                        />
                    </YGroup.Item>
                    <YGroup.Item>
                        <ListItem
                            hoverTheme
                            pressTheme
                            title="Categories"
                            onPress={() => router.push('/categories')}
                            icon={<IconWrapper bgColor="$orange10Light" icon={<MaterialIcons name='format-list-bulleted' size={20} color="white" />} />}
                            iconAfter={<Entypo name="chevron-small-right" size={24} />}
                        />
                    </YGroup.Item>
                    <YGroup.Item>
                        <ListItem
                            hoverTheme
                            pressTheme
                            disabled
                            title="Data management"
                            onPress={() => router.push('/data')}
                            icon={<IconWrapper bgColor="$purple10Light" icon={<MaterialIcons name='file-download' size={20} color="white" />} />}
                            iconAfter={<Entypo name="chevron-small-right" size={24} />}
                        />
                    </YGroup.Item>
                </YGroup>

                <YGroup alignSelf="center" bordered marginHorizontal={16} marginBottom={40}  separator={<Separator />}>
                    <YGroup.Item>
                        <ListItem
                            hoverTheme
                            pressTheme
                            onPress={sentEmail}
                            title="Contact Developer"
                            icon={<IconWrapper bgColor="$blue8Light" icon={<MaterialIcons name='email' size={20} color="white" />} />}
                            iconAfter={<Entypo name="chevron-small-right" size={24} />}
                        />
                    </YGroup.Item>
                    <YGroup.Item>
                        <ListItem
                            hoverTheme
                            pressTheme
                            disabled
                            title="Rate app on App Store"
                            icon={<IconWrapper bgColor="$orange9Light" icon={<MaterialIcons name='star' size={20} color="white" />} />}
                            iconAfter={<Entypo name="chevron-small-right" size={24} />}
                        />
                    </YGroup.Item>
                    <YGroup.Item>
                        <ListItem
                            hoverTheme
                            pressTheme
                            disabled
                            title="Share with Friends"
                            icon={<IconWrapper bgColor="$blue10Light" icon={<FontAwesome6 name='share' size={20} color="white" />} />}
                            iconAfter={<Entypo name="chevron-small-right" size={24} />}
                        />
                    </YGroup.Item>
                    <YGroup.Item>
                        <ListItem
                            hoverTheme
                            pressTheme
                            onPress={() => {
                                Linking.openURL('https://www.instagram.com/soyalexrc/')
                            }}
                            title="Follow @finanzasokapp"
                            icon={<IconWrapper bgColor="$pink11Light" icon={<AntDesign name='instagram' size={20} color="white" />} />}
                            iconAfter={<Entypo name="chevron-small-right" size={24} />}
                        />
                    </YGroup.Item>
                    <YGroup.Item>
                        <ListItem
                            hoverTheme
                            pressTheme
                            disabled
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

                <View height={isIos ? 230 : 50} />

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
