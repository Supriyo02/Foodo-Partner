import React from 'react';
import {ScrollView, View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { kitchenSchema1 as schema } from '@/src/lib/validations/kitchenSetup.schema';
import FormTextInput from '@/src/components/CustomTextInput';
import FormDropdown from '@/src/components/CustomDropdown';
import ImagePickerField from '@/src/components/CustomImagePicker';
import StepHeader from '@/src/components/StepHeader';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import CustomButton from '@/src/components/CustomButton';
import CustomLocationPicker from '@/src/components/CustomLocationPicker';
import LocationPickerWithMap from '@/src/components/CustomLocationPicker';

export default function KitchenSetupScreen() {
  const methods = useForm({
    // resolver: yupResolver(schema),
    defaultValues: {
      kitchenName: '',
      kitchenType: '',
      contactNumber: '',
      businessEmail: '',
      address: '',
      // panNumber: '',
      // idProof: '',
      location: {
        "address": '',
        "latitude": 12.345678,
        "longitude": 98.765432,
        "raw": { /* Geoapify feature object (optional) */ }
      }
    },
  });

  const { handleSubmit, control, setValue, getValues } = methods;

  const onSubmit = (data: any) => {
    console.log('FORM SUBMIT', data);
    Alert.alert('Saved', 'Form saved successfully — implement navigation to next step.');
  };

  return (
    <FormProvider {...methods}>
      <SafeAreaView className="flex-1 bg-bg-primary">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
          <View className="px-4 py-2 border-b border-gray-200 bg-white flex-row relative">
            <TouchableOpacity onPress={() => router.back()}>
              <MaterialIcons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <Text className="absolute left-1/2 -translate-x-1/2 text-2xl font-inter-bold text-gray-900">
              Kitchen Details
            </Text>
          </View>
          <ScrollView contentContainerStyle={{ paddingVertical: 15, paddingHorizontal: 20}} keyboardShouldPersistTaps="handled">
            <StepHeader step={1} total={4} info='Kitchen Details'/>
            <Text className="text-3xl font-inter-bold mb-6">Setup Your Kitchen Profile</Text>

            <View className="bg-bg-primary rounded-2xl p-4 border-border-primary border shadow-sm">
              <Text className="text-lg text-text-secondary font-inter-bold mb-3">Basic Information</Text>
              <FormTextInput control={control} name="kitchenName" label="Kitchen Name" placeholder="e.g., Grandma's Comfort Kitchen" icon="store" />
              <FormDropdown control={control} name="kitchenType" label="What type of kitchen is this?" options={[ 'Home Kitchen', 'Cloud Kitchen', 'Restaurant' ]} />
              <FormTextInput control={control} name="contactNumber" label="Contact Number" placeholder="Enter your contact number" keyboardType="phone-pad" icon="phone" maxLength={10} />
              <FormTextInput control={control} name="businessEmail" label="Business Email" placeholder="you@example.com" keyboardType="email-address" icon="email" />

              {/* <Text className="text-lg text-text-secondary font-inter-bold mb-3 mt-4">Kitchen Location</Text>
              <FormTextInput control={control} name="address" label="Full Kitchen Address" placeholder="123 Foodie Lane, Flavor Town" multiline />

              <View className="h-40 my-4 rounded-lg overflow-hidden bg-gray-100 items-center justify-center">
                <Text className="text-gray-400">[Map preview placeholder — integrate react-native-maps in real app]</Text>
              </View> */}

              {/* <CustomLocationPicker control={control} /> */}

              {/* <LocationPickerWithMap control={control} apiKey='4560770ebd274d458a62b41073058658' /> */}
              <LocationPickerWithMap control={control} name="location" apiKey='4560770ebd274d458a62b41073058658'  />

              {/* <TouchableOpacity onPress={handleSubmit(onSubmit)} className="bg-primary rounded-xl p-4 w-full flex flex-row justify-center">
                <Text className='text-white font-inter-bold paragraph-semibold'>Save and Continue</Text>
              </TouchableOpacity> */}
              <CustomButton onPress={handleSubmit(onSubmit)} title='Continue' />
            </View>

            {/* <View className="mt-6 bg-white rounded-2xl p-4 shadow-sm">
              <Text className="text-2xl font-extrabold mb-2">Business & ID Details</Text>
              <Text className="text-gray-400 mb-4">Please provide your official business and identification documents.</Text>

              <FormTextInput control={control} name="panNumber" label="PAN Card Number" placeholder="Enter your PAN card number" />
              <FormTextInput control={control} name="gstNumber" label="GST Number (Optional)" placeholder="Enter your GST number" />

              <ImagePickerField control={control} name="idProof" label="Upload ID Proof" height={140} />

              <View className="mt-4">
                <Button mode="contained" onPress={handleSubmit(onSubmit)} className="rounded-full">Next: Bank Details</Button>
                <TouchableOpacity onPress={() => Alert.alert('Saved', 'Progress saved locally — implement persistence as needed')} className="mt-3 items-center">
                  <Text className="text-red-600 font-semibold">Save and Exit</Text>
                </TouchableOpacity>
              </View>
            </View> */}

            <View style={{ height: 24 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </FormProvider>
  );
}
