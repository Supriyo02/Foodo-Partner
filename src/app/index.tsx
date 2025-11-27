import { SafeAreaView } from "react-native-safe-area-context";
import ImageCarousel from "../components/ImageCarousal";
import { ImageSliderData } from "../data/OnboardingData";
import { Dimensions, Text, View, TouchableOpacity, Linking } from "react-native";
import { router } from "expo-router";

export default function Index() {
  return (
    <SafeAreaView className="flex-1 bg-bg-secondary h-full relative">
      <ImageCarousel slides={ImageSliderData} height={Dimensions.get('screen').height / 1.4} autoPlay autoPlayInterval={2000} />
      <View className=" absolute bottom-1 items-center w-full">
        <View className="w-full px-6 mb-10">

          <TouchableOpacity
            onPress={() => router.push('/inbox/inbox-tabs')}
            activeOpacity={0.8}
            className="bg-primary py-4 rounded-xl mb-3"
          >
            <Text className="text-white text-center text-lg font-inter-semibold">
              Login
            </Text>
          </TouchableOpacity>

          <View className="mt-6 items-center">
            <Text className="text-center text-gray-500 text-sm">
              By continuing, you agree to our
            </Text>


            <View className="flex-row flex-wrap justify-center mt-1">
              <Text
                className="text-primary text-sm underline mx-1"
                onPress={() => router.push('/terms-conditions')}
              >
                Terms of Service
              </Text>
              <Text className="text-gray-400">|</Text>
              <Text
                className="text-primary text-sm underline mx-1"
                onPress={() => router.push('/privacy-policy')}
              >
                Privacy Policy
              </Text>
              <Text className="text-gray-400">|</Text>
              <Text
                className="text-primary text-sm underline mx-1"
                onPress={() => router.push('/code-of-conduct')}
              >
                Code of Conduct
              </Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
