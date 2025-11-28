import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialIcons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import CustomTopTabBar from '@/src/components/CustomTopTabbar'
import Messages from '@/src/components/inbox/Messages'
import Notifications from '@/src/components/inbox/Notifications'
import Reviews from '@/src/components/inbox/Reviews'

const Tab = createMaterialTopTabNavigator();

const Inbox = () => {
    return (
        <SafeAreaView className="flex-1 bg-bg-primary">
            <View className="px-4 py-1 border-b border-gray-200 bg-bg-primary flex-row relative">
                <TouchableOpacity onPress={() => router.back()}>
                    <MaterialIcons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text className="pl-8 absolute left-1/2 -translate-x-1/2 text-xl font-inter-bold text-text-primary">
                    Inbox
                </Text>
            </View>

            <View className="flex-1">
                <Tab.Navigator
                    initialRouteName="NotificationsTab"
                    tabBar={(props) => <CustomTopTabBar {...props} />}
                    screenOptions={{
                        swipeEnabled: true,
                        lazy: false,
                        // keep default gesture & behavior; we've replaced the bar completely
                        tabBarPressColor: "transparent",
                    }}
                >
                    <Tab.Screen
                        name="NotificationsTab"
                        component={Notifications}
                        options={{
                            title: "Notifications",
                            tabBarItemStyle: { height: 24 },
                        }}
                    />
                    <Tab.Screen
                        name="MessagesTab"
                        component={Messages}
                        options={{
                            title: "Messages",
                            tabBarItemStyle: { height: 24 },
                        }}
                    />
                    <Tab.Screen
                        name="ReviewsTab"
                        component={Reviews}
                        options={{
                            title: "Reviews",
                            tabBarItemStyle: { height: 24 },
                        }}
                    />
                </Tab.Navigator>
            </View>

        </SafeAreaView>
    )
}

export default Inbox