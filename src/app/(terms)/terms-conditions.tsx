import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'

const TermsConditions = () => {
  return (
    <SafeAreaView className='flex-1 bg-white h-full'>
      <View className="px-5 py-4 border-b border-gray-200 bg-white">
        <Text className="text-2xl font-bold text-gray-900 mt-2">
          Terms of Service
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-5 mb-5 py-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        <Text className="text-gray-800 text-base leading-6 mb-4">
          Welcome to <Text className="font-semibold">Foodo Partners</Text> — the
          platform designed to simplify order management, menu control, and
          partner operations. By using our app, you agree to the following
          terms. Please read them carefully before continuing.
        </Text>

        <Text className="text-lg font-semibold text-gray-900 mb-2">
          1. Acceptance of Terms
        </Text>
        <Text className="text-gray-700 text-base leading-6 mb-4">
          By registering or using the Foodo Partners app, you confirm that you
          have read, understood, and agree to these Terms of Service. If you do
          not agree, you may not access or use the app.
        </Text>

        <Text className="text-lg font-semibold text-gray-900 mb-2">
          2. Partner Responsibilities
        </Text>
        <Text className="text-gray-700 text-base leading-6 mb-4">
          As a vendor or partner, you are responsible for maintaining accurate
          menu information, pricing, and order fulfillment. Misrepresentation or
          violation of local regulations may result in account suspension or
          termination.
        </Text>

        <Text className="text-lg font-semibold text-gray-900 mb-2">
          3. App Usage & Data
        </Text>
        <Text className="text-gray-700 text-base leading-6 mb-4">
          The app collects operational and performance data to improve our
          services. We respect your privacy — please refer to our{" "}
          <Text
            className="text-blue-600 underline"
            onPress={() => router.push("/privacy-policy")}
          >
            Privacy Policy
          </Text>{" "}
          for details on data handling.
        </Text>

        <Text className="text-lg font-semibold text-gray-900 mb-2">
          4. Payments & Settlements
        </Text>
        <Text className="text-gray-700 text-base leading-6 mb-4">
          Payment schedules and settlement policies are governed by Foodo’s
          partner agreement. Delayed or incorrect bank details may affect your
          payout schedule.
        </Text>

        <Text className="text-lg font-semibold text-gray-900 mb-2">
          5. Intellectual Property
        </Text>
        <Text className="text-gray-700 text-base leading-6 mb-4">
          All trademarks, logos, and content within the app are the property of
          Foodo or its affiliates. Unauthorized use, reproduction, or
          distribution of the app content is strictly prohibited.
        </Text>

        <Text className="text-lg font-semibold text-gray-900 mb-2">
          6. Limitation of Liability
        </Text>
        <Text className="text-gray-700 text-base leading-6 mb-4">
          Foodo is not liable for any indirect, incidental, or consequential
          damages arising from the use or inability to use the app. The app is
          provided “as is” without any warranties.
        </Text>

        <Text className="text-lg font-semibold text-gray-900 mb-2">
          7. Updates to Terms
        </Text>
        <Text className="text-gray-700 text-base leading-6 mb-4">
          We may update these Terms periodically. Continued use of the app after
          updates constitutes your acceptance of the revised Terms of Service.
        </Text>

        <Text className="text-sm text-gray-500 mt-6">
          Last updated: November 2025
        </Text>
      </ScrollView>

      <View className="absolute bottom-4 left-0 right-0 px-5 py-4 bg-white border-t border-gray-200">
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-black rounded-xl py-4"
        >
          <Text className="text-white text-center font-semibold text-base">
            Accept & Continue
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

export default TermsConditions