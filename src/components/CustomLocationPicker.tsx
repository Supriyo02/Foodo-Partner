import React from 'react'
import LocationPickerWithMap from '../services/LocationProvider'
import { Controller } from 'react-hook-form'
// import { GEOAPIFY_KEY } from '@env';

const CustomLocationPicker = ({control}: any) => {
  return (
    <Controller
    control={control}
    name="location"
    render={({ field }) => (
        <LocationPickerWithMap field={field} apiKey='4560770ebd274d458a62b41073058658' />
    )}
    />
  )
}

export default CustomLocationPicker