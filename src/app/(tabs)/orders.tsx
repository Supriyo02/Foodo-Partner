// /src/screens/Orders.tsx
import React, { useCallback } from "react";
import { View, Text, Image, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import * as Haptics from "expo-haptics";
import { MaterialIcons } from "@expo/vector-icons";
import OrdersScreen from "@/src/components/order/OrderManagement";
import PreOrders from "@/src/components/order/PreOrders";
import { images } from "@/src/lib/constants";

const Tab = createMaterialTopTabNavigator();

export default function Orders() {
  const onBellPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // future: open notifications screen
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-bg-primary">
      <View className="flex-row items-center justify-between px-4 py-1 border-b border-gray-200 bg-bg-primary">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Orders"
          className="p-2"
        >
          <Image source={images?.food_dining} className="w-6 h-6" resizeMode="contain" />
        </Pressable>

        <Text className="text-lg font-inter-bold text-text-primary" accessibilityRole="header">
          Order Management
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Notifications"
          onPress={onBellPress}
          className="rounded-xl p-2 bg-white"
        >
          <MaterialIcons name="notifications-none" size={22} color="#111827" />
        </Pressable>
      </View>

      <View className="flex-1 mt-3">
        <Tab.Navigator
          initialRouteName="OrdersTab"
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
            name="OrdersTab"
            component={OrdersScreen}
            options={{
              title: "Orders",
              tabBarItemStyle: { height: 44 },
            }}
          />
          <Tab.Screen
            name="PreOrdersTab"
            component={PreOrders}
            options={{
              title: "Pre Orders",
              tabBarItemStyle: { height: 44 },
            }}
          />
        </Tab.Navigator>
      </View>
    </SafeAreaView>
  );
}
