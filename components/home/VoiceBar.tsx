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
    t('voice.quick1') || 'Should I irrigate today?',
    t('voice.quick2') || 'Is rain expected tomorrow?',
    t('voice.quick3') || 'What fertilizer should I apply next?',
    t('voice.quick4') || 'How to prevent pest infestation?',
  ];

  return (
    <View style={styles.container}>
      {/* Search & Voice Bar */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onTapMic}
        style={styles.searchBar}
      >
        <View style={styles.leftContent}>
          <Ionicons name="sparkles" size={16} color={Colors.primary.main} />
          <Text style={styles.placeholderText}>
            Ask AgriOptima anything about your farm...
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
            onPress={() => onSelectQuickQuestion(q)}
            style={styles.chip}
          >
            <Text style={styles.chipText}>{q}</Text>
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
    borderRadius: BorderRadius.base,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.xs + 2,
    paddingVertical: Spacing.xs + 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.neutral.border,
    ...Shadows.sm,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  placeholderText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.neutral.textMuted,
    fontWeight: '500',
    flex: 1,
  },
  micButton: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipsContainer: {
    paddingVertical: Spacing.sm,
    gap: Spacing.xs + 2,
  },
  chip: {
    backgroundColor: Colors.neutral.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.neutral.border,
  },
  chipText: {
    fontSize: Typography.fontSizes.xs + 1,
    color: Colors.neutral.textSecondary,
    fontWeight: '600',
  },
});
