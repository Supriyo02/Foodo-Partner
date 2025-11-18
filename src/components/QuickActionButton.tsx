import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { Feather, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { Pressable, View, Text } from "react-native";
import { DashboardData } from "@/types";

export default function QuickActionButton({ item, onPress }: { item: DashboardData['quickActions'][number]; onPress: (id: string) => void }) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: withTiming(scale.value, { duration: 120 }) }] }));

  const Icon = () => {
    if (item.iconPack === 'material') return <MaterialIcons name={item.iconName as any} size={22} color="#ea0b2c" />;
    if (item.iconPack === 'feather') return <Feather name={item.iconName as any} size={20} color="#ea0b2c" />;
    return <FontAwesome5 name={item.iconName as any} size={18} color="#ea0b2c" />;
  };

  const handlePress = () => {
    Haptics.selectionAsync();
    scale.value = 0.96;
    setTimeout(() => (scale.value = 1), 140);
    onPress(item.id);
  };

  return (
      <Animated.View style={style as any} className="w-1/2 p-2">
        <Pressable onPress={handlePress} className="bg-white rounded-2xl p-4 items-center justify-center shadow-sm">
          <View className="bg-red-50 rounded-full p-3 mb-2">
            <Icon />
          </View>
          <Text className="text-sm font-inter-semibold">{item.title}</Text>
        </Pressable>
      </Animated.View>
    );
  }