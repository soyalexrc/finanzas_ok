import {
    View,
    Text,
    ScrollView,
    YGroup,
    ListItem,
    Separator,
    Square,
    GetThemeValueForKey,
    XStack,
    Button, Image
} from 'tamagui';
import React, {useEffect, useRef} from "react";
import {Alert, Animated, Linking, Platform, Share} from "react-native";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import {AntDesign, Ionicons} from "@expo/vector-icons";
import {useRouter} from "expo-router";
import {useHeaderHeight} from "@react-navigation/elements";
import * as MailComposer from 'expo-mail-composer';
import {useTranslation} from "react-i18next";
import {useAuth, useUser} from "@clerk/clerk-expo";
import * as Application from 'expo-application';
import * as Haptics from "expo-haptics";
import RevenueCatUI, {PAYWALL_RESULT} from "react-native-purchases-ui";

export default function Screen() {
    const {signOut, isSignedIn} = useAuth();
    const {user} = useUser()
    const isIos = Platform.OS === 'ios';
    const router = useRouter();
    const headerHeight = useHeaderHeight();
    const {t} = useTranslation()

    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300, // Adjust the duration as needed
            useNativeDriver: true,
        }).start();

    }, []);

    async function handleLogout() {
        await Haptics.selectionAsync()
        Alert.alert(t('AUTH.LOGOUT_CONFIRMATION_TITLE'), t('AUTH.LOGOUT_CONFIRMATION_DESCRIPTION'), [
            {style: 'default', text: t('COMMON.CANCEL'), isPreferred: true},
            {
                style: 'destructive',
                text: t('COMMON.ACCEPT'),
                isPreferred: false,
                onPress: () => signOut({redirectUrl: '/(tabs)'})
            }
        ])
    }

    async function sentEmail() {
        try {
            const isAvailable = await MailComposer.isAvailableAsync();
            if (!isAvailable) {
                Alert.alert(t('COMMON.ERROR'), 'Email is not available on this device');
                return;
            } else {
                // TODO add version / Operating system / translations / Sent from...
                await MailComposer.composeAsync({
                    subject: 'FinanzasOK - Feedback',
                    recipients: ['alexcarvajal2404@gmail.com'],
                    body: 'Hi Alex, I would like to ask you about...'
                });
            }
        } catch (error) {
            console.error('Error sending email', error)
        }
    }

    async function supportDev() {
        const paywallResult: PAYWALL_RESULT = await RevenueCatUI.presentPaywall();

        switch (paywallResult) {
            case PAYWALL_RESULT.PURCHASED:
                // TODO add message modal to user to thank him
                console.log('tip purchased!')
                break;
            case PAYWALL_RESULT.CANCELLED:
                // TODO add message modal to user to explain nothing was charged
                console.log('tip cancelled')
                break;

            case PAYWALL_RESULT.ERROR:
                console.log('tip failed')
                // TODO add message modal to user to show an error occurred
                break;

            case PAYWALL_RESULT.NOT_PRESENTED:
                console.log('paywall not presented');
                break;

        }
    }

    function redirectToReview() {
        if (Platform.OS === 'ios') {
            Linking.openURL('https://apps.apple.com/app/id6737455994?action=write-review')
        } else {
            Linking.openURL('https://play.google.com/store/apps/details?id=com.alexrc.finanzas_ok&showAllReviews=true')
        }
    }

    async function shareToFriends() {
        try {
            const initialMessage = t('SETTINGS.SHARE_WITH_FRIENDS.OPTIONS.DEFAULT_MESSAGE')
            const message = `
            ${initialMessage}
            iOS: https://apps.apple.com/app/id6737455994
            Android: https://play.google.com/store/apps/details?id=com.alexrc.finanzas_ok`
            if (Platform.OS === 'ios') {
                await Share.share({
                    title: 'Finanzas OK',
                    url: 'https://apps.apple.com/app/id6737455994',
                    message,
                }, { subject: 'Finanzas Ok', dialogTitle: 'Finanas Ok', tintColor: '#5EAA4BFF' })
            } else {
                await Share.share({
                    title: 'Finanzas OK',
                    url: 'https://play.google.com/store/apps/details?id=com.alexrc.finanzas_ok',
                    message,
                }, { subject: 'Finanzas Ok', dialogTitle: 'Finanas Ok', tintColor: '#5EAA4BFF' })
            }
        } catch (error) {
            console.error('Error sharing', error)
        }
    }

    return (
        <View backgroundColor="$color1" flex={1}>
            {/*<CustomHeader style={{paddingTop: isIos ? insets.top + 20 : insets.top}} centered={true}>*/}
            {/*    <Text fontSize="$6">Settings</Text>*/}
            {/*</CustomHeader>*/}
            <Animated.View
                style={{
                    opacity: fadeAnim,
                    flex: 1
                }}
            >
                <ScrollView showsVerticalScrollIndicator={false} paddingTop={isIos ? headerHeight + 20 : 20}>

                    <YGroup alignSelf="center" bordered marginHorizontal={16} marginBottom={40}
                            separator={<Separator/>}>
                        <YGroup.Item>
                            <ListItem>
                                <View flex={1} h={100} flexDirection="column" justifyContent="space-between">
                                    {
                                        isSignedIn &&
                                        <>
                                            <View flexDirection="row" alignItems="center">
                                                <Image borderRadius={50} width={50} height={50} mr={10} source={{
                                                    uri: user?.imageUrl
                                                }}/>
                                                <View>
                                                    <Text>{user?.firstName ?? '-'} {user?.lastName ?? '-'}</Text>
                                                    <Text fontSize={12}
                                                          color="$gray10Dark">{user?.emailAddresses[0].emailAddress}</Text>
                                                </View>
                                            </View>
                                            <Button onPress={handleLogout}>{t('AUTH.LOGOUT')}</Button>
                                        </>
                                    }
                                    {
                                        !isSignedIn &&
                                        <>
                                            <View flexDirection="row" alignItems="center" justifyContent="center">
                                                <Ionicons name="person-circle-outline" size={50} color="black"/>
                                            </View>
                                            <Button onPress={() => router.push('/auth')}>{t('AUTH.LOGIN')}</Button>

                                        </>
                                    }

                                </View>
                            </ListItem>
                        </YGroup.Item>
                    </YGroup>

                    <YGroup alignSelf="center" bordered marginHorizontal={16} marginBottom={40}
                            separator={<Separator/>}>
                        <YGroup.Item>
                            <ListItem
                                hoverTheme
                                pressTheme
                                onPress={() => router.push('/appearance')}
                                title={t('SETTINGS.APPEARANCE.TITLE')}
                                icon={<IconWrapper bgColor="black"
                                                   icon={<MaterialIcons name='dark-mode' size={20} color="white"/>}/>}
                                iconAfter={<Entypo name="chevron-small-right" size={24}/>}
                            />
                        </YGroup.Item>
                        <YGroup.Item>
                            <ListItem
                                hoverTheme
                                pressTheme
                                title={t('SETTINGS.NOTIFICATIONS.TITLE')}
                                onPress={() => router.push('/notifications')}
                                icon={<IconWrapper bgColor="$red9Light"
                                                   icon={<MaterialIcons name='notifications' size={20}
                                                                        color="white"/>}/>}
                                iconAfter={<Entypo name="chevron-small-right" size={24}/>}
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
                                title={t('SETTINGS.LANGUAGE.TITLE')}
                                onPress={() => router.push('/language')}
                                icon={<IconWrapper bgColor="$blue9Light"
                                                   icon={<MaterialIcons name='language' size={20} color="white"/>}/>}
                                iconAfter={<Entypo name="chevron-small-right" size={24}/>}
                            />
                        </YGroup.Item>
                    </YGroup>

                    <YGroup alignSelf="center" bordered marginHorizontal={16} marginBottom={40}
                            separator={<Separator/>}>
                        {/*<YGroup.Item>*/}
                        {/*    <ListItem*/}
                        {/*        hoverTheme*/}
                        {/*        pressTheme*/}
                        {/*        title={t('SETTINGS.ACCOUNTS.TITLE')}*/}
                        {/*        onPress={() => router.push('/accounts')}*/}
                        {/*        icon={<IconWrapper bgColor="$blue11Light"*/}
                        {/*                           icon={<MaterialIcons name='account-balance-wallet' size={20}*/}
                        {/*                                                color="white"/>}/>}*/}
                        {/*        iconAfter={<Entypo name="chevron-small-right" size={24}/>}*/}
                        {/*    />*/}
                        {/*</YGroup.Item>*/}
                        <YGroup.Item>
                            <ListItem
                                hoverTheme
                                pressTheme
                                title={t('SETTINGS.CATEGORIES.TITLE')}
                                onPress={() => router.push('/categories')}
                                icon={<IconWrapper bgColor="$orange10Light"
                                                   icon={<MaterialIcons name='format-list-bulleted' size={20}
                                                                        color="white"/>}/>}
                                iconAfter={<Entypo name="chevron-small-right" size={24}/>}
                            />
                        </YGroup.Item>
                        <YGroup.Item>
                            <ListItem
                                hoverTheme
                                pressTheme
                                title={t('SETTINGS.DATA_MANAGEMENT.TITLE')}
                                onPress={() => router.push('/data')}
                                icon={<IconWrapper bgColor="$purple10Light"
                                                   icon={<MaterialIcons name='file-download' size={20}
                                                                        color="white"/>}/>}
                                iconAfter={<Entypo name="chevron-small-right" size={24}/>}
                            />
                        </YGroup.Item>
                    </YGroup>

                    <YGroup alignSelf="center" bordered marginHorizontal={16} marginBottom={40}
                            separator={<Separator/>}>
                        <YGroup.Item>
                            <ListItem
                                hoverTheme
                                pressTheme
                                onPress={sentEmail}
                                title={t('SETTINGS.CONTACT_DEV.TITLE')}
                                icon={<IconWrapper bgColor="$blue8Light"
                                                   icon={<MaterialIcons name='email' size={20} color="white"/>}/>}
                                iconAfter={<Entypo name="chevron-small-right" size={24}/>}
                            />
                        </YGroup.Item>
                        <YGroup.Item>
                            <ListItem
                                hoverTheme
                                pressTheme
                                onPress={redirectToReview}
                                title={t('SETTINGS.RATE_ON_STORE.TITLE')}
                                icon={<IconWrapper bgColor="$orange9Light"
                                                   icon={<MaterialIcons name='star' size={20} color="white"/>}/>}
                                iconAfter={<Entypo name="chevron-small-right" size={24}/>}
                            />
                        </YGroup.Item>
                        <YGroup.Item>
                            <ListItem
                                hoverTheme
                                pressTheme
                                onPress={shareToFriends}
                                title={t('SETTINGS.SHARE_WITH_FRIENDS.TITLE')}
                                icon={<IconWrapper bgColor="$blue10Light"
                                                   icon={<FontAwesome6 name='share' size={20} color="white"/>}/>}
                                iconAfter={<Entypo name="chevron-small-right" size={24}/>}
                            />
                        </YGroup.Item>
                        <YGroup.Item>
                            <ListItem
                                hoverTheme
                                pressTheme
                                onPress={() => {
                                    Linking.openURL('https://www.instagram.com/soyalexrc/')
                                }}
                                title={t('SETTINGS.FOLLOW_ON_IG.TITLE')}
                                icon={<IconWrapper bgColor="$pink11Light"
                                                   icon={<AntDesign name='instagram' size={20} color="white"/>}/>}
                                iconAfter={<Entypo name="chevron-small-right" size={24}/>}
                            />
                        </YGroup.Item>
                        <YGroup.Item>
                            <ListItem
                                hoverTheme
                                pressTheme
                                onPress={supportDev}
                                title={t('SETTINGS.SUPPORT_DEV.TITLE')}
                                icon={<IconWrapper bgColor="$red10Light"
                                                   icon={<Entypo name='heart' size={20} color="white"/>}/>}
                                iconAfter={<Entypo name="chevron-small-right" size={24}/>}
                            />
                        </YGroup.Item>
                    </YGroup>

                    <YGroup alignSelf="center" bordered marginHorizontal={16} marginBottom={40}>
                        <YGroup.Item>
                            <ListItem
                                hoverTheme
                                pressTheme
                                title={t('SETTINGS.OTHER.TITLE')}
                                onPress={() => router.push('/other')}
                                icon={<IconWrapper bgColor="$yellow10Light"
                                                   icon={<MaterialIcons name='settings' size={20} color="white"/>}/>}
                                iconAfter={<Entypo name="chevron-small-right" size={24}/>}
                            />
                        </YGroup.Item>
                    </YGroup>

                    <XStack justifyContent="center" gap={5} alignSelf="center">
                        <Text
                            color="$gray10Dark">Version {Application.nativeApplicationVersion} ({Application.nativeBuildVersion})</Text>
                        <Text color="$gray10Dark">•</Text>
                        <Text>{t('COMMON.TERMS')}</Text>
                        <Text color="$gray10Dark">•</Text>
                        <Text>{t('COMMON.PRIVACY')}</Text>
                    </XStack>

                    <XStack justifyContent="center" alignItems="center" gap={4} marginTop={10}>
                        <Text color="$gray10Dark">{t('COMMON.MADE_WITH')} </Text>
                        <Entypo name='heart' size={16} color="red"/>
                        <Text color="$gray10Dark">{t('COMMON.BY')} @desarrollowebconalex</Text>
                    </XStack>

                    <View height={isIos ? 230 : 50}/>

                </ScrollView>
            </Animated.View>

        </View>
    )
}

function IconWrapper({icon, bgColor}: { icon: React.ReactNode, bgColor: GetThemeValueForKey<"backgroundColor"> }) {
    return (
        <Square backgroundColor={bgColor} borderRadius={4} p={2} width={24}>
            {icon}
        </Square>
    )
}
