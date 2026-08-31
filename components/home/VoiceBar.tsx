/**
 * components/home/VoiceBar.tsx
 * Ask AgriOptima Voice Bar for Mobile Home Screen
 * Inviting, easy-to-tap farm assistant entry point with voice mic and contextual quick questions.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { useLanguage } from '@/contexts/LanguageContext';

interface VoiceBarProps {
  onTapMic: () => void;
  onSelectQuickQuestion: (question: string) => void;
}

export const VoiceBar: React.FC<VoiceBarProps> = ({
  onTapMic,
  onSelectQuickQuestion,
}) => {
  const { t } = useLanguage();

  const quickQuestions = [
    { icon: 'water-outline', text: t('voice.quick1') || 'Should I irrigate today?' },
    { icon: 'cloud-outline', text: t('voice.quick2') || 'Is rain expected tomorrow?' },
    { icon: 'flask-outline', text: t('voice.quick3') || 'What fertilizer should I apply next?' },
    { icon: 'shield-checkmark-outline', text: t('voice.quick4') || 'How to prevent pest infestation?' },
  ];

  return (
    <View style={styles.container}>
      {/* Search & Voice Bar */}
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={onTapMic}
        style={styles.searchBar}
      >
        <View style={styles.leftContent}>
          <View style={styles.sparkleIconWrapper}>
            <Ionicons name="sparkles" size={15} color={Colors.primary.main} />
          </View>
          <Text style={styles.placeholderText}>
            Ask AgriOptima anything in Hindi or English...
          </Text>
        </View>

        <View style={styles.micButton}>
          <Ionicons name="mic" size={18} color={Colors.neutral.white} />
        </View>
      </TouchableOpacity>

      {/* Quick Inquiry Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContainer}
      >
        {quickQuestions.map((q, idx) => (
          <TouchableOpacity
            key={idx}
            activeOpacity={0.75}
            onPress={() => onSelectQuickQuestion(q.text)}
            style={styles.chip}
          >
            <Ionicons name={q.icon as any} size={12} color={Colors.primary.main} />
            <Text style={styles.chipText}>{q.text}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.xs,
  },
  searchBar: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.lg,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.xs + 3,
    paddingVertical: Spacing.xs + 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: Colors.primary.subtle,
    ...Shadows.base,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  sparkleIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.neutral.textSecondary,
    fontWeight: '600',
    flex: 1,
  },
  micButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.base,
    backgroundColor: Colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.glow,
  },
  chipsContainer: {
    paddingVertical: Spacing.sm,
    gap: Spacing.xs + 3,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.neutral.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.neutral.border,
    ...Shadows.sm,
  },
  chipText: {
    fontSize: Typography.fontSizes.xs + 1,
    color: Colors.neutral.textPrimary,
    fontWeight: '700',
  },
});

