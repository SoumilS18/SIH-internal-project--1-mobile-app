/**
 * components/common/AppHeader.tsx
 * Top Application Header with seamless warm background blend, language switcher pill, and location context.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { useLanguage } from '@/contexts/LanguageContext';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  showLanguageSelector?: boolean;
  rightAction?: React.ReactNode;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title = 'AgriOptima AI',
  subtitle,
  showBack = false,
  showLanguageSelector = true,
  rightAction,
}) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { languageOption } = useLanguage();

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 14) + Spacing.xs }]}>
      <View style={styles.content}>
        {showBack ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color={Colors.primary.dark} />
          </TouchableOpacity>
        ) : null}

        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        <View style={styles.rightContainer}>
          {rightAction ? (
            rightAction
          ) : showLanguageSelector ? (
            <TouchableOpacity
              style={styles.langPill}
              onPress={() => router.push('/settings')}
              activeOpacity={0.75}
            >
              <Ionicons name="globe-outline" size={14} color={Colors.primary.main} />
              <Text style={styles.langText}>{languageOption.label}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.neutral.background,
    paddingBottom: Spacing.sm,
    paddingHorizontal: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.borderLight,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  backButton: {
    marginRight: Spacing.sm,
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neutral.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: '800',
    color: Colors.primary.dark,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.neutral.textSecondary,
    marginTop: 1,
    fontWeight: '500',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral.white,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs + 1,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.neutral.border,
    gap: 4,
  },
  langText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: '600',
    color: Colors.neutral.textPrimary,
  },
});
