import React, { forwardRef, useImperativeHandle, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

type AlertType = "success" | "failed";

export type AlertOptions = {
  type: AlertType;
  message: string;
  duration?: number;
};

export type TopAlertHandle = {
  show: (opts: AlertOptions) => void;
  hide: () => void;
};

const TopAlert = forwardRef<TopAlertHandle>((_, ref) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState<AlertType>("success");

  const translateY = useSharedValue(-100);

  useImperativeHandle(ref, () => ({
    show: ({ type: newType, message: newMessage, duration = 3000 }) => {
      setType(newType);
      setMessage(newMessage);
      setVisible(true);

      translateY.value = withTiming(0, { duration: 250 });

      setTimeout(() => {
        runOnJS(hideInternal)();
      }, duration);
    },

    hide: () => hideInternal(),
  }));

  const hideInternal = () => {
    translateY.value = withTiming(-100, { duration: 200 }, () => {
      runOnJS(setVisible)(false);
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) return null;

  const bgColor = type === "success" ? "bg-green-600" : "bg-red-600";
//   const icon = type === "success" ? "✅" : "❌";

  return (
    
    <Animated.View
      className={`absolute top-0 left-0 right-0 z-50 ${bgColor} pt-12 pb-3 px-4`}
      style={animatedStyle}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          {/* <Text className="text-white text-lg mr-2">{icon}</Text> */}
          <Text className="text-white text-sm font-medium" numberOfLines={2}>
            {message}
          </Text>
        </View>
        <TouchableOpacity onPress={hideInternal}>
          <Text className="text-white text-lg">✕</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
});

TopAlert.displayName = "TopAlert";
export default TopAlert;