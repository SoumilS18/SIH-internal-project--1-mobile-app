/**
 * services/pushNotificationService.ts
 * Push Notification Architecture for AgriOptima AI Mobile
 * Configures Expo Push Notifications, local task reminders, and Sentinel alert triggers.
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getItem, setItem } from '@/lib/storage';

// Configure foreground notification presentation (Mobile only)
if (Platform.OS !== 'web') {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch {
    // Ignore on unsupported platforms
  }
}

const PUSH_TOKEN_KEY = 'agrioptima_push_token_v1';

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return null;
  }

  let token: string | null = null;

  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('agrioptima-alerts', {
        name: 'AgriOptima Farm Alerts',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2D6A4F',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.info('[Push] Notification permission not granted.');
      return null;
    }

    // Try fetching device push token safely
    const tokenData = await Notifications.getExpoPushTokenAsync().catch(() => null);
    if (tokenData?.data) {
      token = tokenData.data;
      await setItem(PUSH_TOKEN_KEY, token);
    }
  } catch (err) {
    console.info('[Push] Notification registration notice:', err);
  }

  return token;
}

export async function scheduleLocalTaskReminder(
  dayNumber: number,
  taskTitle: string,
  hoursFromNow: number = 14
): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  try {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: `🌾 AgriOptima: Day ${dayNumber} Task Due`,
        body: `Today's farm task: "${taskTitle}". Tap to view action steps.`,
        data: { dayNumber, taskTitle },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: Math.max(60, hoursFromNow * 3600),
      },
    });
    return identifier;
  } catch {
    return null;
  }
}

export async function triggerSentinelAlertNotification(
  headline: string,
  recommendation: string
): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  try {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: `⚠️ AgriOptima Sentinel Alert`,
        body: `${headline}: ${recommendation}`,
        data: { type: 'SENTINEL_ALERT' },
      },
      trigger: null, // immediate
    });
    return identifier;
  } catch {
    return null;
  }
}
