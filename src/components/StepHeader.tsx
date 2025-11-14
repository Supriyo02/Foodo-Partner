import React from 'react';
import { View, Text } from 'react-native';

type StepHeaderProps = {
  step: number;
  total: number;
  info?: string;
};

export default function StepHeader({ step, total, info }: StepHeaderProps) {
  const progress = step / total;

  return (
    <View className="mb-4 w-full">
      <Text className="text-sm font-inter-bold text-text-primary">
        Step {step} of {total}: {info}
      </Text>

      <View className="h-2 w-full bg-gray-200 rounded-full overflow-hidden mt-2">
        <View
          className="h-full bg-primary rounded-full"
          style={{ width: `${progress * 100}%` }}
        />
      </View>
    </View>
  );
}
