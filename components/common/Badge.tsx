/**
 * components/common/Badge.tsx
 * Reusable Organic Status & Category Badge for AgriOptima AI Mobile
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors, BorderRadius, Spacing, Typography } from '@/constants/theme';

interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'neutral' | 'accent' | 'terracotta';
  size?: 'sm' | 'md';
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  size = 'md',
  style,
  textStyle,
  icon,
}) => {
  const getStyles = (): { bg: string; text: string; border: string } => {
    switch (variant) {
      case 'success':
        return {
          bg: Colors.status.successBg,
          text: Colors.status.success,
          border: Colors.status.successBorder,
        };
      case 'warning':
        return {
          bg: Colors.status.warningBg,
          text: Colors.status.warning,
          border: Colors.status.warningBorder,
        };
      case 'danger':
        return {
          bg: Colors.status.dangerBg,
          text: Colors.status.danger,
          border: Colors.status.dangerBorder,
        };
      case 'info':
        return {
          bg: Colors.status.infoBg,
          text: Colors.status.info,
          border: Colors.status.infoBorder,
        };
      case 'accent':
        return {
          bg: Colors.accent.ochreBg,
          text: Colors.accent.ochre,
          border: Colors.accent.ochreBorder,
        };
      case 'terracotta':
        return {
          bg: Colors.accent.terracottaBg,
          text: Colors.accent.terracotta,
          border: Colors.accent.terracottaBorder,
        };
      case 'neutral':
        return {
          bg: Colors.neutral.surfaceMuted,
          text: Colors.neutral.textSecondary,
          border: Colors.neutral.border,
        };
      case 'primary':
      default:
        return {
          bg: Colors.primary.subtle,
          text: Colors.primary.dark,
          border: Colors.primary.light + '40',
        };
    }
  };

  const colors = getStyles();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
          borderWidth: 1,
          paddingVertical: size === 'sm' ? 2 : Spacing.xs,
          paddingHorizontal: size === 'sm' ? Spacing.sm : Spacing.md,
        },
        style,
      ]}
    >
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text
        style={[
          styles.text,
          {
            color: colors.text,
            fontSize: size === 'sm' ? Typography.fontSizes.xs : Typography.fontSizes.sm - 1,
          },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: BorderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
