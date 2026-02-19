import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    RefreshControl,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import theme from '../styles/theme';
import { getUserData } from '../services/storage';
import { API_BASE_URL as API_BASE } from '../config/server';

/**
 * Favorites Screen
 * Shows user's favorite/bookmarked stalls
 */
const Favorites = ({ navigation }) => {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchFavorites();
    }, []);

    const fetchFavorites = async () => {
        try {
            const userData = await getUserData();
            if (!userData?.id) {
                setLoading(false);
                return;
            }

            const response = await fetch(`${API_BASE}/users/${userData.id}/favorites`);
            const data = await response.json();

            if (data.success) {
                setFavorites(data.favorites);
            }
        } catch (error) {
            console.log('Using mock favorites:', error.message);
            // Mock data as fallback
            setFavorites([
                {
                    id: '1',
                    name: "Surena's Stall",
                    cuisine_type: 'South Indian',
                    avg_rating: 4.7,
                    is_open: true,
                    image: require('../assets/surenas_stall (1).png'),
                },
                {
                    id: '2',
                    name: "Raju's Chaat Corner",
                    cuisine_type: 'North Indian Street Food',
                    avg_rating: 4.5,
                    is_open: true,
                    image: require('../assets/rajus_chaat (1).png'),
                },
            ]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchFavorites();
    }, []);

    const removeFavorite = async (id) => {
        Alert.alert(
            'Remove Favorite',
            'Are you sure you want to remove this stall from favorites?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const userData = await getUserData();
                            if (userData?.id) {
                                await fetch(`${API_BASE}/users/${userData.id}/favorites/${id}`, {
                                    method: 'DELETE',
                                });
                            }
                            setFavorites(favorites.filter(f => f.id !== id));
                        } catch (error) {
                            console.error('Error removing favorite:', error);
                            // Still remove locally
                            setFavorites(favorites.filter(f => f.id !== id));
                        }
                    },
                },
            ]
        );
    };

    const getImageSource = (item) => {
        if (item.image) {
            return item.image;
        }
        // Default placeholder based on cuisine
        return require('../assets/surenas_stall (1).png');
    };

    const renderFavorite = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('StallDetail', { stallId: item.id })}
        >
            <Image source={getImageSource(item)} style={styles.cardImage} />
            <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
                    <TouchableOpacity onPress={() => removeFavorite(item.id)}>
                        <Icon name="favorite" size={24} color={theme.colors.error} />
                    </TouchableOpacity>
                </View>
                <Text style={styles.cardCuisine}>{item.cuisine_type}</Text>
                <View style={styles.cardFooter}>
                    <View style={styles.rating}>
                        <Icon name="star" size={16} color={theme.colors.secondary} />
                        <Text style={styles.ratingText}>
                            {parseFloat(item.avg_rating || 0).toFixed(1)}
                        </Text>
                    </View>
                    <View style={[
                        styles.statusBadge,
                        { backgroundColor: item.is_open ? theme.colors.statusOpen : theme.colors.statusClosed }
                    ]}>
                        <Text style={styles.statusText}>{item.is_open ? 'OPEN' : 'CLOSED'}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (favorites.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Icon name="favorite-border" size={80} color={theme.colors.border} />
                <Text style={styles.emptyTitle}>No Favorites Yet</Text>
                <Text style={styles.emptySubtitle}>
                    Start adding stalls to your favorites by tapping the heart icon
                </Text>
                <TouchableOpacity
                    style={styles.browseBtn}
                    onPress={() => navigation.navigate('Main')}
                >
                    <Text style={styles.browseBtnText}>Browse Stalls</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={favorites}
                renderItem={renderFavorite}
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
    card: {
        flexDirection: 'row',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        marginBottom: theme.spacing.md,
        overflow: 'hidden',
        ...theme.shadows.md,
    },
    cardImage: {
        width: 100,
        height: 100,
    },
    cardContent: {
        flex: 1,
        padding: theme.spacing.md,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    cardName: {
        fontSize: theme.typography.fontSize.base,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        flex: 1,
        marginRight: theme.spacing.sm,
    },
    cardCuisine: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textSecondary,
        marginTop: 4,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: theme.spacing.sm,
    },
    rating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: theme.typography.fontSize.sm,
        fontWeight: '600',
        color: theme.colors.textPrimary,
    },
    statusBadge: {
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 2,
        borderRadius: 4,
    },
    statusText: {
        fontSize: theme.typography.fontSize.xs,
        fontWeight: 'bold',
        color: 'white',
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

export default Favorites;
