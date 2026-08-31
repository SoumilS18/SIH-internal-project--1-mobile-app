/**
 * app/(tabs)/_layout.tsx
 * Mobile Bottom Tab Navigator for AgriOptima AI
 * Warm, elevated, easy-to-tap navigation with distinct active states and Indic support.
 */

import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View, StyleSheet } from 'react-native';
import { Colors, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { useLanguage } from '@/contexts/LanguageContext';

export default function TabLayout() {
  const { t } = useLanguage();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary.dark,
        tabBarInactiveTintColor: Colors.neutral.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.neutral.white,
          borderTopColor: Colors.neutral.borderLight,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 8,
          ...Shadows.md,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('nav.home'),
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrapper, focused ? styles.activeIconWrapper : undefined]}>
              <Ionicons name={focused ? 'today' : 'today-outline'} size={21} color={focused ? Colors.primary.dark : color} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="plan"
        options={{
          title: t('nav.plan'),
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrapper, focused ? styles.activeIconWrapper : undefined]}>
              <Ionicons name={focused ? 'leaf' : 'leaf-outline'} size={21} color={focused ? Colors.primary.dark : color} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="sentinel"
        options={{
          title: t('nav.sentinel'),
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrapper, focused ? styles.activeIconWrapper : undefined]}>
              <Ionicons
                name={focused ? 'shield-checkmark' : 'shield-checkmark-outline'}
                size={21}
                color={focused ? Colors.primary.dark : color}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="assistant"
        options={{
          title: t('nav.assistant'),
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.aiIconWrapper, focused ? styles.aiIconWrapperActive : undefined]}>
              <Ionicons
                name={focused ? 'mic' : 'mic-outline'}
                size={21}
                color={focused ? Colors.neutral.white : Colors.primary.main}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="more"
        options={{
          title: t('nav.more'),
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrapper, focused ? styles.activeIconWrapper : undefined]}>
              <Ionicons name={focused ? 'grid' : 'grid-outline'} size={21} color={focused ? Colors.primary.dark : color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrapper: {
    width: 42,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.full,
  },
  activeIconWrapper: {
    backgroundColor: Colors.primary.subtle,
  },
  aiIconWrapper: {
    width: 38,
    height: 32,
    borderRadius: BorderRadius.base,
    backgroundColor: Colors.primary.subtle,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primary.light + '40',
  },
  aiIconWrapperActive: {
    backgroundColor: Colors.primary.main,
    borderColor: Colors.primary.main,
    ...Shadows.glow,
  },
});

