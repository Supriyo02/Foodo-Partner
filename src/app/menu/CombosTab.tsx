import ComboCard from "@/src/components/ComboCard";
import { menuService } from "@/src/services/dbCalls";
import { Combo } from "@/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Text, View } from "react-native";

const CombosTab: React.FC<{ query: string }> = ({ query }) => {
    const [combos, setCombos] = useState<Combo[]>([]);
    useEffect(() => { let m = true; (async () => { const res = await menuService.fetchCombos(); if (!m) return; setCombos(res); })(); return () => { m = false; }; }, []);
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase(); if (!q) return combos; return combos.filter(c => c.name.toLowerCase().includes(q) || c.items.join(' ').toLowerCase().includes(q));
    }, [combos, query]);


    const onEdit = useCallback((id: string) => { Alert.alert('Edit combo', id); }, []);
    const onDelete = useCallback((id: string) => { setCombos(prev => prev.filter(p => p.id !== id)); }, []);


    return (
        <FlatList
            data={filtered}
            renderItem={({ item }) => <ComboCard combo={item} onEdit={onEdit} onDelete={onDelete} />}
            keyExtractor={(it) => it.id}
            contentContainerStyle={{ paddingBottom: 140 }}
            initialNumToRender={6}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<View className="items-center mt-8"><Text className="text-gray-500">No combos</Text></View>}
        />
    );
};

export default CombosTab;