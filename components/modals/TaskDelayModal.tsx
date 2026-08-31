/**
 * components/modals/TaskDelayModal.tsx
 * Modal for reporting field issues or delaying a task by 1 or 2 days.
 */

import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Spacing, Typography, Shadows } from '@/constants/theme';
import { Button } from '@/components/common/Button';
import { useLanguage } from '@/contexts/LanguageContext';

interface TaskDelayModalProps {
  visible: boolean;
  dayNumber: number;
  taskTitle: string;
  onClose: () => void;
  onSubmitDelay: (days: number, reason: string) => void;
}

export const TaskDelayModal: React.FC<TaskDelayModalProps> = ({
  visible,
  dayNumber,
  taskTitle,
  onClose,
  onSubmitDelay,
}) => {
  const { t } = useLanguage();
  const [delayDays, setDelayDays] = useState<number>(1);
  const [reasonText, setReasonText] = useState<string>('');

  if (!visible) return null;

  const handleSubmit = () => {
    onSubmitDelay(delayDays, reasonText.trim() || 'Task delayed by farmer');
    setReasonText('');
    onClose();
  };

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Ionicons name="time-outline" size={22} color={Colors.status.warning} />
              <Text style={styles.title}>{t('plan.delayModalTitle')}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={Colors.neutral.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={styles.taskTargetText}>
            Day {dayNumber}: {taskTitle}
          </Text>
          <Text style={styles.subtitle}>{t('plan.delayModalSubtitle')}</Text>

          {/* Quick Postpone Selector */}
          <View style={styles.daysSelector}>
            <TouchableOpacity
              style={[
                styles.dayOption,
                delayDays === 1 ? styles.dayOptionSelected : undefined,
              ]}
              onPress={() => setDelayDays(1)}
            >
              <Text
                style={[
                  styles.dayOptionText,
                  delayDays === 1 ? styles.dayOptionTextSelected : undefined,
                ]}
              >
                {t('plan.delay1Day')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.dayOption,
                delayDays === 2 ? styles.dayOptionSelected : undefined,
              ]}
              onPress={() => setDelayDays(2)}
            >
              <Text
                style={[
                  styles.dayOptionText,
                  delayDays === 2 ? styles.dayOptionTextSelected : undefined,
                ]}
              >
                {t('plan.delay2Days')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Reason Input */}
          <Text style={styles.inputLabel}>{t('plan.delayReasonLabel')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('plan.delayReasonPlaceholder')}
            placeholderTextColor={Colors.neutral.textMuted}
            value={reasonText}
            onChangeText={setReasonText}
            multiline
            numberOfLines={3}
          />

          <View style={styles.actions}>
            <Button
              title={t('common.cancel')}
              onPress={onClose}
              variant="subtle"
              size="md"
              style={{ flex: 1 }}
            />
            <Button
              title={t('plan.submitDelay')}
              onPress={handleSubmit}
              variant="primary"
              size="md"
              style={{ flex: 1.5 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 30, 22, 0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.neutral.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xl,
    ...Shadows.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  title: {
    fontSize: Typography.fontSizes.md,
    fontWeight: '700',
    color: Colors.neutral.textPrimary,
  },
  closeBtn: {
    padding: Spacing.xs,
  },
  taskTargetText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: '600',
    color: Colors.primary.dark,
    marginTop: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.neutral.textSecondary,
    marginBottom: Spacing.base,
  },
  daysSelector: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  dayOption: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.neutral.surfaceMuted,
    borderWidth: 1,
    borderColor: Colors.neutral.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayOptionSelected: {
    backgroundColor: Colors.primary.bg,
    borderColor: Colors.primary.main,
    borderWidth: 1.5,
  },
  dayOptionText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: '600',
    color: Colors.neutral.textSecondary,
  },
  dayOptionTextSelected: {
    color: Colors.primary.dark,
  },
  inputLabel: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: '700',
    color: Colors.neutral.textSecondary,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.neutral.surfaceMuted,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.neutral.border,
    padding: Spacing.md,
    fontSize: Typography.fontSizes.sm,
    color: Colors.neutral.textPrimary,
    minHeight: 70,
    textAlignVertical: 'top',
    marginBottom: Spacing.xl,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
});
