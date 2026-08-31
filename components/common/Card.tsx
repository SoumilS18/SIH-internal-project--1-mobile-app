/**
 * components/common/Card.tsx
 * Reusable Card Container for AgriOptima AI Mobile
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, BorderRadius, Spacing, Shadows } from '@/constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'flat' | 'highlight' | 'dark';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
}) => {
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'flat':
        return {
          backgroundColor: Colors.neutral.surfaceMuted,
          borderWidth: 1,
          borderColor: Colors.neutral.border,
        };
      case 'highlight':
        return {
          backgroundColor: Colors.primary.bg,
          borderWidth: 1.5,
          borderColor: Colors.primary.subtle,
        };
      case 'dark':
        return {
          backgroundColor: Colors.primary.dark,
          borderColor: 'transparent',
        };
      case 'default':
      default:
        return {
          backgroundColor: Colors.neutral.surface,
          borderWidth: 1,
          borderColor: Colors.neutral.border,
          ...Shadows.base,
        };
    }
  };

  return <View style={[styles.card, getVariantStyle(), style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
  },
});
