import React from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
};

const SearchBar: React.FC<Props> = ({ value, onChange, placeholder = "Search..." }) => {
  return (
    <View className="flex-row items-center bg-surface border border-gray-300 rounded-3xl px-3 py-1">
      <Ionicons name="search" size={18} color="#6B7280" />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        className="flex-1 ml-2 text-base text-gray-800 font-inter"
        returnKeyType="search"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={() => onChange("")}
          className="p-1"
          accessibilityLabel="clear-search"
        >
          <Ionicons name="close-circle" size={18} color="#9CA3AF" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SearchBar;
