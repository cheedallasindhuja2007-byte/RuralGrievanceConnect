import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { Ionicons } from "@expo/vector-icons";
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { auth } from "../../firebase/firebaseConfig";


export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
       
      }}>
      <Tabs.Screen
  name="index"
  options={{
    title: "Home",
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="home" size={size} color={color} />
    ),
  }}
/>

<Tabs.Screen
  name="status"
  options={{
    title: "Status",
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="time" size={size} color={color} />
    ),
  }}
/>

<Tabs.Screen
  name="report"
  options={{
    title: "Report",
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="add-circle" size={size} color={color} />
    ),
  }}
/>

<Tabs.Screen
  name="reports"
  options={{
    title: "Reports",
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="document-text" size={size} color={color} />
    ),
  }}
/>

<Tabs.Screen
  name="profile"
  options={{
    title: "Profile",
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="person" size={size} color={color} />
    ),
  }}
/>
   
  </Tabs>
  
  );
}
