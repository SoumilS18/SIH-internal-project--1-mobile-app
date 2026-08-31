/**
 * app/support/government-benefits.tsx
 * Government Schemes & Welfare Benefits Discovery Screen
 * Friendly, authoritative, and direct eligibility matching for Indian farmers.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { AppHeader } from '@/components/common/AppHeader';
import { Badge } from '@/components/common/Badge';

interface SchemeItem {
  id: string;
  name: string;
  category: 'income' | 'insurance' | 'subsidy' | 'organic';
  amount: string;
  eligibilityTag: string;
  description: string;
  officialUrl: string;
}

const SCHEMES_DATABASE: SchemeItem[] = [
  {
    id: 'pm-kisan',
    name: 'PM-KISAN Samman Nidhi',
    category: 'income',
    amount: '₹6,000 / year',
    eligibilityTag: 'Direct Cash Transfer',
    description: 'Income support of ₹6,000 per year in three equal installments of ₹2,000 directly transferred to your bank account.',
    officialUrl: 'https://pmkisan.gov.in',
  },
  {
    id: 'pmfby',
    name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    category: 'insurance',
    amount: 'Comprehensive Coverage',
    eligibilityTag: 'Crop Loss Insurance',
    description: 'Financial support in event of crop failure due to natural calamities, pests, and unseasonal rains at minimal premium (2% Kharif / 1.5% Rabi).',
    officialUrl: 'https://pmfby.gov.in',
  },
  {
    id: 'pmksy',
    name: 'PM Krishi Sinchayee Yojana (Per Drop More Crop)',
    category: 'subsidy',
    amount: 'Up to 55% Subsidy',
    eligibilityTag: 'Micro-Irrigation',
    description: 'Financial assistance for installation of drip and sprinkler irrigation systems to conserve water and improve yield.',
    officialUrl: 'https://pmksy.gov.in',
  },
  {
    id: 'soil-health',
    name: 'Soil Health Card Scheme',
    category: 'subsidy',
    amount: '100% Free Soil Testing',
    eligibilityTag: 'Nutrient Advisory',
    description: 'Provides free soil testing and customized fertilizer recommendations every 2 years to optimize NPK input costs.',
    officialUrl: 'https://soilhealth.dac.gov.in',
  },
  {
    id: 'pkvy',
    name: 'Paramparagat Krishi Vikas Yojana (PKVY)',
    category: 'organic',
    amount: '₹50,000 / hectare',
    eligibilityTag: 'Organic Certification',
    description: 'Promotes organic farming through cluster approach with financial assistance for organic inputs and marketing support.',
    officialUrl: 'https://pgsindia-ncof.gov.in',
  },
  {
    id: 'kcc',
    name: 'Kisan Credit Card (KCC)',
    category: 'income',
    amount: 'Up to ₹3,00,000 @ 4%',
    eligibilityTag: 'Subsidized Loan',
    description: 'Affordable institutional credit for crop cultivation expenses and post-harvest maintenance at subsidized interest rates.',
    officialUrl: 'https://myscheme.gov.in',
  },
];

export default function GovernmentBenefitsScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Schemes' },
    { id: 'income', label: 'Direct Support' },
    { id: 'insurance', label: 'Insurance' },
    { id: 'subsidy', label: 'Subsidies' },
    { id: 'organic', label: 'Organic Farming' },
  ];

  const filteredSchemes =
    selectedCategory === 'all'
      ? SCHEMES_DATABASE
      : SCHEMES_DATABASE.filter((s) => s.category === selectedCategory);

  const handleOpenPortal = (url: string) => {
    Linking.openURL(url).catch((err) => console.warn('Could not open portal:', err));
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Government Benefits"
        subtitle="Subsidies & Direct Welfare Schemes"
        showBack
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Context */}
        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={styles.flagBadge}>
              <Text style={styles.flagText}>🇮🇳 DBT PORTAL</Text>
            </View>
          </View>
          <Text style={styles.heroTitle}>Farmer Welfare & Subsidies</Text>
          <Text style={styles.heroDesc}>
            Discover central and state government schemes available for your farm land, irrigation, and crop protection.
          </Text>
        </View>

        {/* Category Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {categories.map((cat) => {
            const isSelected = cat.id === selectedCategory;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  isSelected ? styles.categoryChipActive : undefined,
                ]}
                onPress={() => setSelectedCategory(cat.id)}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.categoryText,
                    isSelected ? styles.categoryTextActive : undefined,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Schemes List */}
        <View style={styles.schemesList}>
          {filteredSchemes.map((scheme) => (
            <View key={scheme.id} style={styles.schemeCard}>
              <View style={styles.schemeTop}>
                <View style={styles.titleCol}>
                  <Text style={styles.schemeName}>{scheme.name}</Text>
                  <Badge
                    label={scheme.eligibilityTag}
                    variant="primary"
                    size="sm"
                    style={styles.schemeBadge}
                  />
                </View>
                <View style={styles.amountPill}>
                  <Text style={styles.amountText}>{scheme.amount}</Text>
                </View>
              </View>

              <Text style={styles.schemeDesc}>{scheme.description}</Text>

              <View style={styles.cardFooter}>
                <TouchableOpacity
                  style={styles.portalButton}
                  onPress={() => handleOpenPortal(scheme.officialUrl)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.portalButtonText}>Visit Official Portal</Text>
                  <Ionicons name="open-outline" size={15} color={Colors.primary.main} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
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
    paddingBottom: Spacing.xxl + Spacing.lg,
  },
  heroCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.base,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.neutral.border,
    marginBottom: Spacing.md,
  },
  heroHeader: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
  },
  flagBadge: {
    backgroundColor: Colors.accent.terracottaBg,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  flagText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.accent.terracotta,
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: '800',
    color: Colors.primary.dark,
    marginBottom: 4,
  },
  heroDesc: {
    fontSize: Typography.fontSizes.xs + 1,
    color: Colors.neutral.textSecondary,
    lineHeight: 18,
  },
  categoryScroll: {
    paddingVertical: Spacing.xs,
    gap: Spacing.xs + 2,
    marginBottom: Spacing.md,
  },
  categoryChip: {
    backgroundColor: Colors.neutral.white,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.neutral.border,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary.main,
    borderColor: Colors.primary.main,
  },
  categoryText: {
    fontSize: Typography.fontSizes.xs + 1,
    fontWeight: '700',
    color: Colors.neutral.textPrimary,
  },
  categoryTextActive: {
    color: Colors.neutral.white,
  },
  schemesList: {
    gap: Spacing.md,
  },
  schemeCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.base,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.neutral.border,
    ...Shadows.sm,
  },
  schemeTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginBottom: Spacing.xs + 2,
  },
  titleCol: {
    flex: 1,
  },
  schemeName: {
    fontSize: Typography.fontSizes.base - 1,
    fontWeight: '800',
    color: Colors.neutral.textPrimary,
    lineHeight: 20,
    marginBottom: 4,
  },
  schemeBadge: {
    marginTop: 2,
  },
  amountPill: {
    backgroundColor: Colors.primary.subtle,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  amountText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: '800',
    color: Colors.primary.dark,
  },
  schemeDesc: {
    fontSize: Typography.fontSizes.xs + 1,
    color: Colors.neutral.textSecondary,
    lineHeight: 18,
    marginVertical: Spacing.sm,
  },
  cardFooter: {
    paddingTop: Spacing.xs + 2,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.borderLight,
  },
  portalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    paddingVertical: 4,
  },
  portalButtonText: {
    fontSize: Typography.fontSizes.xs + 1,
    fontWeight: '700',
    color: Colors.primary.main,
  },
});
