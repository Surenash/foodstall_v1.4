import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const KEYS = {
    USER_DATA: '@user_data',
    AUTH_TOKEN: '@auth_token',
    DARK_MODE: '@dark_mode',
    LANGUAGE: '@language',
    SEARCH_HISTORY: '@search_history',
    NOTIFICATION_PREFS: '@notification_prefs',
};

/**
 * Storage Service
 * Helper functions for AsyncStorage operations
 */

// =====================================================
// USER DATA
// =====================================================

export const getUserData = async () => {
    try {
        const data = await AsyncStorage.getItem(KEYS.USER_DATA);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error getting user data:', error);
        return null;
    }
};

export const setUserData = async (userData) => {
    try {
        await AsyncStorage.setItem(KEYS.USER_DATA, JSON.stringify(userData));
        return true;
    } catch (error) {
        console.error('Error setting user data:', error);
        return false;
    }
};

export const clearUserData = async () => {
    try {
        await AsyncStorage.removeItem(KEYS.USER_DATA);
        await AsyncStorage.removeItem(KEYS.AUTH_TOKEN);
        return true;
    } catch (error) {
        console.error('Error clearing user data:', error);
        return false;
    }
};

// =====================================================
// AUTH TOKEN
// =====================================================

export const getAuthToken = async () => {
    try {
        return await AsyncStorage.getItem(KEYS.AUTH_TOKEN);
    } catch (error) {
        console.error('Error getting auth token:', error);
        return null;
    }
};

export const setAuthToken = async (token) => {
    try {
        await AsyncStorage.setItem(KEYS.AUTH_TOKEN, token);
        return true;
    } catch (error) {
        console.error('Error setting auth token:', error);
        return false;
    }
};

// =====================================================
// SETTINGS
// =====================================================

export const getDarkMode = async () => {
    try {
        const value = await AsyncStorage.getItem(KEYS.DARK_MODE);
        return value === 'true';
    } catch (error) {
        console.error('Error getting dark mode:', error);
        return false;
    }
};

export const setDarkMode = async (enabled) => {
    try {
        await AsyncStorage.setItem(KEYS.DARK_MODE, enabled ? 'true' : 'false');
        return true;
    } catch (error) {
        console.error('Error setting dark mode:', error);
        return false;
    }
};

export const getLanguage = async () => {
    try {
        const value = await AsyncStorage.getItem(KEYS.LANGUAGE);
        return value || 'en';
    } catch (error) {
        console.error('Error getting language:', error);
        return 'en';
    }
};

export const setLanguage = async (lang) => {
    try {
        await AsyncStorage.setItem(KEYS.LANGUAGE, lang);
        return true;
    } catch (error) {
        console.error('Error setting language:', error);
        return false;
    }
};

// =====================================================
// SEARCH HISTORY
// =====================================================

export const getSearchHistory = async () => {
    try {
        const data = await AsyncStorage.getItem(KEYS.SEARCH_HISTORY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error getting search history:', error);
        return [];
    }
};

export const addSearchQuery = async (query) => {
    try {
        const history = await getSearchHistory();
        // Remove duplicate if exists
        const filtered = history.filter(q => q.toLowerCase() !== query.toLowerCase());
        // Add to beginning
        const updated = [query, ...filtered].slice(0, 10); // Keep last 10
        await AsyncStorage.setItem(KEYS.SEARCH_HISTORY, JSON.stringify(updated));
        return updated;
    } catch (error) {
        console.error('Error adding search query:', error);
        return [];
    }
};

export const clearSearchHistory = async () => {
    try {
        await AsyncStorage.removeItem(KEYS.SEARCH_HISTORY);
        return true;
    } catch (error) {
        console.error('Error clearing search history:', error);
        return false;
    }
};

// =====================================================
// CLEAR ALL CACHE
// =====================================================

export const clearAllCache = async () => {
    try {
        // Clear everything except user data and auth token
        await AsyncStorage.removeItem(KEYS.SEARCH_HISTORY);
        // Keep settings to avoid UX disruption
        return true;
    } catch (error) {
        console.error('Error clearing cache:', error);
        return false;
    }
};

export const clearAllData = async () => {
    try {
        await AsyncStorage.clear();
        return true;
    } catch (error) {
        console.error('Error clearing all data:', error);
        return false;
    }
};

export default {
    getUserData,
    setUserData,
    clearUserData,
    getAuthToken,
    setAuthToken,
    getDarkMode,
    setDarkMode,
    getLanguage,
    setLanguage,
    getSearchHistory,
    addSearchQuery,
    clearSearchHistory,
    clearAllCache,
    clearAllData,
};
