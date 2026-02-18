import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Linking,
    TextInput,
    Alert,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import theme from '../styles/theme';

const FAQ_DATA = [
    {
        question: 'How do I find stalls near me?',
        answer: 'Open the app and allow location access. The map will automatically show stalls near your current location. You can also use the list view to browse all stalls sorted by distance.',
    },
    {
        question: 'How do stall statuses work?',
        answer: 'Stall owners update their open/closed status in real-time through the app. You\'ll see a green "OPEN" badge when they\'re serving and red "CLOSED" when they\'re not.',
    },
    {
        question: 'What are hygiene scores?',
        answer: 'Hygiene scores are based on user reviews about cleanliness, food handling, and safety practices. Higher scores indicate better hygiene as reported by multiple customers.',
    },
    {
        question: 'How do I add a stall to favorites?',
        answer: 'Tap the heart icon on any stall card or on the stall details page. Your favorites are saved and you can access them from your profile.',
    },
    {
        question: 'Can I edit or delete my reviews?',
        answer: 'Yes! Go to your Profile → My Reviews to see all your reviews. You can edit or delete any of them.',
    },
    {
        question: 'How do I report an issue with a stall?',
        answer: 'On the stall details page, tap the menu icon and select "Report Issue". You can report incorrect information, hygiene concerns, or suggest that a stall is closed permanently.',
    },
    {
        question: 'How can I suggest a new stall?',
        answer: 'Go to Settings → Report/Suggest and choose "Suggest New Stall". Provide the stall name, location, and any other details you know.',
    },
];

/**
 * Help Screen
 * FAQ and contact support options
 */
const Help = ({ navigation }) => {
    const [expandedFaq, setExpandedFaq] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredFaqs = FAQ_DATA.filter(
        faq =>
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleFaq = (index) => {
        setExpandedFaq(expandedFaq === index ? null : index);
    };

    const contactSupport = (method) => {
        switch (method) {
            case 'email':
                Linking.openURL('mailto:support@foodstallapp.com?subject=Help Request');
                break;
            case 'phone':
                Alert.alert(
                    'Call Support',
                    'Call our support line?\n+91 1800 123 4567',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Call', onPress: () => Linking.openURL('tel:+911800123456') }
                    ]
                );
                break;
            case 'chat':
                Alert.alert('Coming Soon', 'Live chat support will be available soon!');
                break;
        }
    };

    return (
        <ScrollView style={styles.container}>
            {/* Search */}
            <View style={styles.searchContainer}>
                <Icon name="search" size={20} color={theme.colors.textSecondary} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search help articles..."
                    placeholderTextColor={theme.colors.textSecondary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Icon name="close" size={20} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                )}
            </View>

            {/* FAQ Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

                {filteredFaqs.length === 0 ? (
                    <Text style={styles.noResults}>No matching questions found</Text>
                ) : (
                    filteredFaqs.map((faq, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.faqCard}
                            onPress={() => toggleFaq(index)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.faqHeader}>
                                <Text style={styles.faqQuestion}>{faq.question}</Text>
                                <Icon
                                    name={expandedFaq === index ? 'expand-less' : 'expand-more'}
                                    size={24}
                                    color={theme.colors.primary}
                                />
                            </View>
                            {expandedFaq === index && (
                                <Text style={styles.faqAnswer}>{faq.answer}</Text>
                            )}
                        </TouchableOpacity>
                    ))
                )}
            </View>

            {/* Contact Support */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Need More Help?</Text>

                <View style={styles.contactOptions}>
                    <TouchableOpacity
                        style={styles.contactCard}
                        onPress={() => contactSupport('email')}
                    >
                        <Icon name="email" size={32} color={theme.colors.primary} />
                        <Text style={styles.contactTitle}>Email</Text>
                        <Text style={styles.contactSubtitle}>Get reply in 24h</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.contactCard}
                        onPress={() => contactSupport('phone')}
                    >
                        <Icon name="phone" size={32} color={theme.colors.success} />
                        <Text style={styles.contactTitle}>Call</Text>
                        <Text style={styles.contactSubtitle}>10am - 6pm</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.contactCard}
                        onPress={() => contactSupport('chat')}
                    >
                        <Icon name="chat" size={32} color={theme.colors.secondary} />
                        <Text style={styles.contactTitle}>Chat</Text>
                        <Text style={styles.contactSubtitle}>Coming soon</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Quick Links */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Quick Links</Text>

                <TouchableOpacity
                    style={styles.quickLink}
                    onPress={() => navigation.navigate('About')}
                >
                    <Icon name="info" size={20} color={theme.colors.primary} />
                    <Text style={styles.quickLinkText}>About the App</Text>
                    <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.quickLink}
                    onPress={() => navigation.navigate('ReportStall', {})}
                >
                    <Icon name="feedback" size={20} color={theme.colors.primary} />
                    <Text style={styles.quickLinkText}>Send Feedback</Text>
                    <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        margin: theme.spacing.md,
        paddingHorizontal: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        ...theme.shadows.sm,
    },
    searchInput: {
        flex: 1,
        paddingVertical: theme.spacing.md,
        marginLeft: theme.spacing.sm,
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.textPrimary,
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
    faqCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        marginBottom: theme.spacing.sm,
        overflow: 'hidden',
        ...theme.shadows.sm,
    },
    faqHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.md,
    },
    faqQuestion: {
        flex: 1,
        fontSize: theme.typography.fontSize.base,
        fontWeight: '600',
        color: theme.colors.textPrimary,
    },
    faqAnswer: {
        paddingHorizontal: theme.spacing.md,
        paddingBottom: theme.spacing.md,
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textSecondary,
        lineHeight: 22,
    },
    noResults: {
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        paddingVertical: theme.spacing.xl,
    },
    contactOptions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: theme.spacing.sm,
    },
    contactCard: {
        flex: 1,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        alignItems: 'center',
        ...theme.shadows.sm,
    },
    contactTitle: {
        fontSize: theme.typography.fontSize.base,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        marginTop: theme.spacing.sm,
    },
    contactSubtitle: {
        fontSize: theme.typography.fontSize.xs,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    quickLink: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        marginBottom: theme.spacing.sm,
        ...theme.shadows.sm,
    },
    quickLinkText: {
        flex: 1,
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.textPrimary,
        marginLeft: theme.spacing.md,
    },
});

export default Help;
