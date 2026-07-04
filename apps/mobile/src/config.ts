// Centralized runtime configuration for the PawSense mobile app.
//
// On a physical device, "localhost" resolves to the phone itself, not your
// dev machine — so the default below only works in a simulator/emulator
// running on the same computer as the API server.
//
// To test on a real device (e.g. via the Expo Go QR code in the desktop
// app's dashboard), create apps/mobile/.env from .env.example and set
// EXPO_PUBLIC_API_URL to your machine's LAN IP, e.g.:
//   EXPO_PUBLIC_API_URL=http://192.168.1.12:3000/api
//
// Expo inlines EXPO_PUBLIC_* env vars at build/start time — restart
// `npx expo start` after changing this file.
//
// Note: if TypeScript complains that `process` is not defined, run
// `npx expo start` once — Expo auto-generates an `expo-env.d.ts` file with
// the required ambient types on first run.

export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api'