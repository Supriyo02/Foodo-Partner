import React from "react";
import { View, Text } from "react-native";


export const StatCard = React.memo(function StatCard({ title, value, subtitle, icon }: { title: string; value: string; subtitle?: string; icon?: React.ReactNode }) {
  return (
    <View className="bg-white rounded-2xl p-4 flex-1 mr-3 shadow-sm">
      <View className="flex-row justify-between items-start">
        <View>
          <Text className="text-xs font-inter text-text-secondary">{title}</Text>
          <Text className="text-xl font-inter-bold mt-2">{value}</Text>
          {subtitle ? <Text className="text-xs font-inter text-text-secondary mt-1">{subtitle}</Text> : null}
        </View>
        <View className="bg-gray-100 rounded-full p-2">{icon}</View>
      </View>
    </View>
  );
});