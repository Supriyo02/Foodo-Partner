import React, { useEffect, useRef, useState } from "react";
import { View, Text, TextInput, Keyboard, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Provider as PaperProvider } from "react-native-paper";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import {useLocalSearchParams, useRouter } from "expo-router";
import { sendOtp, verifyOtp } from "@/src/services/dbCalls";
import TopAlert, { TopAlertHandle } from "@/src/components/TopAlert";
import { useAuthStore } from "@/src/stores/authStore";

export default function VerifyOtp() {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputs = useRef<TextInput[]>([]);
  const isComplete = otp.every((digit) => digit.length === 1);
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const login = useAuthStore(state => state.login);

  useEffect(() => {
  const timer = setTimeout(() => {
    inputs.current[0]?.focus();
  }, 300);
  return () => clearTimeout(timer);
}, []);

  const anim = useSharedValue(isComplete ? 1 : 0);
  anim.value = withTiming(isComplete ? 1 : 0, { duration: 180 });

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.6 + anim.value * 0.4,
    transform: [{ scale: 0.98 + anim.value * 0.02 }],
  }));

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text.replace(/[^0-9]/g, "").slice(-1);
    setOtp(newOtp);

    if (text && index < 3) {
      inputs.current[index + 1]?.focus();
    }

    if (index === 3 && text) {
      Keyboard.dismiss();
    }
  };

  const onResendOtp = async() => {
      setLoading(true);
      try {
        await sendOtp(phone);
      } catch (error) {
        const errorMessage =
                      error instanceof Error ? error.message : "An unknown error occurred";
        Alert.alert("Error", errorMessage)
      }finally{
        setLoading(false);
      }
    };

  const onPressContinue = async() => {
    setLoading(true);
    try {
      await verifyOtp(phone);
      login();
      router.push('/setup-kitchen-details')
    } catch (error) {
      const errorMessage =
                    error instanceof Error ? error.message : "An unknown error occurred";
      Alert.alert("Error", errorMessage)
    }finally{
      setLoading(false);
    }
  };

  return (
    <PaperProvider>
      <SafeAreaView className="flex-1 bg-white px-6">
        <View className="mt-10 mb-6">
            <View className="mb-5">
                <Text className="text-gray-900 font-inter-extrabolditalic text-5xl -mb-1">Foodo</Text>
                <Text className="text-gray-900 font-inter text-sm">-- kitchen partners --</Text>
            </View>
          <Text className="text-2xl font-bold text-gray-900">
            Enter the otp
          </Text>
        </View>

        <View className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
          <Text className="text-gray-600 mb-4">OTP sent to {phone}</Text>

          <View className="flex-row justify-between mb-4 py-4">
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(el) => {inputs.current[index] = el!}}
                value={digit}
                onChangeText={(text) => handleChange(text, index)}
                keyboardType="number-pad"
                maxLength={1}
                textAlign="center"
                className={`w-14 h-14 rounded-lg border text-2xl font-semibold ${
                  digit
                    ? "border-gray-700 text-gray-900"
                    : "border-gray-300 text-gray-700"
                }`}
                style={{
                  shadowColor: "#000",
                  shadowOpacity: 0.03,
                  shadowRadius: 2,
                  shadowOffset: { width: 0, height: 1 },
                }}
              />
            ))}
          </View>

          <TouchableOpacity
          onPress={onResendOtp} 
          activeOpacity={0.6}
          >
            <Text className="text-primary font-medium">
              Resend OTP
            </Text>
          </TouchableOpacity>
        </View>

        <Animated.View style={[animatedStyle]} className="my-8">
          <Button
            mode="contained"
            onPress={onPressContinue}
            disabled={!isComplete}
            loading={loading}
            contentStyle={{ paddingVertical: 8 }}
            labelStyle={{
              fontSize: 16,
              fontWeight: "600",
              color: isComplete ? "#fff" : "#9CA3AF",
            }}
            style={{
              borderRadius: 12,
              backgroundColor: isComplete ? "#111827" : "#F3F4F6",
              elevation: isComplete ? 2 : 0,
            }}
          >
            Continue
          </Button>
        </Animated.View>
      </SafeAreaView>
    </PaperProvider>
  );
}
