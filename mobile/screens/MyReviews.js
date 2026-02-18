import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import theme from '../styles/theme';
import { getUserData } from '../services/storage';
import { API_BASE_URL as API_BASE } from '../config/server';

/**
 * MyReviews Screen
 * Shows user's review history with edit/delete options
 */
const MyReviews = ({ navigation }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const userData = await getUserData();
            if (!userData?.id) {
                setLoading(false);
                return;
            }

            const response = await fetch(`${API_BASE}/users/${userData.id}/reviews`);
            const data = await response.json();

            if (data.success) {
                setReviews(data.reviews);
            }
        } catch (error) {
            console.log('Using mock reviews:', error.message);
            // Mock data as fallback
            setReviews([
                {
                    id: 'r1',
                    stall_id: '1',
                    stall_name: "Surena's Stall",
                    cuisine_type: 'South Indian',
                    rating: 5,
                    hygiene_score: 5,
                    comment: 'Amazing dosas! The sambar is so flavorful and the chutney is fresh.',
                    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
                },
                {
                    id: 'r2',
                    stall_id: '2',
                    stall_name: "Raju's Chaat Corner",
                    cuisine_type: 'Street Food',
                    rating: 4,
                    hygiene_score: 4,
                    comment: 'Great pani puri. The pani has the perfect amount of spice.',
                    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
                },
                {
                    id: 'r3',
                    stall_id: '3',
                    stall_name: 'Biryani Express',
                    cuisine_type: 'Hyderabadi',
                    rating: 3,
                    hygiene_score: 3,
                    comment: 'Decent biryani but a bit overpriced for the portion size.',
                    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
                },
            ]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchReviews();
    }, []);

    const deleteReview = async (reviewId) => {
        Alert.alert(
            'Delete Review',
            'Are you sure you want to delete this review? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const userData = await getUserData();
                            if (userData?.id) {
                                await fetch(`${API_BASE}/users/${userData.id}/reviews/${reviewId}`, {
                                    method: 'DELETE',
                                });
                            }
                            setReviews(reviews.filter(r => r.id !== reviewId));
                            Alert.alert('Deleted', 'Your review has been deleted.');
                        } catch (error) {
                            console.error('Error deleting review:', error);
                            // Still remove locally for demo
                            setReviews(reviews.filter(r => r.id !== reviewId));
                        }
                    },
                },
            ]
        );
    };

    const renderStars = (count) => {
        return (
            <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((i) => (
                    <Icon
                        key={i}
                        name={i <= count ? 'star' : 'star-border'}
                        size={16}
                        color={theme.colors.secondary}
                    />
                ))}
            </View>
        );
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return date.toLocaleDateString();
    };

    const renderReview = ({ item }) => (
        <View style={styles.reviewCard}>
            <TouchableOpacity
                style={styles.stallInfo}
                onPress={() => navigation.navigate('StallDetail', { stallId: item.stall_id })}
            >
                <Text style={styles.stallName}>{item.stall_name}</Text>
                <Text style={styles.cuisineType}>{item.cuisine_type}</Text>
            </TouchableOpacity>

            <View style={styles.ratingsRow}>
                <View style={styles.ratingItem}>
                    <Text style={styles.ratingLabel}>Rating</Text>
                    {renderStars(item.rating)}
                </View>
                <View style={styles.ratingItem}>
                    <Text style={styles.ratingLabel}>Hygiene</Text>
                    <View style={styles.hygieneScore}>
                        <Icon name="verified-user" size={14} color={theme.colors.success} />
                        <Text style={styles.hygieneText}>{item.hygiene_score}/5</Text>
                    </View>
                </View>
            </View>

            {item.comment && (
                <Text style={styles.comment}>"{item.comment}"</Text>
            )}

            <View style={styles.footer}>
                <Text style={styles.date}>{formatDate(item.created_at)}</Text>
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => navigation.navigate('ReviewForm', {
                            stallId: item.stall_id,
                            editMode: true,
                            reviewId: item.id,
                            initialRating: item.rating,
                            initialHygiene: item.hygiene_score,
                            initialComment: item.comment,
                        })}
                    >
                        <Icon name="edit" size={18} color={theme.colors.primary} />
                        <Text style={styles.actionText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => deleteReview(item.id)}
                    >
                        <Icon name="delete" size={18} color={theme.colors.error} />
                        <Text style={[styles.actionText, { color: theme.colors.error }]}>Delete</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (reviews.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Icon name="rate-review" size={80} color={theme.colors.border} />
                <Text style={styles.emptyTitle}>No Reviews Yet</Text>
                <Text style={styles.emptySubtitle}>
                    Share your experience by reviewing stalls you've visited
                </Text>
                <TouchableOpacity
                    style={styles.browseBtn}
                    onPress={() => navigation.navigate('Main')}
                >
                    <Text style={styles.browseBtnText}>Find Stalls to Review</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={reviews}
                renderItem={renderReview}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[theme.colors.primary]}
                    />
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        padding: theme.spacing.md,
        paddingBottom: 100,
    },
    reviewCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
        ...theme.shadows.sm,
    },
    stallInfo: {
        marginBottom: theme.spacing.sm,
    },
    stallName: {
        fontSize: theme.typography.fontSize.lg,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
    },
    cuisineType: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    ratingsRow: {
        flexDirection: 'row',
        marginBottom: theme.spacing.md,
        gap: theme.spacing.xl,
    },
    ratingItem: {},
    ratingLabel: {
        fontSize: theme.typography.fontSize.xs,
        color: theme.colors.textSecondary,
        marginBottom: 4,
    },
    starsContainer: {
        flexDirection: 'row',
    },
    hygieneScore: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    hygieneText: {
        fontSize: theme.typography.fontSize.sm,
        fontWeight: '600',
        color: theme.colors.success,
    },
    comment: {
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.textSecondary,
        fontStyle: 'italic',
        lineHeight: 22,
        marginBottom: theme.spacing.md,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        paddingTop: theme.spacing.sm,
    },
    date: {
        fontSize: theme.typography.fontSize.xs,
        color: theme.colors.textSecondary,
    },
    actions: {
        flexDirection: 'row',
        gap: theme.spacing.md,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    actionText: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.primary,
        fontWeight: '500',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.xl,
    },
    emptyTitle: {
        fontSize: theme.typography.fontSize.xl,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        marginTop: theme.spacing.lg,
    },
    emptySubtitle: {
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginTop: theme.spacing.sm,
    },
    browseBtn: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        marginTop: theme.spacing.xl,
    },
    browseBtnText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: theme.typography.fontSize.base,
    },
});

export default MyReviews;
