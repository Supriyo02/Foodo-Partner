import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Alert } from 'react-native';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { SafeAreaView } from 'react-native-safe-area-context';
import { kitchenSchema3 as schema } from '@/src/lib/validations/kitchenSetup.schema';
import FormTextInput from '@/src/components/CustomTextInput';
import StepHeader from '@/src/components/StepHeader';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import CustomButton from '@/src/components/CustomButton';
import { formSubmit } from '@/src/services/dbCalls';
import useRegistrationKitchen from '@/src/stores/kitchenSetupStore';
import ImagePickerField from '@/src/components/CustomImagePicker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function SetupBankDetails() {
  const [loading, setLoading] = useState(false);
  const { setSetupBank, getCombined, setupBank } = useRegistrationKitchen();
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      bankName: '',
      accountNumber: '',
      confirmAccountNumber: '',
      ifsc: '',
      upiId: ''
    },
  });

  const { handleSubmit, control, setValue, getValues, reset } = methods;
  useEffect(() => {
    reset(setupBank);
  }, []);

  const onSubmit = async(data: any) => {
    setLoading(true);
    try {
      setSetupBank({
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        confirmAccountNumber: data.confirmAccountNumber,
        ifsc: data.ifsc,
        upiId: data.upiId,
      });
      const bankDetails = useRegistrationKitchen.getState().setupBank;
      console.log("Bank details", bankDetails);
      await formSubmit(data);
      router.push('/setup-business-photo');
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
              Bank Details
            </Text>
          </View>
          <ScrollView contentContainerStyle={{ paddingVertical: 15, paddingHorizontal: 20 }} keyboardShouldPersistTaps="handled">
            <StepHeader step={3} total={4} info='Bank Details' />
            <Text className="text-3xl font-inter-bold mb-6">Provide Bank Details</Text>


            <View className="bg-bg-primary rounded-2xl p-4 border-border-primary border shadow-sm">
              <Text className="text-2xl font-extrabold mb-2">Bank and UPI Details</Text>
              <Text className="text-gray-400 mb-4 font-inter">We will send your earnings to this account. Please enter details cautiously.</Text>

              <FormTextInput control={control} name="bankName" label="Bank Name" placeholder="Enter your Bank Name" icon="cottage"/>
              <FormTextInput control={control} name="accountNumber" label="Account Number" placeholder="Enter correct Bank Account Number" icon="attach-money" maxLength={14} />
              <FormTextInput control={control} name="confirmAccountNumber" label="Confirm Account Number" placeholder="Re-enter Bank Account Number" icon="attach-money" maxLength={14} secureTextEntry={true}/>
              <FormTextInput control={control} name="ifsc" label="IFSC Code" placeholder="Enter the branch IFSC Code" icon="confirmation-number"/>
              <FormTextInput control={control} name="upiId" label="UPI Id" placeholder="Enter the UPI Id" icon="money"/>

              {/* <View className='flex-1' /> */}
              <View className='flex-row gap-2 p-1'>
                <MaterialIcons name='lock' size={16} color={'#66666b'} />
                <Text className="text-gray-400  items-center font-inter text-sm">Your details are encrypted and secure</Text>
              </View>

              <CustomButton onPress={handleSubmit(onSubmit)} title='Continue' isLoading={loading} />
            </View>

            <View style={{ height: 24 }} />
          </ScrollView>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </FormProvider>
  );
}
