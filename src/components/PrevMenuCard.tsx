import { PreviousMenu } from "@/types";
import { View, Text, TouchableOpacity } from "react-native";

const PreviousMenuCard: React.FC<{ prev: PreviousMenu; onRestore?: (id: string) => void }> = ({ prev, onRestore }) => {
    return (
        <View className="bg-white rounded-2xl p-3 mb-3 shadow-sm flex-row items-center justify-between">
            <View>
                <Text className="text-base font-semibold">{prev.title}</Text>
                <Text className="text-sm text-gray-500">{prev.createdAt}</Text>
            </View>
            <TouchableOpacity onPress={() => onRestore && onRestore(prev.id)} className="px-3 py-2 bg-gray-100 rounded-md">
                <Text>Restore</Text>
            </TouchableOpacity>
        </View>
    );
};

export default PreviousMenuCard;