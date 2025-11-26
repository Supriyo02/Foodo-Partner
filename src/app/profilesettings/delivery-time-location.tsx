import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { MaterialIcons } from '@expo/vector-icons'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import TimeManagement from '@/src/components/deliveryandtime/TimeManagement'
import LocationManagement from '@/src/components/deliveryandtime/LocationManagement'

const Tab = createMaterialTopTabNavigator();

const DeliveryTimeLocation = () => {
    return (
        <SafeAreaView className="flex-1 bg-bg-primary">
            <View className="px-4 py-1 border-b border-gray-200 bg-bg-primary flex-row relative">
                <TouchableOpacity onPress={() => router.back()}>
                    <MaterialIcons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text className="pl-8 absolute left-1/2 -translate-x-1/2 text-xl font-inter-bold text-text-primary">
                    Delivery & Time
                </Text>
            </View>

            <View className="flex-1 mt-3">
                <Tab.Navigator
                    initialRouteName="TimeManagementTab"
                    screenOptions={{
                        swipeEnabled: true,
                        lazy: false,
                        tabBarStyle: {
                            backgroundColor: "#e5e7eb",
                            borderRadius: 9999,
                            marginHorizontal: 16,
                            padding: 4,
                            elevation: 0,
                            shadowOpacity: 0,
                        },
                        tabBarIndicatorStyle: {
                            backgroundColor: "#ffffff",
                            height: 44,
                            borderRadius: 9999,
                            marginVertical: 4,
                            // marginHorizontal: -4,
                            // marginLeft: 4,
                            // marginRight: -4,
                        },
                        tabBarPressColor: "transparent",
                        tabBarLabelStyle: {
                            textTransform: "none",
                            fontWeight: "700",
                            fontSize: 14,
                        },
                        tabBarActiveTintColor: "#111827",
                        tabBarInactiveTintColor: "#6b7280",
                    }}
                >
                    <Tab.Screen
                        name="TimeManagementTab"
                        component={TimeManagement}
                        options={{
                            title: "Time Management",
                            tabBarItemStyle: { height: 44 },
                        }}
                    />
                    <Tab.Screen
                        name="DeliveryAreasTab"
                        component={LocationManagement}
                        options={{
                            title: "Delivery Areas",
                            tabBarItemStyle: { height: 44 },
                        }}
                    />
                </Tab.Navigator>
            </View>
        </SafeAreaView>
    )
}

export default DeliveryTimeLocation;