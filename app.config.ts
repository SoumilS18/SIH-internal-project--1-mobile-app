import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'AgriOptima AI',
  slug: 'agrioptima-ai',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  scheme: 'agrioptima',
  userInterfaceStyle: 'light',
  newArchEnabled: true,
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#1B4332',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'ai.agrioptima.app',
    infoPlist: {
      NSLocationWhenInUseUsageDescription: 'AgriOptima uses your farm location to fetch hyper-local agro-climatic intelligence and soil risk alerts.',
      NSMicrophoneUsageDescription: 'AgriOptima uses the microphone for Indic voice interaction with the Farm Advisory AI.',
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#1B4332',
    },
    package: 'ai.agrioptima.app',
    permissions: [
      'ACCESS_FINE_LOCATION',
      'ACCESS_COARSE_LOCATION',
      'RECORD_AUDIO',
      'RECEIVE_BOOT_COMPLETED',
      'VIBRATE',
    ],
  },
  web: {
    bundler: 'metro',
    output: 'single',
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-location',
      {
        locationWhenInUsePermission: 'AgriOptima uses your location to provide accurate local weather and agro-climatic advisories.',
      },
    ],
    [
      'expo-av',
      {
        microphonePermission: 'AgriOptima needs microphone access for voice queries in Hindi and regional languages.',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
});
