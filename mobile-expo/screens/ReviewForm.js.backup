import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import theme from '../styles/theme';

/**
 * ReviewForm Screen
 * Structured review flow with hygiene-specific questions
 */
const ReviewForm = ({ route, navigation }) => {
    const { stallId } = route.params;
    const [userId] = useState('user-id-placeholder'); // Get from auth context

    const [rating, setRating] = useState(0);
    const [hygieneScore, setHygieneScore] = useState(0);
    const [comment, setComment] = useState('');

    // Hygiene questions (Yes/No)
    const [hygieneResponses, setHygieneResponses] = useState({
        vendor_wears_gloves: null,
        filtered_water_visible: null,
        clean_utensils: null,
        covered_food_storage: null,
    });

    const [submitting, setSubmitting] = useState(false);

    const hygieneQuestions = [
        { key: 'vendor_wears_gloves', label: 'Did the vendor wear gloves?' },
        { key: 'filtered_water_visible', label: 'Was filtered water visible?' },
        { key: 'clean_utensils', label: 'Were the utensils clean?' },
        { key: 'covered_food_storage', label: 'Was food properly covered?' },
    ];

    const handleHygieneResponse = (key, value) => {
        setHygieneResponses({
            ...hygieneResponses,
            [key]: value,
        });
    };

    const handleSubmit = async () => {
        // Validation
        if (rating === 0) {
            Alert.alert('Rating Required', 'Please provide an overall rating');
            return;
        }

        if (hygieneScore === 0) {
            Alert.alert('Hygiene Score Required', 'Please provide a hygiene score');
            return;
        }

        setSubmitting(true);

        try {
            const response = await fetch('http://localhost:3000/api/v1/stalls/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    stall_id: stallId,
                    user_id: userId,
                    rating,
                    hygiene_score: hygieneScore,
                    hygiene_responses: hygieneResponses,
                    comment: comment.trim() || null,
                }),
            });

            const data = await response.json();

            if (data.success) {
                Alert.alert(
                    'Review Submitted',
                    'Thank you for your feedback!',
                    [
                        {
                            text: 'OK',
                            onPress: () => navigation.goBack(),
                        },
                    ]
                );
            } else {
                throw new Error(data.error || 'Failed to submit review');
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            Alert.alert('Error', error.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    const renderStarRating = (currentRating, setRatingFunc, label) => (
        <View style={styles.ratingSection}>
            <Text style={styles.ratingLabel}>{label}</Text>
            <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                        key={star}
                        onPress={() => setRatingFunc(star)}
                    >
                        <Icon
                            name={star <= currentRating ? 'star' : 'star-border'}
                            size={40}
                            color={star <= currentRating ? theme.colors.secondary : theme.colors.border}
                            style={styles.star}
                        />
                    </TouchableOpacity>
                ))}
            </View>
            <Text style={styles.ratingValue}>{currentRating}/5</Text>
        </View>
    );

    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>How was your experience?</Text>

                {/* Overall Rating */}
                {renderStarRating(rating, setRating, 'Overall Rating')}

                {/* Hygiene Score */}
                <View style={styles.separator} />
                {renderStarRating(hygieneScore, setHygieneScore, 'Hygiene Score')}

                {/* Hygiene Questions */}
                <View style={styles.separator} />
                <Text style={styles.sectionTitle}>Hygiene Checklist</Text>
                <Text style={styles.sectionSubtitle}>
                    Help others know about the hygiene practices
                </Text>

                {hygieneQuestions.map((question) => (
                    <View key={question.key} style={styles.questionContainer}>
                        <Text style={styles.questionText}>{question.label}</Text>
                        <View style={styles.yesNoButtons}>
                            <TouchableOpacity
                                style={[
                                    styles.yesNoButton,
                                    hygieneResponses[question.key] === true && styles.yesButtonActive,
                                ]}
                                onPress={() => handleHygieneResponse(question.key, true)}
                            >
                                <Icon
                                    name="check-circle"
                                    size={24}
                                    color={
                                        hygieneResponses[question.key] === true
                                            ? theme.colors.textLight
                                            : theme.colors.success
                                    }
                                />
                                <Text
                                    style={[
                                        styles.yesNoButtonText,
                                        hygieneResponses[question.key] === true && styles.yesNoButtonTextActive,
                                    ]}
                                >
                                    Yes
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.yesNoButton,
                                    hygieneResponses[question.key] === false && styles.noButtonActive,
                                ]}
                                onPress={() => handleHygieneResponse(question.key, false)}
                            >
                                <Icon
                                    name="cancel"
                                    size={24}
                                    color={
                                        hygieneResponses[question.key] === false
                                            ? theme.colors.textLight
                                            : theme.colors.error
                                    }
                                />
                                <Text
                                    style={[
                                        styles.yesNoButtonText,
                                        hygieneResponses[question.key] === false && styles.yesNoButtonTextActive,
                                    ]}
                                >
                                    No
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}

                {/* Comment */}
                <View style={styles.separator} />
                <Text style={styles.sectionTitle}>Additional Comments (Optional)</Text>
                <TextInput
                    style={styles.commentInput}
                    placeholder="Share your experience..."
                    multiline
                    numberOfLines={4}
                    value={comment}
                    onChangeText={setComment}
                    textAlignVertical="top"
                />

                {/* Submit Button */}
                <TouchableOpacity
                    style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={submitting}
                >
                    <Text style={styles.submitButtonText}>
                        {submitting ? 'Submitting...' : 'Submit Review'}
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        padding: theme.spacing.lg,
    },
    title: {
        fontSize: theme.typography.fontSize['2xl'],
        fontFamily: theme.typography.fontFamily.bold,
        color: theme.colors.textPrimary,
        textAlign: 'center',
        marginBottom: theme.spacing.lg,
    },
    ratingSection: {
        alignItems: 'center',
        marginVertical: theme.spacing.md,
    },
    ratingLabel: {
        fontSize: theme.typography.fontSize.lg,
        fontFamily: theme.typography.fontFamily.semibold,
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.sm,
    },
    starsContainer: {
        flexDirection: 'row',
    },
    star: {
        marginHorizontal: 4,
    },
    ratingValue: {
        fontSize: theme.typography.fontSize.xl,
        fontFamily: theme.typography.fontFamily.bold,
        color: theme.colors.primary,
        marginTop: theme.spacing.xs,
    },
    separator: {
        height: 1,
        backgroundColor: theme.colors.divider,
        marginVertical: theme.spacing.lg,
    },
    sectionTitle: {
        fontSize: theme.typography.fontSize.lg,
        fontFamily: theme.typography.fontFamily.bold,
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.xs,
    },
    sectionSubtitle: {
        fontSize: theme.typography.fontSize.sm,
        fontFamily: theme.typography.fontFamily.regular,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.md,
    },
    questionContainer: {
        marginBottom: theme.spacing.md,
    },
    questionText: {
        fontSize: theme.typography.fontSize.base,
        fontFamily: theme.typography.fontFamily.medium,
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.sm,
    },
    yesNoButtons: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
    },
    yesNoButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        borderWidth: 2,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.background,
    },
    yesButtonActive: {
        backgroundColor: theme.colors.success,
        borderColor: theme.colors.success,
    },
    noButtonActive: {
        backgroundColor: theme.colors.error,
        borderColor: theme.colors.error,
    },
    yesNoButtonText: {
        fontSize: theme.typography.fontSize.base,
        fontFamily: theme.typography.fontFamily.semibold,
        color: theme.colors.textPrimary,
        marginLeft: theme.spacing.xs,
    },
    yesNoButtonTextActive: {
        color: theme.colors.textLight,
    },
    commentInput: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        fontSize: theme.typography.fontSize.base,
        fontFamily: theme.typography.fontFamily.regular,
        color: theme.colors.textPrimary,
        minHeight: 100,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    submitButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
        marginTop: theme.spacing.xl,
        ...theme.shadows.md,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        fontSize: theme.typography.fontSize.lg,
        fontFamily: theme.typography.fontFamily.bold,
        color: theme.colors.textLight,
    },
});

export default ReviewForm;
