import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Alert,
    Linking,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import theme from '../styles/theme';
import { getDarkMode, setDarkMode as saveDarkMode, getLanguage, setLanguage as saveLanguage, clearAllCache } from '../services/storage';

/**
 * Settings Screen
 * App settings, language, notifications, about
 */
const Settings = ({ navigation }) => {
    const [language, setLanguage] = useState('English');
    const [notifications, setNotifications] = useState(true);
    const [locationAlerts, setLocationAlerts] = useState(true);
    const [darkMode, setDarkMode] = useState(false);

    const languages = ['English', 'हिंदी', 'தமிழ்', 'मराठी'];

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        const savedDarkMode = await getDarkMode();
        const savedLanguage = await getLanguage();
        setDarkMode(savedDarkMode);
        if (savedLanguage) {
            const langMap = { 'en': 'English', 'hi': 'हिंदी', 'ta': 'தமிழ்', 'mr': 'मराठी' };
            setLanguage(langMap[savedLanguage] || 'English');
        }
    };

    const handleLanguageChange = async (lang) => {
        setLanguage(lang);
        const langCodeMap = { 'English': 'en', 'हिंदी': 'hi', 'தமிழ்': 'ta', 'मराठी': 'mr' };
        await saveLanguage(langCodeMap[lang]);
    };

    const handleDarkModeToggle = async (enabled) => {
        setDarkMode(enabled);
        await saveDarkMode(enabled);
    };

    const showLanguagePicker = () => {
        Alert.alert(
            'Select Language',
            'Choose your preferred language',
            languages.map(lang => ({
                text: lang,
                onPress: () => handleLanguageChange(lang),
            }))
        );
    };

    const clearCache = async () => {
        Alert.alert(
            'Clear Cache',
            'This will clear cached images and search history. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: async () => {
                        await clearAllCache();
                        Alert.alert('Done', 'Cache cleared successfully!');
                    }
                }
            ]
        );
    };

    const SettingRow = ({ icon, iconColor, title, subtitle, onPress, rightComponent }) => (
        <TouchableOpacity style={styles.settingRow} onPress={onPress} disabled={!onPress}>
            <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
                <Icon name={icon} size={22} color={iconColor} />
            </View>
            <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>{title}</Text>
                {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
            </View>
            {rightComponent || (onPress && <Icon name="chevron-right" size={24} color={theme.colors.textSecondary} />)}
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container}>
            {/* Language Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Language & Region</Text>
                <SettingRow
                    icon="language"
                    iconColor={theme.colors.primary}
                    title="Language"
                    subtitle={language}
                    onPress={showLanguagePicker}
                />
            </View>

            {/* Notifications Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Notifications</Text>
                <SettingRow
                    icon="notifications"
                    iconColor={theme.colors.secondary}
                    title="Push Notifications"
                    subtitle="Get updates about stalls and offers"
                    rightComponent={
                        <Switch
                            value={notifications}
                            onValueChange={setNotifications}
                            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                        />
                    }
                />
                <SettingRow
                    icon="location-on"
                    iconColor={theme.colors.success}
                    title="Nearby Stall Alerts"
                    subtitle="Get notified when you're near a favorite stall"
                    rightComponent={
                        <Switch
                            value={locationAlerts}
                            onValueChange={setLocationAlerts}
                            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                        />
                    }
                />
            </View>

            {/* Appearance Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Appearance</Text>
                <SettingRow
                    icon="dark-mode"
                    iconColor="#6B7280"
                    title="Dark Mode"
                    subtitle={darkMode ? 'Enabled' : 'Disabled'}
                    rightComponent={
                        <Switch
                            value={darkMode}
                            onValueChange={handleDarkModeToggle}
                            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                        />
                    }
                />
            </View>

            {/* Data Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Data & Storage</Text>
                <SettingRow
                    icon="delete-sweep"
                    iconColor={theme.colors.error}
                    title="Clear Cache"
                    subtitle="Free up storage space"
                    onPress={clearCache}
                />
            </View>

            {/* About Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>About</Text>
                <SettingRow
                    icon="info"
                    iconColor={theme.colors.primary}
                    title="App Version"
                    subtitle="1.0.0"
                />
                <SettingRow
                    icon="description"
                    iconColor="#8B5CF6"
                    title="Terms of Service"
                    onPress={() => Linking.openURL('https://example.com/terms')}
                />
                <SettingRow
                    icon="privacy-tip"
                    iconColor="#EC4899"
                    title="Privacy Policy"
                    onPress={() => Linking.openURL('https://example.com/privacy')}
                />
                <SettingRow
                    icon="help"
                    iconColor={theme.colors.secondary}
                    title="Help & Support"
                    onPress={() => navigation.navigate('Help')}
                />
                <SettingRow
                    icon="star"
                    iconColor="#F59E0B"
                    title="Rate This App"
                    onPress={() => Alert.alert('Thanks!', 'This would open the app store.')}
                />
            </View>

            {/* Danger Zone */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.error }]}>Danger Zone</Text>
                <TouchableOpacity
                    style={styles.dangerBtn}
                    onPress={() => Alert.alert(
                        'Delete Account',
                        'This action is permanent and cannot be undone. All your data will be deleted.',
                        [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Delete', style: 'destructive', onPress: () => { } }
                        ]
                    )}
                >
                    <Icon name="delete-forever" size={20} color={theme.colors.error} />
                    <Text style={styles.dangerBtnText}>Delete Account</Text>
                </TouchableOpacity>
            </View>

            <View style={{ height: 100 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    section: {
        marginTop: theme.spacing.lg,
        paddingHorizontal: theme.spacing.md,
    },
    sectionTitle: {
        fontSize: theme.typography.fontSize.sm,
        fontWeight: '600',
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.sm,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        marginBottom: theme.spacing.sm,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingContent: {
        flex: 1,
        marginLeft: theme.spacing.md,
    },
    settingTitle: {
        fontSize: theme.typography.fontSize.base,
        fontWeight: '500',
        color: theme.colors.textPrimary,
    },
    settingSubtitle: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    dangerBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.md,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.error,
        gap: theme.spacing.sm,
    },
    dangerBtnText: {
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.error,
        fontWeight: '600',
    },
});

export default Settings;
