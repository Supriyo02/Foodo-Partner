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
  const {setSetupKitchen, setupKitchen} = useRegistrationKitchen();
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
        "raw": { }
      }
    },
  });


  const { handleSubmit, control, setValue, getValues, reset } = methods;
  useEffect(() => {
    reset(setupKitchen);
  }, []);

  const onSubmit = async(data: any) => {
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
    finally{
      setLoading(false);
      Alert.alert('Saved', 'Form saved successfully — implement navigation to next step.');
    }
  };

  return (
    <FormProvider {...methods}>
      <SafeAreaView className="flex-1 bg-bg-primary">
        <KeyboardAwareScrollView
                  contentContainerStyle={{ flexGrow: 1 }}
                  enableOnAndroid={true}
                  showsVerticalScrollIndicator={false}
                >
          <View className="px-4 py-2 border-b border-gray-200 bg-bg-primary flex-row relative">
            <TouchableOpacity onPress={() => router.back()}>
              <MaterialIcons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <Text className="absolute left-1/2 -translate-x-1/2 text-2xl font-inter-bold text-gray-900">
              Kitchen Details
            </Text>
          </View>
          <ScrollView contentContainerStyle={{ paddingVertical: 15, paddingHorizontal: 20 }} keyboardShouldPersistTaps="handled">
            <StepHeader step={1} total={4} info='Kitchen Details' />
            <Text className="text-3xl font-inter-bold mb-6">Setup Your Kitchen Profile</Text>

            <View className="bg-bg-primary rounded-2xl p-4 border-border-primary border shadow-sm">
              <Text className="text-lg text-text-secondary font-inter-bold mb-3">Basic Information</Text>
              <FormTextInput control={control} name="kitchenName" label="Kitchen Name" placeholder="e.g., Grandma's Comfort Kitchen" icon="store" />
              <FormDropdown control={control} name="kitchenType" label="What type of kitchen is this?" options={['Home Kitchen', 'Cloud Kitchen', 'Restaurant']} />
              <FormTextInput control={control} name="contactNumber" label="Contact Number" placeholder="Enter your contact number" keyboardType="phone-pad" icon="phone" maxLength={10} />
              <FormTextInput control={control} name="businessEmail" label="Business Email" placeholder="you@example.com" keyboardType="email-address" icon="email" />

              {/* <Text className="text-lg text-text-secondary font-inter-bold mb-3 mt-4">Kitchen Location</Text>
              <FormTextInput control={control} name="address" label="Full Kitchen Address" placeholder="123 Foodie Lane, Flavor Town" multiline />

              <View className="h-40 my-4 rounded-lg overflow-hidden bg-gray-100 items-center justify-center">
                <Text className="text-gray-400">[Map preview placeholder — integrate react-native-maps in real app]</Text>
              </View> */}

              {/* <CustomLocationPicker control={control} /> */}

              <LocationPickerWithMap control={control} name="location" apiKey='4560770ebd274d458a62b41073058658' />

              {/* <TouchableOpacity onPress={handleSubmit(onSubmit)} className="bg-primary rounded-xl p-4 w-full flex flex-row justify-center">
                <Text className='text-white font-inter-bold paragraph-semibold'>Save and Continue</Text>
              </TouchableOpacity> */}
              <CustomButton onPress={handleSubmit(onSubmit)} title='Continue' isLoading={loading} />
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
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </FormProvider>
  );
}
