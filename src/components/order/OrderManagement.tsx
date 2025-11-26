import { fetchDeliveredOrders, fetchIncomingOrders, fetchOutForDeliveryOrders, fetchPreparingOrders } from '@/src/services/dbCalls';
import { OrderCardType } from '@/types';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import { View, Text, FlatList, Image, Pressable, RefreshControl, ActivityIndicator} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

type OrderStatus = 'incoming' | 'preparing' | 'out' | 'delivered';

const Badge = ({text}:{text:string}) => (
  <View className="px-2 py-1.5 rounded-full bg-gray-200">
    <Text className="text-xs font-inter text-gray-700">{text}</Text>
  </View>
);

const OrderCard = React.memo(function OrderCard({order, primaryActionLabel, onPrimaryAction, secondaryActionLabel, onSecondaryAction, showStatusBadge}:{
  order: OrderCardType;
  primaryActionLabel?: string;
  onPrimaryAction?: (id: string) => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: (id: string) => void;
  showStatusBadge?: boolean;
}) {
  return (
    <View className="bg-white rounded-lg p-4 mb-2 shadow-md">
      {order.placedAt ? <Text className="text-xs font-inter text-text-secondary">{order.placedAt}</Text> : null}
      <View className="flex-row items-center justify-between mb-1">
        <Text className="font-inter-semibold text-base">Order #{order.id.replace(/^[^_]*_/, '')} - {order.customer}</Text>
        {showStatusBadge && order.declined ? <Badge text="Declined" /> : null}
        {showStatusBadge && order.rejected ? <Badge text="Rejected" /> : null}
      </View>

      <Text className="text-sm font-inter text-gray-700 mb-1">{order.itemsSummary}</Text>
      <Text className="text-sm font-inter text-gray-700 mb-1">Location: <Text className="font-medium">{order.deliveryLocation ?? '—'}</Text></Text>
      <Text className="text-sm font-inter-semibold mb-3">Total: ₹ {order.total}</Text>

      <View className="flex-row gap-3">
        {secondaryActionLabel ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSecondaryAction?.(order.id)
            }}
            className="flex-1 border border-border-primary rounded-lg py-3 items-center justify-center bg-bg-secondary"
            >
            <Text className="text-gray-700 font-inter">{secondaryActionLabel}</Text>
          </Pressable>
        ) : null}

        {primaryActionLabel ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onPrimaryAction?.(order.id);
            }}
            className="flex-1 rounded-lg py-3 items-center justify-center bg-primary"
            >
            <Text className="text-white font-semibold">{primaryActionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
});

const SectionHeader = ({title, count, onToggle, collapsed}:{title:string; count?:number; onToggle?:()=>void; collapsed?:boolean}) => (
  <Pressable onPress={onToggle} className="flex-row items-center justify-between px-1 pt-3 pb-1">
    <Text className="font-inter-semibold text-text-primary">{title}{typeof count === 'number' ? ` (${count})` : ''}</Text>
    <Text className="text-gray-400">{collapsed ? 
      <Feather name="chevron-down" size={20} color="black" />
     : <Feather name="chevron-up" size={20} color="black" />
     }</Text>
  </Pressable>
);

