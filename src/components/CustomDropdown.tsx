import React, { useState } from 'react';
import {View, Text, TouchableOpacity } from 'react-native';
import { Controller} from 'react-hook-form';
import { MaterialIcons } from '@expo/vector-icons';

export default function FormDropdown({ control, name, label, placeholder='Select', icon, options = [] }: any) {
  const [open, setOpen] = useState(false);
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View className="mb-4">
          {label && <Text className="text-md font-inter-semibold mb-1">{label}</Text>}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setOpen((s) => !s)}
            className={`flex-row items-center rounded-lg border ${error ? 'border-red-500' : 'border-border-primary'} px-3 justify-between`}
            style={{ height: 42 }}
            accessibilityRole="button"
            accessibilityLabel={`${label || name} dropdown`}
          >
            <View className="flex-row items-center">
              {icon && <MaterialIcons name={icon} size={18} className="mr-2" color={'#66666b'} />}
              <Text className={`${value ? 'text-text-primary font-inter' : 'text-text-secondary'}`}>{value || placeholder}</Text>
            </View>
            <MaterialIcons name="keyboard-arrow-down" size={24} color={'#66666b'} />
          </TouchableOpacity>

          {open && (
            <View className="mt-1 rounded-lg border border-border-primary bg-bg-secondary">
              {options.map((opt: string) => (
                <TouchableOpacity
                  key={opt}
                  onPress={() => {
                    onChange(opt);
                    setOpen(false);
                  }}
                  className="px-4 py-3"
                >
                  <Text>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {error && <Text className="text-sm text-red-600 mt-1">{error.message}</Text>}
        </View>
      )}
    />
  );
}
