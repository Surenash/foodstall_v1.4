import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    TextInput,
    Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Geolocation from 'react-native-geolocation-service';
import StallCard from '../components/StallCard';
import { stallsAPI } from '../services/api';
import theme from '../styles/theme';

/**
 * ListView Screen
 * Displays stalls in a list with search and filter capabilities
 */
const ListView = ({ navigation }) => {
    const [stalls, setStalls] = useState([]);
    const [filteredStalls, setFilteredStalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Filter states
    const [filters, setFilters] = useState({
        openOnly: false,
        dietaryTags: [],
        maxDistance: 5, // km
    });

    const dietaryOptions = ['Vegetarian', 'Jain', 'Halal', 'Vegan', 'Non-Veg'];

    useEffect(() => {
        getUserLocation();
    }, []);

    useEffect(() => {
        if (userLocation) {
            fetchStalls();
        }
    }, [userLocation]);

    useEffect(() => {
        applyFilters();
    }, [stalls, searchQuery, filters]);

    const getUserLocation = () => {
        Geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            (error) => {
                console.error('Location error:', error);
                // Use default Mumbai location
                setUserLocation({ latitude: 19.0760, longitude: 72.8777 });
            },
            { enableHighAccuracy: true, timeout: 15000 }
        );
    };

    const fetchStalls = async () => {
        try {
            setLoading(true);
            const data = await stallsAPI.getNearby(
                userLocation.latitude,
                userLocation.longitude,
                filters.maxDistance * 1000, // Convert km to meters
                filters.openOnly
            );
            setStalls(data.stalls || []);
        } catch (error) {
            console.error('Error fetching stalls:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let result = [...stalls];

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (stall) =>
                    stall.name.toLowerCase().includes(query) ||
                    stall.cuisine_type?.toLowerCase().includes(query) ||
                    stall.description?.toLowerCase().includes(query)
            );
        }

        // Dietary tags filter
        if (filters.dietaryTags.length > 0) {
            result = result.filter((stall) =>
                stall.dietary_tags?.some((tag) =>
                    filters.dietaryTags.includes(tag)
                )
            );
        }

        // Distance filter
        result = result.filter(
            (stall) => parseFloat(stall.distance_km) <= filters.maxDistance
        );

        setFilteredStalls(result);
    };

    const toggleDietaryTag = (tag) => {
        setFilters((prev) => {
            const tags = prev.dietaryTags.includes(tag)
                ? prev.dietaryTags.filter((t) => t !== tag)
                : [...prev.dietaryTags, tag];
            return { ...prev, dietaryTags: tags };
        });
    };

    const clearFilters = () => {
        setFilters({
            openOnly: false,
            dietaryTags: [],
            maxDistance: 5,
        });
        setSearchQuery('');
    };

    const renderStallCard = ({ item }) => (
        <StallCard
            stall={item}
            onPress={() => navigation.navigate('StallDetail', { stallId: item.id })}
        />
    );

    const renderFilterModal = () => (
        <Modal
            visible={showFilters}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowFilters(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Filters</Text>
                        <TouchableOpacity onPress={() => setShowFilters(false)}>
                            <Icon name="close" size={24} color={theme.colors.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    {/* Open Only Toggle */}
                    <TouchableOpacity
                        style={styles.filterOption}
                        onPress={() => setFilters({ ...filters, openOnly: !filters.openOnly })}
                    >
                        <Text style={styles.filterLabel}>Show Open Stalls Only</Text>
                        <Icon
                            name={filters.openOnly ? 'check-box' : 'check-box-outline-blank'}
                            size={24}
                            color={theme.colors.primary}
                        />
                    </TouchableOpacity>

                    {/* Dietary Tags */}
                    <Text style={styles.filterSectionTitle}>Dietary Preferences</Text>
                    <View style={styles.tagsContainer}>
                        {dietaryOptions.map((tag) => (
                            <TouchableOpacity
                                key={tag}
                                style={[
                                    styles.tagChip,
                                    filters.dietaryTags.includes(tag) && styles.tagChipActive,
                                ]}
                                onPress={() => toggleDietaryTag(tag)}
                            >
                                <Text
                                    style={[
                                        styles.tagChipText,
                                        filters.dietaryTags.includes(tag) && styles.tagChipTextActive,
                                    ]}
                                >
                                    {tag}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Max Distance Slider */}
                    <Text style={styles.filterSectionTitle}>
                        Max Distance: {filters.maxDistance} km
                    </Text>
                    <View style={styles.distanceButtons}>
                        {[1, 2, 5, 10].map((distance) => (
                            <TouchableOpacity
                                key={distance}
                                style={[
                                    styles.distanceButton,
                                    filters.maxDistance === distance && styles.distanceButtonActive,
                                ]}
                                onPress={() => setFilters({ ...filters, maxDistance: distance })}
                            >
                                <Text
                                    style={[
                                        styles.distanceButtonText,
                                        filters.maxDistance === distance && styles.distanceButtonTextActive,
                                    ]}
                                >
                                    {distance} km
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Actions */}
                    <View style={styles.modalActions}>
                        <TouchableOpacity
                            style={styles.clearButton}
                            onPress={clearFilters}
                        >
                            <Text style={styles.clearButtonText}>Clear All</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.applyButton}
                            onPress={() => {
                                fetchStalls();
                                setShowFilters(false);
                            }}
                        >
                            <Text style={styles.applyButtonText}>Apply Filters</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Finding stalls near you...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Icon name="search" size={24} color={theme.colors.textSecondary} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by name or cuisine..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                <TouchableOpacity
                    style={styles.filterButton}
                    onPress={() => setShowFilters(true)}
                >
                    <Icon name="filter-list" size={24} color={theme.colors.primary} />
                    {(filters.openOnly || filters.dietaryTags.length > 0) && (
                        <View style={styles.filterBadge} />
                    )}
                </TouchableOpacity>
            </View>

            {/* Active Filters Display */}
            {(filters.openOnly || filters.dietaryTags.length > 0) && (
                <View style={styles.activeFilters}>
                    {filters.openOnly && (
                        <View style={styles.activeFilterChip}>
                            <Text style={styles.activeFilterText}>Open Now</Text>
                        </View>
                    )}
                    {filters.dietaryTags.map((tag) => (
                        <View key={tag} style={styles.activeFilterChip}>
                            <Text style={styles.activeFilterText}>{tag}</Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Results Count */}
            <View style={styles.resultsHeader}>
                <Text style={styles.resultsText}>
                    {filteredStalls.length} stall{filteredStalls.length !== 1 ? 's' : ''} found
                </Text>
                {filteredStalls.length > 0 && (
                    <TouchableOpacity onPress={fetchStalls}>
                        <Icon name="refresh" size={24} color={theme.colors.primary} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Stalls List */}
            {filteredStalls.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Icon name="store" size={64} color={theme.colors.border} />
                    <Text style={styles.emptyText}>No stalls found</Text>
                    <Text style={styles.emptySubtext}>
                        Try adjusting your filters or search query
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filteredStalls}
                    renderItem={renderStallCard}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Filter Modal */}
            {renderFilterModal()}
        </View>
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
    loadingText: {
        marginTop: theme.spacing.md,
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.textSecondary,
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
        paddingHorizontal: theme.spacing.sm,
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.textPrimary,
    },
    filterButton: {
        padding: theme.spacing.xs,
        position: 'relative',
    },
    filterBadge: {
        position: 'absolute',
        top: 4,
        right: 4,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: theme.colors.error,
    },
    activeFilters: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: theme.spacing.md,
        marginBottom: theme.spacing.sm,
    },
    activeFilterChip: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.borderRadius.sm,
        marginRight: theme.spacing.xs,
        marginBottom: theme.spacing.xs,
    },
    activeFilterText: {
        fontSize: theme.typography.fontSize.sm,
        fontFamily: theme.typography.fontFamily.medium,
        color: theme.colors.textLight,
    },
    resultsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.md,
        marginBottom: theme.spacing.sm,
    },
    resultsText: {
        fontSize: theme.typography.fontSize.base,
        fontFamily: theme.typography.fontFamily.semibold,
        color: theme.colors.textPrimary,
    },
    listContent: {
        paddingBottom: theme.spacing.lg,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.xl,
    },
    emptyText: {
        fontSize: theme.typography.fontSize.lg,
        fontFamily: theme.typography.fontFamily.semibold,
        color: theme.colors.textPrimary,
        marginTop: theme.spacing.md,
    },
    emptySubtext: {
        fontSize: theme.typography.fontSize.sm,
        fontFamily: theme.typography.fontFamily.regular,
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.xs,
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: theme.colors.background,
        borderTopLeftRadius: theme.borderRadius.xl,
        borderTopRightRadius: theme.borderRadius.xl,
        padding: theme.spacing.lg,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
    },
    modalTitle: {
        fontSize: theme.typography.fontSize['2xl'],
        fontFamily: theme.typography.fontFamily.bold,
        color: theme.colors.textPrimary,
    },
    filterOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    filterLabel: {
        fontSize: theme.typography.fontSize.base,
        fontFamily: theme.typography.fontFamily.medium,
        color: theme.colors.textPrimary,
    },
    filterSectionTitle: {
        fontSize: theme.typography.fontSize.base,
        fontFamily: theme.typography.fontFamily.semibold,
        color: theme.colors.textPrimary,
        marginTop: theme.spacing.lg,
        marginBottom: theme.spacing.sm,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    tagChip: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginRight: theme.spacing.sm,
        marginBottom: theme.spacing.sm,
    },
    tagChipActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    tagChipText: {
        fontSize: theme.typography.fontSize.sm,
        fontFamily: theme.typography.fontFamily.medium,
        color: theme.colors.textPrimary,
    },
    tagChipTextActive: {
        color: theme.colors.textLight,
    },
    distanceButtons: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
    },
    distanceButton: {
        flex: 1,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        alignItems: 'center',
    },
    distanceButtonActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    distanceButtonText: {
        fontSize: theme.typography.fontSize.sm,
        fontFamily: theme.typography.fontFamily.medium,
        color: theme.colors.textPrimary,
    },
    distanceButtonTextActive: {
        color: theme.colors.textLight,
    },
    modalActions: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
        marginTop: theme.spacing.xl,
    },
    clearButton: {
        flex: 1,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        alignItems: 'center',
    },
    clearButtonText: {
        fontSize: theme.typography.fontSize.base,
        fontFamily: theme.typography.fontFamily.semibold,
        color: theme.colors.textPrimary,
    },
    applyButton: {
        flex: 1,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
    },
    applyButtonText: {
        fontSize: theme.typography.fontSize.base,
        fontFamily: theme.typography.fontFamily.semibold,
        color: theme.colors.textLight,
    },
});

export default ListView;
