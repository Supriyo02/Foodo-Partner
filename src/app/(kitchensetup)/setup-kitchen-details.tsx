import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { kitchenSchema1 as schema } from '@/src/lib/validations/kitchenSetup.schema';
import FormTextInput from '@/src/components/CustomTextInput';
import FormDropdown from '@/src/components/CustomDropdown';
import StepHeader from '@/src/components/StepHeader';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import CustomButton from '@/src/components/CustomButton';
import LocationPickerWithMap from '@/src/components/CustomLocationPicker';
import { formSubmit } from '@/src/services/dbCalls';
import useRegistrationKitchen from '@/src/stores/kitchenSetupStore';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function SetupBusiness() {
  const [loading, setLoading] = useState(false);
  const { setSetupKitchen, setupKitchen } = useRegistrationKitchen();
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      kitchenName: '',
      kitchenType: '',
      contactNumber: '',
      businessEmail: '',
      location: {
        "address": '',
        "latitude": 22.5726,
        "longitude": 88.3639,
        "raw": {}
      }
    },
  });


  const { handleSubmit, control, setValue, getValues, reset } = methods;
  useEffect(() => {
    reset(setupKitchen);
  }, []);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      setSetupKitchen({
        kitchenName: data.kitchenName,
        kitchenType: data.kitchenType,
        contactNumber: data.contactNumber,
        businessEmail: data.businessEmail,
        location: data.location,
      });
      const kitchenDetails = useRegistrationKitchen.getState().setupKitchen;
      console.log("Kitchen details: ", kitchenDetails);
      await formSubmit(data);
      router.push('/setup-business');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      Alert.alert("Error", errorMessage)
    }
    finally {
      setLoading(false);
      Alert.alert('Saved', 'Form saved successfully — implement navigation to next step.');
    }
  };

  return (
    <FormProvider {...methods}>
      <SafeAreaView className="flex-1 bg-bg-primary">
        <View className="px-4 py-2 border-b border-gray-200 bg-bg-primary flex-row relative">
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text className="absolute left-1/2 -translate-x-1/2 text-2xl font-inter-bold text-gray-900">
            Kitchen Details
          </Text>
        </View>
        <KeyboardAwareScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          enableOnAndroid={true}
          showsVerticalScrollIndicator={false}
        >
          <ScrollView contentContainerStyle={{ paddingVertical: 15, paddingHorizontal: 20 }} keyboardShouldPersistTaps="handled">
            <StepHeader step={1} total={4} info='Kitchen Details' />
            <Text className="text-3xl font-inter-bold mb-6">Setup Your Kitchen Profile</Text>

            <View className="bg-bg-primary rounded-2xl p-4 border-border-primary border shadow-sm">
              <Text className="text-lg text-text-secondary font-inter-bold mb-3">Basic Information</Text>
              <FormTextInput control={control} name="kitchenName" label="Kitchen Name" placeholder="e.g., Grandma's Comfort Kitchen" icon="store" />
              <FormDropdown control={control} name="kitchenType" icon='kitchen' label="What type of kitchen is this?" placeholder='Select kitchen type' options={['Home Kitchen', 'Cloud Kitchen', 'Restaurant']} />
              <FormTextInput control={control} name="contactNumber" label="Contact Number" placeholder="Enter your contact number" keyboardType="phone-pad" icon="phone" maxLength={10} />
              <FormTextInput control={control} name="businessEmail" label="Business Email" placeholder="you@example.com" keyboardType="email-address" icon="email" />

              <LocationPickerWithMap label='Kitchen Address' control={control} name="location" apiKey='4560770ebd274d458a62b41073058658' />

              <CustomButton onPress={handleSubmit(onSubmit)} title='Continue' isLoading={loading} />
            </View>


            <View style={{ height: 24 }} />
          </ScrollView>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </FormProvider>
  );
}
