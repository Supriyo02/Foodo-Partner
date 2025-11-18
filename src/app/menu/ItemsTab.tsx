import ItemCard from "@/src/components/ItemCard";
import { menuService } from "@/src/services/dbCalls";
import { MenuItem } from "@/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, View, Text, Alert } from "react-native";

const ItemsTab: React.FC<{ query: string }> = ({ query }) => {
    const [items, setItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);


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


    return (
        <FlatList
            data={filtered}
            renderItem={({ item }) => <ItemCard item={item} onEdit={onEdit} onDelete={onDelete} onToggle={onToggle} />}
            keyExtractor={(it) => it.id}
            contentContainerStyle={{ paddingBottom: 140 }}
            initialNumToRender={8}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<View className="items-center mt-8"><Text className="text-gray-500">No items found</Text></View>}
        />
    );
};

export default ItemsTab;