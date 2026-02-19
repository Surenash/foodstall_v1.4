import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    Image,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import theme from '../styles/theme';
import { API_BASE_URL } from '../config/server';

/**
 * ReviewForm Screen
 * Structured review flow with hygiene-specific questions and photo upload
 */
const ReviewForm = ({ route, navigation }) => {
    const { stallId } = route.params;
    const [userId] = useState('user-id-placeholder'); // Get from auth context

    const [rating, setRating] = useState(0);
    const [hygieneScore, setHygieneScore] = useState(0);
    const [comment, setComment] = useState('');
    const [photos, setPhotos] = useState([]); // Array of photo URIs

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

    const pickImage = async (useCamera = false) => {
        // Request permissions
        if (useCamera) {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Camera permission is required');
                return;
            }
        }

        const options = {
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 0.7,
            selectionLimit: 5 - photos.length, // Max 5 photos
        };

        let result;
        if (useCamera) {
            result = await ImagePicker.launchCameraAsync(options);
        } else {
            result = await ImagePicker.launchImageLibraryAsync(options);
        }

        if (!result.canceled && result.assets) {
            const newPhotos = result.assets.map(asset => asset.uri);
            setPhotos([...photos, ...newPhotos].slice(0, 5)); // Max 5
        }
    };

    const removePhoto = (index) => {
        setPhotos(photos.filter((_, i) => i !== index));
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
            const response = await fetch(`${API_BASE_URL}/stalls/reviews`, {
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

                {/* Photo Upload Section */}
                <View style={styles.separator} />
                <Text style={styles.sectionTitle}>Add Photos (Optional)</Text>
                <Text style={styles.sectionSubtitle}>
                    Share up to 5 photos of your food
                </Text>

                {/* Photo Buttons */}
                <View style={styles.photoButtons}>
                    <TouchableOpacity
                        style={styles.photoButton}
                        onPress={() => pickImage(false)}
                        disabled={photos.length >= 5}
                    >
                        <Icon name="photo-library" size={24} color={theme.colors.primary} />
                        <Text style={styles.photoButtonText}>Gallery</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.photoButton}
                        onPress={() => pickImage(true)}
                        disabled={photos.length >= 5}
                    >
                        <Icon name="camera-alt" size={24} color={theme.colors.primary} />
                        <Text style={styles.photoButtonText}>Camera</Text>
                    </TouchableOpacity>
                </View>

                {/* Photo Preview Grid */}
                {photos.length > 0 && (
                    <View style={styles.photoGrid}>
                        {photos.map((uri, index) => (
                            <View key={index} style={styles.photoWrapper}>
                                <Image source={{ uri }} style={styles.photoPreview} />
                                <TouchableOpacity
                                    style={styles.removePhotoBtn}
                                    onPress={() => removePhoto(index)}
                                >
                                    <Icon name="close" size={16} color="white" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}

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
        marginBottom: theme.spacing.xs,
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
    photoButtons: {
        flexDirection: 'row',
        gap: theme.spacing.md,
        marginTop: theme.spacing.sm,
    },
    photoButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.md,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.primary,
        borderStyle: 'dashed',
        gap: theme.spacing.xs,
    },
    photoButtonText: {
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.primary,
        fontWeight: '500',
    },
    photoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.sm,
        marginTop: theme.spacing.md,
    },
    photoWrapper: {
        position: 'relative',
    },
    photoPreview: {
        width: 80,
        height: 80,
        borderRadius: theme.borderRadius.md,
    },
    removePhotoBtn: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: theme.colors.error,
        borderRadius: 12,
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default ReviewForm;
