// LocationPickerWithMap.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Keyboard,
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  TouchableWithoutFeedback,
  findNodeHandle,
  UIManager,
  Dimensions,
  NativeSyntheticEvent,
  TextInput as RNTextInput,
} from "react-native";
import MapView, { Marker, Region, MapPressEvent } from "react-native-maps";
import * as Location from "expo-location";

/**
 * Props:
 *  - field: from react-hook-form Controller (render: ({ field }) => <... />)
 *  - apiKey: Geoapify API key (string)
 *  - searchPlaceholder?: string
 *  - mapHeight?: number
 *
 * Usage:
 * <Controller
 *   control={control}
 *   name="location"
 *   render={({ field }) => <LocationPickerWithMap field={field} apiKey={GEOAPIFY} />}
 * />
 *
 * Replace GEOAPIFY with your key.
 */

type Suggestion = {
  id: string;
  description: string;
  lat: number;
  lon: number;
};

export default function LocationPickerWithMap({
  field,
  apiKey,
  searchPlaceholder = "Search address or place",
  mapHeight = 220,
  debug = false,
}: {
  field?: any;
  apiKey: string;
  searchPlaceholder?: string;
  mapHeight?: number;
  debug?: boolean; // set true to log measure/debug info
}) {
  // make field safe so component doesn't crash if used standalone
  const safeField = field ?? { value: null, onChange: (_: any) => {} };

  const [query, setQuery] = useState<string>(safeField.value?.address ?? "");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [marker, setMarker] = useState<{ latitude: number; longitude: number } | null>(
    safeField.value
      ? { latitude: safeField.value.latitude, longitude: safeField.value.longitude }
      : null
  );

  // internal region state for bookkeeping only (NOT bound to MapView)
  const [currentRegion, setCurrentRegion] = useState<Region | null>(() =>
    safeField.value && safeField.value.latitude && safeField.value.longitude
      ? {
          latitude: safeField.value.latitude,
          longitude: safeField.value.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }
      : null
  );

  // modal (dropdown) visibility & measured positioning
  const [suggestionsVisible, setSuggestionsVisible] = useState(false);
  const [suggestionsTop, setSuggestionsTop] = useState<number>(Platform.OS === "android" ? 90 : 110);
  const [inputWidth, setInputWidth] = useState<number | undefined>(undefined);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mapRef = useRef<MapView | null>(null);
  const inputRef = useRef<RNTextInput | null>(null);

  const screenHeight = Dimensions.get("window").height;

  // measure input position to anchor the modal
  const measureInput = () => {
    try {
      const node = findNodeHandle(inputRef.current);
      if (!node) return;
      UIManager.measureInWindow(
        node,
        (x: number, y: number, w: number, h: number) => {
          // compute top for dropdown: a little below input
          const top = y + h + 6;
          // ensure dropdown does not go below visible area considering keyboard
          const maxVisibleHeight = screenHeight - keyboardHeight - 10;
          let adjustedTop = top;
          // if suggested dropdown would overflow below keyboard, push it up if possible
          // Here we simply ensure dropdown top is not > maxVisibleHeight - smallMinimum
          if (top > maxVisibleHeight - 100) {
            // place dropdown higher (above input)
            adjustedTop = Math.max(8, y - 200); // show above if possible
          }
          setSuggestionsTop(adjustedTop);
          setInputWidth(w);
          if (debug) console.log("measureInput", { x, y, w, h, top, adjustedTop, keyboardHeight });
        }
      );
    } catch (err) {
      if (debug) console.warn("measureInput error", err);
    }
  };

  useEffect(() => {
    // keyboard listeners to recalc modal position when keyboard shows/hides
    const subShow = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates?.height ?? 0);
      // delay measurement a little to let layout settle
      setTimeout(measureInput, 80);
    });
    const subHide = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
      setTimeout(measureInput, 80);
    });

    return () => {
      subShow.remove();
      subHide.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debug]);

  useEffect(() => {
    // initial measurement in case input is already laid out
    setTimeout(measureInput, 150);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // --- fetch suggestions (Geoapify)
  const fetchSuggestions = async (text: string) => {
    if (!apiKey) return;
    try {
      setLoading(true);
      const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
        text
      )}&limit=6&lang=en&format=json&apiKey=${apiKey}`;
      const res = await fetch(url);
      const json = await res.json();
      if (debug) console.log("autocomplete", json?.features?.length);
      if (json && json.features && Array.isArray(json.features)) {
        const preds: Suggestion[] = json.features.map((f: any, idx: number) => ({
          id:
            f.properties?.place_id ??
            f.properties?.osm_id ??
            f.properties?.rank_id ??
            f.properties?.formatted ??
            String(idx),
          description: f.properties?.formatted ?? f.properties?.name ?? "Unknown",
          lat: f.geometry?.coordinates?.[1] ?? 0,
          lon: f.geometry?.coordinates?.[0] ?? 0,
        }));
        setSuggestions(preds);
        setSuggestionsVisible(preds.length > 0);
        // ensure measurement updated (keyboard may have opened)
        setTimeout(measureInput, 40);
      } else {
        setSuggestions([]);
        setSuggestionsVisible(false);
      }
    } catch (err) {
      if (debug) console.warn("fetchSuggestions error", err);
      setSuggestions([]);
      setSuggestionsVisible(false);
    } finally {
      setLoading(false);
    }
  };

  const onQueryChange = (text: string) => {
    setQuery(text);
    // measure for accurate placement (keyboard may change position)
    measureInput();

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (text && text.length > 2) fetchSuggestions(text);
      else {
        setSuggestions([]);
        setSuggestionsVisible(false);
      }
    }, 300);
  };

  // when user selects suggestion
  const selectSuggestion = async (s: Suggestion) => {
    Keyboard.dismiss();
    setSuggestions([]);
    setSuggestionsVisible(false);
    setQuery(s.description);

    const r: Region = {
      latitude: s.lat,
      longitude: s.lon,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    try {
      mapRef.current?.animateToRegion?.(r, 350);
    } catch {}
    setMarker({ latitude: s.lat, longitude: s.lon });
    setCurrentRegion(r);
    safeField.onChange({ address: s.description, latitude: s.lat, longitude: s.lon });
  };

  // map press (tap)
  const onMapPress = async (e: MapPressEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    const r: Region = {
      latitude,
      longitude,
      latitudeDelta: currentRegion?.latitudeDelta ?? 0.01,
      longitudeDelta: currentRegion?.longitudeDelta ?? 0.01,
    };
    try {
      mapRef.current?.animateToRegion?.(r, 250);
    } catch {}
    setMarker({ latitude, longitude });
    setCurrentRegion(r);
    await reverseGeocodeAndSet(latitude, longitude);
  };

  // marker drag end
  const onMarkerDragEnd = async (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    const r: Region = {
      latitude,
      longitude,
      latitudeDelta: currentRegion?.latitudeDelta ?? 0.01,
      longitudeDelta: currentRegion?.longitudeDelta ?? 0.01,
    };
    setMarker({ latitude, longitude });
    setCurrentRegion(r);
    await reverseGeocodeAndSet(latitude, longitude);
  };

  const reverseGeocodeAndSet = async (latitude: number, longitude: number) => {
    // try Geoapify reverse
    if (apiKey) {
      try {
        const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${apiKey}`;
        const res = await fetch(url);
        const json = await res.json();
        if (debug) console.log("reverse", json?.features?.length);
        if (json && json.features && json.features.length > 0) {
          const address = json.features[0].properties.formatted;
          setQuery(address);
          safeField.onChange({ address, latitude, longitude });
          return;
        }
      } catch (err) {
        if (debug) console.warn("geoapify reverse error", err);
      }
    }

    // fallback: expo reverse
    try {
      const reverse = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (reverse && reverse.length > 0) {
        const place = reverse[0];
        const pretty = [place.name, place.street, place.city, place.region, place.postalCode, place.country]
          .filter(Boolean)
          .join(", ");
        setQuery(pretty);
        safeField.onChange({ address: pretty, latitude, longitude });
      }
    } catch (err) {
      if (debug) console.warn("expo reverse error", err);
    }
  };

  // get current location
  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Location permission denied", "We need location permission to show the map.");
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const r: Region = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      try {
        mapRef.current?.animateToRegion?.(r, 350);
      } catch {}
      setMarker({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      setCurrentRegion(r);

      // reverse geocode
      await reverseGeocodeAndSet(pos.coords.latitude, pos.coords.longitude);
    } catch (err) {
      if (debug) console.warn("getCurrentLocation error", err);
    }
  };

  // initial region (not controlled)
  const initialRegion: Region =
    currentRegion ??
    ({
      latitude: 22.5726,
      longitude: 88.3639,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    } as Region);

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
        setSuggestionsVisible(false);
      }}
    >
      <View className="mb-4">
        <Text className="text-sm font-semibold mb-1">Kitchen Address</Text>

        <View className="rounded-lg border border-gray-200 bg-white overflow-visible">
          {/* SEARCH ROW */}
          <View className="px-3 py-2 bg-white">
            <TextInput
              ref={inputRef}
              value={query}
              onChangeText={onQueryChange}
              onFocus={() => {
                measureInput();
                if (suggestions.length > 0) setSuggestionsVisible(true);
              }}
              placeholder={searchPlaceholder}
              placeholderTextColor="#9ca3af"
              className="text-base"
              accessibilityLabel="Location search"
              onLayout={() => {
                // ensure measurement known after layout
                setTimeout(measureInput, 50);
              }}
              returnKeyType="search"
            />
            <View className="mt-2">
              <TouchableOpacity onPress={getCurrentLocation} className="px-3 py-2 rounded bg-gray-100 self-start">
                <Text className="text-sm">Use my current location</Text>
              </TouchableOpacity>
            </View>

            {loading && (
              <View className="mt-2">
                <ActivityIndicator />
              </View>
            )}
          </View>

          {/* MAP AREA (not controlled by region prop) */}
          <View style={{ height: mapHeight }}>
            <MapView
              ref={(r) => {
                mapRef.current = r ?? null;
              }}
              style={{ flex: 1 }}
              initialRegion={initialRegion}
              onPress={onMapPress}
              onRegionChangeComplete={(r) => {
                // only store, do NOT bind to MapView prop -> avoids sliding
                setCurrentRegion(r);
              }}
            >
              {marker && (
                <Marker
                  coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
                  draggable
                  onDragEnd={onMarkerDragEnd}
                />
              )}
            </MapView>
          </View>
        </View>

        <Text className="text-xs text-gray-500 mt-1">Tip: drag the pin or tap the map for precise location</Text>

        {/* Suggestions Modal anchored under input */}
        <Modal visible={suggestionsVisible && suggestions.length > 0} transparent animationType="fade" statusBarTranslucent>
          <TouchableWithoutFeedback
            onPress={() => {
              setSuggestionsVisible(false);
              Keyboard.dismiss();
            }}
          >
            <View className="flex-1" style={{ backgroundColor: "rgba(0,0,0,0.12)" }}>
              <View
                style={{
                  position: "absolute",
                  top: suggestionsTop,
                  left: 12,
                  right: inputWidth ? undefined : 12,
                  width: inputWidth ?? undefined,
                }}
              >
                <View className="bg-white rounded-lg overflow-hidden shadow-lg max-h-72 border border-gray-100">
                  <FlatList
                    data={suggestions}
                    keyExtractor={(i) => i.id}
                    keyboardShouldPersistTaps="handled"
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        onPress={() => selectSuggestion(item)}
                        className="px-4 py-3 border-b border-gray-100"
                      >
                        <Text className="text-sm">{item.description}</Text>
                      </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                      <View className="p-4">
                        <Text className="text-sm text-gray-500">No suggestions</Text>
                      </View>
                    }
                  />
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
}
