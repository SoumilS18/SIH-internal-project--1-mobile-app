// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// In-process bundling ensures direct buffer passing for Expo Router context modules in Bun on Windows
config.maxWorkers = 1;

module.exports = config;
