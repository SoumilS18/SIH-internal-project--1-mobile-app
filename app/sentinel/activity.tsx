/**
 * app/sentinel/activity.tsx
 * Sentinel Autonomous Cycle Audit Log & Field Activity Timeline
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { AppHeader } from '@/components/common/AppHeader';
import { Badge } from '@/components/common/Badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { getItem, STORAGE_KEYS } from '@/lib/storage';
import type { FarmDecisionResponse } from '@/types/farm';
import type { FarmerObservationLog } from '@/types/planLifecycle';

interface TimelineEvent {
  id: string;
  type: 'sentinel_check' | 'farmer_obs' | 'plan_start';
  title: string;
  detail: string;
  badge: string;
  badgeVariant: 'success' | 'warning' | 'info' | 'primary';
  timestamp: string;
}

export default function ActivityTimelineScreen() {
  const { t, language } = useLanguage();
  const isHi = language === 'hi';

  const [events, setEvents] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    async function load() {
      const dec = await getItem<FarmDecisionResponse>(STORAGE_KEYS.FARM_DECISION, null);
      const obsLogs = await getItem<FarmerObservationLog[]>(STORAGE_KEYS.RECENT_OBSERVATIONS, []);

      const list: TimelineEvent[] = [];

      // 1. Initial plan creation event
      if (dec) {
        list.push({
          id: 'evt-init',
          type: 'plan_start',
          title: isHi ? 'स्वायत्त कृषि योजना तैयार हुई' : 'Autonomous Farm Plan Generated',
          detail: isHi
            ? `${dec.location.district_name} (${dec.request.land_size_acres} एकड़) हेतु इष्टतम फसल आवंटन पूर्ण।`
            : `Optimal portfolio allocation solved for ${dec.request.land_size_acres} acres in ${dec.location.district_name}.`,
          badge: 'SOLVED',
          badgeVariant: 'success',
          timestamp: dec.weather.weather_timestamp,
        });

        // 2. Sentinel baseline cycle
        list.push({
          id: 'evt-sentinel',
          type: 'sentinel_check',
          title: isHi ? 'सेंटिनल टेलीमेट्री सत्यापन' : 'Sentinel Telemetry Verification',
          detail: isHi
            ? `जड़ क्षेत्र नमी ${(dec.weather.root_zone_soil_moisture_m3m3 ?? 0.35).toFixed(2)} m³/m³ दर्ज। जोखिम स्तर: ${dec.risk.overall_risk_label}`
            : `Root zone moisture ${(dec.weather.root_zone_soil_moisture_m3m3 ?? 0.35).toFixed(2)} m³/m³. Risk Level: ${dec.risk.overall_risk_label}`,
          badge: 'VERIFIED',
          badgeVariant: 'info',
          timestamp: dec.weather.weather_timestamp,
        });
      }

      // 3. Farmer field observations
      (obsLogs || []).forEach((obs) => {
        list.push({
          id: obs.id,
          type: 'farmer_obs',
          title: isHi ? `खेत अवलोकन (दिन ${obs.dayNumber})` : `Field Observation (Day ${obs.dayNumber})`,
          detail: obs.customText || `${obs.selectedQuestions.length} checklist items confirmed in field.`,
          badge: 'FIELD LOG',
          badgeVariant: 'primary',
          timestamp: obs.timestamp,
        });
      });

      setEvents(list);
    }

    load();
  }, [isHi]);

  return (
    <View style={styles.container}>
      <AppHeader
        title={t('sentinel.viewActivityTimeline')}
        subtitle="Chronological Sentinel & Farm Logs"
        showBack
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.timeline}>
          {events.map((evt, idx) => (
            <View key={evt.id} style={styles.timelineRow}>
              {/* Left timeline axis */}
              <View style={styles.axisCol}>
                <View
                  style={[
                    styles.nodeDot,
                    evt.type === 'sentinel_check'
                      ? styles.nodeSentinel
                      : evt.type === 'farmer_obs'
                      ? styles.nodeFarmer
                      : styles.nodePlan,
                  ]}
                >
                  <Ionicons
                    name={
                      evt.type === 'sentinel_check'
                        ? 'shield-checkmark'
                        : evt.type === 'farmer_obs'
                        ? 'create'
                        : 'leaf'
                    }
                    size={12}
                    color={Colors.neutral.white}
                  />
                </View>
                {idx < events.length - 1 ? <View style={styles.axisLine} /> : null}
              </View>

              {/* Right Event Card */}
              <View style={styles.eventCard}>
                <View style={styles.eventHeader}>
                  <Text style={styles.eventTitle}>{evt.title}</Text>
                  <Badge label={evt.badge} variant={evt.badgeVariant} size="sm" />
                </View>

                <Text style={styles.eventDetail}>{evt.detail}</Text>
                <Text style={styles.eventTime}>
                  {new Date(evt.timestamp).toLocaleString([], {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </Text>
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
    paddingBottom: Spacing.xxl,
  },
  timeline: {
    marginTop: Spacing.sm,
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: Spacing.base,
  },
  axisCol: {
    alignItems: 'center',
    width: 32,
    marginRight: Spacing.sm,
  },
  nodeDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  nodeSentinel: {
    backgroundColor: Colors.status.info,
  },
  nodeFarmer: {
    backgroundColor: Colors.primary.main,
  },
  nodePlan: {
    backgroundColor: Colors.status.success,
  },
  axisLine: {
    flex: 1,
    width: 2,
    backgroundColor: Colors.neutral.border,
    marginTop: 2,
  },
  eventCard: {
    flex: 1,
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.neutral.border,
    ...Shadows.sm,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  eventTitle: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: '700',
    color: Colors.neutral.textPrimary,
  },
  eventDetail: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.neutral.textSecondary,
    lineHeight: 18,
    marginBottom: 6,
  },
  eventTime: {
    fontSize: 10,
    color: Colors.neutral.textMuted,
  },
});
