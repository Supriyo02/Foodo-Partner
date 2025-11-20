import { MenuItem } from "@/types";
import { useRef, useState } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { IconButton, Menu, Portal } from "react-native-paper";
import { images } from "../lib/constants";
import cn from 'clsx';

const ItemCard: React.FC<{ item: MenuItem; onEdit?: (id: string) => void; onDelete?: (id: string) => void; onToggle?: (id: string) => void }> = ({ item, onEdit, onDelete, onToggle }) => {
    const [visible, setVisible] = useState(false);

    return (
        <View className="flex-row items-center bg-white p-3 mb-3 border border-gray-300 rounded-3xl">
            <Image source={item.image ? { uri: item.image } : require('@/assets/images/placeholder.jpg')} className="w-16 h-16 rounded-lg" />
            <View className="flex-1 ml-3">
                <Text className="text-base font-inter-semibold">{item.name}</Text>
                {item.items?.length && <Text className="text-sm text-gray-500">{item.items?.join(' • ')}</Text>}
                <View className="flex-row gap-1 items-center">
                    <View>
                        <Image source={images.rupee} className='size-4' resizeMode='contain' tintColor='#5D5F6D' />
                    </View>
                    <Text className="text-sm font-inter-semibold text-text-secondary">{item.price.toFixed(2)}</Text>
                </View>
                <View className="flex-row items-center">
                    <View className={cn('w-2 h-2 rounded-full mr-2 mt-1', item.status === 'available' ? 'bg-green-500' : item.status === 'low_stock' ? 'bg-orange-500' : 'bg-red-500')} />
                    <Text className={cn('font-inter text-sm', item.status === 'available' ? 'text-green-500' : item.status === 'low_stock' ? 'text-orange-500' : 'text-red-500')}>{item.status === 'available' ? 'Available' : item.status === 'low_stock' ? 'Low Stock' : 'Sold Out'}</Text>
                </View>
            </View>

            <Menu visible={visible} onDismiss={() => setVisible(false)} anchor={<IconButton icon="dots-vertical" size={22} onPress={() => setVisible(true)} />}>
                <Menu.Item onPress={() => { setVisible(false); onEdit && onEdit(item.id); }} title="Edit" />
                <Menu.Item onPress={() => { setVisible(false); onDelete && onDelete(item.id); }} title="Delete" />
                <Menu.Item onPress={() => { setVisible(false); onToggle && onToggle(item.id); }} title={item.status === 'available' ? 'Mark Unavailable' : 'Mark Available'} />
            </Menu>
        </View>
    );
};

export default ItemCard;