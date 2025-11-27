
import { CustomButtonProps } from '@/types';
import cn from 'clsx';
import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

const CustomButton = ({
  onPress,
  title='Click Me',
  style,
  textStyle,
  leftIcon,
  isLoading=false
}: CustomButtonProps) => {
  return (
    <View className={cn('w-full flex flex-row justify-center')}>
      <TouchableOpacity className={cn('bg-primary rounded-xl flex flex-row justify-center', style? style : 'p-4 w-full')} onPress={onPress}>
        {leftIcon}
        <View className='flex-center flex-row'>
          {isLoading?(
            <ActivityIndicator size='small' color='white' />
          ):
          <Text className={cn('text-white font-inter-bold paragraph-semibold', textStyle)}>{title}</Text>
          }
        </View>
      </TouchableOpacity>
    </View>
  )
}

export default CustomButton