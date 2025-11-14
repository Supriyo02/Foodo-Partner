import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Keyboard, ActivityIndicator, Platform, Alert } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';

/*
  LocationPickerWithMap (Geoapify implementation)

  - Uses Geoapify Autocomplete for suggestions and Geoapify Reverse Geocoding for reverse lookup
  - Uses expo-location for current device location permission + fallback reverse geocode
  - Uses react-native-maps for map + draggable marker
  - Integrates with react-hook-form via Controller (store value as { address, latitude, longitude })

  Install:
    yarn add react-native-maps expo-location

  Notes:
    - Create a Geoapify API key: https://www.geoapify.com
    - For production, avoid shipping unrestricted keys in the client. Prefer a tiny server proxy or strict referrer restrictions.
    - For Expo Go: Map provider "PROVIDER_GOOGLE" may require a dev build. On Android/iOS you can still use the default provider (Apple/OSM) in Expo Go.

  Usage (Controller):
    <Controller
      control={control}
      name="location"
      render={({ field }) => (
        <LocationPickerWithMapGeoapify field={field} apiKey={GEOAPIFY_KEY} />
      )}
    />

  Stored value example:
    { address: string, latitude: number, longitude: number }
*/

type Suggestion = {
  id: string;
  description: string;
  lat: number;
  lon: number;
};

