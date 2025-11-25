import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { addItemSchema } from '@/src/lib/validations/addMenu.schema';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import ImagePickerField from '@/src/components/CustomImagePicker';
import FormTextInput from '@/src/components/CustomTextInput';
import FormDropdown from '@/src/components/CustomDropdown';
import FormToggle from '@/src/components/customToggle';
import CustomButton from '@/src/components/CustomButton';

const AddItem = () => {
  const [loading, setLoading] = useState(false);
  const methods = useForm({
    resolver: yupResolver(addItemSchema),
    defaultValues: {
      itemPhoto: undefined,
      name: '',
      description: '',
      itemType: '',
      price: undefined,
      isAvailable: false,
      stockQuantity: 0,
    },
  });
  const { handleSubmit, control, setValue, getValues, reset, watch } = methods;
  const isAvailable = watch("isAvailable");

  const onSubmit = async(data: any) => {
    setLoading(true);
    try {
      console.log("Item details: ", data);
      router.replace('/menu')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      Alert.alert("Error", errorMessage)
    }
    finally{
      setLoading(false);
      Alert.alert('Saved', 'Item added Successfully');
    }
  };
  
  return (
    <FormProvider {...methods}>
      <SafeAreaView className="flex-1 bg-bg-primary">
        <View className="px-4 pt-1 pb-2 border-b border-gray-200 bg-bg-primary flex-row gap-5 relative">
            <TouchableOpacity onPress={() => router.back()}>
              <MaterialIcons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <Text className="text-xl font-inter-semibold text-gray-900">
              Add New Item
            </Text>
          </View>
        <KeyboardAwareScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          enableOnAndroid={true}
          showsVerticalScrollIndicator={false}
        >
          <ScrollView contentContainerStyle={{ paddingVertical: 10, paddingHorizontal: 10 }} keyboardShouldPersistTaps="handled">
            <View className="bg-bg-primary rounded-2xl p-4">
              <ImagePickerField control={control} name="itemPhoto" label="Upload Item Photo" height={280} />
              <FormTextInput control={control} name="name" label="Item Name" placeholder="e.g. Aloo Posto" />
              <FormTextInput control={control} name="description" label="Description (Optional)" placeholder="Enter a description for your item" multiline={true} inputHeight={108}/>
              <FormDropdown control={control} name="itemType" label="Meal Type" placeholder='Select Meal Type' options={['Breakfast', 'Lunch', 'Dinner']} />
              <FormTextInput control={control} icon='currency-rupee' name="price" label="Price" placeholder="0.00" keyboardType='number-pad' inputMode='numeric' />

              <FormToggle control={control} name="isAvailable" helperText="Item is available" />

              {isAvailable ? (
                <FormTextInput control={control} name="stockQuantity" label="Stock Quantity" placeholder="0" keyboardType="number-pad" />
              ) : null}

              <CustomButton onPress={handleSubmit(onSubmit)} title='Continue' isLoading={loading} />

            </View>

            {/* <View style={{ height: 24 }} /> */}
          </ScrollView>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </FormProvider>
  )
}

export default AddItem