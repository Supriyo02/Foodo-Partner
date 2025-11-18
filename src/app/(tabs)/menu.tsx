import { TouchableOpacity, View, Text, Alert, Image } from "react-native";
import { FAB, PaperProvider, Portal } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchBar from "@/src/components/SearchBar";
import { useCallback, useState } from "react";
import CombosTab from "../menu/CombosTab";
import PreviousMenusTab from "../menu/PrevMenuTab";
import ItemsTab from "../menu/ItemsTab";
import { MaterialIcons } from "@expo/vector-icons";
import { images } from "@/src/lib/constants";

export default function MenuManagementScreen() {
  const [active, setActive] = useState<'items' | 'combos' | 'previous'>('items');
  const [query, setQuery] = useState('');


  const onAdd = useCallback(() => {
    if (active === 'items') return Alert.alert('Add Item', 'Open Add Item flow');
    if (active === 'combos') return Alert.alert('Add Combo', 'Open Add Combo flow');
    return Alert.alert('Create Snapshot', 'Create previous menu snapshot');
  }, [active]);


  return (
    <PaperProvider>
    <SafeAreaView className="flex-1 bg-bg-primary">
        <View className="px-4 pb-2 pt-1 border-b gap-8 border-gray-200 bg-bg-primary flex-row relative">
          <TouchableOpacity >
            <Image source={images.menu} className='size-6' resizeMode='contain' tintColor='black' />
          </TouchableOpacity>
          <Text className=" text-xl font-inter-bold text-gray-900">
            Menu Management
          </Text>
        </View>


      {/* segmented control */}
      <View className="flex-row justify-around mt-4 px-4">
        <TouchableOpacity onPress={() => setActive('items')} className={`px-4 py-2 rounded-full ${active === 'items' ? 'bg-red-50' : ''}`}>
          <Text className={`${active === 'items' ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>Items</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActive('combos')} className={`px-4 py-2 rounded-full ${active === 'combos' ? 'bg-red-50' : ''}`}>
          <Text className={`${active === 'combos' ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>Combos</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActive('previous')} className={`px-4 py-2 rounded-full ${active === 'previous' ? 'bg-red-50' : ''}`}>
          <Text className={`${active === 'previous' ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>Previous Menus</Text>
        </TouchableOpacity>
      </View>


      {/* Search */}
      <View className="px-4 mt-4">
        <SearchBar value={query} onChange={setQuery} placeholder={active === 'items' ? 'Search items...' : active === 'combos' ? 'Search combos...' : 'Search previous menus...'} />
      </View>


      {/* content */}
      <View className="flex-1 px-4 mt-3">
        {active === 'items' && <ItemsTab query={query} />}
        {active === 'combos' && <CombosTab query={query} />}
        {active === 'previous' && <PreviousMenusTab />}
      </View>


      {/* FAB - behavior and label change per tab. Use Portal at root for correct stacking (PaperProvider must be root). */}
      <Portal>
        <FAB
          icon="plus"
          label={active === 'items' ? 'Add Item' : active === 'combos' ? "Add Combo" : 'Snapshot'}
          style={{ position: 'absolute', right: 20, bottom: 56 }}
          onPress={onAdd}
        />
      </Portal>
    </SafeAreaView>
    </PaperProvider>
  );
}




// import React, { useCallback, useEffect, useMemo, useState } from 'react';
// import { View, Text, FlatList, TouchableOpacity } from 'react-native';
// import { FAB, Provider as PaperProvider } from 'react-native-paper';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import SearchBar from '../../components/SearchBar';
// import ItemsList from '../../components/ItemList';
// import { fetchMenuItems } from '@/src/services/dbCalls';


// export type TabKey = 'items' | 'combos' | 'previous';


// export default function MenuManagementScreen() {
//   const [tab, setTab] = useState<TabKey>('items');
//   const [query, setQuery] = useState('');


//   const [items, setItems] = useState<any[]>([]);
//   const [loading, setLoading] = useState(false);


//   useEffect(() => {
//     let mounted = true;
//     const load = async () => {
//       setLoading(true);
//       const res = await fetchMenuItems();
//       if (!mounted) return;
//       setItems(res);
//       setLoading(false);
//     };
//     load();
//     return () => {
//       mounted = false;
//     };
//   }, []);


//   const filteredItems = useMemo(() => {
//     const q = query.trim().toLowerCase();
//     if (!q) return items;
//     return items.filter(i => (
//       i.name.toLowerCase().includes(q) ||
//       (i.description || '').toLowerCase().includes(q)
//     ));
//   }, [items, query]);


//   const onAddNew = useCallback(() => {
//     // navigate to add-screen (placeholder)
//     console.log('Add new pressed');
//   }, []);


//   return (
//     <PaperProvider>
//       <SafeAreaView className="flex-1 bg-white">
//         <View className="px-4 pt-4">
//           <Text className="text-xl font-semibold">Menu Management</Text>
//         </View>


//         {/* Segment control */}
//         <View className="flex-row justify-around mt-4 px-4">
//           <TouchableOpacity onPress={() => setTab('items')} className={`px-4 py-2 rounded-full ${tab === 'items' ? 'bg-red-50' : ''}`}>
//             <Text className={`${tab === 'items' ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>Items</Text>
//           </TouchableOpacity>
//           <TouchableOpacity onPress={() => setTab('combos')} className={`px-4 py-2 rounded-full ${tab === 'combos' ? 'bg-red-50' : ''}`}>
//             <Text className={`${tab === 'combos' ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>Combos</Text>
//           </TouchableOpacity>
//           <TouchableOpacity onPress={() => setTab('previous')} className={`px-4 py-2 rounded-full ${tab === 'previous' ? 'bg-red-50' : ''}`}>
//             <Text className={`${tab === 'previous' ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>Previous Menus</Text>
//           </TouchableOpacity>
//         </View>


//         {/* Search */}
//         <View className="px-4 mt-4">
//           <SearchBar value={query} onChangeText={setQuery} placeholder="Search in items..." />
//         </View>


//         {/* Content area */}
//         <View className="flex-1 px-4 mt-3">
//           {tab === 'items' && (
//             <ItemsList
//               items={filteredItems}
//               loading={loading}
//               onItemsChange={setItems}
//             />
//           )}


//           {tab === 'combos' && (
//             <View className="flex-1 items-center justify-center">
//               <Text className="text-gray-500">Combos - placeholder (implement your combos list here)</Text>
//             </View>
//           )}


//           {tab === 'previous' && (
//             <View className="flex-1 items-center justify-center">
//               <Text className="text-gray-500">Previous Menus - placeholder</Text>
//             </View>
//           )}
//         </View>


//         <FAB
//           icon="plus"
//           label="Add New"
//           style={{ position: 'absolute', right: 20, bottom: 120 }}
//           onPress={onAddNew}
//         />

//       </SafeAreaView>
//     </PaperProvider>
//   );
// }