/**
 * app/(onboarding)/location.tsx
 * Step 1 of Farm Onboarding: GPS Auto-Detect or State/District Selection
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Modal,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { Button } from '@/components/common/Button';
import { AppHeader } from '@/components/common/AppHeader';
import {
  ALL_INDIAN_DISTRICTS,
  getAllStates,
  getDistrictsByState,
  findNearestDistrict,
} from '@/lib/districtsCatalog';
import { getStateDisplayName, getDistrictDisplayName } from '@/i18n/geoNames';
import { useLanguage } from '@/contexts/LanguageContext';
import { setItem, STORAGE_KEYS } from '@/lib/storage';
import type { DistrictLocationItem } from '@/types/farm';

export default function LocationScreen() {
  const router = useRouter();
  const { t, language } = useLanguage();

  const [selectedState, setSelectedState] = useState<string>('Madhya Pradesh');
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictLocationItem | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);

  const [isStateModalOpen, setIsStateModalOpen] = useState<boolean>(false);
  const [isDistrictModalOpen, setIsDistrictModalOpen] = useState<boolean>(false);

  const statesList = useMemo(() => getAllStates(), []);
  const districtsInState = useMemo(
    () => getDistrictsByState(selectedState),
    [selectedState]
  );

  // Set default district
  useEffect(() => {
    if (districtsInState.length > 0 && (!selectedDistrict || selectedDistrict.state_name !== selectedState)) {
      setSelectedDistrict(districtsInState[0]);
    }
  }, [selectedState, districtsInState, selectedDistrict]);

  // GPS Auto-Detection
  const handleUseGPS = async () => {
    setGpsLoading(true);
    setGpsStatus(t('onboarding.gpsDetecting'));

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setGpsStatus('Location permission denied. Please select district manually.');
        setGpsLoading(false);
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const nearest = findNearestDistrict(position.coords.latitude, position.coords.longitude);

      if (nearest) {
        setSelectedState(nearest.state_name);
        setSelectedDistrict(nearest);
        setGpsStatus(
          t('onboarding.gpsSuccess', {
            district: getDistrictDisplayName(nearest.district_name, language),
            state: getStateDisplayName(nearest.state_name, language),
          })
        );
      } else {
        setGpsStatus('Could not determine nearest district. Please choose manually.');
      }
    } catch {
      setGpsStatus('GPS signal unavailable. Please select your district below.');
    } finally {
      setGpsLoading(false);
    }
  };

  const handleContinue = async () => {
    if (!selectedDistrict) return;

    // Cache partial onboarding state
    await setItem('agrioptima_onboarding_draft', {
      state_name: selectedDistrict.state_name,
      district_name: selectedDistrict.district_name,
      latitude: selectedDistrict.latitude,
      longitude: selectedDistrict.longitude,
      agro_climatic_zone: selectedDistrict.agro_climatic_zone,
      major_soil_type: selectedDistrict.major_soil_type,
    });

    router.push('/(onboarding)/farm-details');
  };

  return (
    <View style={styles.container}>
      <AppHeader title={t('onboarding.step1Title')} subtitle="Step 1 of 3" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.titleSection}>
          <Text style={styles.headline}>{t('onboarding.step1Title')}</Text>
          <Text style={styles.subhead}>{t('onboarding.step1Subtitle')}</Text>
        </View>

        {/* GPS Quick Button */}
        <TouchableOpacity
          style={styles.gpsCard}
          onPress={handleUseGPS}
          disabled={gpsLoading}
          activeOpacity={0.8}
        >
          <View style={styles.gpsIconCircle}>
            {gpsLoading ? (
              <ActivityIndicator size="small" color={Colors.primary.main} />
            ) : (
              <Ionicons name="navigate" size={22} color={Colors.primary.main} />
            )}
          </View>
          <View style={styles.gpsTextWrapper}>
            <Text style={styles.gpsTitle}>{t('onboarding.gpsButton')}</Text>
            <Text style={styles.gpsSubtitle}>
              {gpsStatus || 'Automatically fetch hyper-local weather & soil data'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR SELECT MANUALLY</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* State Selector */}
        <Text style={styles.fieldLabel}>{t('onboarding.stateLabel')}</Text>
        <TouchableOpacity
          style={styles.selectTrigger}
          onPress={() => setIsStateModalOpen(true)}
          activeOpacity={0.75}
        >
          <Ionicons name="map-outline" size={20} color={Colors.primary.main} />
          <Text style={styles.selectTriggerText}>
            {getStateDisplayName(selectedState, language)}
          </Text>
          <Ionicons name="chevron-down" size={18} color={Colors.neutral.textMuted} />
        </TouchableOpacity>

        {/* District Selector */}
        <Text style={[styles.fieldLabel, { marginTop: Spacing.base }]}>
          {t('onboarding.districtLabel')}
        </Text>
        <TouchableOpacity
          style={styles.selectTrigger}
          onPress={() => setIsDistrictModalOpen(true)}
          activeOpacity={0.75}
        >
          <Ionicons name="location-outline" size={20} color={Colors.primary.main} />
          <Text style={styles.selectTriggerText}>
            {selectedDistrict
              ? getDistrictDisplayName(selectedDistrict.district_name, language)
              : t('onboarding.selectDistrictPrompt')}
          </Text>
          <Ionicons name="chevron-down" size={18} color={Colors.neutral.textMuted} />
        </TouchableOpacity>

        {/* Selected District Info Badge */}
        {selectedDistrict ? (
          <View style={styles.zoneCard}>
            <View style={styles.zoneRow}>
              <Text style={styles.zoneKey}>Agro-Climatic Zone:</Text>
              <Text style={styles.zoneVal}>{selectedDistrict.agro_climatic_zone}</Text>
            </View>
            <View style={styles.zoneRow}>
              <Text style={styles.zoneKey}>Soil Profile:</Text>
              <Text style={styles.zoneVal}>{selectedDistrict.major_soil_type}</Text>
            </View>
          </View>
        ) : null}

        <Button
          title={t('onboarding.nextButton')}
          onPress={handleContinue}
          variant="primary"
          size="lg"
          style={styles.nextBtn}
          icon={<Ionicons name="arrow-forward" size={18} color={Colors.neutral.white} />}
        />
      </ScrollView>

      {/* State Picker Modal */}
      <Modal visible={isStateModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('onboarding.selectStatePrompt')}</Text>
              <TouchableOpacity onPress={() => setIsStateModalOpen(false)}>
                <Ionicons name="close" size={24} color={Colors.neutral.textPrimary} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={statesList}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalListItem,
                    item === selectedState ? styles.modalListItemActive : undefined,
                  ]}
                  onPress={() => {
                    setSelectedState(item);
                    setIsStateModalOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      item === selectedState ? styles.modalItemTextActive : undefined,
                    ]}
                  >
                    {getStateDisplayName(item, language)}
                  </Text>
                  {item === selectedState ? (
                    <Ionicons name="checkmark" size={18} color={Colors.primary.main} />
                  ) : null}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* District Picker Modal with Search */}
      <Modal visible={isDistrictModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('onboarding.selectDistrictPrompt')}</Text>
              <TouchableOpacity onPress={() => setIsDistrictModalOpen(false)}>
                <Ionicons name="close" size={24} color={Colors.neutral.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchBox}>
              <Ionicons name="search" size={18} color={Colors.neutral.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder={t('onboarding.searchDistrictPlaceholder')}
                placeholderTextColor={Colors.neutral.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCorrect={false}
              />
            </View>

            <FlatList
              data={districtsInState.filter((d) =>
                d.district_name.toLowerCase().includes(searchQuery.toLowerCase())
              )}
              keyExtractor={(item) => item.district_id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalListItem,
                    selectedDistrict?.district_id === item.district_id
                      ? styles.modalListItemActive
                      : undefined,
                  ]}
                  onPress={() => {
                    setSelectedDistrict(item);
                    setIsDistrictModalOpen(false);
                    setSearchQuery('');
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      selectedDistrict?.district_id === item.district_id
                        ? styles.modalItemTextActive
                        : undefined,
                    ]}
                  >
                    {getDistrictDisplayName(item.district_name, language)}
                  </Text>
                  {selectedDistrict?.district_id === item.district_id ? (
                    <Ionicons name="checkmark" size={18} color={Colors.primary.main} />
                  ) : null}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
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
    marginVertical: Spacing.base,
  },
  headline: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: '700',
    color: Colors.neutral.textPrimary,
  },
  subhead: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.neutral.textSecondary,
    marginTop: 2,
  },
  gpsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary.bg,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    borderWidth: 1.5,
    borderColor: Colors.primary.subtle,
    ...Shadows.sm,
  },
  gpsIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary.light,
  },
  gpsTextWrapper: {
    flex: 1,
  },
  gpsTitle: {
    fontSize: Typography.fontSizes.base,
    fontWeight: '700',
    color: Colors.primary.dark,
  },
  gpsSubtitle: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.neutral.textSecondary,
    marginTop: 2,
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
    fontSize: 10,
    fontWeight: '700',
    color: Colors.neutral.textMuted,
    letterSpacing: 0.5,
  },
  fieldLabel: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: '700',
    color: Colors.neutral.textSecondary,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
  },
  selectTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.base,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.neutral.border,
    ...Shadows.sm,
  },
  selectTriggerText: {
    flex: 1,
    fontSize: Typography.fontSizes.base,
    fontWeight: '600',
    color: Colors.neutral.textPrimary,
    marginLeft: Spacing.sm,
  },
  zoneCard: {
    backgroundColor: Colors.neutral.surfaceMuted,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.lg,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.neutral.border,
  },
  zoneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  zoneKey: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.neutral.textMuted,
  },
  zoneVal: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: '600',
    color: Colors.neutral.textPrimary,
  },
  nextBtn: {
    marginTop: Spacing.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 30, 22, 0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    maxHeight: '75%',
    backgroundColor: Colors.neutral.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: '700',
    color: Colors.neutral.textPrimary,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral.surfaceMuted,
    borderRadius: BorderRadius.base,
    paddingHorizontal: Spacing.md,
    height: 44,
    marginBottom: Spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.fontSizes.sm,
    color: Colors.neutral.textPrimary,
    marginLeft: Spacing.xs,
  },
  modalListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.borderLight,
  },
  modalListItemActive: {
    backgroundColor: Colors.primary.bg,
  },
  modalItemText: {
    fontSize: Typography.fontSizes.base,
    color: Colors.neutral.textPrimary,
  },
  modalItemTextActive: {
    fontWeight: '700',
    color: Colors.primary.dark,
  },
});
