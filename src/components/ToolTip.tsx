import { useEffect } from "react";
import { Dimensions, Text } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

const WINDOW_WIDTH = Dimensions.get('window').width;
const formatCurrency = (v: number) => v.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 });

export default function Tooltip({ visible, label, orders, sales, left }: { visible: boolean; label?: string; orders?: number; sales?: number; left: number }) {
  const scale = useSharedValue(0);
  useEffect(() => {
    scale.value = visible ? withTiming(1, { duration: 140 }) : withTiming(0, { duration: 120 });
  }, [visible]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }], opacity: scale.value }));
  if (!visible) return null;
  const clampedLeft = Math.max(8, Math.min(left - 64, WINDOW_WIDTH - 160));
  return (
    <Animated.View style={[style as any, { position: 'absolute', top: -64, left: clampedLeft }]} className="bg-white px-3 py-2 rounded-md shadow-md">
      <Text className="text-xs font-inter-semibold">{label}</Text>
      <Text className="text-[11px] font-inter text-text-secondary">Orders: {orders}</Text>
      <Text className="text-[11px] font-inter text-text-secondary">Sales: {formatCurrency(sales ?? 0)}</Text>
    </Animated.View>
  );
}