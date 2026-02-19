import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Linking,
    Image,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import theme from '../styles/theme';

const APP_VERSION = '1.0.0';
const BUILD_NUMBER = '2026.01.28';

/**
 * About Screen
 * App information, version, credits, and links
 */
const About = ({ navigation }) => {
    const openLink = (url) => {
        Linking.openURL(url).catch(err => console.error('Error opening link:', err));
    };

    const LinkRow = ({ icon, title, subtitle, onPress }) => (
        <TouchableOpacity style={styles.linkRow} onPress={onPress}>
            <Icon name={icon} size={24} color={theme.colors.primary} />
            <View style={styles.linkContent}>
                <Text style={styles.linkTitle}>{title}</Text>
                {subtitle && <Text style={styles.linkSubtitle}>{subtitle}</Text>}
            </View>
            <Icon name="chevron-right" size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container}>
            {/* App Logo and Info */}
            <View style={styles.header}>
                <View style={styles.logoContainer}>
                    <Icon name="restaurant" size={50} color="white" />
                </View>
                <Text style={styles.appName}>Food Stall Discovery</Text>
                <Text style={styles.version}>Version {APP_VERSION}</Text>
                <Text style={styles.build}>Build {BUILD_NUMBER}</Text>
            </View>

            {/* Description */}
            <View style={styles.section}>
                <Text style={styles.description}>
                    Discover the best street food stalls near you! Get real-time open/closed status,
                    hygiene ratings, and honest reviews from fellow food lovers.
                </Text>
            </View>

            {/* Links */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Links</Text>

                <LinkRow
                    icon="language"
                    title="Website"
                    subtitle="www.foodstallapp.com"
                    onPress={() => openLink('https://foodstallapp.com')}
                />

                <LinkRow
                    icon="description"
                    title="Terms of Service"
                    onPress={() => openLink('https://foodstallapp.com/terms')}
                />

                <LinkRow
                    icon="privacy-tip"
                    title="Privacy Policy"
                    onPress={() => openLink('https://foodstallapp.com/privacy')}
                />

                <LinkRow
                    icon="article"
                    title="Open Source Licenses"
                    onPress={() => navigation.navigate('Licenses')}
                />
            </View>

            {/* Contact */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Contact Us</Text>

                <LinkRow
                    icon="email"
                    title="Email Support"
                    subtitle="support@foodstallapp.com"
                    onPress={() => openLink('mailto:support@foodstallapp.com')}
                />

                <LinkRow
                    icon="chat"
                    title="Twitter"
                    subtitle="@foodstallapp"
                    onPress={() => openLink('https://twitter.com/foodstallapp')}
                />
            </View>

            {/* Credits */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Credits</Text>
                <Text style={styles.creditsText}>
                    Made with ❤️ in India{'\n'}
                    Icons by Material Design Icons{'\n'}
                    Built with React Native & Expo
                </Text>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    © 2026 Food Stall Discovery App{'\n'}
                    All rights reserved
                </Text>
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
    header: {
        alignItems: 'center',
        paddingVertical: theme.spacing.xl,
        backgroundColor: theme.colors.primary,
    },
    logoContainer: {
        width: 100,
        height: 100,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    appName: {
        fontSize: theme.typography.fontSize['2xl'],
        fontWeight: 'bold',
        color: 'white',
    },
    version: {
        fontSize: theme.typography.fontSize.base,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 4,
    },
    build: {
        fontSize: theme.typography.fontSize.sm,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 2,
    },
    section: {
        padding: theme.spacing.md,
    },
    sectionTitle: {
        fontSize: theme.typography.fontSize.lg,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.md,
    },
    description: {
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.textSecondary,
        lineHeight: 24,
        textAlign: 'center',
    },
    linkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        marginBottom: theme.spacing.sm,
        ...theme.shadows.sm,
    },
    linkContent: {
        flex: 1,
        marginLeft: theme.spacing.md,
    },
    linkTitle: {
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.textPrimary,
        fontWeight: '500',
    },
    linkSubtitle: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    creditsText: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textSecondary,
        lineHeight: 22,
        textAlign: 'center',
    },
    footer: {
        paddingVertical: theme.spacing.xl,
        alignItems: 'center',
    },
    footerText: {
        fontSize: theme.typography.fontSize.xs,
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
});

export default About;
