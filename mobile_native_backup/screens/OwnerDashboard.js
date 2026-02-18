import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import Icon from 'react-native-vector-icons/MaterialIcons';
import io from 'socket.io-client';
import theme from '../styles/theme';

/**
 * OwnerDashboard Screen
 * 
 * Features:
 * - Large "GO ONLINE" / "GO OFFLINE" toggle button
 * - High contrast design for outdoor visibility
 * - One-tap status update with automatic GPS location
 * - Real-time status reflection via Socket.io
 * - Simple, low-tech interface for low digital literacy
 */
const OwnerDashboard = ({ route }) => {
    const { stallId, ownerId, stallName } = route.params;

    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [socket, setSocket] = useState(null);

    // Initialize Socket.io connection
    useEffect(() => {
        const socketConnection = io('http://localhost:3000'); // Configure your server URL
        setSocket(socketConnection);

        socketConnection.on('connect', () => {
            console.log('Connected to server');
        });

        return () => {
            socketConnection.disconnect();
        };
    }, []);

    /**
     * Handle Toggle Button Press
     * Updates stall status and GPS location
     */
    const handleToggle = async () => {
        setLoading(true);

        try {
            // Get current GPS location
            const location = await getCurrentLocation();

            const newStatus = !isOpen;

            // Call API to update status
            const response = await fetch('http://localhost:3000/api/v1/owner/status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    stall_id: stallId,
                    owner_id: ownerId,
                    is_open: newStatus,
                    location: {
                        lat: location.latitude,
                        long: location.longitude,
                    },
                }),
            });

            const data = await response.json();

            if (data.success) {
                setIsOpen(newStatus);
                setLastUpdate(new Date());

                // Emit Socket.io event
                if (socket) {
                    socket.emit('owner_status_change', {
                        stall_id: stallId,
                        is_open: newStatus,
                        last_status_update: new Date().toISOString(),
                    });
                }

                Alert.alert(
                    'Success',
                    `Your stall is now ${newStatus ? 'OPEN' : 'CLOSED'}`,
                    [{ text: 'OK' }]
                );
            } else {
                throw new Error(data.error || 'Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            Alert.alert(
                'Error',
                'Failed to update status. Please try again.',
                [{ text: 'OK' }]
            );
        } finally {
            setLoading(false);
        }
    };

    /**
     * Get current GPS location
     */
    const getCurrentLocation = () => {
        return new Promise((resolve, reject) => {
            Geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                },
                (error) => {
                    console.error('Location error:', error);
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 10000,
                }
            );
        });
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.stallName}>{stallName}</Text>
                <Text style={styles.subtitle}>Vendor Dashboard</Text>
            </View>

            {/* Status Display */}
            <View style={styles.statusContainer}>
                <Text style={styles.currentStatusLabel}>Current Status:</Text>
                <Text style={[
                    styles.currentStatus,
                    { color: isOpen ? theme.colors.statusOpen : theme.colors.statusClosed }
                ]}>
                    {isOpen ? 'OPEN' : 'CLOSED'}
                </Text>

                {lastUpdate && (
                    <Text style={styles.lastUpdateText}>
                        Last updated: {lastUpdate.toLocaleTimeString()}
                    </Text>
                )}
            </View>

            {/* Main Toggle Button */}
            <View style={styles.toggleContainer}>
                <TouchableOpacity
                    style={[
                        styles.toggleButton,
                        isOpen ? styles.toggleButtonOpen : styles.toggleButtonClosed,
                    ]}
                    onPress={handleToggle}
                    disabled={loading}
                    activeOpacity={0.8}
                >
                    {loading ? (
                        <ActivityIndicator size="large" color={theme.colors.textLight} />
                    ) : (
                        <>
                            <Icon
                                name={isOpen ? 'store' : 'storefront'}
                                size={60}
                                color={theme.colors.textLight}
                            />
                            <Text style={styles.toggleText}>
                                {isOpen ? 'GO OFFLINE' : 'GO ONLINE'}
                            </Text>
                            <Text style={styles.toggleSubtext}>
                                {isOpen
                                    ? 'Tap to close your stall'
                                    : 'Tap to open your stall'}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            {/* Info Section */}
            <View style={styles.infoSection}>
                <View style={styles.infoBox}>
                    <Icon name="location-on" size={24} color={theme.colors.primary} />
                    <Text style={styles.infoText}>
                        Location updates automatically when you go online
                    </Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        backgroundColor: theme.colors.primary,
        padding: theme.spacing.xl,
        paddingTop: theme.spacing['2xl'],
        alignItems: 'center',
    },
    stallName: {
        fontSize: theme.typography.fontSize['2xl'],
        fontFamily: theme.typography.fontFamily.bold,
        color: theme.colors.textLight,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: theme.typography.fontSize.base,
        fontFamily: theme.typography.fontFamily.regular,
        color: theme.colors.textLight,
        marginTop: theme.spacing.xs,
        opacity: 0.9,
    },
    statusContainer: {
        alignItems: 'center',
        paddingVertical: theme.spacing.lg,
        backgroundColor: theme.colors.surface,
        marginHorizontal: theme.spacing.md,
        marginTop: theme.spacing.lg,
        borderRadius: theme.borderRadius.lg,
        ...theme.shadows.sm,
    },
    currentStatusLabel: {
        fontSize: theme.typography.fontSize.base,
        fontFamily: theme.typography.fontFamily.regular,
        color: theme.colors.textSecondary,
    },
    currentStatus: {
        fontSize: theme.typography.fontSize['3xl'],
        fontFamily: theme.typography.fontFamily.bold,
        marginTop: theme.spacing.xs,
    },
    lastUpdateText: {
        fontSize: theme.typography.fontSize.sm,
        fontFamily: theme.typography.fontFamily.regular,
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.sm,
    },
    toggleContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.lg,
    },
    toggleButton: {
        ...theme.components.ownerToggle,
        width: '90%',
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: theme.colors.textLight,
    },
    toggleButtonOpen: {
        backgroundColor: '#E53935', // Bright Red for "GO OFFLINE"
    },
    toggleButtonClosed: {
        backgroundColor: '#00C853', // Bright Green for "GO ONLINE"
    },
    toggleText: {
        fontSize: theme.typography.fontSize['4xl'],
        fontFamily: theme.typography.fontFamily.bold,
        color: theme.colors.textLight,
        marginTop: theme.spacing.md,
        textAlign: 'center',
    },
    toggleSubtext: {
        fontSize: theme.typography.fontSize.base,
        fontFamily: theme.typography.fontFamily.regular,
        color: theme.colors.textLight,
        marginTop: theme.spacing.sm,
        opacity: 0.9,
    },
    infoSection: {
        paddingHorizontal: theme.spacing.lg,
        paddingBottom: theme.spacing.xl,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        ...theme.shadows.sm,
    },
    infoText: {
        flex: 1,
        fontSize: theme.typography.fontSize.sm,
        fontFamily: theme.typography.fontFamily.regular,
        color: theme.colors.textSecondary,
        marginLeft: theme.spacing.sm,
    },
});

export default OwnerDashboard;
