import { Tabs } from 'expo-router';
import React from 'react';

import { CustomTabBar } from '../src/presentation/components/CustomTabBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="categories" />
      <Tabs.Screen name="cart" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen 
        name="[...vtexPath]" 
        options={{ 
          href: null,
          headerShown: false 
        }} 
      />
      <Tabs.Screen 
        name="explore" 
        options={{ 
          href: null,
        }} 
      />
    </Tabs>
  );
}
