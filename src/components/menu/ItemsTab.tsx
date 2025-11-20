import ItemCard from "@/src/components/ItemCard";
import SearchBar from "@/src/components/SearchBar";
import { menuService } from "@/src/services/dbCalls";
import { MenuItem } from "@/types";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, View, Text, Alert } from "react-native";
import { FAB, Portal } from "react-native-paper";

const ItemsTab: React.FC = () => {
    const [items, setItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');


    useEffect(() => {
        let mounted = true;
        (async () => {
            const res = await menuService.fetchItems();
            if (!mounted) return;
            setItems(res);
            setLoading(false);
        })();
        return () => { mounted = false; };
    }, []);


    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return items;
        return items.filter(i => i.name.toLowerCase().includes(q) || (i.description || '').toLowerCase().includes(q));
    }, [items, query]);


    const onEdit = useCallback((id: string) => { Alert.alert('Edit', `Edit item ${id}`); }, []);
    const onDelete = useCallback((id: string) => { setItems(prev => prev.filter(p => p.id !== id)); }, []);
    const onToggle = useCallback((id: string) => { setItems(prev => prev.map(p => p.id === id ? { ...p, status: p.status === 'available' ? 'sold_out' : 'available' } : p)); }, []);

      const onAdd = useCallback(() => {
        router.push('/menu/add-item');
        // return Alert.alert('Add Item', 'Open Add Item flow');
      }, []);


    return (
        <View>
            <View className="px-1 ">
                <SearchBar value={query} onChange={setQuery} placeholder='Search items...' />
            </View>
            <View className="mt-4">
                <FlatList
                    data={filtered}
                    renderItem={({ item }) => <ItemCard item={item} onEdit={onEdit} onDelete={onDelete} onToggle={onToggle} />}
                    keyExtractor={(it) => it.id}
                    contentContainerStyle={{ paddingBottom: 140, paddingLeft: 5, paddingRight: 5 }}
                    initialNumToRender={8}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={<View className="items-center mt-8"><Text className="text-gray-500">No items found</Text></View>}
                />
            </View>
            <Portal>
                <FAB
                    icon="plus"
                    label='Add Item'
                    onPress={onAdd}
                    style={[
                        {
                            position: 'absolute',
                            right: 20,
                            bottom: 100,
                            backgroundColor: '#ea0b2c',
                            borderRadius: 9999,
                            paddingHorizontal: 6,
                            elevation: 0,
                        },
                    ]}
                    color="#FFFFFF"
                />
            </Portal>
        </View>
    );
};

export default ItemsTab;