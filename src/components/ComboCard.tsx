import { Combo } from "@/types";
import { useState } from "react";
import { View, Text } from "react-native";
import { IconButton, Menu } from "react-native-paper";

const ComboCard: React.FC<{ combo: Combo; onEdit?: (id: string) => void; onDelete?: (id: string) => void }> = ({ combo, onEdit, onDelete }) => {
    const [visible, setVisible] = useState(false);
    return (
        <View className="bg-white rounded-2xl p-3 mb-3 shadow-sm flex-row items-center">
            <View className="flex-1">
                <Text className="text-base font-semibold">{combo.name}</Text>
                <Text className="text-sm text-gray-500">{combo.items.join(' • ')}</Text>
                <Text className="mt-1 text-sm">₹{combo.price.toFixed(2)}</Text>
            </View>


            <Menu visible={visible} onDismiss={() => setVisible(false)} anchor={<IconButton icon="dot   s-vertical" size={22} onPress={() => setVisible(true)} />}>
                <Menu.Item onPress={() => { setVisible(false); onEdit && onEdit(combo.id); }} title="Edit" />
                <Menu.Item onPress={() => { setVisible(false); onDelete && onDelete(combo.id); }} title="Delete" />
            </Menu>
        </View>
    );
};

export default ComboCard;