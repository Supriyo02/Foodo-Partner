import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import TickBadge from '../../components/TickBadge';
import CustomButton from '@/src/components/CustomButton';
import useRegistrationKitchen from '@/src/stores/kitchenSetupStore';

type BusinessDetails = {
  businessName: string;
  contactEmail: string;
  businessType: string;
};
export async function fetchBusinessDetails(): Promise<BusinessDetails> {
  const combined = useRegistrationKitchen.getState().getCombined();
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        businessName: combined.kitchenName,
        contactEmail: combined.businessEmail,
        businessType: combined.kitchenType,
      });
    }, 900);
  });
}

// const AUTO_NAV_DELAY_MS = 5000;

export default function RegistraionConfirmation() {
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState<BusinessDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

//   const autoNavTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const result = await fetchBusinessDetails();
        if (cancelled) return;
        setBusiness(result);
        setLoading(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

        // autoNavTimerRef.current = setTimeout(() => {
        //   router.replace('/');
        // }, AUTO_NAV_DELAY_MS);
      } catch (err: any) {
        if (cancelled) return;
        setError(err?.message ?? 'Failed to load');
        setLoading(false);
      }
    };

    load();

    // return () => {
    //   cancelled = true;
    //   if (autoNavTimerRef.current) clearTimeout(autoNavTimerRef.current);
    // };
  }, []);

  const goToDashboard = () => {
    // if (autoNavTimerRef.current) clearTimeout(autoNavTimerRef.current);
    router.replace('/');
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-primary">
      <View className="flex-1 justify-center items-center px-6">

        <View className='mb-10'>
          <TickBadge size={144} 
        //   onAnimationComplete={() => { }} 
          />
        </View>

        <Text className="text-3xl font-inter-extrabold text-center text-text-primary">Welcome to Foodo!</Text>
        <Text className="text-sm font-inter text-center text-text-secondary mt-2 px-6">
          Your business profile has been successfully created. You're all set to start selling.
        </Text>

        <View className="w-full mt-6 bg-bg-primary rounded-2xl shadow-md p-4 border border-gray-100">
          <Text className="text-xl font-semibold text-slate-800 mb-3">Your Business Details</Text>

          {loading && (
            <View className="gap-3 py-6">
              <View className="h-5 bg-gray-200 rounded w-2/3" />
              <View className="h-5 bg-gray-200 rounded w-1/2" />
              <View className="h-5 bg-gray-200 rounded w-1/3" />
            </View>
          )}

          {!loading && business && (
            <View className="p-2">
              <View className="flex-row justify-between py-2">
                <Text className="text-slate-600 font-inter">Business Name</Text>
                <Text className="font-inter-medium text-text-primary">{business.businessName}</Text>
              </View>

              <View className="flex-row justify-between py-2">
                <Text className="text-slate-600 font-inter">Contact Email</Text>
                <Text className="font-inter-medium text-text-primary">{business.contactEmail}</Text>
              </View>

              <View className="flex-row justify-between py-2">
                <Text className="text-slate-600 font-inter">Business Type</Text>
                <Text className="font-inter-medium text-text-primary">{business.businessType}</Text>
              </View>
            </View>
          )}

          {!loading && error && <Text className="text-red-600">{error}</Text>}
        </View>

        <View className="w-full mt-16 px-6">
          <CustomButton onPress={()=>router.replace('/dashboard')} title='Go to Your Dashboard' />

          {/* <Pressable className="bg-rose-600 rounded-full py-4 items-center">
            <Text className="text-white font-semibold text-base">Go to Your Dashboard</Text>
          </Pressable> */}

          {/* <Text className="text-center text-xs text-slate-400 mt-3">Redirecting you in 5 seconds...</Text> */}
        </View>
      </View>
    </SafeAreaView>
  );
}