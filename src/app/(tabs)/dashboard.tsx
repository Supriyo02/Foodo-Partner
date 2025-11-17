/*
  ProtectedTabs._layout.tsx (UPDATED)
  Place this file under: app/(protected)/_layout.tsx  (or app/(tabs)/_layout.tsx depending on your route groups)

  What this file contains (production-minded, performance-focused):
  - Protected tab layout that redirects unauthenticated users to /sign-in
  - Memoized TabBarIcon component
  - Custom TabBarButton with haptics + Reanimated press animation
  - Tailwind-first tabBarClassName usage
  - Dashboard screen (interactive) implemented with Victory Native charts (zoom + tooltip)
  - Pull-to-refresh using RefreshControl
  - Async fetch function placeholders serving static data (replace with real DB/API)
  - Extra analytics widgets (AOV, conversion, top items) and UX-friendly loading states

  Packages expected (add to your Expo project if missing):
    - nativewind
    - expo-haptics
    - react-native-reanimated
    - react-native-svg
    - victory-native
    - @expo/vector-icons
*/
import "victory-native";
import React, { JSX, memo, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  AccessibilityInfo,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Tabs, Redirect } from 'expo-router';
import cn from 'clsx';
// import useAuthStore from '@/stores/auth.store';
// import { images } from '@/constants';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

// Victory imports (v36+ usage)
import { VictoryChart, VictoryLine, VictoryPie } from 'victory';
import {  VictoryAxis,
  VictoryVoronoiContainer,
  VictoryTooltip,
  VictoryZoomContainer,
  VictoryLegend,
  createContainer,
} from 'victory';

import { MaterialIcons, FontAwesome5, Feather } from '@expo/vector-icons';

// ---------- Types ----------
type DashboardData = {
  kitchenName: string;
  status: 'Open' | 'Closed';
  todaysOrders: number;
  totalIncome: number;
  activeSubscriptions: number;
  avgRating: number;
  weeklySales: { day: string; value: number }[];
  monthlySales: { month: string; value: number }[];
  weeklySalesTotal: number;
  weeklyGrowthPercent: number;
  quickActions: { id: string; title: string; iconName: string; iconPack?: 'material' | 'feather' | 'fa' }[];
  avgOrderValue: number;
  conversionRate: number;
  pendingOrders: number;
  activeDeliveries: number;
  topItems: { name: string; sold: number }[];
  orderDistribution: { label: string; value: number }[]; // for pie chart
};

// ---------- Async DB placeholder function (replace with real async call) ----------
export async function fetchDashboardData(): Promise<DashboardData> {
  // Simulate network latency (replace with your real API/DB call)
  await new Promise((res) => setTimeout(res, 900));

  return {
    kitchenName: 'The Golden Spoon Kitchen',
    status: 'Open',
    todaysOrders: 15,
    totalIncome: 250.75,
    activeSubscriptions: 8,
    avgRating: 4.8,
    weeklySales: [
      { day: 'Mon', value: 120 },
      { day: 'Tue', value: 300 },
      { day: 'Wed', value: 200 },
      { day: 'Thu', value: 420 },
      { day: 'Fri', value: 380 },
      { day: 'Sat', value: 460 },
      { day: 'Sun', value: 410 },
    ],
    monthlySales: [
      { month: 'Jan', value: 4200 },
      { month: 'Feb', value: 5200 },
      { month: 'Mar', value: 4800 },
      { month: 'Apr', value: 5400 },
      { month: 'May', value: 6000 },
      { month: 'Jun', value: 5800 },
    ],
    weeklySalesTotal: 1850.45,
    weeklyGrowthPercent: 5.2,
    quickActions: [
      { id: 'add', title: 'Add Menu', iconName: 'add-circle', iconPack: 'material' },
      { id: 'orders', title: 'View Orders', iconName: 'shopping-bag', iconPack: 'feather' },
      { id: 'delivery', title: 'Deliveries', iconName: 'delivery-dining', iconPack: 'material' },
      { id: 'analytics', title: 'Analytics', iconName: 'chart-line', iconPack: 'fa' },
    ],
    avgOrderValue: 12.35,
    conversionRate: 3.8,
    pendingOrders: 4,
    activeDeliveries: 6,
    topItems: [
      { name: 'Paneer Butter Masala', sold: 120 },
      { name: 'Egg Fried Rice', sold: 90 },
      { name: 'Chicken Biryani', sold: 75 },
    ],
    orderDistribution: [
      { label: 'Dine-in', value: 30 },
      { label: 'Pickup', value: 20 },
      { label: 'Delivery', value: 50 },
    ],
  };
}

