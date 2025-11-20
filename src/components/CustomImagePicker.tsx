import React from 'react';
import {View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Controller } from 'react-hook-form';
import { Entypo } from '@expo/vector-icons';


export default function ImagePickerField({ control, name, label, height = 160 }: any) {
  const pickImage = async (onChange: (val: any) => void) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
        Alert.alert('Permission required', 'We need access to your photos to upload document.');
        return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
    });

    if (!result.canceled && result.assets?.length > 0) {
        const pickedImage = result.assets[0];
        onChange(pickedImage);
    }
    };

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange }, fieldState: { error } }) => (
        <View className="mb-4">
          {label && <Text className="text-md font-inter-semibold mb-1">{label}</Text>}
          <TouchableOpacity
            onPress={() => pickImage(onChange)}
            className={`rounded-lg border border-dashed ${error ? 'border-red-500' : 'border-gray-200'} items-center justify-center`}
            style={{ height }}
            accessibilityRole="button"
          >
            {value?.uri ? (
              <Image source={typeof value === "string" ? { uri: value } : value} style={{ width: '100%', height: '100%', borderRadius: 12 }} resizeMode="cover" />
            ) : (
              <View className="items-center justify-center flex-1">
                <Entypo name="upload" size={28} color='#ea0b2c' />
                <Text className="mt-2 text-sm text-primary font-inter">Click to upload</Text>
                <Text className="text-xs text-gray-500 font-inter">JPG, PNG, SVG (Max 5MB)</Text>
              </View>
            )}
          </TouchableOpacity>
          {error && <Text className="text-sm text-red-600 mt-1">{error.message}</Text>}
        </View>
      )}
    />
  );
}