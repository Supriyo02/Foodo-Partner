import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  LayoutChangeEvent,
  GestureResponderEvent,
} from "react-native";

const ACTIVE_COLOR = "#ef4444"; // red-500
const INACTIVE_COLOR = "#6b7280"; // gray-500

// Custom top tab bar using nativewind className and Animated for indicator
const CustomTopTabBar: React.FC<any> = ({ state, descriptors, navigation }) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const routesCount = state.routes.length;

  // animated value for left position of the indicator
  const translateX = useRef(new Animated.Value(0)).current;

  // compute per-tab width once layout is known
  const tabWidth = containerWidth && routesCount ? containerWidth / routesCount : 0;

  // small underline width (60% of tab or capped)
  const underlineWidth = tabWidth ? Math.min(tabWidth * 0.6, 80) : 0;

  // move indicator when index or sizes change
  useEffect(() => {
    if (!tabWidth) return;
    const target =
      state.index * tabWidth + (tabWidth - underlineWidth) / 2; // center under label
    Animated.timing(translateX, {
      toValue: target,
      duration: 180,
      useNativeDriver: true,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.index, tabWidth, underlineWidth]);

  const onLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  const handlePress = (route: any, isFocused: boolean, index: number) => (e: GestureResponderEvent) => {
    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name);
    }
  };

  return (
    <View className="mx-4 mt-2">
      <View
        onLayout={onLayout}
        className="bg-bg-primary px-1 py-2 border-b border-gray-200"
        style={{
          // subtle shadow (platform safe)
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.06,
          shadowRadius: 6,
          elevation: 1,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", height: 28 }}>
          {state.routes.map((route: any, index: number) => {
            const label =
              descriptors[route.key]?.options?.title ?? route.name ?? route.key;
            const isFocused = state.index === index;

            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                onPress={handlePress(route, isFocused, index)}
                activeOpacity={0.8}
                style={{ flex: 1, alignItems: "center", justifyContent: "center", height: 24 }}
              >
                <Text
                  className="text-base font-bold"
                  style={{
                    color: isFocused ? ACTIVE_COLOR : INACTIVE_COLOR,
                    textTransform: "none",
                  }}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Animated underline indicator */}
        {tabWidth > 0 && (
          <Animated.View
            pointerEvents="none"
            style={{
              position: "absolute",
              bottom: 0,
              width: underlineWidth,
              height: 3,
              borderRadius: 999,
              backgroundColor: ACTIVE_COLOR,
              transform: [{ translateX }],
              left: 0,
            }}
          />
        )}
      </View>
    </View>
  );
};

export default CustomTopTabBar;