// ---------- Utilities ----------
const formatCurrency = (v: number) => v.toLocaleString('en-IN', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
const windowWidth = Dimensions.get('window').width;

// ---------- TabBar icon + button (re-used from previous layout) ----------
import { ImageSourcePropType } from 'react-native';

type TabBarIconProps = {
  focused: boolean;
  color: string;
  size?: number;
  icon: ImageSourcePropType;
  title: string;
};

const TabBarIcon = memo(function TabBarIcon({ focused, color, size = 28, icon, title }: TabBarIconProps) {
  return (
    <View className="items-center justify-center" accessible accessibilityRole="button" accessibilityState={{ selected: focused }}>
      <Image source={icon} style={{ width: size, height: size, tintColor: color, resizeMode: 'contain' }} />
      <Text className={cn('text-xs font-bold', focused ? 'text-primary' : 'text-gray-400')}>{title}</Text>
    </View>
  );
});

TabBarIcon.displayName = 'TabBarIcon';

const TabBarButton = ({ accessibilityState, children, onPress, ...rest }: any) => {
  const focused = accessibilityState?.selected;
  const scaleStyle = useAnimatedStyle(() => ({ transform: [{ scale: withTiming(focused ? 1.05 : 1, { duration: 150 }) }] }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <Animated.View style={scaleStyle as any} className="flex-1 items-center justify-center">
      <Pressable {...rest} onPress={handlePress} style={{ width: '100%' }}>
        {children}
      </Pressable>
    </Animated.View>
  );
};

// ---------- Chart container combining zoom + voronoi for tooltip ----------
const VictoryZoomVoronoiContainer: any = createContainer('zoom', 'voronoi');

// ---------- Small memoized stat card ----------
const StatCard = memo(function StatCard({ title, value, subtitle, icon }: { title: string; value: string; subtitle?: string; icon?: JSX.Element }) {
  return (
    <View className="bg-white rounded-2xl p-4 flex-1 mr-3 shadow-sm">
      <View className="flex-row justify-between items-start">
        <View>
          <Text className="text-xs text-gray-400">{title}</Text>
          <Text className="text-xl font-bold mt-2">{value}</Text>
          {subtitle ? <Text className="text-xs text-gray-400 mt-1">{subtitle}</Text> : null}
        </View>
        <View className="bg-gray-100 rounded-full p-2">{icon}</View>
      </View>
    </View>
  );
});

// ---------- QuickActionButton ----------
function QuickActionButton({ item, onPress }: { item: DashboardData['quickActions'][number]; onPress: (id: string) => void }) {
  const scale = useAnimatedStyle(() => ({ transform: [{ scale: withTiming(1, { duration: 120 }) }] }));

  const handlePress = () => {
    Haptics.selectionAsync();
    onPress(item.id);
  };

  const Icon = () => {
    if (item.iconPack === 'material') return <MaterialIcons name={item.iconName as any} size={22} color="#ff3b57" />;
    if (item.iconPack === 'feather') return <Feather name={item.iconName as any} size={20} color="#ff3b57" />;
    return <FontAwesome5 name={item.iconName as any} size={18} color="#ff3b57" />;
  };

  return (
    <Animated.View style={scale as any} className="w-1/2 p-2">
      <Pressable onPress={handlePress} className="bg-white rounded-2xl p-4 items-center justify-center shadow-sm">
        <View className="bg-red-50 rounded-full p-3 mb-2">
          <Icon />
        </View>
        <Text className="text-sm font-semibold">{item.title}</Text>
      </Pressable>
    </Animated.View>
  );
}

// ---------- Main Layout & Dashboard Screen Combined ----------
// export default function ProtectedTabsLayout() {
//   const { isAuthenticated } = useAuthStore();
//   if (!isAuthenticated) return <Redirect href="/sign-in" />;

//   return (
//     <Tabs
//       initialRouteName="index"
//       screenOptions={{
//         headerShown: false,
//         tabBarShowLabel: false,
//         tabBarClassName: 'rounded-[50px] mx-5 h-20 absolute bottom-5 bg-white shadow-lg shadow-black/10',
//         tabBarButton: (props) => <TabBarButton {...props} />,
//       }}
//     >
//       <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color, focused, size }) => <TabBarIcon title="Home" icon={images.home} color={color} focused={focused} size={size} /> }} />
//       <Tabs.Screen name="search" options={{ title: 'Search', tabBarIcon: ({ color, focused, size }) => <TabBarIcon title="Search" icon={images.search} color={color} focused={focused} size={size} /> }} />
//       <Tabs.Screen name="cart" options={{ title: 'Cart', tabBarIcon: ({ color, focused, size }) => <TabBarIcon title="Cart" icon={images.bag} color={color} focused={focused} size={size} /> }} />
//       <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color, focused, size }) => <TabBarIcon title="Profile" icon={images.person} color={color} focused={focused} size={size} /> }} />

//       {/* Dashboard route: placed at app/(protected)/dashboard.tsx in real app but here embedded for preview*/}
//       <Tabs.Screen
//         name="dashboard"
//         options={{ title: 'Dashboard', tabBarIcon: ({ color, focused, size }) => <TabBarIcon title="Dash" icon={images.home} color={color} focused={focused} size={size} /> }}
//       />

//       {/* Render Dashboard as child route default (you can move to separate file) */}
//       <Tabs.Screen
//         name="dashboardScreen"
//         options={{ href: null }}
//       >
//         {() => <DashboardScreen />}
//       </Tabs.Screen>
//     </Tabs>
//   );
// }

export default function DashboardScreen() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [trend, setTrend] = useState<'weekly' | 'monthly'>('weekly');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetchDashboardData();
        if (!cancelled) {
          setData(res);
          setLoading(false);
          AccessibilityInfo.announceForAccessibility('Dashboard loaded');
        }
      } catch (err) {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const res = await fetchDashboardData();
      setData(res);
    } finally {
      setRefreshing(false);
    }
  };

  const quickActionHandler = (id: string) => {
    Haptics.selectionAsync();
    console.log('Quick action', id);
  };

  // Prepare chart data
  const chartData = useMemo(() => (data ? data.weeklySales.map((d, i) => ({ x: d.day, y: d.value })) : []), [data]);
  const pieData = useMemo(() => (data ? data.orderDistribution.map((d) => ({ x: d.label, y: d.value })) : []), [data]);

  return (
    <ScrollView
      className="bg-gray-50 p-4"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View>
          <Text className="text-base font-bold">{data?.kitchenName ?? 'Loading...'}</Text>
          <View className="flex-row items-center">
            <View className={cn('w-2 h-2 rounded-full mr-2', data?.status === 'Open' ? 'bg-green-500' : 'bg-gray-400')} />
            <Text className={cn('text-xs', data?.status === 'Open' ? 'text-green-600' : 'text-gray-500')}>{data?.status ?? ''}</Text>
          </View>
        </View>

        <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} className="p-2 bg-white rounded-xl">
          <MaterialIcons name="notifications-none" size={22} color="#111827" />
        </Pressable>
      </View>

      {/* KPI Cards */}
      {loading ? (
        <View>
          <View className="flex-row">
            <View className="bg-gray-200 rounded-2xl p-4 flex-1 mr-3" style={{ height: 92 }} />
            <View className="bg-gray-200 rounded-2xl p-4 flex-1" style={{ height: 92 }} />
          </View>
          <View className="flex-row mt-3">
            <View className="bg-gray-200 rounded-2xl p-4 flex-1 mr-3" style={{ height: 92 }} />
            <View className="bg-gray-200 rounded-2xl p-4 flex-1" style={{ height: 92 }} />
          </View>
        </View>
      ) : (
        <View>
          <View className="flex-row mb-3">
            <StatCard title="Today's Orders" value={`${data!.todaysOrders}`} subtitle="New Orders" icon={<MaterialIcons name="list-alt" size={20} color="#FF4D6D" />} />
            <StatCard title="Total Income" value={`${formatCurrency(data!.totalIncome)}`} subtitle="Today's Earnings" icon={<MaterialIcons name="attach-money" size={20} color="#FF4D6D" />} />
          </View>

          <View className="flex-row mb-4">
            <StatCard title="Avg Order Value" value={`${formatCurrency(data!.avgOrderValue)}`} subtitle="Per order" icon={<FontAwesome5 name="money-bill-wave" size={16} color="#FF4D6D" />} />
            <StatCard title="Conversion Rate" value={`${data!.conversionRate}%`} subtitle="Conversion" icon={<MaterialIcons name="insights" size={18} color="#FF4D6D" />} />
          </View>
        </View>
      )}

      {/* Interactive Chart + Controls */}
      <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-sm font-semibold">Sales Trend</Text>
          <View className="flex-row bg-gray-100 rounded-full p-1">
            <Pressable onPress={() => setTrend('weekly')} className={cn('px-3 py-1 rounded-full', trend === 'weekly' ? 'bg-white shadow-sm' : '')}>
              <Text className={cn('text-sm font-medium', trend === 'weekly' ? 'text-black' : 'text-gray-500')}>Weekly</Text>
            </Pressable>
            <Pressable onPress={() => setTrend('monthly')} className={cn('px-3 py-1 rounded-full', trend === 'monthly' ? 'bg-white shadow-sm' : '')}>
              <Text className={cn('text-sm font-medium', trend === 'monthly' ? 'text-black' : 'text-gray-500')}>Monthly</Text>
            </Pressable>
          </View>
        </View>

        {loading ? (
          <View className="h-40 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : (
          <View>
            <Text className="text-lg font-bold mb-1">{formatCurrency(data!.weeklySalesTotal)}</Text>
            <Text className="text-xs text-gray-400 mb-2">This Week <Text className="text-green-500">+{data!.weeklyGrowthPercent}%</Text></Text>

            <View style={{ height: 220 }}>
              <VictoryChart
                width={windowWidth - 32}
                height={220}
                containerComponent={
                  <VictoryZoomVoronoiContainer
                    zoomDimension="x"
                    voronoiPadding={10}
                    voronoiBlacklist={[]}
                    labels={({ datum }: any) => `${datum.x}: ${datum.y}`}
                    labelComponent={<VictoryTooltip flyoutStyle={{ stroke: '#eee', fill: 'white' }} />}
                  />
                }
              >
                <VictoryAxis style={{ axis: { stroke: '#f3f4f6' }, tickLabels: { fill: '#9CA3AF' } }} />
                <VictoryLine
                  interpolation="natural"
                  data={trend === 'weekly' ? chartData : data!.monthlySales.map((m) => ({ x: m.month, y: m.value }))}
                  style={{ data: { stroke: '#FF4D6D', strokeWidth: 3 } }}
                />
              </VictoryChart>
            </View>

            <View className="flex-row justify-between mt-3 px-2">
              {(trend === 'weekly' ? data!.weeklySales.map((d) => d.day) : data!.monthlySales.map((m) => m.month)).map((t, idx) => (
                <Text key={idx} className="text-xs text-gray-400">{t}</Text>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Extra analytics row: Pie + Top Items + Realtime */}
      <View className="flex-row mb-4">
        <View className="flex-1 mr-3 bg-white rounded-2xl p-4 shadow-sm">
          <Text className="text-sm font-semibold mb-2">Order Distribution</Text>
          {loading ? (
            <View className="h-36 items-center justify-center"><ActivityIndicator /></View>
          ) : (
            <VictoryPie
              data={pieData}
              colorScale={["#FF4D6D", "#34D399", "#60A5FA"]}
              width={windowWidth * 0.45}
              height={160}
              innerRadius={28}
              labels={({ datum }) => `${datum.x}: ${datum.y}%`}
              style={{ labels: { fontSize: 10 } }}
            />
          )}
        </View>

        <View className="w-1/2 bg-white rounded-2xl p-4 shadow-sm">
          <Text className="text-sm font-semibold mb-2">Top Items</Text>
          {loading ? (
            <View className="h-36 items-center justify-center"><ActivityIndicator /></View>
          ) : (
            data!.topItems.map((it, idx) => (
              <View key={it.name} className={cn('flex-row items-center justify-between py-2', idx < data!.topItems.length - 1 ? 'border-b border-gray-100' : '')}>
                <Text className="text-sm">{it.name}</Text>
                <Text className="text-sm text-gray-500">{it.sold}</Text>
              </View>
            ))
          )}
        </View>
      </View>

      {/* Quick Actions */}
      <View className="mb-6">
        <Text className="text-sm font-semibold mb-3">Quick Actions</Text>
        <View className="flex-row flex-wrap -m-2">
          {loading ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <View key={idx} className="w-1/2 p-2"><View className="bg-gray-200 rounded-2xl p-4 h-28" /></View>
            ))
          ) : (
            data!.quickActions.map((q) => <QuickActionButton key={q.id} item={q} onPress={quickActionHandler} />)
          )}
        </View>
      </View>

      {/* More insights */}
      <View className="bg-white rounded-2xl p-4 mb-8 shadow-sm">
        <Text className="text-sm font-semibold mb-2">Operational Insights</Text>
        <View className="flex-row items-center mb-2">
          <MaterialIcons name="people" size={18} color="#FF4D6D" />
          <Text className="ml-2 text-sm">Top customers & LTV analytics</Text>
        </View>
        <View className="flex-row items-center mb-2">
          <MaterialIcons name="campaign" size={18} color="#FF4D6D" />
          <Text className="ml-2 text-sm">Promotions & coupon quick-push</Text>
        </View>
        <View className="flex-row items-center">
          <MaterialIcons name="flash-on" size={18} color="#FF4D6D" />
          <Text className="ml-2 text-sm">Realtime order heatmap</Text>
        </View>
      </View>
    </ScrollView>
  );
}
