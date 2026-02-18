import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import theme from '../styles/theme';

/**
 * StallDetail Screen
 * Displays comprehensive information about a stall
 */
const StallDetail = ({ route, navigation }) => {
    const { stallId } = route.params;
    const [stall, setStall] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStallDetails();
    }, []);

    const fetchStallDetails = async () => {
        try {
            const response = await fetch(
                `http://localhost:3000/api/v1/stalls/${stallId}`
            );
            const data = await response.json();

            if (data.success) {
                setStall(data.stall);
                setReviews(data.reviews);
            }
        } catch (error) {
            console.error('Error fetching stall details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNavigate = () => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${stall.latitude},${stall.longitude}`;
        Linking.openURL(url);
    };

    const handleReview = () => {
        navigation.navigate('ReviewForm', { stallId: stall.id });
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (!stall) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Stall not found</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.stallName}>{stall.name}</Text>
                <View style={[
                    styles.statusBadge,
                    stall.is_open ? styles.statusOpen : styles.statusClosed
                ]}>
                    <Text style={styles.statusText}>
                        {stall.is_open ? 'OPEN NOW' : 'CLOSED'}
                    </Text>
                </View>
            </View>

            {/* Info Cards */}
            <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                    <Icon name="restaurant" size={20} color={theme.colors.primary} />
                    <Text style={styles.infoLabel}>Cuisine:</Text>
                    <Text style={styles.infoValue}>{stall.cuisine_type}</Text>
                </View>

                {stall.price_range && (
                    <View style={styles.infoRow}>
                        <Icon name="currency-rupee" size={20} color={theme.colors.primary} />
                        <Text style={styles.infoLabel}>Price Range:</Text>
                        <Text style={styles.infoValue}>{stall.price_range}</Text>
                    </View>
                )}

                <View style={styles.infoRow}>
                    <Icon name="star" size={20} color={theme.colors.secondary} />
                    <Text style={styles.infoLabel}>Rating:</Text>
                    <Text style={styles.infoValue}>
                        {stall.avg_rating}/5.0 ({stall.review_count} reviews)
                    </Text>
                </View>

                {stall.hygiene_score > 0 && (
                    <View style={styles.infoRow}>
                        <Icon name="verified-user" size={20} color={theme.colors.hygieneHigh} />
                        <Text style={styles.infoLabel}>Hygiene Score:</Text>
                        <Text style={[styles.infoValue, { color: theme.colors.hygieneHigh }]}>
                            {stall.hygiene_score.toFixed(1)}/5.0
                        </Text>
                    </View>
                )}
            </View>

            {/* Description */}
            {stall.description && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About</Text>
                    <Text style={styles.description}>{stall.description}</Text>
                </View>
            )}

            {/* Menu */}
            {stall.menu_text && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Menu</Text>
                    <Text style={styles.menuText}>{stall.menu_text}</Text>
                </View>
            )}

            {/* Dietary Tags */}
            {stall.dietary_tags && stall.dietary_tags.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Dietary Options</Text>
                    <View style={styles.tagsContainer}>
                        {stall.dietary_tags.map((tag, index) => (
                            <View key={index} style={styles.tag}>
                                <Text style={styles.tagText}>{tag}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {/* Hygiene Showcase */}
            {stall.hygiene_badges?.fssai_verified && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Hygiene Certification</Text>
                    <View style={styles.certificationBadge}>
                        <Icon name="verified" size={24} color={theme.colors.success} />
                        <Text style={styles.certificationText}>FSSAI Verified</Text>
                    </View>
                </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={[styles.button, styles.navigateButton]}
                    onPress={handleNavigate}
                >
                    <Icon name="directions" size={24} color={theme.colors.textLight} />
                    <Text style={styles.buttonText}>Navigate</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.reviewButton]}
                    onPress={handleReview}
                >
                    <Icon name="rate-review" size={24} color={theme.colors.textLight} />
                    <Text style={styles.buttonText}>Write Review</Text>
                </TouchableOpacity>
            </View>

            {/* Reviews Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                    Reviews ({stall.review_count})
                </Text>
                {reviews.map((review) => (
                    <View key={review.id} style={styles.reviewCard}>
                        <View style={styles.reviewHeader}>
                            <Text style={styles.reviewerName}>{review.reviewer_name}</Text>
                            <View style={styles.ratingContainer}>
                                <Icon name="star" size={16} color={theme.colors.secondary} />
                                <Text style={styles.ratingText}>{review.rating}/5</Text>
                            </View>
                        </View>
                        {review.comment && (
                            <Text style={styles.reviewComment}>{review.comment}</Text>
                        )}
                        <View style={styles.hygieneRating}>
                            <Icon name="verified-user" size={14} color={theme.colors.success} />
                            <Text style={styles.hygieneText}>
                                Hygiene: {review.hygiene_score}/5
                            </Text>
                        </View>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: theme.typography.fontSize.lg,
        color: theme.colors.textSecondary,
    },
    header: {
        backgroundColor: theme.colors.primary,
        padding: theme.spacing.lg,
        alignItems: 'center',
    },
    stallName: {
        fontSize: theme.typography.fontSize['2xl'],
        fontFamily: theme.typography.fontFamily.bold,
        color: theme.colors.textLight,
        textAlign: 'center',
    },
    statusBadge: {
        marginTop: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.borderRadius.sm,
    },
    statusOpen: {
        backgroundColor: theme.colors.statusOpen,
    },
    statusClosed: {
        backgroundColor: theme.colors.statusClosed,
    },
    statusText: {
        fontSize: theme.typography.fontSize.sm,
        fontFamily: theme.typography.fontFamily.bold,
        color: theme.colors.textLight,
    },
    infoCard: {
        backgroundColor: theme.colors.surface,
        margin: theme.spacing.md,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.lg,
        ...theme.shadows.sm,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: theme.spacing.xs,
    },
    infoLabel: {
        fontSize: theme.typography.fontSize.sm,
        fontFamily: theme.typography.fontFamily.medium,
        color: theme.colors.textSecondary,
        marginLeft: theme.spacing.sm,
        marginRight: theme.spacing.xs,
    },
    infoValue: {
        fontSize: theme.typography.fontSize.sm,
        fontFamily: theme.typography.fontFamily.regular,
        color: theme.colors.textPrimary,
    },
    section: {
        padding: theme.spacing.md,
    },
    sectionTitle: {
        fontSize: theme.typography.fontSize.lg,
        fontFamily: theme.typography.fontFamily.bold,
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.sm,
    },
    description: {
        fontSize: theme.typography.fontSize.base,
        fontFamily: theme.typography.fontFamily.regular,
        color: theme.colors.textSecondary,
        lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
    },
    menuText: {
        fontSize: theme.typography.fontSize.base,
        fontFamily: theme.typography.fontFamily.regular,
        color: theme.colors.textPrimary,
        lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    tag: {
        backgroundColor: theme.colors.secondary,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.borderRadius.sm,
        marginRight: theme.spacing.xs,
        marginBottom: theme.spacing.xs,
    },
    tagText: {
        fontSize: theme.typography.fontSize.sm,
        fontFamily: theme.typography.fontFamily.medium,
        color: theme.colors.textPrimary,
    },
    certificationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.sm,
        borderRadius: theme.borderRadius.md,
    },
    certificationText: {
        fontSize: theme.typography.fontSize.base,
        fontFamily: theme.typography.fontFamily.semibold,
        color: theme.colors.success,
        marginLeft: theme.spacing.sm,
    },
    actionButtons: {
        flexDirection: 'row',
        padding: theme.spacing.md,
        gap: theme.spacing.sm,
    },
    button: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        ...theme.shadows.md,
    },
    navigateButton: {
        backgroundColor: theme.colors.primary,
    },
    reviewButton: {
        backgroundColor: theme.colors.success,
    },
    buttonText: {
        fontSize: theme.typography.fontSize.base,
        fontFamily: theme.typography.fontFamily.semibold,
        color: theme.colors.textLight,
        marginLeft: theme.spacing.xs,
    },
    reviewCard: {
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        marginBottom: theme.spacing.sm,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.xs,
    },
    reviewerName: {
        fontSize: theme.typography.fontSize.base,
        fontFamily: theme.typography.fontFamily.semibold,
        color: theme.colors.textPrimary,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: theme.typography.fontSize.sm,
        fontFamily: theme.typography.fontFamily.medium,
        color: theme.colors.textPrimary,
        marginLeft: 4,
    },
    reviewComment: {
        fontSize: theme.typography.fontSize.sm,
        fontFamily: theme.typography.fontFamily.regular,
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.xs,
    },
    hygieneRating: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: theme.spacing.xs,
    },
    hygieneText: {
        fontSize: theme.typography.fontSize.xs,
        fontFamily: theme.typography.fontFamily.medium,
        color: theme.colors.success,
        marginLeft: 4,
    },
});

export default StallDetail;
