import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import FormTextInput from '@/src/components/CustomTextInput';
import FormDropdown from '@/src/components/CustomDropdown';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import CustomButton from '@/src/components/CustomButton';
import LocationPickerWithMap from '@/src/components/CustomLocationPicker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import ImagePickerField from '@/src/components/CustomImagePicker';
import ComboItemsManager from '@/src/components/menu/ComboItemsManager';

export default function SetupBusiness() {
    const [loading, setLoading] = useState(false);

    const methods = useForm({
        // resolver: yupResolver(schema),
        // defaultValues: {
        //   kitchenName: '',
        //   kitchenType: '',
        //   contactNumber: '',
        //   businessEmail: '',
        //   location: {
        //     "address": '',
        //     "latitude": 22.5726,
        //     "longitude": 88.3639,
        //     "raw": { }
        //   }
        // },
    });


    const { handleSubmit, control, setValue, getValues, reset } = methods;

    const onSubmit = async (data: any) => {
        setLoading(true);
        try {

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
                <View className="px-4 pt-1 pb-2 border-b border-gray-200 bg-bg-primary flex-row gap-5 relative">
                    <TouchableOpacity onPress={() => router.back()}>
                        <MaterialIcons name="arrow-back" size={24} color="black" />
                    </TouchableOpacity>
                    <Text className="text-xl font-inter-semibold text-gray-900">
                        Add New Combo
                    </Text>
                </View>
                <KeyboardAwareScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    enableOnAndroid={true}
                    showsVerticalScrollIndicator={false}
                >
                    <ScrollView contentContainerStyle={{ paddingVertical: 15, paddingHorizontal: 20 }} keyboardShouldPersistTaps="handled">

                        <View className="bg-bg-primary rounded-2xl p-4 border-border-primary border shadow-sm">
                            <FormTextInput control={control} name="kitchenName" label="Combo Name" placeholder="e.g., Veg Thali"/>
                            <FormTextInput control={control} name="description" label="Description (Optional)" placeholder="Enter a description for your meal" multiline={true} inputHeight={108}/>
                            <FormDropdown control={control} name="itemType" label="Meal Type" placeholder='Select Meal Type' options={['Breakfast', 'Lunch', 'Dinner']} />
                            <FormTextInput control={control} icon='currency-rupee' name="price" label="Price" placeholder="0.00" keyboardType='number-pad' inputMode='numeric' />

                            {/* <CustomButton onPress={handleSubmit(onSubmit)} title='Continue' isLoading={loading} /> */}
                        </View>

                        <View className="mt-4 bg-bg-primary rounded-2xl p-4 border-border-primary border shadow-sm">
                            <ImagePickerField control={control} name="itemPhoto" label="Upload Combo Image" height={180} />
                        </View>

                        <ComboItemsManager />

                        <View style={{ height: 24 }} />
                    </ScrollView>
                </KeyboardAwareScrollView>
            </SafeAreaView>
        </FormProvider>
    );
}
