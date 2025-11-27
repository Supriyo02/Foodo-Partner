// LocationManagement.tsx
import React, { useEffect, useState, useCallback } from "react";
import { View, Text, Pressable, FlatList, ActivityIndicator, Alert, ScrollView } from "react-native";
import Slider from "@react-native-community/slider";
import { useForm, Controller, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { MaterialIcons } from "@expo/vector-icons";
import CustomButton from "../CustomButton";
import LocationPickerWithMap from "../CustomLocationPicker";
import { SafeAreaView } from "react-native-safe-area-context";
import { RawLocation } from "@/types";
import { addDefinedArea, fetchDeliverySettings, removeDefinedArea, submitDeliverySettings, updateMaxDistance } from "@/src/services/dbCalls";
import { distanceSchema, locationSchema } from "@/src/lib/validations/delivery.schema";

export default function LocationManagement() {
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [definedAreas, setDefinedAreas] = useState<RawLocation[]>([]);
  const [addingArea, setAddingArea] = useState(false);

  const distanceMethods = useForm({
    defaultValues: { distance: 0 },
    resolver: yupResolver(distanceSchema),
  });
  const {
    control: distanceControl,
    watch: watchDistance,
    reset: resetDistance,
    formState: { errors: distanceErrors },
  } = distanceMethods;
  const distanceValue = watchDistance("distance");

  const locationMethods = useForm({
    defaultValues: { location: {
      'address': "",
      'latitude': 22.5726,
      'longitude': 88.3639,
      'raw': {},
    }, },
    resolver: yupResolver(locationSchema),
  });
  const { control: locationControl, watch: watchLocation, reset: resetLocation } = locationMethods;
  const pickedLocation = watchLocation("location");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetchDeliverySettings();
        if (!mounted) return;
        resetDistance({ distance: res.distance });
        setDefinedAreas(res.areas);
      } finally {
        if (mounted) setInitializing(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [resetDistance]);

  // const onAddFromPicker = async (data: any) => {
  //   if(!data?.location?.address){
  //     Alert.alert("No location selected", "Please pick a location from the map first.");
  //     return;
  //   }
  //   if (definedAreas.some((a) => a.address === data?.location?.address)) {
  //     Alert.alert("Already added", "This area is already in the defined areas.");
  //     return;
  //   }
  //   setAddingArea(true);
  //   try {
  //     const saved = await addDefinedArea(data?.location);
  //     setDefinedAreas((prev) => [saved, ...prev]);
  //     console.log("Added area", data?.location?.address)
  //     console.log("Defined areas", definedAreas);
  //     resetLocation({ location: null });
  //   } catch (err) {
  //     Alert.alert("Error", "Failed to add area.");
  //   } finally {
  //     setAddingArea(false);
  //   }
  // }

  const onAddFromPicker = useCallback(async () => {
    if (!pickedLocation) {
      Alert.alert("No location selected", "Please pick a location from the map first.");
      return;
    }
    if (definedAreas.some((a) => a.address === pickedLocation.address)) {
      Alert.alert("Already added", "This area is already in the defined areas.");
      return;
    }
    setAddingArea(true);
    try {
      const saved = await addDefinedArea(pickedLocation);
      setDefinedAreas((prev) => [saved, ...prev]);
    } catch (err) {
      Alert.alert("Error", "Failed to add area.");
    } finally {
      setAddingArea(false);
    }
  }, [pickedLocation, definedAreas, resetLocation]);

  const onRemoveArea = useCallback(
    async (address: string) => {
      setLoading(true);
      try {
        const r = await removeDefinedArea(address);
        if (r.removed) {
          setDefinedAreas((prev) => prev.filter((p) => p.address !== address));
        }
      } catch (err) {
        Alert.alert("Error", "Failed to remove area.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const onSaveChanges = async () => {
    setLoading(true);
    try {
      await updateMaxDistance(distanceValue);

      const payload = { distance: distanceValue, definedAreas };
      const res = await submitDeliverySettings(payload);

      if (res.ok) {
        Alert.alert("Saved", "Delivery settings saved successfully.");
      } else {
        Alert.alert("Error", "Failed to save delivery settings.");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Unexpected error");
    } finally {
      setLoading(false);
    }
  };


  if (initializing) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="p-5 bg-bg-primary">
      <FormProvider {...distanceMethods}>
        <View className="bg-white rounded-2xl p-4 border border-gray-300">
          <Text className="text-lg font-inter-semibold text-text-primary">Max Delivery Distance</Text>
          <Text className="text-sm font-inter text-gray-500 mt-1">Set a radius for how far you'll deliver.</Text>

          <View className="mt-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-inter text-text-primary">Distance</Text>
              <Text className="text-sm font-semibold text-primary">{distanceValue} km</Text>
            </View>

            <Controller
              control={distanceControl}
              name="distance"
              render={({ field: { onChange, value } }) => (
                <View className="mt-3">
                  <Slider
                    minimumValue={0}
                    maximumValue={20}
                    step={1}
                    value={value}
                    onValueChange={(v) => onChange(Math.round(v))}
                    minimumTrackTintColor="#ff2d55"
                    maximumTrackTintColor="#e5e7eb"
                    thumbTintColor="#ff2d55"
                  />
                  <View className="flex-row justify-between px-1 mt-1">
                    <Text className="text-xs font-inter text-gray-500">0 km</Text>
                    <Text className="text-xs font-inter text-gray-500">20 km</Text>
                  </View>
                </View>
              )}
            />
            {distanceErrors.distance && <Text className="text-primary font-inter text-xs mt-2">Distance must be 0-20 km</Text>}
          </View>
        </View>
      </FormProvider>

      <View className="flex-row items-center my-4">
        <View className="flex-1 h-px bg-gray-200" />
        <Text className="px-3 text-gray-400 text-sm">OR</Text>
        <View className="flex-1 h-px bg-gray-200" />
      </View>

      <FormProvider {...locationMethods}>
        <View className="bg-white rounded-2xl p-4 border border-gray-300">

          {/*<View className="mt-3 flex-row items-center border border-gray-200 rounded-lg px-3 py-2">
                <MaterialIcons name="search" size={18} color="#9ca3af" />
                <TextInput
                  placeholder="Search by area or pincode"
                  value={searchText}
                  onChangeText={setSearchText}
                  className="ml-2 flex-1 text-sm"
                  onSubmitEditing={onSearchAdd}
                  returnKeyType="search"
                />
                <Pressable
                  onPress={onSearchAdd}
                  className="px-3 py-1 rounded-md"
                  style={{ backgroundColor: "#ff2d55" }}
                  disabled={searching}
                >
                  {searching ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text className="text-white text-sm">Add</Text>
                  )}
                </Pressable>
              </View>

              <View className="mt-4">
                <View className="bg-gray-100 rounded-lg h-36 items-center justify-center border border-gray-200">
                  <LocationPickerWithMap control={locationControl} name="location" apiKey="4560770ebd274d458a62b41073058658" />
                </View>

                <View className="mt-3 flex-row justify-end">
                  <Pressable
                    onPress={onAddFromPicker}
                    disabled={addingArea}
                    className="px-4 py-2 rounded-full"
                    style={{ backgroundColor: "#ff2d55" }}
                  >
                    {addingArea ? <ActivityIndicator color="#fff" /> : <Text className="text-white">Add Selected Area</Text>}
                  </Pressable>
                </View>
              </View> */}
          <LocationPickerWithMap
            label="Manually Add Delivery Areas/Pincodes"
            subLabel="Search for specific pincodes or areas."
            control={locationControl} name="location" apiKey="4560770ebd274d458a62b41073058658"
          />
          <CustomButton style="w-2/3 p-3" onPress={onAddFromPicker} title='Add area' isLoading={addingArea} />
        </View>
      </FormProvider>

      <View className="my-4">
        <Text className="text-md font-inter-semibold text-text-primary mb-2">Defined Areas ({definedAreas.length})</Text>

        <FlatList
          data={definedAreas}
          keyExtractor={(item) => item.address}
          nestedScrollEnabled
          scrollEnabled={false} // non-scrollable to avoid nested virtualization warning (safe for small lists)
          renderItem={({ item }) => (
            <View className="bg-white rounded-lg p-3 flex-row items-center justify-between shadow-md mb-2">
              <Text className="text-md font-inter text-text-primary flex-1">{item.address}</Text>
              <Pressable
                onPress={() => onRemoveArea(item.address)}
                className="p-2 rounded-full"
                accessibilityLabel={`Delete ${item.address}`}
              >
                <MaterialIcons name="delete-outline" size={22} color="#ea0b2c" />
              </Pressable>
            </View>
          )}
          ListEmptyComponent={
            <View className="bg-white rounded-lg p-3 items-center">
              <Text className="text-gray-400 font-inter">No defined areas yet.</Text>
            </View>
          }
        />
      </View>

      <View className="mt-3">
        <CustomButton onPress={onSaveChanges} title='Save Changes' isLoading={loading} />
      </View>

      <View className="h-20" />
    </ScrollView>
  );
}
