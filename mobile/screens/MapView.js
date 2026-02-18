import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import theme from '../styles/theme';
import { API_BASE_URL } from '../config/server';

/**
 * MapView Screen
 * Displays stalls on an interactive map with custom markers
 */
const StallMapView = ({ navigation }) => {
    const [stalls, setStalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState(null);
    const [region, setRegion] = useState({
        latitude: 19.0760, // Default to Mumbai
        longitude: 72.8777,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
    });

    useEffect(() => {
        initializeMap();
    }, []);

    const initializeMap = async () => {
        // Default location (Mumbai)
        let userLoc = { latitude: 19.0760, longitude: 72.8777 };

        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                let location = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                });
                userLoc = {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                };
                console.log('📍 Got user location:', userLoc);
            } else {
                console.log('📍 Location permission denied, using default');
            }
        } catch (error) {
            console.log('📍 Location error, using default:', error.message);
        }

        setUserLocation(userLoc);
        setRegion({
            ...userLoc,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
        });

        // Load stalls after setting location
        await loadStalls(userLoc);
    };

    const loadStalls = async (location) => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/stalls/nearby?lat=${location.latitude}&long=${location.longitude}&radius=5000`
            );
            const data = await response.json();

            if (data.success && data.stalls?.length > 0) {
                console.log('🗺️ Loaded stalls from API:', data.stalls.length);
                setStalls(data.stalls);
            } else {
                throw new Error('No stalls from API');
            }
        } catch (error) {
            console.log('🗺️ API unavailable, using mock stalls:', error.message);
            // Use mock stalls as fallback - positioned relative to user location
            const mockStalls = [
                {
                    id: '1',
                    name: "Surena's Stall",
                    cuisine_type: 'South Indian',
                    is_open: true,
                    latitude: location.latitude + 0.003,
                    longitude: location.longitude + 0.002,
                },
                {
                    id: '2',
                    name: "Raju's Chaat Corner",
                    cuisine_type: 'North Indian',
                    is_open: true,
                    latitude: location.latitude - 0.002,
                    longitude: location.longitude + 0.003,
                },
                {
                    id: '3',
                    name: 'Biryani Express',
                    cuisine_type: 'Hyderabadi',
                    is_open: false,
                    latitude: location.latitude + 0.004,
                    longitude: location.longitude - 0.003,
                },
            ];
            console.log('🗺️ Using mock stalls at:', location);
            setStalls(mockStalls);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkerPress = (stall) => {
        navigation.navigate('StallDetail', { stallId: stall.id });
    };

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
            <MapView
                style={styles.map}
                initialRegion={region}
                showsUserLocation={true}
                showsMyLocationButton={true}
            >
                {stalls.map((stall) => (
                    <Marker
                        key={stall.id}
                        coordinate={{
                            latitude: parseFloat(stall.latitude),
                            longitude: parseFloat(stall.longitude),
                        }}
                        title={stall.name}
                        description={`${stall.cuisine_type} • ${stall.is_open ? 'OPEN' : 'CLOSED'} • Tap to view`}
                        pinColor={stall.is_open ? '#22C55E' : '#EF4444'}
                        onCalloutPress={() => handleMarkerPress(stall)}
                    />
                ))}
            </MapView>

            {/* Legend */}
            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#22C55E' }]} />
                    <Text style={styles.legendText}>Open</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
                    <Text style={styles.legendText}>Closed</Text>
                </View>
            </View>

            {/* Debug info */}
            <View style={styles.debugInfo}>
                <Text style={styles.debugText}>
                    {stalls.length} stalls loaded
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
    },
    loadingText: {
        marginTop: theme.spacing.md,
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.textSecondary,
    },
    legend: {
        position: 'absolute',
        bottom: 100,
        right: 16,
        backgroundColor: 'white',
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.sm,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 4,
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 8,
    },
    legendText: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textPrimary,
    },
    debugInfo: {
        position: 'absolute',
        top: 16,
        left: 16,
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 8,
        borderRadius: 4,
    },
    debugText: {
        color: 'white',
        fontSize: 12,
    },
});

export default StallMapView;
