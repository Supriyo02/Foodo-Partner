import { useEffect, useRef, useState } from "react";
import { LayoutChangeEvent, Pressable, View, Text, Animated } from "react-native";
import * as Haptics from 'expo-haptics';

export function PillTabBar({ state, descriptors, navigation }: any) {
  const routes = state.routes;
  const index = state.index;
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const animatedIndex = useRef(new Animated.Value(index)).current;

  useEffect(() => {
    Animated.timing(animatedIndex, {
      toValue: index,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [index, animatedIndex]);

  const onLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  const tabCount = Math.max(1, routes.length);
  const indicatorWidth = containerWidth ? containerWidth / tabCount : 0;

  // translateX: 0 -> (tabCount - 1) * indicatorWidth
  const translateX =
    indicatorWidth > 0
      ? animatedIndex.interpolate({
          inputRange: [0, tabCount - 1],
          outputRange: [0, (tabCount - 1) * indicatorWidth],
          extrapolate: "clamp",
        })
      : 0;

  return (
    <View
      onLayout={onLayout}
      className="mx-4 my-3 bg-gray-200 rounded-full p-1 h-12 overflow-hidden"
      accessibilityRole="tablist"
    >
      <View className="flex-row relative h-full">
        {/* Animated white indicator (clipped by overflow-hidden on container) */}
        {indicatorWidth > 0 && (
          <Animated.View
            pointerEvents="none"
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: indicatorWidth,
              transform: [{ translateX }],
              borderRadius: 9999,
              backgroundColor: "#fff",
            }}
          />
        )}

        {/* Tabs */}
        {routes.map((route: any, idx: number) => {
          const descriptor = descriptors[route.key];
          const label = descriptor?.options?.title ?? route.name;
          const isFocused = index === idx;

          const onPress = () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              accessibilityRole="tab"
              accessibilityState={isFocused ? { selected: true } : {}}
              className="flex-1 items-center justify-center"
              style={{ minHeight: 44 }}
            >
              <Text className={isFocused ? "text-gray-900 font-inter-bold text-base" : "text-gray-500 font-inter text-base"}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
