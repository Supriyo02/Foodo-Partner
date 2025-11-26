import { fetchPreordersForDate } from "@/src/services/dbCalls";
import { PreorderItem, PreorderSection } from "@/types";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { View, Text, Pressable, Image, FlatList, LayoutAnimation, UIManager, Platform, StyleSheet } from "react-native";

function enableLayoutAnimationOnAndroid() {
  if (Platform.OS === "android") {
    // @ts-ignore
    if (UIManager.setLayoutAnimationEnabledExperimental) {
      // @ts-ignore
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }
}

const ItemRow: React.FC<{ item: PreorderItem }> = ({ item }) => {
  return (
    <View className="flex-row items-center py-3 border-b border-gray-100">
      <Image source={{ uri: item.image }} style={styles.thumbnail} />
      <View className="flex-1 ml-3">
        <Text className="text-base font-inter-medium">{item.name}</Text>
      </View>
      <Text className="text-sm font-inter-semibold">x {item.qty}</Text>
    </View>
  );
};

const SectionHeader: React.FC<{ section: PreorderSection; onPress: () => void }> = ({ section, onPress }) => {
  return (
    <Pressable onPress={onPress} className="mb-2">
      <View className="bg-gray-100 rounded-2xl p-4 flex-row items-center justify-between">
        <Text className="text-base font-semibold">{section.title}{typeof section.itemCount === 'number' ? ` (${section.itemCount})` : ''}</Text>
        <View>
          {section.expanded ?
          <Feather name="chevron-up" size={20} color="black" />
          : <Feather name="chevron-down" size={20} color="black" />
          } 
        </View>
      </View>
    </Pressable>
  );
};

export default function PreordersScreen() {
  const [sections, setSections] = useState<PreorderSection[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    enableLayoutAnimationOnAndroid();
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const todayISO = new Date().toISOString().slice(0, 10);
      const data = await fetchPreordersForDate(todayISO);
      setSections(data);
    } finally {
      setLoading(false);
    }
  }

  function toggleSection(sectionId: string) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, expanded: !s.expanded } : s)));
  }

  return (
    <View className="flex-1 bg-[#fafafa] px-4 pt-4 pb-20">
      <Text className="text-sm text-text-secondary font-inter-bold ">Tuesday, 28 May</Text>
      <Text className="text-2xl font-inter-bold mb-4">Today's Preorders</Text>

      <FlatList
        data={sections}
        keyExtractor={(s) => s.id}
        renderItem={({ item }) => (
          <View>
            <SectionHeader section={item} onPress={() => toggleSection(item.id)} />

            {item.expanded && (
              <View className="bg-white rounded-xl p-3 mb-4 shadow-sm">
                {item.items.length === 0 ? (
                  <Text className="text-sm font-inter text-gray-500 py-4">No items for this section.</Text>
                ) : (
                  <FlatList
                    data={item.items}
                    keyExtractor={(it) => it.id}
                    renderItem={({ item: row }) => <ItemRow item={row} />}
                  />
                )}
              </View>
            )}
          </View>
        )}
        refreshing={loading}
        onRefresh={loadData}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
    resizeMode: "cover",
  },
});