export default function OrdersScreen() {
  const [incoming, setIncoming] = useState<OrderCardType[] | null>(null);
  const [preparing, setPreparing] = useState<OrderCardType[] | null>(null);
  const [outForDelivery, setOutForDelivery] = useState<OrderCardType[] | null>(null);
  const [delivered, setDelivered] = useState<OrderCardType[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [collapsedIncoming, setCollapsedIncoming] = useState(false);
  const [collapsedPreparing, setCollapsedPreparing] = useState(false);
  const [collapsedOut, setCollapsedOut] = useState(false);
  const [collapsedDelivered, setCollapsedDelivered] = useState(true);

  const loadAll = useCallback(async () => {
    setRefreshing(true);
    try {
      const [inc, prep, out, del] = await Promise.all([
        fetchIncomingOrders(),
        fetchPreparingOrders(),
        fetchOutForDeliveryOrders(),
        fetchDeliveredOrders(),
      ]);
      setIncoming(inc);
      setPreparing(prep);
      setOutForDelivery(out);
      setDelivered(del);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const acceptIncoming = useCallback((id: string) => {
    setIncoming(prev => {
      if (!prev) return prev;
      const idx = prev.findIndex(o => o.id === id);
      if (idx === -1) return prev;
      const [order] = prev.splice(idx, 1);
      const toPrep: OrderCardType = {
        ...order,
        id: `pre_${Date.now()}`,
        placedAt: `Placed at ${new Date().toLocaleTimeString()}`,
        declined: false,
      };
      setPreparing(prevPrep => (prevPrep ? [toPrep, ...prevPrep] : [toPrep]));
      console.log('[DB] Accept incoming -> move to preparing', {from: id, to: toPrep.id});
      // Here you would call your accept API
      return [...prev];
    });
  }, []);

  const declineIncoming = useCallback((id: string) => {
    setIncoming(prev => prev ? prev.map(o => o.id === id ? {...o, declined: true} : o) : prev);
    console.log('[DB] Decline incoming', {id});
  }, []);

  const readyForDelivery = useCallback((id: string) => {
    setPreparing(prev => {
      if (!prev) return prev;
      const idx = prev.findIndex(o => o.id === id);
      if (idx === -1) return prev;
      const [order] = prev.splice(idx, 1);
      const toOut: OrderCardType = {
        ...order,
        id: `out_${Date.now()}`,
        placedAt: `Out for delivery at ${new Date().toLocaleTimeString()}`,
        rejected: false,
      };
      setOutForDelivery(prevOut => (prevOut ? [toOut, ...prevOut] : [toOut]));
      console.log('[DB] Mark ready for delivery', {from: id, to: toOut.id});
      return [...prev];
    });
  }, []);

  const rejectPreparing = useCallback((id: string) => {
    setPreparing(prev => prev ? prev.map(o => o.id === id ? {...o, rejected: true} : o) : prev);
    console.log('[DB] Reject preparing order', {id});
  }, []);

  const markAsDelivered = useCallback((id: string) => {
    setOutForDelivery(prev => {
      if (!prev) return prev;
      const idx = prev.findIndex(o => o.id === id);
      if (idx === -1) return prev;
      const [order] = prev.splice(idx, 1);
      const toDel: OrderCardType = {
        ...order,
        id: `del_${Date.now()}`,
        placedAt: `Delivered at ${new Date().toLocaleTimeString()}`,
      };
      setDelivered(prevDel => (prevDel ? [toDel, ...prevDel] : [toDel]));
      console.log('[DB] Mark as delivered', {from: id, to: toDel.id});
      return [...prev];
    });
  }, []);

  const renderIncoming = useCallback(({item}:{item:OrderCardType}) => (
    <OrderCard
      order={item}
      primaryActionLabel={item.declined ? undefined : 'Accept'}
      onPrimaryAction={(id) => acceptIncoming(id)}
      secondaryActionLabel={item.declined ? undefined : 'Decline'}
      onSecondaryAction={(id) => declineIncoming(id)}
      showStatusBadge
    />
  ), [acceptIncoming, declineIncoming]);

  const renderPreparing = useCallback(({item}:{item:OrderCardType}) => (
    <OrderCard
      order={item}
      primaryActionLabel={item.rejected ? 'Ready for Delivery' : 'Ready for Delivery'}
      onPrimaryAction={(id) => readyForDelivery(id)}
      secondaryActionLabel={'Reject'}
      onSecondaryAction={(id) => rejectPreparing(id)}
      showStatusBadge
    />
  ), [readyForDelivery, rejectPreparing]);

  const renderOut = useCallback(({item}:{item:OrderCardType}) => (
    <OrderCard
      order={item}
      primaryActionLabel={'Mark as Delivered'}
      onPrimaryAction={(id) => markAsDelivered(id)}
      showStatusBadge
    />
  ), [markAsDelivered]);

  const renderDelivered = useCallback(({item}:{item:OrderCardType}) => (
    <OrderCard
      order={item}
      showStatusBadge
    />
  ), []);

  const keyExtractor = useCallback((o: OrderCardType) => o.id, []);

  const incomingList = useMemo(() => incoming ?? [], [incoming]);
  const preparingList = useMemo(() => preparing ?? [], [preparing]);
  const outList = useMemo(() => outForDelivery ?? [], [outForDelivery]);
  const deliveredList = useMemo(() => delivered ?? [], [delivered]);

  return (
    // <SafeAreaView className="flex-1 bg-bg-primary">
    <View className='flex-1 bg-bg-primary h-full relative px-4 py-2'>
      <FlatList
        data={[{section: 'root'}]}
        keyExtractor={() => 'orders-root'}
        renderItem={() => (
          <View>
            {/* Incoming Orders */}
            <View className="mt-4">
              <SectionHeader title="Incoming Orders" count={incomingList.length} onToggle={() => setCollapsedIncoming(v => !v)} collapsed={collapsedIncoming} />
              {!collapsedIncoming && (
                incoming === null ? (
                  <View className="items-center justify-center py-8"><ActivityIndicator size="small" /></View>
                ) : incomingList.length === 0 ?
                <View className="items-center py-6"><Text className="text-text-secondary font-inter">No incoming orders</Text></View>
                :
                // incomingList.length === 0 ? (
                //   <View className="items-center py-10">
                //     <Image source={{uri: incomingDesign}} style={{width: 180, height: 120, resizeMode: 'contain'}} />
                //     <Text className="text-gray-500 mt-4 font-semibold">All caught up!</Text>
                //     <Text className="text-gray-400 text-sm mt-1 text-center">No new orders at the moment. We'll notify you when one comes in!</Text>
                //   </View>
                // ) :
                (
                  <FlatList data={incomingList} keyExtractor={keyExtractor} renderItem={renderIncoming} scrollEnabled={false} showsVerticalScrollIndicator={false} />
                )
              )}
            </View>

            {/* Preparing */}
            <View className="mt-2">
              <SectionHeader title="Preparing" count={preparingList.length} onToggle={() => setCollapsedPreparing(v => !v)} collapsed={collapsedPreparing} />
              {!collapsedPreparing && (
                preparing === null ? (
                  <View className="items-center justify-center py-8"><ActivityIndicator size="small" /></View>
                ) : preparingList.length === 0 ? (
                  <View className="items-center py-6"><Text className="text-text-secondary font-inter">No orders in preparing</Text></View>
                ) : (
                  <FlatList data={preparingList} keyExtractor={keyExtractor} renderItem={renderPreparing} scrollEnabled={false} showsVerticalScrollIndicator={false} />
                )
              )}
            </View>

            {/* Out for Delivery */}
            <View className="mt-4">
              <SectionHeader title="Out for Delivery" count={outList.length} onToggle={() => setCollapsedOut(v => !v)} collapsed={collapsedOut} />
              {!collapsedOut && (
                outForDelivery === null ? (
                  <View className="items-center justify-center py-8"><ActivityIndicator size="small" /></View>
                ) : outList.length === 0 ? (
                  <View className="items-center py-6"><Text className="text-text-secondary font-inter">No orders out for delivery</Text></View>
                ) : (
                  <FlatList data={outList} keyExtractor={keyExtractor} renderItem={renderOut} scrollEnabled={false} showsVerticalScrollIndicator={false} />
                )
              )}
            </View>

            {/* Delivered */}
            <View className="mt-4 mb-20">
              <SectionHeader title="Delivered" count={deliveredList.length} onToggle={() => setCollapsedDelivered(v => !v)} collapsed={collapsedDelivered} />
              {!collapsedDelivered && (
                delivered === null ? (
                  <View className="items-center justify-center py-8"><ActivityIndicator size="small" /></View>
                ) : deliveredList.length === 0 ? (
                  <View className="items-center py-6"><Text className="text-text-secondary font-inter">No delivered orders yet</Text></View>
                ) : (
                  <FlatList data={deliveredList} keyExtractor={keyExtractor} renderItem={renderDelivered} scrollEnabled={false} showsVerticalScrollIndicator={false} />
                )
              )}
            </View>
          </View>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadAll}  />}
        showsVerticalScrollIndicator={false}
      />
      </View>
    // </SafeAreaView>
  );
}
