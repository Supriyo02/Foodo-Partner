import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Keyboard, StyleSheet, ScrollView } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import type { Control } from 'react-hook-form';
import { useController } from 'react-hook-form';
import * as Location from 'expo-location';

type LocationValue = {
  address: string;
  latitude: number;
  longitude: number;
  raw?: any;
};

type Props = {
  control: Control<any>;
  name?: string;
  label?: string,
  subLabel?: string,
  apiKey?: string; 
  placeholder?: string;
  mapHeight?: number;
  showDebug?: boolean;
};

function useDebounce<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function LocationPickerWithMap({
  control,
  name = 'location',
  label,
  subLabel,
  apiKey,
  placeholder = 'Search address or landmark',
  mapHeight = 260,
  showDebug = false,
}: Props) {
  const { field, fieldState  } = useController({ name, control, rules: { required: true } });

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const mapRef = useRef<MapView | null>(null);
  const [reverseLoading, setReverseLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [lastFetchError, setLastFetchError] = useState<string | null>(null);
  const DEFAULT_KOLKATA_REGION: Region = {
    latitude: 22.5726,
    longitude: 88.3639,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };
  const DEFAULT_KOLKATA_ADDRESS = 'Kolkata, West Bengal, India';

  useEffect(() => {
    if (field.value && field.value.address) {
      setQuery(field.value.address);
      if (field.value.latitude && field.value.longitude) {
        const r: Region = {
          latitude: Number(field.value.latitude),
          longitude: Number(field.value.longitude),
          latitudeDelta: 0.006,
          longitudeDelta: 0.006,
        };
        setRegion(r);
        setMarker({ latitude: r.latitude, longitude: r.longitude });
        setTimeout(() => mapRef.current?.animateToRegion(r, 400), 300);
      }
    }
  }, [field.value]);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getLastKnownPositionAsync();
          if (loc && validCoords(loc.coords.latitude, loc.coords.longitude)) {
            const r: Region = {
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            };
            setRegion(r);
            setMarker({ latitude: r.latitude, longitude: r.longitude });

            const f = await reverseGeocode(r.latitude, r.longitude);
            const addr = f?.properties?.formatted || `${r.latitude}, ${r.longitude}`;
            field.onChange({ address: addr, latitude: r.latitude, longitude: r.longitude, raw: f });
            setQuery(addr);
          }
        }
      } catch (e) {
        console.warn('initial location error', e);
      }
    })();
  }, []);

  const validCoords = (lat: any, lon: any) => {
    const a = Number(lat);
    const b = Number(lon);
    return Number.isFinite(a) && Number.isFinite(b);
  };

  const [region, setRegion] = useState<Region | null>(
    field.value && validCoords(field.value.latitude, field.value.longitude)
      ? DEFAULT_KOLKATA_REGION : {
        latitude: Number(field.value.latitude),
        longitude: Number(field.value.longitude),
        latitudeDelta: 0.006,
        longitudeDelta: 0.006,
      }
    ,
  );
  const [marker, setMarker] = useState<{ latitude: number; longitude: number } | null>(
    field.value && validCoords(field.value.latitude, field.value.longitude)
      ? { latitude: DEFAULT_KOLKATA_REGION.latitude, longitude: DEFAULT_KOLKATA_REGION.longitude } : { latitude: Number(field.value.latitude), longitude: Number(field.value.longitude) },
  );

  const [query, setQuery] = useState<string>(field.value?.address || DEFAULT_KOLKATA_ADDRESS);
  const debouncedQuery = useDebounce(query, 450);

  useEffect(() => {
    if (!field.value || !validCoords(field.value.latitude, field.value.longitude)) {
      field.onChange({
        address: DEFAULT_KOLKATA_ADDRESS,
        latitude: DEFAULT_KOLKATA_REGION.latitude,
        longitude: DEFAULT_KOLKATA_REGION.longitude,
        raw: null,
      });
    }
  }, []);


  async function fetchAutocomplete(q: string) {
    setLastFetchError(null);
    if (!q || q.length < 2) {
      setSuggestions([]);
      return;
    }
    setLoadingSuggestions(true);
    try {
      if (apiKey) {
        const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
          q,
        )}&limit=8&format=json&apiKey=${apiKey}`;
        const res = await fetch(url);
        const json = await res.json();
        const features = json?.features || [];
        if (features.length > 0) {
          setSuggestions(features);
          return;
        }
      }
      const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=8&addressdetails=1`;
      const nomRes = await fetch(nomUrl, { headers: { 'User-Agent': 'FoodoApp/1.0 (your@email)' } });
      const nomJson = await nomRes.json();
      const mapped = nomJson.map((r: any) => ({
        type: 'Feature',
        properties: {
          formatted: r.display_name,
          name: r.display_name,
          country: r.address?.country,
        },
        geometry: { coordinates: [Number(r.lon), Number(r.lat)] },
        raw_nominatim: r,
      }));
      setSuggestions(mapped);
    } catch (e: any) {
      console.warn('autocomplete fetch failed', e);
      setLastFetchError(e?.message || String(e));
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  }

  useEffect(() => {
    fetchAutocomplete(debouncedQuery);
  }, [debouncedQuery]);

  async function reverseGeocode(lat: number, lon: number) {
    setReverseLoading(true);
    try {
      if (apiKey) {
        const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&format=json&apiKey=${apiKey}`;
        const res = await fetch(url);
        const json = await res.json();
        const f = json?.features?.[0];
        if (f) return f;
      }
      const nomUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`;
      const nomRes = await fetch(nomUrl, { headers: { 'User-Agent': 'FoodoApp/1.0 (your@email)' } });
      const nomJson = await nomRes.json();
      return {
        type: 'Feature',
        properties: { formatted: nomJson.display_name, name: nomJson.display_name, raw: nomJson },
        geometry: { coordinates: [Number(lon), Number(lat)] },
      };
    } catch (e) {
      console.warn('reverse geocode failed', e);
      return null;
    } finally {
      setReverseLoading(false);
    }
  }

  async function useCurrentLocation() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      const lat = loc.coords.latitude;
      const lon = loc.coords.longitude;
      const feature = await reverseGeocode(lat, lon);
      const address = feature?.properties?.formatted || '';
      const payload: LocationValue = { address, latitude: lat, longitude: lon, raw: feature };
      field.onChange(payload);
      setQuery(address);
      const r: Region = { latitude: lat, longitude: lon, latitudeDelta: 0.006, longitudeDelta: 0.006 };
      setRegion(r);
      setMarker({ latitude: lat, longitude: lon });
      mapRef.current?.animateToRegion(r, 400);
      setShowSuggestions(false);
      Keyboard.dismiss();
    } catch (e) {
      console.warn('useCurrentLocation failed', e);
    }
  }

  function onSelectSuggestion(feature: any) {
    const lon = feature.geometry?.coordinates?.[0];
    const lat = feature.geometry?.coordinates?.[1];
    if (!validCoords(lat, lon)) {
      console.warn('Invalid coords from suggestion', feature);
      return;
    }
    const address = feature.properties?.formatted || feature.properties?.name || '';
    const payload: LocationValue = { address, latitude: Number(lat), longitude: Number(lon), raw: feature };
    field.onChange(payload);
    const r: Region = { latitude: Number(lat), longitude: Number(lon), latitudeDelta: 0.006, longitudeDelta: 0.006 };
    setRegion(r);
    setMarker({ latitude: Number(lat), longitude: Number(lon) });
    setQuery(address);
    setShowSuggestions(false);
    setSuggestions([]);
    setTimeout(() => mapRef.current?.animateToRegion(r, 400), 120);
    Keyboard.dismiss();
  }

  return (
    <View className="w-full">
      <View className="mb-2">
        {label && <Text className="text-md font-inter-semibold">{label}</Text>}
        {subLabel && <Text className="text-sm text-gray-500 mb-2">{subLabel}</Text>}
        <View className="relative">
          <TextInput
            value={query}
            onChangeText={(t) => {
              setQuery(t);
              setShowSuggestions(true);
            }}
            placeholderTextColor="#8A8A8E"
            placeholder={placeholder}
            className="border border-gray-300 rounded-md px-3 pl-2 pr-8 text-base font-inter text-text-primary"
            onFocus={() => setShowSuggestions(true)}
            style={{ height: 42 }}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 250)}
            returnKeyType="search"
          />

          {loadingSuggestions && (
            <View className="absolute right-2 top-3">
              <ActivityIndicator />
            </View>
          )}

          {showSuggestions && suggestions.length > 0 && (
            <View
              style={styles.suggestionsContainer}
              className="absolute left-0 right-0 top-12 bg-white border border-gray-200 rounded-md shadow-md max-h-56">
              <ScrollView
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {suggestions.map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => onSelectSuggestion(item)}
                    className="px-3 py-2 border-b border-gray-100"
                  >
                    <Text className="text-sm font-inter">{item.properties?.formatted}</Text>
                    <Text className="text-xs text-text-secondary font-inter">
                      {item.properties?.country || item.properties?.state || ""}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <View className="flex-row justify-end mt-2">
            <TouchableOpacity
              onPress={() => useCurrentLocation()}
              className="px-2 py-1 rounded-md border border-gray-300">
              <Text className="text-sm">Use current location</Text>
            </TouchableOpacity>
          </View>
        </View>
        {fieldState?.error && <Text className="text-sm text-red-600 mt-1">{fieldState?.error?.message}</Text>}
      </View>

      <View style={{ height: mapHeight }} className="overflow-hidden rounded-md border border-gray-200">
        {region ? (
          <MapView
            ref={(r) => {
              mapRef.current = r ?? null;
            }}
            style={{ flex: 1 }}
            region={region}
            onRegionChangeComplete={(r) => setRegion(r)}
            onPress={async (e) => {
              const { latitude, longitude } = e.nativeEvent.coordinate;
              if (!validCoords(latitude, longitude)) return;
              setMarker({ latitude, longitude });
              mapRef.current?.animateToRegion({ latitude, longitude, latitudeDelta: 0.006, longitudeDelta: 0.006 }, 300);
              const f = await reverseGeocode(latitude, longitude);
              const address = f?.properties?.formatted || f?.properties?.name || '';
              const payload: LocationValue = { address, latitude, longitude, raw: f };
              field.onChange(payload);
              setQuery(address);
              setShowSuggestions(false);
            }}
          >
            {marker && validCoords(marker.latitude, marker.longitude) && (
              <Marker
                coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
                draggable
                onDragEnd={async (e) => {
                  const { latitude, longitude } = e.nativeEvent.coordinate;
                  if (!validCoords(latitude, longitude)) return;
                  setMarker({ latitude, longitude });
                  const f = await reverseGeocode(latitude, longitude);
                  const address = f?.properties?.formatted || f?.properties?.name || '';
                  const payload: LocationValue = { address, latitude, longitude, raw: f };
                  field.onChange(payload);
                  setQuery(address);
                  setShowSuggestions(false);
                }}
              />
            )}
          </MapView>
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-sm text-text-secondary font-inter">Map loading or location permission not granted.</Text>
          </View>
        )}
      </View>

      <View className="mb-2">
        <Text className="text-xs text-text-secondary font-inter">Tap exact location on map to place the pin for precision.</Text>
        {reverseLoading && <ActivityIndicator />}
      </View>

      {showDebug && (
        <View className="mt-3 p-2 border border-gray-200 rounded-md bg-gray-50">
          <Text className="font-medium">Debug</Text>
          <Text className="text-xs">Query: {query}</Text>
          <Text className="text-xs">Suggestions: {suggestions.length}</Text>
          <Text className="text-xs">Last error: {lastFetchError || 'none'}</Text>
          <Text className="text-xs">Form value: {JSON.stringify(field.value)}</Text>
          <Text className="text-xs">Marker: {marker ? `${marker.latitude}, ${marker.longitude}` : 'none'}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  suggestionsContainer: {
    zIndex: 9999,
    elevation: 20,
  },
});
