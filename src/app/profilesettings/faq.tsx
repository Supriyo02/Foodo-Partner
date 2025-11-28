import { FAQ_ITEMS } from '@/src/data/faqData';
import { faqFormSubmit, fetchContactDetails } from '@/src/services/dbCalls';
import { FaqContactDetails } from '@/types';
import { Entypo, Feather, FontAwesome5, FontAwesome6, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, {useEffect, useState, useCallback, useMemo} from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { ScrollView, View, Text, Pressable, ActivityIndicator, LayoutAnimation, UIManager, Platform, Linking, TextInput, Keyboard, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { faqSchema as schema } from '@/src/lib/validations/profile.schema';
import { yupResolver } from '@hookform/resolvers/yup';
import FormTextInput from '@/src/components/CustomTextInput';
import CustomButton from '@/src/components/CustomButton';
import FormDropdown from '@/src/components/CustomDropdown';

export default function ContactSupportScreen() {
  const [contact, setContact] = useState<FaqContactDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [query, setQuery] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');

  const [formLoading, setFormLoading] = useState(false);
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      topic: '',
      subject: '',
      description: '',
    },
  });

  const { handleSubmit, control, setValue, getValues, reset } = methods;

  const onSubmit = async (data: any) => {
    setFormLoading(true);
    try {
      await faqFormSubmit(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      Alert.alert("Error", errorMessage)
    }
    finally {
      setFormLoading(false);
      Alert.alert('Saved', 'Query submitted successfully');
    }
  };

  useEffect(() => {
    // enable LayoutAnimation on Android
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      // @ts-ignore
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchContactDetails();
        if (mounted) setContact(data);
      } catch (err) {
        console.warn('Failed to load contact details', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 250);
    return () => clearTimeout(t);
  }, [query]);

  const filteredFaq = useMemo(() => {
    if (!debouncedQuery) return FAQ_ITEMS;
    const q = debouncedQuery.toLowerCase();
    return FAQ_ITEMS.filter(item => item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q));
  }, [debouncedQuery]);

  const toggle = useCallback(
    (id: string) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setExpandedId(prev => (prev === id ? null : id));
    },
    [setExpandedId],
  );

  const openMail = useCallback(async (email: string) => {
    const url = `mailto:${email}`;
    try {
      await Linking.openURL(url);
    } catch (e) {
      console.warn('Could not open mail client', e);
    }
  }, []);

  const openPhone = useCallback(async (phone: string) => {
    const url = `tel:${phone.replace(/[^+0-9]/g, '')}`;
    try {
      await Linking.openURL(url);
    } catch (e) {
      console.warn('Could not open phone dialer', e);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    Keyboard.dismiss();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-bg-primary">
        <View className="px-4 pt-1 pb-2 border-b border-gray-200 bg-bg-primary flex-row gap-5 relative">
            <TouchableOpacity onPress={() => router.back()}>
                <MaterialIcons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <Text className="text-xl font-inter-semibold text-gray-900">
                Help & Support
            </Text>
        </View>
      <ScrollView className='bg-bg-primary' contentContainerStyle={{paddingBottom: 32}} keyboardShouldPersistTaps="handled">
        <View className="px-4 py-2">
          <View className="bg-gray-100 rounded-xl px-3 py-3 flex-row items-center shadow-sm border border-gray-200">
            <FontAwesome6 name="magnifying-glass" size={16} color="gray" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              style={{color: 'black', marginLeft: 10, padding: 0, flex: 1 }}
              placeholder="Search help articles..."
              placeholderTextColor="#6B7280"
            //   className="ml-3 flex-1 text-gray-800 p-0"
              returnKeyType="search"
              accessible
              accessibilityLabel="Search help articles"
            />
            {query.length > 0 ? (
              <Pressable onPress={clearSearch} className="pl-3">
                <Entypo name="cross" size={16} color="gray" />
              </Pressable>
            ) : null}
          </View>
          {debouncedQuery.length > 0 && (
            <Text className="text-sm font-inter text-text-secondary mt-2">Showing results for "{debouncedQuery}"</Text>
          )}
        </View>

        <View className="px-4 pt-4">
          <Text className="text-lg font-inter-bold text-text-primary mb-3">Frequently Asked Questions</Text>

          {filteredFaq.length === 0 ? (
            <View className="bg-bg-primary rounded-xl px-4 py-6 shadow-sm">
              <Text className="text-text-secondary font-inter">No articles match your search. Try different keywords.</Text>
            </View>
          ) : (
            filteredFaq.map(item => (
              <View key={item.id} className="mb-2 border-b border-gray-300 px-2">
                <Pressable
                  onPress={() => toggle(item.id)}
                  className="bg-white rounded-xl py-4 flex-row justify-between items-start"
                  android_ripple={{color: 'rgba(0,0,0,0.05)'}}
                >
                  <View className="flex-1">
                    <Text className="text-text-primary font-inter-medium">{item.q}</Text>
                    {expandedId === item.id ? (
                      <Text className="mt-2 font-inter text-gray-700">{item.a}</Text>
                    ) : null}
                  </View>
                  <View className="mr-1 text-gray-400">{expandedId === item.id 
                    ? <Feather name="chevron-up" size={16} color="black" />
                    : <Feather name="chevron-down" size={16} color="black" />}
                  </View>
                </Pressable>
              </View>
            ))
          )}
        </View>

        <FormProvider {...methods}>
            <View className="bg-bg-primary rounded-2xl p-4 mt-4">
                <Text className="text-lg font-inter-bold text-text-primary">Contact Our Support Team</Text>
                <Text className="text-gray-500 mb-4 font-inter text-sm">Our team typically responds within 24 hours. For urgent issues, please call us.</Text>

                <FormDropdown control={control} name="topic" label="Topic" placeholder='Select Topic' options={['Account Management', 'Order Related', 'Payment Issue']} />
                <FormTextInput control={control} name="subject" label="Subject" placeholder="e.g., Issue with order #25342"/>
                <FormTextInput control={control} name="description" label="Your Query" placeholder="Please describe your issue in detail..." multiline={true} inputHeight={108} maxLength={500}/>

                <View className='mt-4 w-full'>
                    <CustomButton style='p-3.5 w-11/12' onPress={handleSubmit(onSubmit)} title='Submit' isLoading={formLoading} />
                </View>
                
            </View>
        </FormProvider>

        <View className="px-4 mt-6">
          <Text className="text-lg font-inter-bold text-text-primary">Other Ways to Reach Us</Text>

          <View className="space-y-3">  

            <View className="flex-row justify-between">
              {loading ? (
                <View className="flex-row items-center">
                  <ActivityIndicator />
                  <Text className="ml-2 text-gray-500">Loading contact details...</Text>
                </View>
              ) : contact ? (
                <View style={{flex: 1}}>
                  <TouchableOpacity
                    onPress={() => openMail(contact.email)}
                    className="bg-gray-100 rounded-xl px-4 py-3 mb-3 shadow-sm flex-row items-center gap-2"
                  >
                    <View className="w-11 h-11 rounded-full items-center justify-center bg-[#ffcccf] mr-3">
                        <Feather name="mail" size={18} color="#ef4444" />
                    </View>
                    <View style={{flex: 1}}>
                      <Text className="font-inter-semibold text-lg text-text-primary">Email Support</Text>
                      <Text className="text-gray-500 font-inter-semibold text-md">{contact.email}</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => openPhone(contact.phone)}
                    className="bg-gray-100 rounded-xl px-4 py-3 shadow-sm flex-row items-center gap-2"
                  >
                    <View className="w-11 h-11 rounded-full items-center justify-center bg-[#ffcccf] mr-3">
                        <Feather name="phone" size={18} color="#ef4444" />
                    </View>
                    <View style={{flex: 1}}>
                      <Text className="font-inter-semibold text-lg text-text-primary">Phone Support</Text>
                      <Text className="text-gray-500 font-inter-semibold text-md">{contact.phone}</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              ) : (
                <Text className="text-sm text-gray-500">Contact information not available.</Text>
              )}
            </View>
          </View>
        </View>

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}
