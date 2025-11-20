import React, { useEffect, useRef, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Keyboard, Platform, ScrollView, Alert, ActivityIndicator } from "react-native";
import {Image} from 'expo-image';
import { Button, Provider as PaperProvider } from "react-native-paper";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { Redirect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import cn from 'clsx'
import useDbCall from "@/src/services/useDbCall";
import { sendOtp } from "@/src/services/dbCalls";


const AnimatedView = Animated.createAnimatedComponent(View);

export default function LogIn() {
  const isAuthenticated = false;
  if(isAuthenticated) return <Redirect href='/dashboard' />

  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<TextInput | null>(null);
  const [loading, setLoading] = useState(false);

  const enabled = phone.length === 10;
  const anim = useSharedValue(enabled ? 1 : 0);

  useEffect(() => {
    anim.value = withTiming(enabled ? 1 : 0, { duration: 180 });
  }, [enabled, anim]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: 0.6 + anim.value * 0.4,
      transform: [{ scale: 0.98 + anim.value * 0.02 }],
    };
  });

  const onChangePhone = (text: string) => {
    const digits = text.replace(/\D/g, "").slice(0, 10);
    setPhone(digits);

    if (digits.length === 10) {
      setTimeout(() => Keyboard.dismiss(), 120);
    }
  };

  const onPressContinue = async() => {
    if (!enabled) return;
    setLoading(true);
    try {
      await sendOtp(phone);
      router.push({
        pathname: "/verify-otp",
        params: { phone },
      });
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
      <SafeAreaView className="flex-1 bg-bg-primary">
        <KeyboardAwareScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          enableOnAndroid={true}
          showsVerticalScrollIndicator={false}
        >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingVertical: 0 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
            <View className="px-6 pt-10">
                <View className="mb-5">
                    <Text className="text-gray-900 font-inter-extrabolditalic text-5xl -mb-1">Foodo</Text>
                    <Text className="text-gray-900 font-inter text-sm">-- kitchen partners --</Text>
                </View>
            <Text className="text-2xl font-bold text-gray-900">
                Enter your registered phone number!
            </Text>
            </View>

            <View className="px-4 mt-6">
            <View className="bg-bg-primary rounded-3xl p-4 shadow-sm border border-gray-100">
                <Text className="text-gray-600 mb-3">Enter your Mobile Number</Text>

                <View className="flex-row items-center">
                <TouchableOpacity
                    activeOpacity={0.8}
                    className="h-14 w-14 rounded-lg bg-bg-primary border border-gray-200 items-center justify-center mr-3"
                >
                    <Image
                    source={require('@/assets/images/Flag_of_India.png')}
                    style={{ width: 20, height: 14}}
                    contentFit="contain"
                    cachePolicy="memory-disk"
                    />
                    <Text className="text-xs mt-1">+91</Text>
                </TouchableOpacity>

                <View className="flex-1">
                    <TextInput
                    ref={inputRef}
                    value={phone}
                    onChangeText={onChangePhone}
                    keyboardType={Platform.OS === "ios" ? "number-pad" : "phone-pad"}
                    returnKeyType="done"
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    placeholderTextColor="#9CA3AF"
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    style={{
                        height: 56,
                        paddingHorizontal: 12,
                        borderRadius: 8,
                        borderWidth: 1,
                        backgroundColor: "#fff",
                        fontSize: 20,
                        letterSpacing: 2
                    }}
                    className={cn(focused ? 'border-gray-800' : 'border-gray-300')}
                    />
                </View>
                </View>
            </View>
            </View>

            <View className="flex-1" />

            <View className="px-6 mb-4 items-center">
            <Text className="text-center text-gray-500">
                By clicking Continue, you agree to our{" "}
                <Text className="text-primary underline"
                onPress={() => router.push('/terms-conditions')}
                >
                T&Cs
                </Text>
            </Text>
            </View>

            <View className="px-6 pb-4">
            <AnimatedView style={[animatedStyle]}>
                <Button
                mode="contained"
                onPress={onPressContinue}
                disabled={!enabled}
                loading = {loading}
                contentStyle={{ paddingVertical: 8 }}
                labelStyle={{ fontSize: 16, fontWeight: "600" }}
                style={{ borderRadius: 12, elevation: enabled ? 2 : 0, backgroundColor: enabled ? "#111827" : "#F3F4F6" }}
                >
                  <Text style={{ color: enabled ? "#fff" : "#9CA3AF" }}>
                      Continue
                  </Text>
                </Button>
            </AnimatedView>
            </View>
        </ScrollView>
    </KeyboardAwareScrollView>
    </SafeAreaView>
    </PaperProvider>
  );
}
