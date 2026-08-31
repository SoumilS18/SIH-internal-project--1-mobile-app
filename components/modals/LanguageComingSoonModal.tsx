/**
 * components/modals/LanguageComingSoonModal.tsx
 * Modal informing the user that 20 of the 22 Eighth Schedule languages are coming soon,
 * preserving current language selection without UI crashes.
 */

import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Spacing, Typography, Shadows } from '@/constants/theme';
import { Button } from '@/components/common/Button';
import { useLanguage } from '@/contexts/LanguageContext';

export const LanguageComingSoonModal: React.FC = () => {
  const { isComingSoonModalOpen, pendingLanguage, closeComingSoonModal, t } = useLanguage();

  if (!isComingSoonModalOpen || !pendingLanguage) return null;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={isComingSoonModalOpen}
      onRequestClose={closeComingSoonModal}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <View style={styles.iconCircle}>
            <Ionicons name="sparkles" size={28} color={Colors.accent.ochre} />
          </View>

          <Text style={styles.title}>{t('settings.comingSoonModalTitle')}</Text>

          <Text style={styles.languagePillText}>
            {pendingLanguage.label} ({pendingLanguage.english})
          </Text>

          <Text style={styles.description}>
            {t('settings.comingSoonModalText', { language: `${pendingLanguage.label} (${pendingLanguage.english})` })}
          </Text>

          <Button
            title={t('settings.gotItButton')}
            onPress={closeComingSoonModal}
            variant="primary"
            size="md"
            style={styles.actionBtn}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 30, 22, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  dialog: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    ...Shadows.lg,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: '700',
    color: Colors.neutral.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  languagePillText: {
    fontSize: Typography.fontSizes.base,
    fontWeight: '700',
    color: Colors.primary.dark,
    backgroundColor: Colors.primary.subtle,
    paddingVertical: 4,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    marginVertical: Spacing.sm,
  },
  description: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.neutral.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  actionBtn: {
    width: '100%',
  },
});
