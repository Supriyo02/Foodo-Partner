import PreviousMenuCard from "@/src/components/PrevMenuCard";
import { menuService } from "@/src/services/dbCalls";
import { PreviousMenu } from "@/types";
import { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, View, Text } from "react-native";

const PreviousMenusTab: React.FC = () => {
    const [prevs, setPrevs] = useState<PreviousMenu[]>([]);
    useEffect(() => { let m = true; (async () => { const res = await menuService.fetchPreviousMenus(); if (!m) return; setPrevs(res); })(); return () => { m = false; }; }, []);


    const onRestore = useCallback((id: string) => { Alert.alert('Restore', `Restore menu ${id}`); }, []);


    return (
        <FlatList
            data={prevs}
            renderItem={({ item }) => <PreviousMenuCard prev={item} onRestore={onRestore} />}
            keyExtractor={(it) => it.id}
            contentContainerStyle={{ paddingBottom: 120 }}
            initialNumToRender={6}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<View className="items-center mt-8"><Text className="text-gray-500">No previous menus</Text></View>}
        />
    );
};

export default PreviousMenusTab;