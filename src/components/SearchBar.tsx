import { View, Text } from "react-native";
import { IconButton } from "react-native-paper";

const SearchBar: React.FC<{ value: string; onChange: (v: string) => void; placeholder?: string }> = ({ value, onChange, placeholder = 'Search' }) => {
    return (
        <View className="flex-row items-center bg-gray-100 rounded-xl px-3 py-2">
            <IconButton icon="magnify" size={20} accessibilityLabel="search-icon" />
            <View className="flex-1">
                <Text className="text-base" accessibilityRole="search">{value || placeholder}</Text>
            </View>
            {value.length > 0 && <IconButton icon="close" size={20} onPress={() => onChange('')} accessibilityLabel="clear-search" />}
        </View>
    );
};

export default SearchBar;