export default function LocationPickerWithMap({ field, apiKey, searchPlaceholder = 'Search address or place', mapHeight = 220 }:
  { field: any; apiKey: string; searchPlaceholder?: string; mapHeight?: number }) {
  const [query, setQuery] = useState<string>(field.value?.address ?? '');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [region, setRegion] = useState<Region | null>(null);
  const [marker, setMarker] = useState<{ latitude: number; longitude: number } | null>(
    field.value ? { latitude: field.value.latitude, longitude: field.value.longitude } : null
  );
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    if (field.value && field.value.latitude && field.value.longitude) {
      const r: Region = {
        latitude: field.value.latitude ?? 22.5726,
        longitude: field.value.longitude ?? 88.3639,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setRegion(r);
      setMarker({ latitude: field.value.latitude, longitude: field.value.longitude });
    }
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location permission denied', 'We need location permission to show the map.');
        return;
      }

      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const r: Region = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setRegion(r);
      setMarker({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });

      // Reverse geocode using Geoapify or expo fallback
      if (apiKey) {
        try {
          const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&apiKey=${apiKey}`;
          const res = await fetch(url);
          const json = await res.json();
          console.log("Reverse geocode", json);
          if (json && json.features && json.features.length > 0) {
            const place = json.features[0];
            const pretty = place.properties.formatted;
            setQuery(pretty);
            field.onChange({ address: pretty, latitude: pos.coords.latitude, longitude: pos.coords.longitude });
            return;
          }
        } catch (err) {
          console.warn('geoapify reverse error', err);
        }
      }

      // Fallback to expo reverse geocode
      const geocode = await Location.reverseGeocodeAsync({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      if (geocode && geocode.length > 0) {
        const p = geocode[0];
        const pretty = [p.name, p.street, p.city, p.region, p.postalCode, p.country].filter(Boolean).join(', ');
        setQuery(pretty);
        field.onChange({ address: pretty, latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      }
    } catch (err) {
      console.warn('getCurrentLocation error', err);
    }
  };

  const fetchSuggestions = async (text: string) => {
    if (!apiKey) return;
    try {
      setLoading(true);
      // Geoapify autocomplete endpoint
      const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(text)}&limit=5&lang=en&format=json&apiKey=${apiKey}`;
      const res = await fetch(url);
      const json = await res.json();
      console.log("Geoapify autocomplete", json)
      if (json && json.features) {
        const preds = json.features.map((f: any) => ({ id: f.properties.place_id || f.properties.osm_id || f.properties.rank_id || f.properties.formatted, description: f.properties.formatted, lat: f.geometry.coordinates[1], lon: f.geometry.coordinates[0] }));
        setSuggestions(preds);
      } else {
        setSuggestions([]);
      }
    } catch (err) {
      console.warn('geoapify autocomplete error', err);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const onQueryChange = (text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (text && text.length > 2) fetchSuggestions(text);
      else setSuggestions([]);
    }, 250) as unknown as number;
  };

  const selectSuggestion = async (s: Suggestion) => {
    Keyboard.dismiss();
    setSuggestions([]);
    setQuery(s.description);

    const r: Region = {
      latitude: s.lat,
      longitude: s.lon,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    setRegion(r);
    setMarker({ latitude: s.lat, longitude: s.lon });

    // Set form field value
    field.onChange({ address: s.description, latitude: s.lat, longitude: s.lon });
  };

  const onMarkerDragEnd = async (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarker({ latitude, longitude });
    setRegion((r) => (r ? { ...r, latitude, longitude } : r));

    // Reverse geocode using Geoapify
    if (apiKey) {
      try {
        const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${apiKey}`;
        const res = await fetch(url);
        const json = await res.json();
        console.log("Reverse geocode", json)
        if (json && json.features && json.features.length > 0) {
          const address = json.features[0].properties.formatted;
          setQuery(address);
          field.onChange({ address, latitude, longitude });
          return;
        }
      } catch (err) {
        console.warn('geoapify reverse error', err);
      }
    }

    // Fallback to expo reverseGeocode
    try {
      const reverse = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (reverse && reverse.length > 0) {
        const place = reverse[0];
        const pretty = [place.name, place.street, place.city, place.region, place.postalCode, place.country].filter(Boolean).join(', ');
        setQuery(pretty);
        field.onChange({ address: pretty, latitude, longitude });
      }
    } catch (err) {
      console.warn('expo reverse error', err);
    }
  };

  return (
    <View className="mb-4">
      <Text className="text-sm font-semibold mb-1">Kitchen Address</Text>

      {/* container without overflow-hidden so overlay can show */}
      <View className="rounded-lg border border-gray-200">
        {/* Search + suggestions wrapper */}
        <View style={{ position: 'relative' }}>
          <View className="px-3 py-2 bg-white">
            <TextInput
              value={query}
              onChangeText={onQueryChange}
              onFocus={() => {/* optionally open list */}}
              placeholder={searchPlaceholder}
              placeholderTextColor="#9ca3af"
              className="text-base"
              accessibilityLabel="Location search"
            />
          </View>

          {/* Suggestions overlay */}
          {suggestions.length > 0 && (
            <View
              style={{
                position: 'absolute',
                top: 52,
                left: 8,
                right: 8,
                zIndex: 9999,
                elevation: 9999,
                backgroundColor: '#fff',
                borderRadius: 8,
                maxHeight: 260,
                shadowColor: '#000',
                shadowOpacity: 0.08,
                shadowRadius: 6,
              }}
            >
              <FlatList
                data={suggestions}
                keyExtractor={(i, idx) => i.id ?? String(idx)}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => selectSuggestion(item)} style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}>
                    <Text>{item.description}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        </View>

        {/* small loader */}
        {loading && (
          <View className="px-3 py-2">
            <ActivityIndicator />
          </View>
        )}

        {/* Map area */}
        <View style={{ height: mapHeight }}>
          {region ? (
            <MapView
              style={{ flex: 1 }}
              initialRegion={region}
              region={region}
              onRegionChangeComplete={(r) => setRegion(r)}
            >
              {marker && (
                <Marker
                  coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
                  draggable
                  onDragEnd={onMarkerDragEnd}
                />
              )}
            </MapView>
          ) : (
            <View className="flex-1 items-center justify-center">
              <TouchableOpacity onPress={getCurrentLocation} className="px-4 py-2 rounded bg-gray-100">
                <Text>Use my current location</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>


      <Text className="text-xs text-gray-500 mt-1">Tip: drag the pin for precise location</Text>
    </View>
  );
}
