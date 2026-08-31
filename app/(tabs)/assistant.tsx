/**
 * app/(tabs)/assistant.tsx
 * AgriOptima AI Farm Assistant & Grounded Voice Interaction Screen
 * Grounded in the farmer's live telemetry, 18-week plan, and soil metrics with Indic audio playback.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { AppHeader } from '@/components/common/AppHeader';
import { useLanguage } from '@/contexts/LanguageContext';
import { getItem, STORAGE_KEYS } from '@/lib/storage';
import { loadPlanExecutionState, calculatePlanProgress } from '@/lib/planProgress';
import { askAgriOptimaAI, speakText, stopSpeaking, VoiceAgentResponse } from '@/services/voiceAgentService';
import { getLocalizedCropName } from '@/i18n/cropNames';
import type { FarmDecisionResponse } from '@/types/farm';
import type { PlanExecutionState, PlanProgressInfo } from '@/types/planLifecycle';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  telemetryFacts?: Record<string, string>;
  source?: 'gemini' | 'rule_based' | 'system';
  timestamp: string;
}

export default function AssistantScreen() {
  const params = useLocalSearchParams<{ initialQuery?: string }>();
  const { t, language } = useLanguage();
  const isHi = language === 'hi';

  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [decision, setDecision] = useState<FarmDecisionResponse | null>(null);
  const [planState, setPlanState] = useState<PlanExecutionState | null>(null);

  const scrollViewRef = useRef<ScrollView>(null);

  // Load farm telemetry context
  useEffect(() => {
    async function loadContext() {
      const dec = await getItem<FarmDecisionResponse>(STORAGE_KEYS.DECISION_RESULT, null);
      const pState = await loadPlanExecutionState();
      setDecision(dec);
      setPlanState(pState);

      const primaryCrop = dec?.request.primary_crop_id || 'soybean';
      const cropDisplay = getLocalizedCropName(primaryCrop, language);
      const districtDisplay = dec?.request.district_name || 'Bhopal';

      setMessages([
        {
          id: 'welcome-1',
          sender: 'assistant',
          text: isHi
            ? `नमस्कार! मैं आपका एग्रीऑप्टिमा एआई कृषि सहायक हूँ। मैं आपके ${districtDisplay} के खेत (${cropDisplay}) की लाइव मिट्टी और मौसम जानकारी के आधार पर सलाह दे सकता हूँ। आप क्या पूछना चाहते हैं?`
            : `Hello! I am your AgriOptima AI Farm Assistant. I am grounded in your ${districtDisplay} telemetry and ${cropDisplay} plan. What would you like to know today?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: 'system',
        },
      ]);
    }

    loadContext();
  }, [language, isHi]);

  // Handle initialQuery if passed from Home VoiceBar
  useEffect(() => {
    if (params.initialQuery && decision) {
      handleSend(params.initialQuery);
    }
  }, [params.initialQuery, decision]);

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || inputQuery).trim();
    if (!textToSend || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    const allocatedCrops = decision?.allocations?.map((c) => c.crop_id) || [];
    const progress: PlanProgressInfo = planState
      ? calculatePlanProgress(planState, decision?.request?.season || 'Kharif', allocatedCrops, language as any)
      : {
          isStarted: false,
          startDate: null,
          currentDay: 8,
          currentWeek: 2,
          totalDays: 126,
          totalWeeks: 8,
          isCompleted: false,
          todayTask: null,
          planStatus: 'ACTIVE',
          statusLabelEn: 'Active',
          statusLabelHi: 'सक्रिय',
        };

    const history = messages.slice(-4).map((m) => ({
      role: (m.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
      text: m.text,
    }));

    try {
      const response: VoiceAgentResponse = await askAgriOptimaAI(
        textToSend,
        decision,
        language,
        {
          isStarted: progress.isStarted,
          currentDay: progress.currentDay,
          currentWeek: progress.currentWeek,
          totalDays: progress.totalDays,
          totalWeeks: progress.totalWeeks,
          todayTask: progress.todayTask,
          primaryCrop: allocatedCrops[0] || 'soybean',
          allocatedCrops,
          planStatus: progress.planStatus,
          farmerObservations: [],
        },
        history
      );

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: response.display_text,
        telemetryFacts: response.telemetry_facts,
        source: response.source,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);

      // Speak response in background
      speakText(
        response.spoken_text,
        language,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false)
      );
    } catch {
      const fallbackMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'assistant',
        text: isHi
          ? 'वर्तमान में एआई सहायक व्यस्त है। आपकी फसल का निर्धारित कार्यक्रम सामान्य रूप से जारी है।'
          : 'AI service temporarily unavailable. Field telemetry and task schedule remain normal.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'rule_based',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAudio = (text: string) => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      speakText(
        text,
        language,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false)
      );
    }
  };

  const quickQuestions = [
    isHi ? 'क्या आज सिंचाई करनी चाहिए?' : 'Should I irrigate today?',
    isHi ? 'कल बारिश की क्या संभावना है?' : 'Is rain expected tomorrow?',
    isHi ? 'अगली खाद कब डालनी है?' : 'What fertilizer to apply next?',
    isHi ? 'कीट नियंत्रण के उपाय क्या हैं?' : 'How to prevent pests?',
  ];

  const primaryCrop = decision?.request.primary_crop_id || 'soybean';
  const localizedCrop = getLocalizedCropName(primaryCrop, language);

  return (
    <View style={styles.container}>
      <AppHeader
        title="AgriOptima AI"
        subtitle="Intelligent Farm Assistant"
      />

      {/* Grounded Context Header Pill */}
      {decision ? (
        <View style={styles.contextPill}>
          <Ionicons name="sparkles" size={14} color={Colors.primary.main} />
          <Text style={styles.contextText} numberOfLines={1}>
            Grounded in {decision.request.district_name} · {localizedCrop} · Day 8 · Optimal Moisture
          </Text>
        </View>
      ) : null}

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.chatScroll}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <View
                key={msg.id}
                style={[
                  styles.msgRow,
                  isUser ? styles.msgRowUser : styles.msgRowAssistant,
                ]}
              >
                {!isUser ? (
                  <View style={styles.avatar}>
                    <Ionicons name="leaf" size={16} color={Colors.primary.main} />
                  </View>
                ) : null}

                <View
                  style={[
                    styles.bubble,
                    isUser ? styles.bubbleUser : styles.bubbleAssistant,
                  ]}
                >
                  <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : undefined]}>
                    {msg.text}
                  </Text>

                  {/* Telemetry Chips */}
                  {msg.telemetryFacts && Object.keys(msg.telemetryFacts).length > 0 ? (
                    <View style={styles.telemetryChipsRow}>
                      {Object.entries(msg.telemetryFacts).map(([k, v]) => (
                        <View key={k} style={styles.telemetryChip}>
                          <Text style={styles.chipKey}>{k}:</Text>
                          <Text style={styles.chipVal}>{v}</Text>
                        </View>
                      ))}
                    </View>
                  ) : null}

                  <View style={styles.msgFooter}>
                    <Text style={[styles.timestamp, isUser ? styles.timestampUser : undefined]}>
                      {msg.timestamp}
                    </Text>

                    {!isUser ? (
                      <TouchableOpacity
                        style={styles.speakIconBtn}
                        onPress={() => handleToggleAudio(msg.text)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons
                          name={isSpeaking ? 'volume-mute' : 'volume-high'}
                          size={16}
                          color={Colors.primary.main}
                        />
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </View>
              </View>
            );
          })}

          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={Colors.primary.main} />
              <Text style={styles.loadingText}>AgriOptima is evaluating telemetry...</Text>
            </View>
          ) : null}
        </ScrollView>

        {/* Quick Inquiries horizontal pills */}
        <View style={styles.quickQuestionsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickList}
          >
            {quickQuestions.map((q, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.quickPill}
                onPress={() => handleSend(q)}
                activeOpacity={0.75}
              >
                <Ionicons name="chatbubble-ellipses-outline" size={13} color={Colors.primary.main} />
                <Text style={styles.quickPillText}>{q}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.inputField}
            placeholder={isHi ? 'यहाँ अपना प्रश्न लिखें...' : 'Ask anything about your farm...'}
            placeholderTextColor={Colors.neutral.textMuted}
            value={inputQuery}
            onChangeText={setInputQuery}
            onSubmitEditing={() => handleSend()}
            returnKeyType="send"
          />

          <TouchableOpacity
            style={[styles.sendBtn, !inputQuery.trim() ? styles.sendBtnDisabled : undefined]}
            onPress={() => handleSend()}
            disabled={!inputQuery.trim() || loading}
            activeOpacity={0.8}
          >
            <Ionicons
              name="arrow-up"
              size={20}
              color={inputQuery.trim() ? Colors.neutral.white : Colors.neutral.textMuted}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  contextPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary.subtle,
    paddingVertical: 6,
    paddingHorizontal: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.border,
    gap: 6,
  },
  contextText: {
    flex: 1,
    fontSize: Typography.fontSizes.xs,
    fontWeight: '700',
    color: Colors.primary.dark,
  },
  chatScroll: {
    padding: Spacing.base,
    paddingBottom: Spacing.md,
  },
  msgRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  msgRowUser: {
    justifyContent: 'flex-end',
  },
  msgRowAssistant: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary.subtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: BorderRadius.base,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  bubbleUser: {
    backgroundColor: Colors.primary.main,
    borderBottomRightRadius: 2,
  },
  bubbleAssistant: {
    backgroundColor: Colors.neutral.white,
    borderWidth: 1,
    borderColor: Colors.neutral.border,
    borderBottomLeftRadius: 2,
  },
  bubbleText: {
    fontSize: Typography.fontSizes.base - 1,
    color: Colors.neutral.textPrimary,
    lineHeight: 22,
  },
  bubbleTextUser: {
    color: Colors.neutral.white,
  },
  telemetryChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: Spacing.sm,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.borderLight,
  },
  telemetryChip: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral.surfaceMuted,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 2,
  },
  chipKey: {
    fontSize: 10,
    color: Colors.neutral.textMuted,
  },
  chipVal: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.neutral.textPrimary,
  },
  msgFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  timestamp: {
    fontSize: 10,
    color: Colors.neutral.textMuted,
  },
  timestampUser: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  speakIconBtn: {
    padding: 2,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
    paddingVertical: Spacing.sm,
  },
  loadingText: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.neutral.textMuted,
  },
  quickQuestionsContainer: {
    backgroundColor: Colors.neutral.white,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.borderLight,
  },
  quickList: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs + 2,
  },
  quickPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral.surfaceMuted,
    paddingVertical: Spacing.xs + 1,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.neutral.border,
    gap: 4,
  },
  quickPillText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: '600',
    color: Colors.neutral.textPrimary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral.white,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.border,
    gap: Spacing.sm,
  },
  inputField: {
    flex: 1,
    backgroundColor: Colors.neutral.surfaceMuted,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.base,
    height: 44,
    fontSize: Typography.fontSizes.sm + 1,
    color: Colors.neutral.textPrimary,
    borderWidth: 1,
    borderColor: Colors.neutral.border,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: Colors.neutral.surfaceMuted,
  },
});
