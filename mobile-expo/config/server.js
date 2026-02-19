import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Centralized API Configuration
 * 
 * Automatically detects the correct server IP based on environment:
 * - Development: Uses Expo's debugger host IP (works on physical devices & emulators)
 * - Production: Uses the production URL
 */

const PORT = 3000;

// Get the development machine's IP from Expo
const getDevServerIP = () => {
    try {
        // Try multiple sources for the debugger host
        // Expo SDK 49+ uses expoConfig.hostUri
        // Older versions use manifest.debuggerHost or manifest2.extra.expoGo.debuggerHost
        const debuggerHost =
            Constants.expoConfig?.hostUri ||
            Constants.manifest?.debuggerHost ||
            Constants.manifest2?.extra?.expoGo?.debuggerHost ||
            Constants.manifest?.hostUri;

        if (debuggerHost) {
            // debuggerHost format is "192.168.x.x:8081" - extract just the IP
            const ip = debuggerHost.split(':')[0];
            console.log(`🔍 Detected dev server IP: ${ip}`);
            return ip;
        }
    } catch (error) {
        console.log('Could not auto-detect IP:', error.message);
    }

    // Fallback based on platform
    if (Platform.OS === 'android') {
        // Android emulator uses 10.0.2.2 to connect to host machine
        console.log('🔍 Using Android emulator fallback IP: 10.0.2.2');
        return '10.0.2.2';
    }

    // iOS simulator can use localhost
    console.log('🔍 Using localhost fallback');
    return 'localhost';
};

// Determine if we're in production
const isProduction = !__DEV__;

// Production URL (change this to your deployed server URL)
const PRODUCTION_URL = 'https://api.foodstallapp.com';

// Development URL (auto-detected)
const devIP = getDevServerIP();
const DEV_URL = `http://${devIP}:${PORT}`;

// Export the base URL and API URL
export const SERVER_URL = isProduction ? PRODUCTION_URL : DEV_URL;
export const API_BASE_URL = `${SERVER_URL}/api/v1`;

// Socket URL (same as server URL)
export const SOCKET_URL = SERVER_URL;

// Log the URL in development for debugging
if (__DEV__) {
    console.log(`📡 API connecting to: ${API_BASE_URL}`);
}

export default {
    SERVER_URL,
    API_BASE_URL,
    SOCKET_URL,
    PORT,
};
