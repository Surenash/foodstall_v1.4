import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    Alert,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import theme from '../styles/theme';

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
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    });

    useEffect(() => {
        getUserLocation();
    }, []);

    useEffect(() => {
        if (userLocation) {
            fetchNearbyStalls();
        }
    }, [userLocation]);

    const getUserLocation = () => {
        Geolocation.getCurrentPosition(
            (position) => {
                const location = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                };
                setUserLocation(location);
                setRegion({
                    ...location,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                });
            },
            (error) => {
                console.error('Location error:', error);
                Alert.alert('Location Error', 'Could not get your location');
                setLoading(false);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    };

    const fetchNearbyStalls = async () => {
        try {
            const response = await fetch(
                `http://localhost:3000/api/v1/stalls/nearby?lat=${userLocation.latitude}&long=${userLocation.longitude}&radius=5000`
            );
            const data = await response.json();

            if (data.success) {
                setStalls(data.stalls);
            }
        } catch (error) {
            console.error('Error fetching stalls:', error);
            Alert.alert('Error', 'Failed to load stalls');
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
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                region={region}
                showsUserLocation
                showsMyLocationButton
            >
                {stalls.map((stall) => (
                    <Marker
                        key={stall.id}
                        coordinate={{
                            latitude: parseFloat(stall.latitude),
                            longitude: parseFloat(stall.longitude),
                        }}
                        title={stall.name}
                        description={stall.cuisine_type}
                        onPress={() => handleMarkerPress(stall)}
                        pinColor={stall.is_open ? theme.colors.statusOpen : theme.colors.statusClosed}
                    />
                ))}
            </MapView>
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
});

export default StallMapView;
