import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Pressable,
  LayoutAnimation,
  Platform,
  UIManager,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Router } from "expo-router";

/**
 * ComboItemsManager
 *
 * - Shows a card with categories (combos)
 * - Add Category -> opens modal (combo list + create new)
 * - Add Item within a category -> opens items modal (items list + route to AddItem)
 *
 * Replace fetchCombos() and fetchItems() with your DB calls when ready.
 */

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Combo = {
  id: string;
  name: string;
};

type Item = {
  id: string;
  name: string;
};

type CategoryWithItems = {
  id: string;
  name: string;
  items: Item[];
};

function generateId(prefix = "") {
  return `${prefix}${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;
}

/* ------------------ Stubbed DB functions (replace with real API) ------------------ */

async function fetchCombos(): Promise<Combo[]> {
  // TODO: Replace with actual DB/API call
  return new Promise((res) =>
    setTimeout(
      () =>
        res([
          { id: "c1", name: "Main Course" },
          { id: "c2", name: "Dessert" },
          { id: "c3", name: "Sides" },
        ]),
      150
    )
  );
}

async function fetchItems(): Promise<Item[]> {
  // TODO: Replace with actual DB/API call (with pagination if needed)
  return new Promise((res) =>
    setTimeout(
      () =>
        res([
          { id: "i1", name: "Chicken Biryani" },
          { id: "i2", name: "Mutton Korma" },
          { id: "i3", name: "Gulab Jamun" },
          { id: "i4", name: "Naan" },
        ]),
      150
    )
  );
}

/* ------------------ UI Subcomponents ------------------ */

const IconPlus = ({ size = 16 }: { size?: number }) => (
  <View style={{ width: size, height: size, borderRadius: size / 2, alignItems: "center", justifyContent: "center" }}>
    <Text style={{ color: "#FF2D55", fontWeight: "700" }}>＋</Text>
  </View>
);

const CloseX = ({ size = 12 }: { size?: number }) => <Text style={{ fontSize: size, color: "#FF2D55" }}>✕</Text>;

/* ------------------ Main Component ------------------ */

export default function ComboItemsManager() {
  const navigation = useNavigation();
  const [categories, setCategories] = useState<CategoryWithItems[]>([]);

  // Modals
  const [isComboModalOpen, setComboModalOpen] = useState(false);
  const [isItemsModalOpen, setItemsModalOpen] = useState(false);

  // Data lists for modals
  const [availableCombos, setAvailableCombos] = useState<Combo[]>([]);
  const [availableItems, setAvailableItems] = useState<Item[]>([]);

  // Modal state: which category is being acted on for items
  const [activeCategoryIdForItems, setActiveCategoryIdForItems] = useState<string | null>(null);

  // UI for create-new-combo in modal
  const [newComboName, setNewComboName] = useState("");
  const [isCreatingCombo, setIsCreatingCombo] = useState(false);

  // Load combos/items lazily when modal opens
  useEffect(() => {
    if (isComboModalOpen) {
      fetchCombos().then(setAvailableCombos).catch(() => setAvailableCombos([]));
    }
  }, [isComboModalOpen]);

  useEffect(() => {
    if (isItemsModalOpen) {
      fetchItems().then(setAvailableItems).catch(() => setAvailableItems([]));
    }
  }, [isItemsModalOpen]);

  /* ------------------ Category (Combo) handlers ------------------ */

  const openAddCategoryModal = useCallback(() => {
    setComboModalOpen(true);
    setNewComboName("");
    setIsCreatingCombo(false);
  }, []);

  const createNewComboLocally = useCallback(() => {
    if (!newComboName.trim()) return;
    const newCombo: Combo = { id: generateId("combo_"), name: newComboName.trim() };
    // Add to available combos list so user can select it
    setAvailableCombos((prev) => [newCombo, ...prev]);
    setNewComboName("");
    setIsCreatingCombo(false);
    // Auto-select it immediately:
    addCategoryFromCombo(newCombo);
    setComboModalOpen(false);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [newComboName]);

  const addCategoryFromCombo = useCallback((combo: Combo) => {
    // if the category already exists in UI, do not duplicate
    setCategories((prev) => {
      if (prev.find((p) => p.id === combo.id)) return prev;
      const newCat: CategoryWithItems = { id: combo.id, name: combo.name, items: [] };
      return [...prev, newCat];
    });
    setComboModalOpen(false);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);

  /* ------------------ Items handlers ------------------ */

  const openItemsModalForCategory = useCallback((categoryId: string) => {
    setActiveCategoryIdForItems(categoryId);
    setItemsModalOpen(true);
  }, []);

  const addItemToCategory = useCallback((categoryId: string, item: Item) => {
    setCategories((prev) =>
      prev.map((c) =>
        c.id === categoryId
          ? // prevent duplicate items inside same category
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

  /* ------------------ Navigation ------------------ */

  const goToAddItemScreen = useCallback(() => {
    setItemsModalOpen(false);
    // route to add-item screen; assumes your navigator has a route named "AddItem"
    // If different, change the route name accordingly.
    // @ts-ignore - navigation type generic is not enforced here
    router.push("/menu/add-item");
  }, []);

  /* ------------------ Render helpers ------------------ */

  const renderCategory = useCallback(({ item }: { item: CategoryWithItems }) => {
    return (
      <View key={item.id} className="rounded-lg border border-border-primary bg-white p-3 mb-4">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-inter-semibold text-text-primary">{item.name}</Text>
          <TouchableOpacity onPress={() => openItemsModalForCategory(item.id)} className="flex-row items-center">
            <Text className="text-sm text-red-500 font-inter-semibold mr-2">+ Add Item</Text>
            <IconPlus />
          </TouchableOpacity>
        </View>

        {/* Items chips */}
        <View>
          {item.items.length === 0 ? (
            <Text className="text-sm text-text-secondary">No items added to this category yet.</Text>
          ) : (
            <View className="flex-row flex-wrap">
              {item.items.map((it) => (
                <View key={it.id} className="bg-red-50 border border-red-100 rounded-full px-4 py-2 mr-2 mb-2 flex-row items-center">
                  <Text className="text-sm text-red-600 mr-2">{it.name}</Text>
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

  /* ------------------ Main UI ------------------ */

  return (
    <View className="p-4">
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-lg font-inter-semibold text-text-primary">Combo Items</Text>

        <TouchableOpacity onPress={openAddCategoryModal} className="flex-row items-center">
          <Text className="text-sm text-red-500 font-inter-semibold mr-2">+ Add Category</Text>
        </TouchableOpacity>
      </View>

      <View className="rounded-2xl bg-white p-3 border border-border-primary">
        <FlatList
          data={categories}
          keyExtractor={keyExtractor}
          renderItem={renderCategory}
          ListEmptyComponent={() => (
            <View className="p-6">
              <Text className="text-sm text-text-secondary">No categories added. Tap “Add Category” to get started.</Text>
            </View>
          )}
          scrollEnabled={false}
        />
      </View>

      {/* ---------------- Combo Modal (select or create category) ---------------- */}
      <Modal visible={isComboModalOpen} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-lg font-inter-semibold">Select or Create Category</Text>
              <TouchableOpacity onPress={() => setComboModalOpen(false)}>
                <Text className="text-red-500 font-inter-semibold">Close</Text>
              </TouchableOpacity>
            </View>

            {/* Create new */}
            <View className="mb-3">
              <TouchableOpacity
                className="rounded-lg border border-border-primary px-3 py-2 mb-2 bg-white"
                onPress={() => setIsCreatingCombo((v) => !v)}
              >
                <Text className="text-sm text-red-500 font-inter-semibold">+ Create New Category</Text>
              </TouchableOpacity>

              {isCreatingCombo ? (
                <View className="flex-row items-center bg-white rounded-lg px-3 py-2">
                  <TextInput
                    placeholder="Combo name"
                    value={newComboName}
                    onChangeText={setNewComboName}
                    className="flex-1 text-text-primary"
                    placeholderTextColor="#999"
                    returnKeyType="done"
                  />
                  <TouchableOpacity onPress={createNewComboLocally} className="ml-3 rounded-full px-3 py-1 bg-red-500">
                    <Text className="text-white font-inter-semibold">Create</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>

            {/* combos list */}
            <FlatList
              data={availableCombos}
              keyExtractor={(c) => c.id}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => addCategoryFromCombo(item)} className="py-3 border-b border-border-primary">
                  <Text className="text-base text-text-primary">{item.name}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={() => <Text className="text-sm text-text-secondary">No combos available</Text>}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        </View>
      </Modal>

      {/* ---------------- Items Modal ---------------- */}
      <Modal visible={isItemsModalOpen} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-lg font-inter-semibold">Add Item</Text>
              <TouchableOpacity onPress={() => setItemsModalOpen(false)}>
                <Text className="text-red-500 font-inter-semibold">Close</Text>
              </TouchableOpacity>
            </View>

            <View className="mb-3">
              <TouchableOpacity onPress={goToAddItemScreen} className="rounded-lg border border-border-primary px-3 py-2 bg-white">
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
                      // keep modal open to add more items
                    }}
                    className="py-3 border-b border-border-primary flex-row justify-between items-center"
                  >
                    <Text className="text-base text-text-primary">{item.name}</Text>
                    {alreadySelected ? <Text className="text-sm text-text-secondary">Added</Text> : <Text className="text-sm text-red-500">Add</Text>}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={() => <Text className="text-sm text-text-secondary">No items found</Text>}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ------------------ Styles ------------------ */

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
