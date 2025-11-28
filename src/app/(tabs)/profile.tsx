import React, {useCallback, useEffect, useState, memo} from 'react';
import {View, Text, Image, ImageBackground, Pressable, Switch, Alert, ScrollView, TouchableOpacity} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';
import {Ionicons} from '@expo/vector-icons';
import {FontAwesome5} from '@expo/vector-icons';
import {Entypo} from '@expo/vector-icons';
import {Feather} from '@expo/vector-icons';
import {AntDesign} from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchProfile, fetchSettings, logoutUser, saveSettings } from '@/src/services/dbCalls';
import { router } from 'expo-router';
import { images } from "@/src/lib/constants";
import { StyleSheet } from "react-native";
import CustomButton from '@/src/components/CustomButton';

const SectionHeader: React.FC<{title: string}> = memo(({title}) => (
  <Text className="text-sm text-gray-400 font-inter-semibold px-4 mt-6 mb-2">{title.toUpperCase()}</Text>
));

const ListItem: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  right?: React.ReactNode;
}> = ({icon, title, subtitle, onPress, right}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between px-4 py-3"
    >
      <View className="flex-row items-center">
        <View className="w-11 h-11 rounded-full items-center justify-center bg-[#ffe5e7] mr-3">{icon}</View>
        <View>
          <Text className="text-sm font-inter-medium">{title}</Text>
          {subtitle ? <Text className="text-xs font-inter text-text-secondary">{subtitle}</Text> : null}
        </View>
      </View>
      <View className="flex-row items-center">{right ?? <AntDesign name="right" size={16} color="#cbd5e1" />}</View>
    </TouchableOpacity>
  );
};


export default function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [settings, setSettings] = useState<{notificationsEnabled: boolean; language: string} | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const p = await fetchProfile();
      const s = await fetchSettings();
      if (mounted) {
        setProfile(p);
        setSettings(s);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const onToggleNotifications = useCallback(async (value: boolean) => {
    setSettings(prev => (prev ? {...prev, notificationsEnabled: value} : prev));
    // quick save optimistic
    setSaving(true);
    await saveSettings({notificationsEnabled: value});
    setSaving(false);
  }, []);

  const handleLogout = useCallback(async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logoutUser();
          // navigate to login or reset stack
          router.push('/')
        },
      },
    ]);
  }, []);

  if (!profile || !settings) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-400 font-inter">Loading…</Text>
      </View>
    );
  }

  return (
    <ScrollView>
      <ImageBackground source={images.kitchen_cover} className="h-52 w-full">
        <View style={StyleSheet.absoluteFillObject} className="bg-black/20" />
      </ImageBackground>

      <SafeAreaView className="flex-1 bg-slate-100">
      <View className="-mt-12 px-4">
        <View className="bg-white rounded-b-2xl p-5 shadow-md">
          <View className="items-center">
            <View className="w-32 h-32 rounded-full overflow-hidden border-2 border-white -mt-20 shadow-sm bg-gray-100 items-center justify-center">
              <Image source={{uri: profile.avatar}} className="w-32 h-32" />
            </View>
            <Text className="text-xl font-inter-bold mt-3">{profile.businessName}</Text>
            <Text className="text-sm font-inter-semibold text-text-secondary mt-1">{profile.tagline}</Text>
            <Text className="text-sm font-inter text-text-primary mt-1 text-center">{profile.address}</Text>
            <Text className="text-sm font-inter text-text-primary">{profile.email}</Text>
            
            <View className='mt-4 w-full'>
              <CustomButton title='Edit Profile' style='p-2 w-11/12' />
            </View>

          </View>
        </View>

        <SectionHeader title="Business Management" />
        <View className='rounded-2xl overflow-hidden bg-white'>
          <ListItem
            icon={<FontAwesome5 name="store" size={20} color="#ef4444" />}
            title="Edit Business Details"
            // onPress={() => router.push('/')}
          />
          <View className="h-px bg-gray-200 mx-2" />
          <ListItem
            icon={<Feather name="layers" size={20} color="#f97316" />}
            title="Menu & Dish Preferences"
            onPress={() => router.push('/menu')}
          />
          <View className="h-px bg-gray-200 mx-2" />
          <ListItem
            icon={<Ionicons name="cash" size={20} color="#00d170" />}
            title="Payout Configuration"
            // onPress={() => router.push('/')}
          />
          <View className="h-px bg-gray-200 mx-2" />
          <ListItem
            icon={<MaterialIcons name="delivery-dining" size={20} color="#f97316" />}
            title="Delivery Time & Location"
            onPress={() => router.push('/profilesettings/delivery-time-location')}
          />
        </View>

        <SectionHeader title="App Settings" />
        <View className='rounded-2xl overflow-hidden bg-white'>
          <ListItem
            icon={<MaterialIcons name="notifications" size={20} color="#ef4444" />}
            title="Notifications"
            right={
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={onToggleNotifications}
              />
            }
          />
          <View className="h-px bg-gray-200 mx-2" />
          <ListItem
            icon={<Entypo name="language" size={20} color="#f59e0b" />}
            title="Language"
            subtitle={settings.language}
            // onPress={() => router.push('/')}
          />
          <View className="h-px bg-gray-200 mx-2" />
          <ListItem
            icon={<Ionicons name="help-circle" size={20} color="#6b7280" />}
            title="Help & Support"
            onPress={() => router.push('/profilesettings/faq')}
          />
          <View className="h-px bg-gray-200 mx-2" />
          <ListItem
            icon={<Feather name="file-text" size={20} color="#6b7280" />}
            title="Terms & Conditions"
            onPress={() => router.push('/terms-conditions')}
          />
          <View className="h-px bg-gray-200 mx-2" />
          <ListItem
            icon={<Feather name="file-text" size={20} color="#6b7280" />}
            title="Privacy Policy"
            onPress={() => router.push('/privacy-policy')}
          />
        </View>

        <SectionHeader title="Account" />
        <View className='rounded-2xl overflow-hidden bg-white' >
          <ListItem
            icon={<AntDesign name="user" size={20} color="#ef4444" />}
            title="Manage Account"
            // onPress={() => router.push('/')}
          />
        </View>

        <Pressable onPress={handleLogout} className=" my-4 bg-white rounded-2xl">
          <View className="flex-row items-center px-4 py-4 rounded-lg">
            <View className="w-10 h-10 rounded-md items-center justify-center bg-gray-50 mr-3">
              <MaterialIcons name="logout" size={20} color="#ef4444" />
            </View>
            <Text className="text-sm font-inter-medium text-primary">Logout</Text>
          </View>
        </Pressable>

        <View className="h-20" />

      </View>
      </SafeAreaView>
    </ScrollView>
  );
}