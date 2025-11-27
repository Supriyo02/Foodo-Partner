// src/components/inbox/Notifications.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Pressable,
  LayoutAnimation,
  Platform,
  UIManager,
  ActivityIndicator,
  Animated,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { NotificationItem } from "@/types";
import { fetchNotifications, markNotificationAsRead } from "@/src/services/dbCalls";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ICON_MAP: Record<NonNullable<NotificationItem["icon"]>, string> = {
  order: "inventory-2",
  payment: "paid",
  update: "campaign",
  delivered: "check-circle",
};

const Notifications: React.FC = () => {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [query, setQuery] = useState("");
  const searchTimeout = useRef<number | null>(null);
  const [filtered, setFiltered] = useState<NotificationItem[]>([]);

  // fetch on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const data = await fetchNotifications();
      if (!mounted) return;
      setItems(data);
      setFiltered(data);
      setLoading(false);
    })();
    return () => {
      mounted = false;
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, []);

  // debounced search
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = (setTimeout(() => {
      if (!query) {
        setFiltered(items);
      } else {
        const q = query.trim().toLowerCase();
        setFiltered(
          items.filter(
            (n) =>
              n.title.toLowerCase().includes(q) ||
              n.body.toLowerCase().includes(q) ||
              n.timeLabel.toLowerCase().includes(q)
          )
        );
      }
    }, 180) as unknown) as number;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, items]);

  const onPressNotification = useCallback(
    async (id: string) => {
      // optimistic update locally for snappy UI
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setItems((prev) => prev.map((p) => (p.id === id ? { ...p, unread: false } : p)));
      setFiltered((prev) => prev.map((p) => (p.id === id ? { ...p, unread: false } : p)));

      // call service (simulated)
      try {
        await markNotificationAsRead(id);
      } catch (err) {
        // revert if error (optional). For now we ignore.
      }
    },
    [setItems, setFiltered]
  );

  const renderItem = useCallback(
    ({ item }: { item: NotificationItem }) => (
      <NotificationRow item={item} onPress={() => onPressNotification(item.id)} />
    ),
    [onPressNotification]
  );

  const keyExtractor = useCallback((i: NotificationItem) => i.id, []);

  const unreadCount = useMemo(() => items.filter((i) => i.unread).length, [items]);

  return (
    <View className="flex-1 bg-bg-primary">
      {/* Search input inside the tab */}
      <View className="px-4 pt-1 pb-2 bg-bg-primary">
        <View className="flex-row items-center bg-white rounded-lg px-3 py-2 shadow-sm">
          <MaterialIcons name="search" size={20} color="#9ca3af" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search"
            placeholderTextColor="#9ca3af"
            className="ml-2 flex-1 text-sm"
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {query ? (
            <TouchableOpacity onPress={() => setQuery("")} className="p-1">
              <MaterialIcons name="close" size={18} color="#9ca3af" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <View className="px-2">
        <Text className="text-sm text-gray-500 px-2 pb-2">
          {unreadCount > 0 ? `${unreadCount} unread` : "No unread notifications"}
        </Text>
      </View>

      <View className="flex-1">
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="small" />
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View className="h-px bg-gray-200 mx-4" />}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
};

export default Notifications;

/* ---------------------------
   NotificationRow component
   --------------------------- */
const DOT_SIZE = 8;

const NotificationRow: React.FC<{ item: NotificationItem; onPress: () => void }> = React.memo(
  ({ item, onPress }) => {
    // animate unread dot fade
    const dotOpacity = useRef(new Animated.Value(item.unread ? 1 : 0)).current;

    useEffect(() => {
      Animated.timing(dotOpacity, {
        toValue: item.unread ? 1 : 0,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }, [item.unread, dotOpacity]);

    const bgColor = item.iconBg ?? "#fff1f2";

    const ICON_MAP = {
        order: "inventory-2",
        payment: "paid",
        update: "campaign",
        delivered: "check-circle",
    } satisfies Record<string, keyof typeof MaterialIcons.glyphMap>;
    const iconName = ICON_MAP[item.icon ?? "order"];

    return (
      <Pressable
        onPress={onPress}
        android_ripple={{ color: "#f3f4f6" }}
        className="bg-white"
        accessibilityRole="button"
        style={{ paddingVertical: 12 }}
      >
        <View className="flex-row items-start px-4">
          {/* Icon circle */}
          <View
            className="w-11 h-11 rounded-full items-center justify-center"
            style={{ backgroundColor: bgColor }}
          >
            <MaterialIcons name={iconName} size={20} color="#ef4444" />
          </View>

          {/* text */}
          <View className="flex-1 ml-3 pr-2">
            <View className="flex-row justify-between items-start">
              <Text className="text-base font-bold text-text-primary" numberOfLines={1}>
                {item.title}
              </Text>

              <View className="items-end">
                <Text className="text-xs text-gray-400">{item.timeLabel}</Text>
              </View>
            </View>

            <Text className="text-sm text-gray-500 mt-1" numberOfLines={2}>
              {item.body}
            </Text>
          </View>

          {/* unread dot */}
          <Animated.View
            style={{
              opacity: dotOpacity,
              width: DOT_SIZE,
              height: DOT_SIZE,
              borderRadius: DOT_SIZE,
              backgroundColor: "#ef4444",
              alignSelf: "center",
            }}
          />
        </View>
      </Pressable>
    );
  }
);