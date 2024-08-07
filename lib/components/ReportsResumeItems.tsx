import {Image, Pressable, StyleSheet, Text, View} from "react-native";
import * as ContextMenu from 'zeego/context-menu'
import {useRouter} from "expo-router";

export default function ReportsResumeItems({ data, onPress }: { data: any[], onPress: (id: string) => void }) {
    const router = useRouter();

    function handlePress(id: string) {
        router.push('/(tabs)/(reports)/detailGroup')
    }

    return (
        <View>
            {data.map((item) => (
                <ContextMenu.Root key={item.id}>
                    <ContextMenu.Trigger>
                        <Pressable style={[styles.container, {backgroundColor: 'white'}]}
                                   onPress={() => onPress(item.id)}>
                            {/*<Image source={require(`../../assets/icons/popcorn.png`)}*/}
                            {/*       style={{width: 30, height: 30}}/>*/}
                            <View style={styles.imageWithLabel}>
                                <View style={{flexDirection: 'row', gap: 10, alignItems: 'center'}}>
                                    <Text style={styles.label}>{item.category.label}</Text>
                                    {
                                        item.qty &&
                                        <Text style={{fontSize: 14, color: 'gray'}}>x {item.qty}</Text>
                                    }
                                </View>
                                <Text>S/ {item.value}</Text>
                            </View>
                        </Pressable>
                    </ContextMenu.Trigger>
                    <ContextMenu.Content loop={false} alignOffset={0} collisionPadding={0}
                                         avoidCollisions={true}>
                        <ContextMenu.Item key='duplicate'>
                            <ContextMenu.ItemTitle>Duplicate</ContextMenu.ItemTitle>
                            <ContextMenu.ItemIcon
                                ios={{
                                    name: 'doc.on.doc'
                                }}
                            />
                        </ContextMenu.Item>
                        <ContextMenu.Item key='delete' destructive>
                            <ContextMenu.ItemTitle>Delete</ContextMenu.ItemTitle>
                            <ContextMenu.ItemIcon
                                ios={{
                                    name: 'trash'
                                }}
                            />
                        </ContextMenu.Item>
                    </ContextMenu.Content>
                </ContextMenu.Root>
            ))}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        gap: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    imageWithLabel: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderColor: 'lightgray',
        paddingVertical: 15,
    },
    label: {
        fontSize: 18,
        fontWeight: '500',
    }
})
