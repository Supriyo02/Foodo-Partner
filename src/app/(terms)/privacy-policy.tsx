import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'

const PrivacyPolicy = () => {
  return (
    <SafeAreaView className='flex-1 bg-white h-full'>
      <View className="px-5 py-4 border-b border-gray-200 bg-white">
        <Text className="text-2xl font-bold text-gray-900 mt-2">
          Privacy Policy
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-5 mb-5 py-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        <Text className="text-gray-800 text-base leading-6 mb-4">
          Your privacy is important to us. This Privacy Policy explains how{" "}
          <Text className="font-semibold">Foodo Partners</Text> collects, uses,
          and protects your personal and business information when you use our
          application and services.
        </Text>

        <Text className="text-lg font-semibold text-gray-900 mb-2">
          1. Information We Collect
        </Text>
        <Text className="text-gray-700 text-base leading-6 mb-4">
          We collect information you provide during registration and usage,
          including your business name, contact details, menu items, pricing,
          and bank account information for payments. We also collect app usage
          and performance data to enhance your experience.
        </Text>

        <Text className="text-lg font-semibold text-gray-900 mb-2">
          2. How We Use Your Data
        </Text>
        <Text className="text-gray-700 text-base leading-6 mb-4">
          Your information is used to manage orders, process payments, and
          improve our services. We may use anonymized data for analytics and
          service optimization. We never sell or rent your personal data to
          third parties.
        </Text>

        <Text className="text-lg font-semibold text-gray-900 mb-2">
          3. Data Sharing & Disclosure
        </Text>
        <Text className="text-gray-700 text-base leading-6 mb-4">
          We only share necessary data with trusted third-party service
          providers (e.g., payment gateways) to facilitate operations. All
          partners are contractually obligated to handle your data securely and
          in compliance with applicable privacy laws.
        </Text>

        <Text className="text-lg font-semibold text-gray-900 mb-2">
          4. Data Security
        </Text>
        <Text className="text-gray-700 text-base leading-6 mb-4">
          We implement appropriate security measures to protect your
          information, including encryption, secure servers, and limited access
          controls. However, no system is completely secure, and we cannot
          guarantee absolute protection.
        </Text>

        <Text className="text-lg font-semibold text-gray-900 mb-2">
          5. Your Rights
        </Text>
        <Text className="text-gray-700 text-base leading-6 mb-4">
          You may access, update, or delete your personal data by contacting our
          support team. You can also withdraw consent for non-essential data
          collection at any time through your app settings.
        </Text>

        <Text className="text-lg font-semibold text-gray-900 mb-2">
          6. Data Retention
        </Text>
        <Text className="text-gray-700 text-base leading-6 mb-4">
          We retain your information only for as long as necessary to fulfill
          operational or legal obligations. After termination of your account,
          data may be anonymized or securely deleted.
        </Text>

        <Text className="text-lg font-semibold text-gray-900 mb-2">
          7. Policy Updates
        </Text>
        <Text className="text-gray-700 text-base leading-6 mb-4">
          We may update this Privacy Policy from time to time. Changes will be
          communicated within the app or by email. Continued use after updates
          implies your acceptance of the revised policy.
        </Text>

        <Text className="text-lg font-semibold text-gray-900 mb-2">
          8. Contact Us
        </Text>
        <Text className="text-gray-700 text-base leading-6 mb-4">
          If you have any questions about this Privacy Policy, contact us at{" "}
          <Text className="text-blue-600 underline">
            support@foodo-partners.com
          </Text>
          .
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

export default PrivacyPolicy