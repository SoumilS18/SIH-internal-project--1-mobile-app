/**
 * app/(auth)/signup.tsx
 * Real Supabase Farmer Sign Up
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { Button } from '@/components/common/Button';
import { AppHeader } from '@/components/common/AppHeader';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function SignupScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const { t, language } = useLanguage();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignUp = async () => {
    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !password) {
      setError(t('auth.invalidCredentials'));
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setError(null);
    setLoading(true);

    const result = await signUp(email.trim(), password, fullName.trim(), language);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      router.replace('/(onboarding)/location');
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader title="AgriOptima AI" subtitle={t('brand.taglineShort')} showBack />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.titleSection}>
            <View style={styles.iconCircle}>
              <Ionicons name="person-add-outline" size={28} color={Colors.primary.main} />
            </View>
            <Text style={styles.welcomeTitle}>{t('auth.signupTitle')}</Text>
            <Text style={styles.welcomeSubtitle}>{t('auth.signupSubtitle')}</Text>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={20} color={Colors.status.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.formCard}>
            <Text style={styles.inputLabel}>{t('auth.fullNameLabel')}</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color={Colors.neutral.textMuted} />
              <TextInput
                style={styles.textInput}
                placeholder={t('auth.fullNamePlaceholder')}
                placeholderTextColor={Colors.neutral.textMuted}
                value={fullName}
                onChangeText={setFullName}
                autoCorrect={false}
              />
            </View>

            <Text style={[styles.inputLabel, { marginTop: Spacing.base }]}>
              {t('auth.emailLabel')}
            </Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color={Colors.neutral.textMuted} />
              <TextInput
                style={styles.textInput}
                placeholder={t('auth.emailPlaceholder')}
                placeholderTextColor={Colors.neutral.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <Text style={[styles.inputLabel, { marginTop: Spacing.base }]}>
              {t('auth.passwordLabel')}
            </Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={Colors.neutral.textMuted} />
              <TextInput
                style={styles.textInput}
                placeholder={t('auth.passwordPlaceholder')}
                placeholderTextColor={Colors.neutral.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={Colors.neutral.textMuted}
                />
              </TouchableOpacity>
            </View>

            <Button
              title={loading ? t('auth.creatingAccount') : t('auth.signUpButton')}
              onPress={handleSignUp}
              loading={loading}
              variant="primary"
              size="lg"
              style={styles.submitBtn}
            />

            <TouchableOpacity
              style={styles.switchAuthLink}
              onPress={() => router.replace('/(auth)/login')}
              activeOpacity={0.7}
            >
              <Text style={styles.switchAuthText}>{t('auth.alreadyHaveAccount')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  titleSection: {
    alignItems: 'center',
    marginVertical: Spacing.base,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.primary.subtle,
  },
  welcomeTitle: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: '700',
    color: Colors.neutral.textPrimary,
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.neutral.textSecondary,
    textAlign: 'center',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.status.dangerBg,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.status.dangerBorder,
    marginBottom: Spacing.base,
    gap: Spacing.xs,
  },
  errorText: {
    flex: 1,
    fontSize: Typography.fontSizes.xs,
    color: Colors.status.danger,
    lineHeight: 18,
  },
  formCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.neutral.border,
    ...Shadows.base,
  },
  inputLabel: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: '700',
    color: Colors.neutral.textSecondary,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral.surfaceMuted,
    borderRadius: BorderRadius.base,
    borderWidth: 1,
    borderColor: Colors.neutral.border,
    paddingHorizontal: Spacing.md,
    height: 50,
  },
  textInput: {
    flex: 1,
    fontSize: Typography.fontSizes.base,
    color: Colors.neutral.textPrimary,
    marginLeft: Spacing.sm,
  },
  submitBtn: {
    marginTop: Spacing.xl,
  },
  switchAuthLink: {
    marginTop: Spacing.base,
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  switchAuthText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: '600',
    color: Colors.primary.main,
  },
});
