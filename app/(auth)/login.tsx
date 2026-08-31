/**
 * app/(auth)/login.tsx
 * Real Supabase Farmer Sign In + Demo Farmer Mode
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

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, continueAsDemo } = useAuth();
  const { t } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = async () => {
    if (!email.trim() || !password) {
      setError(t('auth.invalidCredentials'));
      return;
    }

    setError(null);
    setLoading(true);

    const result = await signIn(email.trim(), password);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      router.replace('/');
    }
  };

  const handleDemoLogin = () => {
    continueAsDemo('Ramesh Kumar (Demo)');
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <AppHeader title="AgriOptima AI" subtitle={t('brand.taglineShort')} showLanguageSelector />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header text */}
          <View style={styles.titleSection}>
            <View style={styles.iconCircle}>
              <Ionicons name="leaf" size={28} color={Colors.primary.main} />
            </View>
            <Text style={styles.welcomeTitle}>{t('auth.loginTitle')}</Text>
            <Text style={styles.welcomeSubtitle}>{t('auth.loginSubtitle')}</Text>
          </View>

          {/* Error Banner */}
          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={20} color={Colors.status.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Form Card */}
          <View style={styles.formCard}>
            <Text style={styles.inputLabel}>{t('auth.emailLabel')}</Text>
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
              title={loading ? t('auth.signingIn') : t('auth.signInButton')}
              onPress={handleSignIn}
              loading={loading}
              variant="primary"
              size="lg"
              style={styles.submitBtn}
            />

            <TouchableOpacity
              style={styles.switchAuthLink}
              onPress={() => router.push('/(auth)/signup')}
              activeOpacity={0.7}
            >
              <Text style={styles.switchAuthText}>{t('auth.dontHaveAccount')}</Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Demo Farmer Mode */}
          <View style={styles.demoCard}>
            <View style={styles.demoHeader}>
              <Ionicons name="sparkles" size={20} color={Colors.accent.ochre} />
              <Text style={styles.demoTitle}>{t('auth.demoFarmerButton')}</Text>
            </View>
            <Text style={styles.demoNotice}>{t('auth.demoNotice')}</Text>

            <Button
              title={t('auth.demoFarmerButton')}
              onPress={handleDemoLogin}
              variant="subtle"
              size="md"
              style={styles.demoBtn}
            />
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
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.neutral.border,
  },
  dividerText: {
    marginHorizontal: Spacing.md,
    fontSize: Typography.fontSizes.xs,
    fontWeight: '700',
    color: Colors.neutral.textMuted,
  },
  demoCard: {
    backgroundColor: '#FFFDF5',
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  demoTitle: {
    fontSize: Typography.fontSizes.base,
    fontWeight: '700',
    color: '#92400E',
  },
  demoNotice: {
    fontSize: Typography.fontSizes.xs,
    color: '#B45309',
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  demoBtn: {
    backgroundColor: '#FEF3C7',
  },
});
