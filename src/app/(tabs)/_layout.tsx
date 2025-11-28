import { images } from '@/src/lib/constants';
// import useAuthStore from '@/stores/auth.store';
import { Redirect, Slot, Tabs } from 'expo-router';
import React from 'react';
import { Image, View, Text, ImageSourcePropType } from 'react-native';
import cn from 'clsx'

const TabBarIcon = ({focused, icon, title}: TabBarIconProps) => (
    <View className='flex min-w-20 items-center justify-center min-h-full gap-1 mt-8'>
        <Image source={icon} className='size-6' resizeMode='contain' tintColor={focused? '#f50000' : '#5D5F6D'} />
        <Text className={cn('text-xs font-inter-bold', focused?'text-primary': 'text-text-secondary')}>
            {title}
        </Text>
    </View>
)

interface TabBarIconProps {
    focused: boolean;
    icon: ImageSourcePropType;
    title: string;
}

export default function TabLayout() {
    // const {isAuthenticated} = useAuthStore();
    const isAuthenticated = true;
    if(!isAuthenticated) return <Redirect href='/log-in' />

    return (
        <Tabs
        initialRouteName='dashboard'
        screenOptions={{
            headerShown: false,
            tabBarShowLabel: false,
            tabBarStyle: {
                // borderTopLeftRadius: 50,
                // borderTopRightRadius: 50,
                // borderBottomLeftRadius: 50,
                // borderBottomRightRadius: 50,
                // marginHorizontal: 20,
                paddingBottom: 10,
                height: 80,
                position: 'absolute',
                // bottom: 20,
                backgroundColor: 'white',
                shadowColor: '#1a1a1a',
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 5
            }
        }}
        >
            <Tabs.Screen
            name='dashboard'
            options={{
                title: 'Dashboard',
                tabBarIcon: ({focused}) => <TabBarIcon title='Dashboard' icon={images.dashboard} focused={focused} />
            }}
            />
            <Tabs.Screen
            name='menu'
            options={{
                title: 'Menu',
                tabBarIcon: ({focused}) => <TabBarIcon title='Menu' icon={images.menu} focused={focused} />
            }}
            />
            <Tabs.Screen
            name='orders'
            options={{
                title: 'Orders',
                tabBarIcon: ({focused}) => <TabBarIcon title='Orders' icon={images.orders} focused={focused} />
            }}
            />
            <Tabs.Screen
            name='inbox'
            options={{
                title: 'Inbox',
                tabBarIcon: ({focused}) => <TabBarIcon title='Inbox' icon={images.inbox} focused={focused} />
            }}
            />
            <Tabs.Screen
            name='profile'
            options={{
                title: 'Profile',
                tabBarIcon: ({focused}) => <TabBarIcon title='Profile' icon={images.person} focused={focused} />
            }}
            />
        </Tabs>
    )
}