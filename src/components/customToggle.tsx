import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Controller, Control } from "react-hook-form";
import { Switch } from "react-native-paper";

export default function FormToggle({ control, name, label, helperText, defaultValue = false }: any) {
  return (
    <Controller
      control={control}
      name={name}
      defaultValue={defaultValue}
      render={({ field: { value, onChange }, fieldState: { error } }) => {
        const isOn = Boolean(value);

        return (
          <View className="mb-4">
            <TouchableOpacity
              onPress={() => onChange(!isOn)}
              className={`flex-row items-center justify-between rounded-xl bg-white ${
                error ? "border border-primary" : ""
              }`}
              accessibilityRole="switch"
              accessibilityState={{ checked: isOn }}
              accessibilityLabel={label ?? name}
            >
              <View>
                {label ? (
                  <Text className="text-base font-inter-semibold text-text-primary">
                    {label}
                  </Text>
                ) : null}
                {helperText ? (
                  <Text className="text-lg font-inter-semibold text-text-primary mt-1">
                    {helperText}
                  </Text>
                ) : null}
              </View>

              <Switch
                value={isOn}
                onValueChange={(v) => onChange(v)}
                color="#ea0b2c"
                testID={`${name}-switch`}
              />
            </TouchableOpacity>

            {error && (
              <Text className="text-sm text-red-600 mt-2">{error.message}</Text>
            )}
          </View>
        );
      }}
    />
  );
}
