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
  apiKey?: string; // Geoapify key (optional if you rely on fallback)
  placeholder?: string;
  mapHeight?: number;
  showDebug?: boolean; // show on-screen debug info
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
  apiKey,
  placeholder = 'Search address or landmark',
  mapHeight = 260,
  showDebug = false,
}: Props) {
  const { field } = useController({ name, control, rules: { required: true } });

  // local states
  // const [query, setQuery] = useState<string>(field.value?.address || '');

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  // const [marker, setMarker] = useState<{latitude: number; longitude: number} | null>(
  //   field.value ? {latitude: field.value.latitude, longitude: field.value.longitude} : null,
  // );
  const mapRef = useRef<MapView | null>(null);
  const [reverseLoading, setReverseLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [lastFetchError, setLastFetchError] = useState<string | null>(null);
  // default region + address for initial load
  const DEFAULT_KOLKATA_REGION: Region = {
    latitude: 22.5726,
    longitude: 88.3639,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };
  const DEFAULT_KOLKATA_ADDRESS = 'Kolkata, West Bengal, India';


  // sync external changes into local state
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
        // animate map
        setTimeout(() => mapRef.current?.animateToRegion(r, 400), 300);
      }
    }
  }, [field.value]);

  // initial device location (do not overwrite form-provided location)
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

            // optional: reverse geocode and update form with real address
            const f = await reverseGeocode(r.latitude, r.longitude);
            const addr = f?.properties?.formatted || `${r.latitude}, ${r.longitude}`;
            field.onChange({ address: addr, latitude: r.latitude, longitude: r.longitude, raw: f });
            setQuery(addr);
          }
        }
      } catch (e) {
        console.warn('initial location error', e);
        // keep Kolkata defaults — no further action
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // Helpers: make sure coordinates are valid numbers
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

  // query (input text) shows form address if present, otherwise Kolkata
  const [query, setQuery] = useState<string>(field.value?.address || DEFAULT_KOLKATA_ADDRESS);
  const debouncedQuery = useDebounce(query, 450);

  useEffect(() => {
    // If form has no location value, set Kolkata as default in the form once
    if (!field.value || !validCoords(field.value.latitude, field.value.longitude)) {
      field.onChange({
        address: DEFAULT_KOLKATA_ADDRESS,
        latitude: DEFAULT_KOLKATA_REGION.latitude,
        longitude: DEFAULT_KOLKATA_REGION.longitude,
        raw: null,
      });
    }
    // run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // Try Geoapify autocomplete, fallback to Nominatim if needed
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
      // fallback: Nominatim search
      const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=8&addressdetails=1`;
      const nomRes = await fetch(nomUrl, { headers: { 'User-Agent': 'FoodoApp/1.0 (your@email)' } });
      const nomJson = await nomRes.json();
      // normalize nominatim results into Geoapify-like shape
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  // reverse geocode with Geoapify, fallback to Nominatim
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
      // fallback nominatim
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
        <Text className="text-md font-inter-semibold mb-1">Kitchen address</Text>
        <View className="relative">
          <TextInput
            value={query}
            onChangeText={(t) => {
              setQuery(t);
              setShowSuggestions(true);
            }}
            placeholderTextColor="#8A8A8E"
            placeholder={placeholder}
            className="border border-gray-300 rounded-md px-3 py-2 text-base font-inter text-text-primary"
            onFocus={() => setShowSuggestions(true)}
            style={{ height: 42 }}
            // do NOT immediately hide suggestions on blur — user may be tapping a suggestion
            onBlur={() => setTimeout(() => setShowSuggestions(false), 250)}
            returnKeyType="search"
          />

          {loadingSuggestions && (
            <View className="absolute right-2 top-3">
              <ActivityIndicator />
            </View>
          )}

          {/* suggestions dropdown */}
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
                    <Text className="text-sm">{item.properties?.formatted}</Text>
                    <Text className="text-xs text-gray-400">
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
              className="px-3 py-2 rounded-md border border-gray-300">
              <Text className="text-sm">Use current location</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Map view */}
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
            <Text className="text-sm text-gray-500">Map loading or location permission not granted.</Text>
          </View>
        )}
      </View>

      <View className="mt-2">
        <Text className="text-xs text-gray-500">Tap map to place a pin, or drag the pin for precision.</Text>
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
