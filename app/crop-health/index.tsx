/**
 * app/crop-health/index.tsx
 * Crop Health Scanner Preview Screen (Upcoming Feature)
 * Camera-inspired viewfinder design showcasing automated leaf disease diagnostics and AI detection.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { AppHeader } from '@/components/common/AppHeader';
import { Badge } from '@/components/common/Badge';

export default function CropHealthScreen() {
  const upcomingFeatures = [
    {
      title: 'Instant Disease Detection',
      desc: 'Point your camera at affected leaves to diagnose fungal rust, blights, and spot viruses within 2 seconds.',
      icon: 'scan-outline' as const,
    },
    {
      title: 'Nutrient Deficiency Mapping',
      desc: 'Identify Nitrogen (N), Phosphorus (P), and Potassium (K) yellowing patterns with actionable spray dosages.',
      icon: 'flask-outline' as const,
    },
    {
      title: 'Organic & Bio-Remedies',
      desc: 'Get immediate localized remedy recipes (Neem oil, Trichoderma, Bio-fungicides) before purchasing chemicals.',
      icon: 'leaf-outline' as const,
    },
  ];

  return (
    <View style={styles.container}>
      <AppHeader
        title="Crop Health Scanner"
        subtitle="Visual Disease & Pest Diagnosis"
        showBack
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Camera Viewfinder Mockup */}
        <View style={styles.viewfinderCard}>
          <View style={styles.viewfinderScreen}>
            {/* Top Reticle Brackets */}
            <View style={styles.reticleRow}>
              <View style={[styles.cornerBracket, styles.topLeft]} />
              <View style={[styles.cornerBracket, styles.topRight]} />
            </View>

            {/* Center Scanning Target */}
            <View style={styles.centerTarget}>
              <View style={styles.centerPulse}>
                <Ionicons name="camera" size={36} color={Colors.primary.main} />
              </View>
              <Text style={styles.centerTargetText}>Align Crop Leaf Inside Frame</Text>
            </View>

            {/* Bottom Reticle Brackets */}
            <View style={styles.reticleRow}>
              <View style={[styles.cornerBracket, styles.bottomLeft]} />
              <View style={[styles.cornerBracket, styles.bottomRight]} />
            </View>

            {/* Coming Soon Pill Overlay */}
            <View style={styles.comingSoonOverlay}>
              <Badge
                label="COMING SOON"
                variant="accent"
                size="md"
                style={styles.comingSoonBadge}
              />
            </View>
          </View>
        </View>

        {/* Feature Overview */}
        <View style={styles.introSection}>
          <Text style={styles.introHeadline}>Capture Your Crop. Understand What's Happening.</Text>
          <Text style={styles.introBody}>
            AgriOptima's on-device vision models will analyze leaf textures, discoloration spots, and insect bite patterns directly from your camera.
          </Text>
        </View>

        {/* Capability Cards */}
        <View style={styles.featuresList}>
          {upcomingFeatures.map((feat, idx) => (
            <View key={idx} style={styles.featCard}>
              <View style={styles.featIconCircle}>
                <Ionicons name={feat.icon} size={20} color={Colors.primary.main} />
              </View>
              <View style={styles.featContent}>
                <Text style={styles.featTitle}>{feat.title}</Text>
                <Text style={styles.featDesc}>{feat.desc}</Text>
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
  viewfinderCard: {
    backgroundColor: Colors.neutral.darkBg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.base,
    overflow: 'hidden',
  },
  viewfinderScreen: {
    height: 240,
    backgroundColor: '#0A140F',
    borderRadius: BorderRadius.base,
    justifyContent: 'space-between',
    padding: Spacing.base,
    position: 'relative',
  },
  reticleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cornerBracket: {
    width: 28,
    height: 28,
    borderColor: Colors.accent.ochre,
  },
  topLeft: {
    borderTopWidth: 2.5,
    borderLeftWidth: 2.5,
  },
  topRight: {
    borderTopWidth: 2.5,
    borderRightWidth: 2.5,
  },
  bottomLeft: {
    borderBottomWidth: 2.5,
    borderLeftWidth: 2.5,
  },
  bottomRight: {
    borderBottomWidth: 2.5,
    borderRightWidth: 2.5,
  },
  centerTarget: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerPulse: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(36, 78, 56, 0.4)',
    borderWidth: 1.5,
    borderColor: Colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  centerTargetText: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.neutral.textMuted,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  comingSoonOverlay: {
    position: 'absolute',
    bottom: Spacing.md,
    alignSelf: 'center',
  },
  comingSoonBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
  },
  introSection: {
    marginBottom: Spacing.base,
  },
  introHeadline: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: '800',
    color: Colors.primary.dark,
    marginBottom: 6,
    lineHeight: 24,
  },
  introBody: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.neutral.textSecondary,
    lineHeight: 20,
  },
  featuresList: {
    gap: Spacing.sm + 2,
  },
  featCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.base,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.neutral.border,
    flexDirection: 'row',
    gap: Spacing.md,
  },
  featIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featContent: {
    flex: 1,
  },
  featTitle: {
    fontSize: Typography.fontSizes.base - 1,
    fontWeight: '700',
    color: Colors.neutral.textPrimary,
    marginBottom: 3,
  },
  featDesc: {
    fontSize: Typography.fontSizes.xs + 1,
    color: Colors.neutral.textSecondary,
    lineHeight: 18,
  },
});
