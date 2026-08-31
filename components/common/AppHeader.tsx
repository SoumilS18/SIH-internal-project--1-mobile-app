/**
 * components/common/AppHeader.tsx
 * Top Application Header with seamless warm background blend, language switcher pill, and location context.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
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
            <Ionicons name="arrow-back" size={20} color={Colors.primary.dark} />
          </TouchableOpacity>
        ) : (
          <View style={styles.brandIconCircle}>
            <Ionicons name="leaf" size={16} color={Colors.primary.main} />
          </View>
        )}

        <View style={styles.titleContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            {!showBack && (
              <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>AI LIVE</Text>
              </View>
            )}
          </View>
          {subtitle ? (
            <View style={styles.subtitleRow}>
              <Ionicons name="location-sharp" size={11} color={Colors.accent.terracotta} />
              <Text style={styles.subtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            </View>
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
              <Ionicons name="globe-outline" size={13} color={Colors.primary.main} />
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
    paddingBottom: Spacing.sm + 2,
    paddingHorizontal: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.borderLight,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 46,
    gap: Spacing.sm,
  },
  brandIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primary.subtle,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primary.subtle,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neutral.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: '800',
    color: Colors.primary.dark,
    letterSpacing: -0.3,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.status.successBg,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.status.successBorder,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.status.success,
  },
  liveText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.status.success,
    letterSpacing: 0.3,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 1,
  },
  subtitle: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.neutral.textSecondary,
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
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.neutral.border,
    gap: 5,
    ...Shadows.sm,
  },
  langText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: '700',
    color: Colors.primary.dark,
  },
});

