import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import theme from '../styles/theme';

/**
 * LanguageSelection Screen
 * Onboarding screen for language selection
 */
const LanguageSelection = ({ navigation }) => {
    const [selectedLanguage, setSelectedLanguage] = useState('en');

    const languages = [
        { code: 'en', name: 'English', nativeName: 'English' },
        { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
        { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
        { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
        { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
        { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
        { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
        { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
        { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
        { code: 'or', name: 'Oriya', nativeName: 'ଓଡ଼ିଆ' },
        { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
        { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
    ];

    const handleContinue = async () => {
        // Save language preference
        await AsyncStorage.setItem('language', selectedLanguage);

        // Navigate to login screen
        navigation.replace('LoginScreen');
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Image
                    source={require('../assets/logo_icon.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <Text style={styles.appName}>Street Eat</Text>
                <Text style={styles.subtitle}>Choose your preferred language</Text>
            </View>

            <ScrollView style={styles.languageList}>
                {languages.map((language) => (
                    <TouchableOpacity
                        key={language.code}
                        style={[
                            styles.languageCard,
                            selectedLanguage === language.code && styles.languageCardActive,
                        ]}
                        onPress={() => setSelectedLanguage(language.code)}
                    >
                        <View style={styles.languageInfo}>
                            <Text style={styles.languageName}>{language.name}</Text>
                            <Text style={styles.languageNativeName}>{language.nativeName}</Text>
                        </View>
                        {selectedLanguage === language.code && (
                            <View style={styles.checkmark}>
                                <Text style={styles.checkmarkText}>✓</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
                <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        padding: theme.spacing.lg,
    },
    header: {
        alignItems: 'center',
        paddingVertical: theme.spacing['2xl'],
    },
    logo: {
        width: 100,
        height: 100,
        marginBottom: theme.spacing.md,
    },
    appName: {
        fontSize: theme.typography.fontSize['2xl'],
        fontFamily: theme.typography.fontFamily.bold,
        color: theme.colors.primary,
        marginBottom: theme.spacing.xs,
    },
    subtitle: {
        fontSize: theme.typography.fontSize.base,
        fontFamily: theme.typography.fontFamily.regular,
        color: theme.colors.textSecondary,
    },
    languageList: {
        flex: 1,
        marginTop: theme.spacing.lg,
    },
    languageCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.lg,
        borderRadius: theme.borderRadius.lg,
        marginBottom: theme.spacing.sm,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    languageCardActive: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.background,
    },
    languageInfo: {
        flex: 1,
    },
    languageName: {
        fontSize: theme.typography.fontSize.lg,
        fontFamily: theme.typography.fontFamily.semibold,
        color: theme.colors.textPrimary,
    },
    languageNativeName: {
        fontSize: theme.typography.fontSize.base,
        fontFamily: theme.typography.fontFamily.regular,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    checkmark: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkmarkText: {
        color: theme.colors.textLight,
        fontSize: theme.typography.fontSize.lg,
        fontFamily: theme.typography.fontFamily.bold,
    },
    continueButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: theme.spacing.lg,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
        ...theme.shadows.md,
    },
    continueButtonText: {
        fontSize: theme.typography.fontSize.lg,
        fontFamily: theme.typography.fontFamily.bold,
        color: theme.colors.textLight,
    },
});

export default LanguageSelection;
