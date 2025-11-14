import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {useForm} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
import * as yup from 'yup';
import LocationPickerWithMap from '@/src/components/CustomLocationPicker';

const schema = yup.object({
  location: yup
    .object({
      address: yup.string().required('Address is required'),
      latitude: yup.number().required(),
      longitude: yup.number().required(),
    })
    .required('Location is required'),
});

export default function SampleLocationForm() {
  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {location: {}},
  });

  function onSubmit(data: any) {
    console.log('Payload:', data);
  }

  return (
    <View className="flex-1 p-4 bg-white">
      <Text className="text-xl font-semibold mb-4">Kitchen Setup</Text>

      {/* <LocationPickerWithMap
        control={control}
        name="location"
        apiKey='4560770ebd274d458a62b41073058658'
        mapHeight={260}
      /> */}

        <LocationPickerWithMap control={control} name="location" apiKey='4560770ebd274d458a62b41073058658' showDebug />
      {errors.location && (
        <Text className="text-red-500 text-sm mt-2">{errors.location.message}</Text>
      )}

      <TouchableOpacity
        onPress={handleSubmit(onSubmit)}
        className="bg-blue-600 py-3 rounded-xl mt-6 items-center">
        <Text className="text-white font-semibold text-base">Submit</Text>
      </TouchableOpacity>
    </View>
  );
}
