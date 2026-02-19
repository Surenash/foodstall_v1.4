import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import theme from '../styles/theme';

/**
 * StallCard Component
 * 
 * Displays stall information in a card format with:
 * - Stall photo
 * - Stall name and cuisine type
 * - Distance from user's location
 * - Dynamic Open/Closed status badge
 * - Hygiene score indicator
 * 
 * Props:
 * - stall: Stall object from API
 * - onPress: Function to call when card is tapped
 */
const StallCard = ({ stall, onPress }) => {
    const {
        name,
        cuisine_type,
        distance_km,
        is_open,
        hygiene_score = 0,
        avg_rating = 0,
        rating = 0,
        price_range,
        image,
    } = stall;

    const displayRating = avg_rating || rating || 0;

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            activeOpacity={0.7}
        >
            {/* Stall Image */}
            {image ? (
                <Image source={image} style={styles.stallImage} resizeMode="cover" />
            ) : (
                <View style={styles.imagePlaceholder}>
                    <Icon name="store" size={48} color={theme.colors.textSecondary} />
                </View>
            )}

            {/* Header: Name and Status */}
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    <Text style={styles.name} numberOfLines={1}>
                        {name}
                    </Text>
                    <Text style={styles.cuisineType}>{cuisine_type}</Text>
                </View>

                {/* Dynamic Status Badge */}
                <View style={[
                    styles.statusBadge,
                    is_open ? styles.statusOpen : styles.statusClosed
                ]}>
                    <Text style={styles.statusText}>
                        {is_open ? 'OPEN' : 'CLOSED'}
                    </Text>
                </View>
            </View>

            {/* Info Row: Distance, Rating, Price */}
            <View style={styles.infoRow}>
                {/* Distance */}
                <View style={styles.infoItem}>
                    <Icon name="location-on" size={16} color={theme.colors.primary} />
                    <Text style={styles.infoText}>{distance_km} km away</Text>
                </View>

                {/* Rating */}
                {parseFloat(displayRating) > 0 && (
                    <View style={styles.infoItem}>
                        <Icon name="star" size={16} color={theme.colors.secondary} />
                        <Text style={styles.infoText}>{displayRating}</Text>
                    </View>
                )}

                {/* Price Range */}
                {price_range && (
                    <View style={styles.infoItem}>
                        <Icon name="currency-rupee" size={16} color={theme.colors.textSecondary} />
                        <Text style={styles.infoText}>{price_range}</Text>
                    </View>
                )}
            </View>

            {/* Hygiene Score */}
            {hygiene_score > 0 && (
                <View style={styles.hygieneContainer}>
                    <Icon
                        name="verified-user"
                        size={18}
                        color={getHygieneColor(hygiene_score)}
                    />
                    <Text style={[styles.hygieneText, { color: getHygieneColor(hygiene_score) }]}>
                        Hygiene Score: {hygiene_score.toFixed(1)}/5.0
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

// Helper function to get hygiene color based on score
const getHygieneColor = (score) => {
    if (score >= 4) return theme.colors.hygieneHigh;
    if (score >= 3) return theme.colors.hygieneMedium;
    return theme.colors.hygieneLow;
};

const styles = StyleSheet.create({
    card: {
        ...theme.components.stallCard,
        overflow: 'hidden',
    },
    stallImage: {
        width: '100%',
        height: 150,
        borderRadius: theme.borderRadius.md,
        marginBottom: theme.spacing.sm,
    },
    imagePlaceholder: {
        width: '100%',
        height: 100,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        marginBottom: theme.spacing.sm,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: theme.spacing.sm,
    },
    titleContainer: {
        flex: 1,
        marginRight: theme.spacing.sm,
    },
    name: {
        fontSize: theme.typography.fontSize.lg,
        fontFamily: theme.typography.fontFamily.bold,
        color: theme.colors.textPrimary,
        marginBottom: 2,
    },
    cuisineType: {
        fontSize: theme.typography.fontSize.sm,
        fontFamily: theme.typography.fontFamily.regular,
        color: theme.colors.textSecondary,
    },
    statusBadge: {
        paddingHorizontal: theme.spacing.sm,
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
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: theme.spacing.xs,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: theme.spacing.md,
        marginTop: theme.spacing.xs,
    },
    infoText: {
        fontSize: theme.typography.fontSize.sm,
        fontFamily: theme.typography.fontFamily.regular,
        color: theme.colors.textSecondary,
        marginLeft: 4,
    },
    hygieneContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: theme.spacing.xs,
        paddingTop: theme.spacing.xs,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    hygieneText: {
        fontSize: theme.typography.fontSize.sm,
        fontFamily: theme.typography.fontFamily.semibold,
        marginLeft: theme.spacing.xs,
    },
});

export default StallCard;
