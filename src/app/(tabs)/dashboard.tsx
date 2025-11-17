import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, ActivityIndicator, Dimensions, Pressable, GestureResponderEvent } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import * as Haptics from 'expo-haptics';
import { MaterialIcons, Feather, FontAwesome5 } from '@expo/vector-icons';
import cn from 'clsx';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DashboardData } from '@/src/lib/types';
import { dashboardData } from '@/src/data/dashboardData';
import { StatCard } from '@/src/components/StatCard';
import QuickActionButton from '@/src/components/QuickActionButton';
import Tooltip from '@/src/components/ToolTip';

export async function fetchDashboardData(): Promise<DashboardData> {
  await new Promise((res) => setTimeout(res, 700));
  return dashboardData;
}

const formatCurrency = (v: number) => v.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 });
const WINDOW_WIDTH = Dimensions.get('window').width;

const CHART_CONFIG = {
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(255, 9, 54, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(99,102,107, ${opacity})`,
  propsForDots: { r: '4', strokeWidth: '0' },
  style: { borderRadius: 12 },
};

export default function DashboardScreen() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [trend, setTrend] = useState<'weekly' | 'monthly' | 'yearly'>('weekly');

  // tooltip state (label, orders, sales)
  const [tooltip, setTooltip] = useState<{ visible: boolean; label: string; orders: number; sales: number; left: number }>({ visible: false, label: '', orders: 0, sales: 0, left: 0 });
  const tooltipTimer = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetchDashboardData();
        if (!cancelled) setData(res);
      } finally {
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

  const chartPayload = useMemo(() => {
    if (!data) return { labels: [], values: [] as number[] };
    if (trend === 'weekly') {
      const order = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const map = new Map(data.weeklySales.map((d) => [d.day, d.value]));
      const labels = order;
      const values = order.map((d) => map.get(d) ?? 0);
      return { labels, values };
    }

    if (trend === 'monthly') {
      const labels = data.monthlySales.map((m) => m.month);
      const map = new Map(data.monthlySales.map((m) => [m.month, m.value]));
      const values = labels.map((d) => map.get(d) ?? 0);
      return { labels, values };
    }
    const labels = data.monthlySales.map((m) => m.month);
    const values = data.monthlySales.map((m) => m.value);
    return { labels, values };
  }, [data, trend]);

  const CHART_LEFT_PADDING = 12;
  const CHART_RIGHT_PADDING = 12;
  const chartWidth = useMemo(() => WINDOW_WIDTH - 48, [chartPayload]);

  const topCustomers = useMemo(() => (data ? data.topCustomers : []), [data]);

  const handleDataPointClick = (dp: { value: number; index: number }) => {
    const n = Math.max(1, chartPayload.values.length);
    const usableWidth = chartWidth - CHART_LEFT_PADDING - CHART_RIGHT_PADDING;
    const spacing = usableWidth / Math.max(1, n - 1);
    const index = dp.index;
    const left = CHART_LEFT_PADDING + index * spacing;
    const label = chartPayload.labels[index] ?? '';
    const orders = dp.value;
    const sales = (data?.avgOrderValue ?? 0) * orders;

    if (tooltipTimer.current) clearTimeout(tooltipTimer.current);

    setTooltip({ visible: true, label, orders, sales, left });
    Haptics.selectionAsync();

    tooltipTimer.current = setTimeout(() => {
      setTooltip((t) => ({ ...t, visible: false }));
    }, 4400);

  };

  const handleTouchAtX = (nativeX: number) => {
    const n = Math.max(1, chartPayload.values.length);
    const usableWidth = chartWidth - CHART_LEFT_PADDING - CHART_RIGHT_PADDING;
    const spacing = usableWidth / Math.max(1, n - 1);
    const index = Math.round((nativeX - CHART_LEFT_PADDING) / spacing);
    const clampedIndex = Math.max(0, Math.min(n - 1, index));

    const orders = chartPayload.values[clampedIndex] ?? 0;
    const label = chartPayload.labels[clampedIndex] ?? '';
    const sales = (data?.avgOrderValue ?? 0) * orders;
    const left = CHART_LEFT_PADDING + clampedIndex * spacing;

    if (tooltipTimer.current) clearTimeout(tooltipTimer.current);

    setTooltip({ visible: true, label, orders, sales, left });
    Haptics.selectionAsync();

    tooltipTimer.current = setTimeout(() => {
      setTooltip((t) => ({ ...t, visible: false }));
    }, 4400);

  };

  const handleLongPress = (nativeX: number) => {
    handleTouchAtX(nativeX);
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-primary">
      <ScrollView className="bg-bg-primary p-4" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-base font-inter-bold">{data?.kitchenName ?? 'Loading...'}</Text>
            <View className="flex-row items-center">
              <View className={cn('w-2 h-2 rounded-full mr-2', data?.status === 'Open' ? 'bg-green-500' : 'bg-gray-400')} />
              <Text className={cn('text-xs font-inter', data?.status === 'Open' ? 'text-green-600' : 'text-gray-500')}>{data?.status ?? ''}</Text>
            </View>
          </View>

          <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} className="p-2 bg-white rounded-xl">
            <MaterialIcons name="notifications-none" size={22} color="#111827" />
          </Pressable>
        </View>

        {loading ? (
          <>
            <View className="flex-row">
              <View className="bg-gray-200 rounded-2xl p-4 flex-1 mr-3" style={{ height: 92 }} />
              <View className="bg-gray-200 rounded-2xl p-4 flex-1" style={{ height: 92 }} />
            </View>
            <View className="flex-row mt-3 mb-3">
              <View className="bg-gray-200 rounded-2xl p-4 flex-1 mr-3" style={{ height: 92 }} />
              <View className="bg-gray-200 rounded-2xl p-4 flex-1" style={{ height: 92 }} />
            </View>
          </>
        ) : (
          <View>
            <View className="flex-row mb-3">
              <StatCard title="Today's Orders" value={`${data!.todaysOrders}`} subtitle="New Orders" icon={<MaterialIcons name="list-alt" size={20} color="#ea0b2c" />} />
              <StatCard title="Total Income" value={`${formatCurrency(data!.totalIncome)}`} subtitle="Today's Earnings" icon={<MaterialIcons name="attach-money" size={20} color="#ea0b2c" />} />
            </View>

            <View className="flex-row mb-4">
              <StatCard title="Avg Order Value" value={`${formatCurrency(data!.avgOrderValue)}`} subtitle="Per order" icon={<FontAwesome5 name="money-bill-wave" size={16} color="#ea0b2c" />} />
              <StatCard title="Conversion Rate" value={`${data!.conversionRate}%`} subtitle="Conversion" icon={<MaterialIcons name="insights" size={18} color="#ea0b2c" />} />
            </View>
          </View>
        )}

        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-sm font-inter-semibold">Sales Trend</Text>
          <View className="flex-row items-center space-x-2">
            <View className="flex-row bg-gray-100 rounded-full p-1">
              <Pressable onPress={() => setTrend('weekly')} className={cn('px-3 py-1 rounded-full', trend === 'weekly' ? 'bg-white shadow-sm' : '')}>
                <Text className={cn('text-sm font-inter-medium', trend === 'weekly' ? 'text-black' : 'text-gray-500')}>Weekly</Text>
              </Pressable>
              <Pressable onPress={() => setTrend('monthly')} className={cn('px-3 py-1 rounded-full', trend === 'monthly' ? 'bg-white shadow-sm' : '')}>
                <Text className={cn('text-sm font-inter-medium', trend === 'monthly' ? 'text-black' : 'text-gray-500')}>Monthly</Text>
              </Pressable>
              <Pressable onPress={() => setTrend('yearly')} className={cn('px-3 py-1 rounded-full', trend === 'yearly' ? 'bg-white shadow-sm' : '')}>
                <Text className={cn('text-sm font-inter-medium', trend === 'yearly' ? 'text-black' : 'text-gray-500')}>Yearly</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Line Chart (horizontal scroll for pan) */}
        <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          {loading ? (
            <View className="h-72 items-center justify-center">
              <ActivityIndicator />
            </View>
          ) : (
            <View>
              <Text className="text-lg font-inter-bold mb-1">{formatCurrency(data!.weeklySalesTotal)}</Text>
              <Text className="text-xs font-inter text-gray-400 mb-3">This Period <Text className="text-green-500">+{data!.weeklyGrowthPercent}%</Text></Text>

              <View style={{ width: chartWidth }}>
                <View style={{ position: 'relative', paddingLeft: CHART_LEFT_PADDING }}>
                  <Tooltip visible={tooltip.visible} label={tooltip.label} orders={tooltip.orders} sales={tooltip.sales} left={tooltip.left} />

                  <View>
                    <LineChart
                      data={{ labels: chartPayload.labels, datasets: [{ data: chartPayload.values }] }}
                      width={chartWidth}
                      height={220}
                      chartConfig={CHART_CONFIG}
                      bezier
                      style={{ borderRadius: 12, marginLeft: -30 }}
                      withDots
                      withShadow
                      onDataPointClick={(dp) => handleDataPointClick(dp as any)}
                      formatYLabel={(y) => `${y}`}
                      fromZero
                      yAxisInterval={1}
                      verticalLabelRotation={0}
                    />

                    <Pressable
                      style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
                      onPressIn={(e: GestureResponderEvent) => {
                        const x = e.nativeEvent.locationX;
                        // compute nearest index and show tooltip (tap simulation)
                        handleTouchAtX(x);
                      }}
                      // onLongPress={(e: GestureResponderEvent) => {
                      //   const x = e.nativeEvent.locationX;
                      //   handleLongPress(x);
                      // }}
                    />
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>

        <View className="flex-row mb-4">
          <View className="flex-1 mr-3 bg-white rounded-2xl p-4 shadow-sm">
            <Text className="text-md font-inter-semibold mb-2">Top Customers</Text>
            {loading ? (
              <View className="h-36 items-center justify-center"><ActivityIndicator /></View>
            ) : (
              topCustomers.map((c, idx) => (
                <View key={c.name} className={cn('flex-row items-center justify-between py-2', idx < topCustomers.length - 1 ? 'border-b border-gray-100' : '')}>
                  <View>
                    <Text className="text-sm font-inter-medium">{c.name}</Text>
                    <Text className="text-xs font-inter text-gray-500">{c.orders} orders</Text>
                  </View>
                  <Text className="text-sm font-inter-semibold">{formatCurrency(c.totalSpent)}</Text>
                </View>
              ))
            )}
          </View>

          <View className="w-1/2 bg-white rounded-2xl p-4 shadow-sm">
            <Text className="text-md font-inter-semibold mb-2">Top Items</Text>
            {loading ? (
              <View className="h-36 items-center justify-center"><ActivityIndicator /></View>
            ) : (
              data!.topItems.map((it, idx) => (
                <View key={it.name} className={cn('flex-row items-center justify-between py-2', idx < data!.topItems.length - 1 ? 'border-b border-gray-100' : '')}>
                  <Text className="text-sm font-inter-medium">{it.name}</Text>
                  <Text className="text-sm text-gray-500 font-inter-semibold">{it.sold}</Text>
                </View>
              ))
            )}
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-sm font-inter-semibold mb-3">Quick Actions</Text>
          <View className="flex-row flex-wrap -m-2">{loading ? Array.from({ length: 4 }).map((_, i) => <View key={i} className="w-1/2 p-2"><View className="bg-gray-200 rounded-2xl p-4 h-28" /></View>) : data!.quickActions.map((q) => <QuickActionButton key={q.id} item={q} onPress={quickActionHandler} />)}</View>
        </View>

        <View className="bg-white rounded-2xl p-4 mb-32 shadow-sm">
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
    </SafeAreaView>
  );
}
