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
    Alert,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import theme from '../styles/theme';
import { getUserData } from '../services/storage';
import { API_BASE_URL as API_BASE } from '../config/server';

/**
 * StallDetail Screen
 * Displays comprehensive information about a stall
 */
const StallDetail = ({ route, navigation }) => {
    const { stallId } = route.params;
    const [stall, setStall] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        fetchStallDetails();
        checkFavoriteStatus();
    }, []);

    const fetchStallDetails = async () => {
        // Mock data - used as fallback when API is unavailable
        const mockStalls = {
            '1': {
                id: '1',
                name: "Surena's Stall",
                cuisine_type: 'South Indian',
                description: 'Authentic South Indian delicacies - Crispy Dosas, fluffy Idlis, and piping hot Sambar. Family-run stall serving fresh food since 2015.',
                is_open: true,
                avg_rating: 4.7,
                hygiene_score: 4.5,
                review_count: 156,
                latitude: 19.0760,
                longitude: 72.8777,
                dietary_tags: ['Vegetarian', 'Vegan'],
                menu_text: 'Masala Dosa - ₹60\nIdli Sambar (4 pcs) - ₹40\nFilter Coffee - ₹20\nMedu Vada - ₹30\nUttapam - ₹50',
                price_range: '₹20 - ₹80',
                hygiene_badges: { fssai_verified: true },
                image: require('../assets/surenas_stall.png'),
            },
            '2': {
                id: '2',
                name: "Raju's Chaat Corner",
                cuisine_type: 'North Indian Street Food',
                description: 'Famous for Pani Puri, Bhel Puri, and Sev Puri since 1985. A local favorite!',
                is_open: true,
                avg_rating: 4.5,
                hygiene_score: 4.2,
                review_count: 230,
                latitude: 19.0765,
                longitude: 72.8780,
                dietary_tags: ['Vegetarian', 'Jain'],
                menu_text: 'Pani Puri (6 pcs) - ₹30\nBhel Puri - ₹40\nSev Puri - ₹45\nDahi Puri - ₹50',
                price_range: '₹30 - ₹60',
                image: require('../assets/rajus_chaat.png'),
            },
            '3': {
                id: '3',
                name: 'Biryani Express',
                cuisine_type: 'Hyderabadi',
                description: 'Authentic Dum Biryani and Haleem prepared with traditional recipes.',
                is_open: false,
                avg_rating: 4.3,
                hygiene_score: 4.0,
                review_count: 89,
                latitude: 19.0750,
                longitude: 72.8790,
                dietary_tags: ['Halal', 'Non-Veg'],
                menu_text: 'Chicken Biryani - ₹120\nMutton Biryani - ₹180\nHaleem - ₹100',
                price_range: '₹100 - ₹200',
                image: require('../assets/biryani_express.png'),
            },
        };

        const mockReviews = [
            { id: 'r1', reviewer_name: 'Priya M.', rating: 5, hygiene_score: 5, comment: 'Best dosa in the area! Super crispy and the sambar is amazing.', photos: ['https://images.unsplash.com/photo-1630383249896-424e482df921?w=300'], date: '2 days ago' },
            { id: 'r2', reviewer_name: 'Rahul K.', rating: 4, hygiene_score: 4, comment: 'Good food, reasonable prices. Always fresh.', photos: [], date: '1 week ago' },
            { id: 'r3', reviewer_name: 'Anita S.', rating: 5, hygiene_score: 5, comment: 'Love the filter coffee! Authentic taste.', photos: ['https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300'], date: '2 weeks ago' },
        ];

        try {
            const response = await fetch(`${API_BASE}/stalls/${stallId}`);
            const data = await response.json();

            if (data.success && data.stall) {
                setStall(data.stall);
                setReviews(data.reviews || []);
            } else {
                // API returned but no stall data - use mock
                console.log('API returned no stall data, using mock');
                setStall(mockStalls[stallId] || mockStalls['1']);
                setReviews(mockReviews);
            }
        } catch (error) {
            console.log('API unavailable, using mock data:', error.message);
            // Use mock data as fallback
            setStall(mockStalls[stallId] || mockStalls['1']);
            setReviews(mockReviews);
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

    const checkFavoriteStatus = async () => {
        try {
            const userData = await getUserData();
            if (userData?.id) {
                const response = await fetch(
                    `${API_BASE}/users/${userData.id}/favorites/${stallId}/check`
                );
                const data = await response.json();
                if (data.success) {
                    setIsFavorite(data.is_favorited);
                }
            }
        } catch (error) {
            // Silently fail, default to not favorited
        }
    };

    const toggleFavorite = async () => {
        try {
            const userData = await getUserData();
            if (!userData?.id) {
                Alert.alert('Login Required', 'Please login to add favorites.');
                return;
            }

            const method = isFavorite ? 'DELETE' : 'POST';
            await fetch(
                `${API_BASE}/users/${userData.id}/favorites/${stallId}`,
                { method }
            );

            setIsFavorite(!isFavorite);
        } catch (error) {
            console.log('Toggling favorite locally:', error.message);
            setIsFavorite(!isFavorite);
        }
    };

    const handleReport = () => {
        navigation.navigate('ReportStall', {
            stallId: stall.id,
            stallName: stall.name,
        });
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
            {/* Stall Header Image */}
            {stall.image && (
                <Image source={stall.image} style={styles.headerImage} resizeMode="cover" />
            )}

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
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
                <TouchableOpacity onPress={toggleFavorite} style={styles.favoriteBtn}>
                    <Icon
                        name={isFavorite ? 'favorite' : 'favorite-border'}
                        size={28}
                        color={isFavorite ? theme.colors.error : 'white'}
                    />
                </TouchableOpacity>
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

            {/* Report Issue Button */}
            <TouchableOpacity style={styles.reportButton} onPress={handleReport}>
                <Icon name="flag" size={18} color={theme.colors.textSecondary} />
                <Text style={styles.reportText}>Report an issue with this stall</Text>
            </TouchableOpacity>

            {/* Reviews Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                    Reviews ({stall.review_count})
                </Text>
                {reviews.map((review) => (
                    <View key={review.id} style={styles.reviewCard}>
                        <View style={styles.reviewHeader}>
                            <View>
                                <Text style={styles.reviewerName}>{review.reviewer_name}</Text>
                                {review.date && (
                                    <Text style={styles.reviewDate}>{review.date}</Text>
                                )}
                            </View>
                            <View style={styles.ratingContainer}>
                                <Icon name="star" size={16} color={theme.colors.secondary} />
                                <Text style={styles.ratingText}>{review.rating}/5</Text>
                            </View>
                        </View>
                        {review.comment && (
                            <Text style={styles.reviewComment}>{review.comment}</Text>
                        )}
                        {/* Review Photos */}
                        {review.photos && review.photos.length > 0 && (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.reviewPhotosScroll}>
                                {review.photos.map((photoUri, index) => (
                                    <Image
                                        key={index}
                                        source={{ uri: photoUri }}
                                        style={styles.reviewPhoto}
                                        resizeMode="cover"
                                    />
                                ))}
                            </ScrollView>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerContent: {
        flex: 1,
        alignItems: 'flex-start',
    },
    favoriteBtn: {
        padding: theme.spacing.sm,
    },
    stallName: {
        fontSize: theme.typography.fontSize['2xl'],
        fontFamily: theme.typography.fontFamily.bold,
        color: theme.colors.textLight,
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
    reportButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        gap: theme.spacing.xs,
    },
    reportText: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textSecondary,
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
    headerImage: {
        width: '100%',
        height: 200,
    },
    reviewDate: {
        fontSize: theme.typography.fontSize.xs,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    reviewPhotosScroll: {
        marginTop: theme.spacing.sm,
        marginBottom: theme.spacing.xs,
    },
    reviewPhoto: {
        width: 100,
        height: 100,
        borderRadius: theme.borderRadius.md,
        marginRight: theme.spacing.sm,
    },
});

export default StallDetail;
