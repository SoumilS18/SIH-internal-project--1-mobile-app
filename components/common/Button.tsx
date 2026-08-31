/**
 * components/common/Button.tsx
 * Reusable Mobile Button Component with tactile touch feedback and accessibility.
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, BorderRadius, Spacing, Typography } from '@/constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'terracotta' | 'danger' | 'subtle';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
}) => {
  const getContainerStyle = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: disabled ? Colors.neutral.border : Colors.primary.main,
          borderColor: 'transparent',
        };
      case 'secondary':
        return {
          backgroundColor: disabled ? Colors.neutral.surfaceMuted : Colors.primary.subtle,
          borderColor: 'transparent',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: disabled ? Colors.neutral.border : Colors.primary.main,
          borderWidth: 1.5,
        };
      case 'terracotta':
        return {
          backgroundColor: disabled ? Colors.neutral.border : Colors.accent.terracotta,
          borderColor: 'transparent',
        };
      case 'danger':
        return {
          backgroundColor: disabled ? Colors.neutral.border : Colors.status.danger,
          borderColor: 'transparent',
        };
      case 'subtle':
      default:
        return {
          backgroundColor: disabled ? Colors.neutral.surfaceMuted : Colors.neutral.surfaceMuted,
          borderColor: Colors.neutral.border,
          borderWidth: 1,
        };
    }
  };

  const getTextStyle = (): TextStyle => {
    switch (variant) {
      case 'primary':
      case 'terracotta':
      case 'danger':
        return {
          color: disabled ? Colors.neutral.textMuted : Colors.neutral.white,
        };
      case 'secondary':
        return {
          color: disabled ? Colors.neutral.textMuted : Colors.primary.dark,
        };
      case 'outline':
        return {
          color: disabled ? Colors.neutral.textMuted : Colors.primary.main,
        };
      case 'subtle':
      default:
        return {
          color: disabled ? Colors.neutral.textMuted : Colors.neutral.textPrimary,
        };
    }
  };

  const getSizeStyle = (): { container: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'sm':
        return {
          container: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, minHeight: 40 },
          text: { fontSize: Typography.fontSizes.sm },
        };
      case 'lg':
        return {
          container: { paddingVertical: Spacing.base, paddingHorizontal: Spacing.xl, minHeight: 54 },
          text: { fontSize: Typography.fontSizes.md, fontWeight: '700' },
        };
      case 'md':
      default:
        return {
          container: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg, minHeight: 48 },
          text: { fontSize: Typography.fontSizes.base, fontWeight: '600' },
        };
    }
  };

  const sizeStyles = getSizeStyle();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.base,
        getContainerStyle(),
        sizeStyles.container,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' ? Colors.primary.main : Colors.neutral.white}
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text
            style={[
              styles.text,
              getTextStyle(),
              sizeStyles.text,
              icon ? { marginLeft: Spacing.sm } : undefined,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
});
