import React from 'react';
import {View, Text, TextInput as RNTextInput} from 'react-native';
import { Controller} from 'react-hook-form';
import { MaterialIcons, Entypo } from '@expo/vector-icons';

export default function FormTextInput({ control, name, label, placeholder, keyboardType = 'default', multiline = false, inputHeight = 42, icon, ...rest }: any) {
    return (
        <Controller
            control={control}
            name={name}
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <View className="mb-4">
                    {label && <Text className="text-md font-inter-semibold mb-1">{label}</Text>}
                    <View className={`flex-row items-center rounded-lg border ${error ? 'border-red-500' : 'border-border-primary'} px-3`} style={{ height: inputHeight }}>
                        {icon ? <View className="mr-2"><MaterialIcons name={icon} size={20} color={'#66666b'} /></View> : null}
                        <RNTextInput
                            value={value}
                            placeholder={placeholder}
                            placeholderTextColor="#8A8A8E"
                            onChangeText={onChange}
                            onBlur={onBlur}
                            keyboardType={keyboardType}
                            multiline={multiline}
                            className="flex-1 font-inter text-text-primary"
                            accessible
                            accessibilityLabel={label || name}
                            style={{ paddingVertical: multiline ? 8 : 0, fontSize: 14, fontFamily: 'Inter-Regular', }}
                            {...rest}
                        />
                    </View>
                    {error && <Text className="text-sm text-red-600 mt-1">{error.message}</Text>}
                </View>
            )}
        />
    );
}