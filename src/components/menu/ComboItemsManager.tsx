import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, Modal, TextInput, Pressable, LayoutAnimation, Platform, UIManager, StyleSheet, TouchableWithoutFeedback } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { router } from "expo-router";
import { AddCombo, AddItem, CategoryWithItems } from "@/types";
import { fetchCombosName, fetchItemsName } from "@/src/services/dbCalls";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function generateId(prefix = "") {
  return `${prefix}${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;
}

const IconPlus = ({ size = 16 }: { size?: number }) => (
  <View style={{ width: size, height: size, borderRadius: size / 2, alignItems: "center", justifyContent: "center" }}>
    <Text style={{ color: "#FF2D55", fontWeight: "700" }}>＋</Text>
  </View>
);

const CloseX = ({ size = 12 }: { size?: number }) => <Text style={{ fontSize: size, color: "#FF2D55" }}>✕</Text>;

export default function ComboItemsManager() {
  const navigation = useNavigation();
  const [categories, setCategories] = useState<CategoryWithItems[]>([]);

  const [isComboModalOpen, setComboModalOpen] = useState(false);
  const [isItemsModalOpen, setItemsModalOpen] = useState(false);

  const [availableCombos, setAvailableCombos] = useState<AddCombo[]>([]);
  const [availableItems, setAvailableItems] = useState<AddItem[]>([]);

  const [activeCategoryIdForItems, setActiveCategoryIdForItems] = useState<string | null>(null);

  const [newComboName, setNewComboName] = useState("");
  const [isCreatingCombo, setIsCreatingCombo] = useState(false);

  useEffect(() => {
    if (isComboModalOpen) {
      fetchCombosName().then(setAvailableCombos).catch(() => setAvailableCombos([]));
    }
  }, [isComboModalOpen]);

  useEffect(() => {
    if (isItemsModalOpen) {
      fetchItemsName().then(setAvailableItems).catch(() => setAvailableItems([]));
    }
  }, [isItemsModalOpen]);

  const openAddCategoryModal = useCallback(() => {
    setComboModalOpen(true);
    setNewComboName("");
    setIsCreatingCombo(false);
  }, []);

  const createNewComboLocally = useCallback(() => {
    if (!newComboName.trim()) return;
    const newCombo: AddCombo = { id: generateId("combo_"), name: newComboName.trim() };
    setAvailableCombos((prev) => [newCombo, ...prev]);
    setNewComboName("");
    setIsCreatingCombo(false);
    addCategoryFromCombo(newCombo);
    setComboModalOpen(false);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [newComboName]);

  const addCategoryFromCombo = useCallback((combo: AddCombo) => {
    setCategories((prev) => {
      if (prev.find((p) => p.id === combo.id)) return prev;
      const newCat: CategoryWithItems = { id: combo.id, name: combo.name, items: [] };
      return [...prev, newCat];
    });
    setComboModalOpen(false);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);

  const removeCategory = useCallback((categoryId: string) => {
    setCategories(prev => prev.filter(c => c.id !== categoryId));
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);



  const openItemsModalForCategory = useCallback((categoryId: string) => {
    setActiveCategoryIdForItems(categoryId);
    setItemsModalOpen(true);
  }, []);

  const addItemToCategory = useCallback((categoryId: string, item: AddItem) => {
    setCategories((prev) =>
      prev.map((c) =>
        c.id === categoryId
          ?
            c.items.find((it) => it.id === item.id)
            ? c
            : { ...c, items: [...c.items, item] }
          : c
      )
    );
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);

  const removeItemFromCategory = useCallback((categoryId: string, itemId: string) => {
    setCategories((prev) => prev.map((c) => (c.id === categoryId ? { ...c, items: c.items.filter((it) => it.id !== itemId) } : c)));
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);

  const goToAddItemScreen = useCallback(() => {
    setItemsModalOpen(false);
    router.push("/menu/add-item");
  }, []);

  const renderCategory = useCallback(({ item }: { item: CategoryWithItems }) => {
    return (
      <View key={item.id} className="rounded-lg border border-border-primary bg-white p-3 mb-4">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-inter-semibold text-text-primary">{item.name}</Text>
          <TouchableOpacity onPress={() => openItemsModalForCategory(item.id)} className="flex-row items-center">
            <Text className="text-sm text-primary font-inter-semibold mr-2">+ Add AddItem</Text>
            {/* <IconPlus /> */}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => removeCategory(item.id)}
            className="px-3 py-1 rounded-md border border-red-100 bg-red-50"
            hitSlop={8}
            accessibilityLabel={`Remove ${item.name} category`}
          >
            <Text className="text-sm text-primary font-inter">Remove</Text>
          </TouchableOpacity>
        </View>

        <View>
          {item.items.length === 0 ? (
            <Text className="text-sm font-inter text-text-secondary">No items added to this category yet.</Text>
          ) : (
            <View className="flex-row flex-wrap">
              {item.items.map((it) => (
                <View key={it.id} className="bg-red-50 border border-red-100 rounded-full px-4 py-2 mr-2 mb-2 flex-row items-center">
                  <Text className="text-sm font-inter text-primary mr-2">{it.name}</Text>
                  <Pressable onPress={() => removeItemFromCategory(item.id, it.id)} hitSlop={8}>
                    <CloseX />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  }, [openItemsModalForCategory, removeItemFromCategory]);

  const keyExtractor = useCallback((item: CategoryWithItems) => item.id, []);

  return (
    <View className="my-4">
      <View className="rounded-2xl bg-white p-2 border border-border-primary">
        <View className="flex-row justify-between items-center m-1">
        <Text className="text-md font-inter-semibold text-text-primary">Combo Items</Text>

        <TouchableOpacity onPress={openAddCategoryModal} className="flex-row items-center">
          <Text className="text-sm text-primary font-inter-semibold mr-2">+ Add Category</Text>
        </TouchableOpacity>
      </View>
      
        <FlatList
          data={categories}
          keyExtractor={keyExtractor}
          renderItem={renderCategory}
          ListEmptyComponent={() => (
            <View className="p-6">
              <Text className="text-sm font-inter text-text-secondary">No categories added. Tap “Add Category” to get started.</Text>
            </View>
          )}
          scrollEnabled={false}
        />
      </View>

      <Modal visible={isComboModalOpen} animationType="slide" transparent>
        <Pressable style={styles.modalBackdrop} onPress={() => setComboModalOpen(false)}>
          <TouchableWithoutFeedback>
            <View style={styles.modalCard}>
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-lg font-inter-semibold">Select or Create Category</Text>
                <TouchableOpacity onPress={() => setComboModalOpen(false)}>
                  <Text className="text-primary font-inter-semibold">Close</Text>
                </TouchableOpacity>
              </View>

              <View className="mb-3">
                <TouchableOpacity
                  className="rounded-lg border border-border-primary px-3 py-3 mb-1 bg-white"
                  onPress={() => setIsCreatingCombo((v) => !v)}
                >
                  <Text className="text-sm text-red-500 font-inter-semibold">+ Create New Category</Text>
                </TouchableOpacity>

                {isCreatingCombo ? (
                  <View className="flex-row items-center bg-white rounded-lg px-3 py-2">
                    <TextInput
                      placeholder="AddCategory name"
                      value={newComboName}
                      onChangeText={setNewComboName}
                      className="flex-1 text-text-primary font-inter"
                      placeholderTextColor="#999"
                      returnKeyType="done"
                    />
                    <TouchableOpacity onPress={createNewComboLocally} className="ml-3 rounded-full px-3 py-1 bg-primary">
                      <Text className="text-white font-inter-semibold">Create</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>

              <FlatList
                data={availableCombos}
                keyExtractor={(c) => c.id}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => addCategoryFromCombo(item)} className="py-3 border-b border-border-primary">
                    <Text className="text-base font-inter text-text-primary">{item.name}</Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={() => <Text className="text-sm font-inter text-text-secondary">No combos available</Text>}
                keyboardShouldPersistTaps="handled"
              />
            </View>
          </TouchableWithoutFeedback>
        </Pressable>
      </Modal>

      <Modal visible={isItemsModalOpen} animationType="slide" transparent>
        <Pressable style={styles.modalBackdrop} onPress={() => setItemsModalOpen(false)}>
          <TouchableWithoutFeedback>
            <View style={styles.modalCard}>
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-lg font-inter-semibold">Add Item</Text>
                <TouchableOpacity onPress={() => setItemsModalOpen(false)}>
                  <Text className="text-primary font-inter-semibold">Close</Text>
                </TouchableOpacity>
              </View>

              <View className="mb-3">
                <TouchableOpacity onPress={goToAddItemScreen} className="rounded-lg border border-border-primary px-3 py-3 bg-white">
                  <Text className="text-sm text-red-500 font-inter-semibold">+ Add Item (Create new)</Text>
                </TouchableOpacity>
              </View>

              <FlatList
                data={availableItems}
                keyExtractor={(it) => it.id}
                renderItem={({ item }) => {
                  const alreadySelected = activeCategoryIdForItems
                    ? (categories.find((c) => c.id === activeCategoryIdForItems)?.items ?? []).some((i) => i.id === item.id)
                    : false;

                  return (
                    <TouchableOpacity
                      disabled={!activeCategoryIdForItems}
                      onPress={() => {
                        if (!activeCategoryIdForItems) return;
                        addItemToCategory(activeCategoryIdForItems, item);
                      }}
                      className="py-3 border-b border-border-primary flex-row justify-between items-center"
                    >
                      <Text className="text-base font-inter text-text-primary">{item.name}</Text>
                      {alreadySelected ? <Text className="text-sm font-inter text-text-secondary">Added</Text> : <Text className="text-sm text-primary font-inter">Add</Text>}
                    </TouchableOpacity>
                  );
                }}
                ListEmptyComponent={() => <Text className="text-sm font-inter text-text-secondary">No items found</Text>}
                keyboardShouldPersistTaps="handled"
              />
            </View>
          </TouchableWithoutFeedback>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "white",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "75%",
    padding: 16,
  },
});
