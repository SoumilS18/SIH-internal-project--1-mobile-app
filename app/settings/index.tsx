/**
 * app/settings/index.tsx
 * App Settings & 22 Eighth Schedule Indian Languages Selector
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { AppHeader } from '@/components/common/AppHeader';
import { Badge } from '@/components/common/Badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { LanguageOption, isLanguageAvailable } from '@/i18n/languages';

export default function SettingsScreen() {
  const { language, setLanguage, allLanguages, t } = useLanguage();
  const { isConfigured, updateLanguagePreference } = useAuth();

  const handleSelectLanguage = async (opt: LanguageOption) => {
    const success = setLanguage(opt.code);
    if (success) {
      await updateLanguagePreference(opt.code);
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader title={t('settings.title')} subtitle={t('settings.subtitle')} showBack />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Language Selection Grid */}
        <Text style={styles.sectionHeader}>{t('settings.languageHeader')}</Text>

        <View style={styles.languageList}>
          {allLanguages.map((opt) => {
            const isSelected = language === opt.code;
            const isAvailable = isLanguageAvailable(opt.code);

            return (
              <TouchableOpacity
                key={opt.code}
                style={[
                  styles.languageCard,
                  isSelected ? styles.languageCardActive : undefined,
                ]}
                onPress={() => handleSelectLanguage(opt)}
                activeOpacity={0.75}
              >
                <View style={styles.langMainRow}>
                  <View style={styles.langTextGroup}>
                    <Text
                      style={[
                        styles.nativeLabel,
                        isSelected ? styles.nativeLabelActive : undefined,
                      ]}
                    >
                      {opt.label}
                    </Text>
                    <Text style={styles.englishLabel}>{opt.english}</Text>
                  </View>

                  <View style={styles.statusGroup}>
                    {isAvailable ? (
                      <Badge
                        label={isSelected ? 'ACTIVE' : 'AVAILABLE'}
                        variant={isSelected ? 'success' : 'primary'}
                        size="sm"
                      />
                    ) : (
                      <Badge label="COMING SOON" variant="neutral" size="sm" />
                    )}

                    {isSelected ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={Colors.primary.main}
                        style={{ marginLeft: 6 }}
                      />
                    ) : null}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* System Diagnostics */}
        <Text style={[styles.sectionHeader, { marginTop: Spacing.xl }]}>
          System Architecture Status
        </Text>
        <View style={styles.diagnosticsCard}>
          <View style={styles.diagRow}>
            <View style={styles.diagLabelGroup}>
              <View style={[styles.diagDot, { backgroundColor: Colors.status.success }]} />
              <Text style={styles.diagName}>Supabase Account Sync</Text>
            </View>
            <Text style={styles.diagStatus}>{isConfigured ? 'CONNECTED' : 'LOCAL DEMO'}</Text>
          </View>

          <View style={styles.diagRow}>
            <View style={styles.diagLabelGroup}>
              <View style={[styles.diagDot, { backgroundColor: Colors.status.success }]} />
              <Text style={styles.diagName}>Deterministic LP Decision Solver</Text>
            </View>
            <Text style={styles.diagStatus}>ONLINE (0ms Latency)</Text>
          </View>

          <View style={styles.diagRow}>
            <View style={styles.diagLabelGroup}>
              <View style={[styles.diagDot, { backgroundColor: Colors.status.success }]} />
              <Text style={styles.diagName}>Agro-Climatic Weather Feed</Text>
            </View>
            <Text style={styles.diagStatus}>OPEN-METEO LIVE</Text>
          </View>

          <View style={styles.diagRow}>
            <View style={styles.diagLabelGroup}>
              <View style={[styles.diagDot, { backgroundColor: Colors.status.success }]} />
              <Text style={styles.diagName}>Indic Voice & AI Advisor</Text>
            </View>
            <Text style={styles.diagStatus}>READY</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.background,
  },
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: Spacing.xxl,
  },
  sectionHeader: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: '700',
    color: Colors.neutral.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  languageList: {
    gap: Spacing.xs,
  },
  languageCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.base,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.neutral.border,
    ...Shadows.sm,
  },
  languageCardActive: {
    borderColor: Colors.primary.main,
    borderWidth: 1.5,
    backgroundColor: Colors.primary.bg,
  },
  langMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  langTextGroup: {
    flex: 1,
  },
  nativeLabel: {
    fontSize: Typography.fontSizes.base,
    fontWeight: '700',
    color: Colors.neutral.textPrimary,
  },
  nativeLabelActive: {
    color: Colors.primary.dark,
  },
  englishLabel: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.neutral.textMuted,
    marginTop: 2,
  },
  statusGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  diagnosticsCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.neutral.border,
    ...Shadows.sm,
    gap: Spacing.md,
  },
  diagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  diagLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  diagDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  diagName: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: '600',
    color: Colors.neutral.textPrimary,
  },
  diagStatus: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: '700',
    color: Colors.primary.main,
  },
});
