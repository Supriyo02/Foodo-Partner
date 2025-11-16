import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { kitchenSchema2 as schema } from '@/src/lib/validations/kitchenSetup.schema';
import FormTextInput from '@/src/components/CustomTextInput';
import FormDropdown from '@/src/components/CustomDropdown';
import StepHeader from '@/src/components/StepHeader';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import CustomButton from '@/src/components/CustomButton';
import LocationPickerWithMap from '@/src/components/CustomLocationPicker';
import { formSubmit } from '@/src/services/dbCalls';
import useRegistrationKitchen from '@/src/stores/kitchenSetupStore';
import ImagePickerField from '@/src/components/CustomImagePicker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function SetupBusiness() {
  const [loading, setLoading] = useState(false);
  const { setSetupBusiness, getCombined, setupBusiness } = useRegistrationKitchen();
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      panNumber: '',
      idProof: {},
      gstNumber: '',
    },
  });

  const { handleSubmit, control, setValue, getValues, reset } = methods;
  useEffect(() => {
      reset(setupBusiness);
    }, []);

  const onSubmit = async(data: any) => {
    setLoading(true);
    try {
      setSetupBusiness({
        panNumber: data.panNumber,
        idProof: data.idProof,
        gstNumber: data.gstNumber,
      });
      const businessDetails = useRegistrationKitchen.getState().setupBusiness;
      console.log("Business details", businessDetails);
      await formSubmit(data);
      router.push('/setup-bank-details');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      Alert.alert("Error", errorMessage)
    }
    finally{
      setLoading(false);
      Alert.alert('Saved', 'Form saved successfully - proceed to next step');
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
              Verification Details
            </Text>
          </View>
          <ScrollView contentContainerStyle={{ paddingVertical: 15, paddingHorizontal: 20 }} keyboardShouldPersistTaps="handled">
            <StepHeader step={2} total={4} info='Verification Details' />
            <Text className="text-3xl font-inter-bold mb-6">Provide Business & ID Details</Text>


            <View className="bg-bg-primary rounded-2xl p-4 border-border-primary border shadow-sm">
              <Text className="text-2xl font-extrabold mb-2">Business & ID Details</Text>
              <Text className="text-gray-400 mb-4">Please provide your official business and identification documents.</Text>

              <FormTextInput control={control} name="panNumber" label="PAN Card Number" placeholder="Enter your PAN card number" icon="file-copy" maxLength={10} />
              <FormTextInput control={control} name="gstNumber" label="GST Number (Optional)" placeholder="Enter your GST number" icon='request-page' />
              <ImagePickerField control={control} name="idProof" label="Upload ID Proof" height={140} />

              <CustomButton onPress={handleSubmit(onSubmit)} title='Continue' isLoading={loading} />
            </View>

            <View style={{ height: 24 }} />
          </ScrollView>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </FormProvider>
  );
}
