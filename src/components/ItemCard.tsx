import { MenuItem } from "@/types";
import { useState } from "react";
import { View, Text, Image } from "react-native";
import { IconButton, Menu } from "react-native-paper";

const ItemCard: React.FC<{ item: MenuItem; onEdit?: (id: string) => void; onDelete?: (id: string) => void; onToggle?: (id: string) => void }> = ({ item, onEdit, onDelete, onToggle }) => {
    const [visible, setVisible] = useState(false);
    return (
        <View className="flex-row items-center bg-white rounded-2xl p-3 mb-3 shadow-sm">
            <Image source={item.image ? { uri: item.image } : require('@/assets/images/placeholder.jpg')} className="w-16 h-16 rounded-lg" />
            <View className="flex-1 ml-3">
                <Text className="text-base font-semibold">{item.name}</Text>
                <Text className="text-sm text-gray-500">{item.description}</Text>
                <Text className="mt-1 text-sm" style={{ color: item.status === 'available' ? '#16a34a' : item.status === 'low_stock' ? '#f59e0b' : '#ef4444' }}>{item.status === 'available' ? 'Available' : item.status === 'low_stock' ? 'Low Stock' : 'Sold Out'}</Text>
            </View>


            <Menu visible={visible} onDismiss={() => setVisible(false)} anchor={<IconButton icon="dots-vertical" size={22} onPress={() => setVisible(true)} />}>
                <Menu.Item onPress={() => { setVisible(false); onEdit && onEdit(item.id); }} title="Edit" />
                <Menu.Item onPress={() => { setVisible(false); onDelete && onDelete(item.id); }} title="Delete" />
                <Menu.Item onPress={() => { setVisible(false); onToggle && onToggle(item.id); }} title={item.status === 'available' ? 'Mark Out of Stock' : 'Mark Available'} />
            </Menu>
        </View>
    );
};

export default ItemCard;