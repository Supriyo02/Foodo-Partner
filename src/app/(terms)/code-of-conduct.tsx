import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'

const CodeOfConduct = () => {
  return (
    <SafeAreaView className='flex-1 bg-white h-full'>
      <View className="px-5 py-4 border-b border-gray-200 bg-white">
        <Text className="text-2xl font-bold text-gray-900 mt-2">
          Code of Conduct
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-5 mb-5 py-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        <Text className="text-gray-800 text-base leading-6 mb-4">
          The <Text className="font-semibold">Foodo Partners</Text> Code of
          Conduct outlines the principles and behaviors expected from all
          vendors and partners using our platform. It ensures a safe, reliable,
          and professional experience for both customers and businesses.
        </Text>

        <Text className="text-lg font-semibold text-gray-900 mb-2">
          1. Integrity & Professionalism
        </Text>
        <Text className="text-gray-700 text-base leading-6 mb-4">
          Partners must operate with honesty and transparency. All information
          related to pricing, availability, and service must be accurate and
          regularly updated. Misleading listings or fraudulent activities are
          strictly prohibited.
        </Text>

        <Text className="text-lg font-semibold text-gray-900 mb-2">
          2. Respectful Communication
        </Text>
        <Text className="text-gray-700 text-base leading-6 mb-4">
          All communication with customers, delivery partners, and Foodo staff
          must remain courteous and respectful. Harassment, abusive language, or
          discrimination of any kind will not be tolerated.
        </Text>

        <Text className="text-lg font-semibold text-gray-900 mb-2">
          3. Food Safety & Quality
        </Text>
        <Text className="text-gray-700 text-base leading-6 mb-4">
          Partners must comply with all local health, hygiene, and food safety
          regulations. Food must be prepared, packaged, and handled according to
          safe and hygienic practices to maintain customer trust.
        </Text>

        <Text className="text-lg font-semibold text-gray-900 mb-2">
          4. Fair Business Practices
        </Text>
        <Text className="text-gray-700 text-base leading-6 mb-4">
          Partners should not engage in practices such as fake discounts,
          manipulation of ratings, or exploiting platform systems. Promotions
          must be genuine and clearly communicated.
        </Text>

        <Text className="text-lg font-semibold text-gray-900 mb-2">
          5. Compliance with Laws
        </Text>
        <Text className="text-gray-700 text-base leading-6 mb-4">
          All partners must adhere to applicable laws, licenses, and permits
          required for their business operations. Foodo reserves the right to
          suspend accounts found violating regulatory or legal standards.
        </Text>

        <Text className="text-lg font-semibold text-gray-900 mb-2">
          6. Data Protection
        </Text>
        <Text className="text-gray-700 text-base leading-6 mb-4">
          Partners must handle customer data responsibly and use it solely for
          legitimate business purposes such as order fulfillment and service
          improvement. Unauthorized use or sharing of personal data is
          prohibited.
        </Text>

        <Text className="text-lg font-semibold text-gray-900 mb-2">
          7. Accountability
        </Text>
        <Text className="text-gray-700 text-base leading-6 mb-4">
          Foodo expects all partners to uphold the highest standards of
          accountability. Any reported misconduct or violation of this Code may
          lead to warnings, suspension, or permanent removal from the platform.
        </Text>

        <Text className="text-lg font-semibold text-gray-900 mb-2">
          8. Continuous Improvement
        </Text>
        <Text className="text-gray-700 text-base leading-6 mb-4">
          We encourage partners to provide feedback and suggestions that help us
          improve the platform. Collaboration and professionalism strengthen the
          Foodo ecosystem.
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

export default CodeOfConduct