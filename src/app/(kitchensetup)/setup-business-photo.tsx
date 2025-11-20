import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Alert } from 'react-native';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { SafeAreaView } from 'react-native-safe-area-context';
import { kitchenSchema4 as schema } from '@/src/lib/validations/kitchenSetup.schema';
import FormTextInput from '@/src/components/CustomTextInput';
import StepHeader from '@/src/components/StepHeader';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import CustomButton from '@/src/components/CustomButton';
import { formSubmit } from '@/src/services/dbCalls';
import useRegistrationKitchen from '@/src/stores/kitchenSetupStore';
import ImagePickerField from '@/src/components/CustomImagePicker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function SetupBusinessPhotoDetails() {
  const [loading, setLoading] = useState(false);
  const { setSetupBusinessPhoto, getCombined, setupBusinessPhoto } = useRegistrationKitchen();
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      businessPhoto: {},
    },
  });

  const { handleSubmit, control, setValue, getValues, reset } = methods;
  useEffect(() => {
    reset(setupBusinessPhoto);
  }, []);

  const onSubmit = async(data: any) => {
    setLoading(true);
    try {
      setSetupBusinessPhoto({
        businessPhoto: data.businessPhoto,
      });
      const businessPhoto = useRegistrationKitchen.getState().setupBusinessPhoto;
      console.log("Business Photo", businessPhoto);
      console.log("Combined data: ", getCombined());
      await formSubmit(data);
      router.replace('/registration-confirmation');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      Alert.alert("Error", errorMessage)
    }
    finally{
      setLoading(false);
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
              Business Photo
            </Text>
          </View>
          
        <KeyboardAwareScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          enableOnAndroid={true}
          showsVerticalScrollIndicator={false}
        >
          <ScrollView contentContainerStyle={{ paddingVertical: 15, paddingHorizontal: 20 }} keyboardShouldPersistTaps="handled">
            <StepHeader step={4} total={4} info='Business Photo' />
            <Text className="text-3xl font-inter-bold mb-6">Upload Business Photo</Text>


            <View className="bg-bg-primary rounded-2xl p-4 border-border-primary border shadow-sm">
              <Text className="text-2xl font-extrabold mb-2">Showcase Your Kitchen</Text>
              <Text className="text-text-primary mb-4 font-inter">Upload a high-quality photo of your kitchen or a promotional image. This will be the first thing customers see.</Text>

              <ImagePickerField control={control} name="businessPhoto" label="Upload Business Photo" height={360} />

              <CustomButton onPress={handleSubmit(onSubmit)} title='Submit' isLoading={loading} />
            </View>

            <View style={{ height: 24 }} />
          </ScrollView>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </FormProvider>
  );
}
