import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    ScrollView,
} from 'react-native';
import * as Location from 'expo-location';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import io from 'socket.io-client';
import theme from '../styles/theme';
import { SOCKET_URL, API_BASE_URL } from '../config/server';

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
const OwnerDashboard = ({ route, navigation }) => {
    // Safe defaults if params are missing
    const { stallId = '1', ownerId = 'vendor-001', stallName = "My Stall" } = route?.params || {};

    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [socket, setSocket] = useState(null);

    // Initialize Socket.io connection
    useEffect(() => {
        // Use localhost for iOS Simulator, 10.0.2.2 for Android Emulator
        // For physical device, you need your computer's IP address
        const socketConnection = io(SOCKET_URL);
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

            try {
                // Try API call
                const response = await fetch(`${API_BASE_URL}/owner/status`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        stall_id: stallId,
                        owner_id: ownerId,
                        is_open: newStatus,
                        location: { lat: location.latitude, long: location.longitude },
                    }),
                });
                const data = await response.json();
                if (!data.success) throw new Error('API error');
            } catch (apiError) {
                // API unavailable - continue with local update (demo mode)
                console.log('API unavailable, updating locally:', apiError.message);
            }

            // Update local state (works regardless of API)
            setIsOpen(newStatus);
            setLastUpdate(new Date());

            // Emit Socket.io event if connected
            if (socket?.connected) {
                socket.emit('owner_status_change', {
                    stall_id: stallId,
                    is_open: newStatus,
                    last_status_update: new Date().toISOString(),
                });
            }

            Alert.alert(
                'Status Updated!',
                `Your stall is now ${newStatus ? 'OPEN' : 'CLOSED'}`,
                [{ text: 'OK' }]
            );
        } catch (error) {
            console.log('Toggle error:', error.message);
            // Still allow toggle even if location fails
            const newStatus = !isOpen;
            setIsOpen(newStatus);
            setLastUpdate(new Date());
            Alert.alert('Status Updated', `Stall is now ${newStatus ? 'OPEN' : 'CLOSED'}\n(Location unavailable)`);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Get current GPS location
     */
    const getCurrentLocation = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            throw new Error('Location permission denied');
        }

        let location = await Location.getCurrentPositionAsync({});
        return {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
        };
    };

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.stallName}>{stallName}</Text>
                <Text style={styles.subtitle}>Vendor Dashboard</Text>
            </View>

            {/* Status Card - Prominent Display */}
            <View style={[
                styles.statusCard,
                { borderColor: isOpen ? theme.colors.statusOpen : theme.colors.statusClosed }
            ]}>
                <View style={[
                    styles.statusIndicator,
                    { backgroundColor: isOpen ? theme.colors.statusOpen : theme.colors.statusClosed }
                ]}>
                    <Icon
                        name={isOpen ? 'check-circle' : 'cancel'}
                        size={32}
                        color="white"
                    />
                </View>
                <View style={styles.statusInfo}>
                    <Text style={styles.currentStatusLabel}>Current Status</Text>
                    <Text style={[
                        styles.currentStatus,
                        { color: isOpen ? theme.colors.statusOpen : theme.colors.statusClosed }
                    ]}>
                        {isOpen ? 'OPEN' : 'CLOSED'}
                    </Text>
                    {lastUpdate && (
                        <Text style={styles.lastUpdateText}>
                            Updated: {lastUpdate.toLocaleTimeString()}
                        </Text>
                    )}
                </View>
            </View>

            {/* Toggle Button */}
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
                    <View style={styles.toggleContent}>
                        <Icon
                            name={isOpen ? 'power-settings-new' : 'power-settings-new'}
                            size={40}
                            color={theme.colors.textLight}
                        />
                        <View style={styles.toggleTextContainer}>
                            <Text style={styles.toggleText}>
                                {isOpen ? 'GO OFFLINE' : 'GO ONLINE'}
                            </Text>
                            <Text style={styles.toggleSubtext}>
                                {isOpen ? 'Tap to close your stall' : 'Tap to open your stall'}
                            </Text>
                        </View>
                    </View>
                )}
            </TouchableOpacity>

            {/* Info Section */}
            <View style={styles.infoSection}>
                <View style={styles.infoBox}>
                    <Icon name="location-on" size={24} color={theme.colors.primary} />
                    <Text style={styles.infoText}>
                        Location updates automatically when you go online
                    </Text>
                </View>

                {/* Edit Stall Profile Button */}
                <TouchableOpacity
                    style={styles.editProfileButton}
                    onPress={() => navigation.navigate('StallProfileEditor', { stallId })}
                >
                    <Icon name="edit" size={20} color="white" />
                    <Text style={styles.editProfileText}>Edit Stall Profile</Text>
                </TouchableOpacity>

                {/* Logout Button */}
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={() => navigation.replace('LoginScreen')}
                >
                    <Icon name="logout" size={20} color={theme.colors.error} />
                    <Text style={styles.logoutText}>Logout</Text>
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
    statusCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        marginHorizontal: theme.spacing.md,
        marginTop: theme.spacing.lg,
        borderRadius: theme.borderRadius.lg,
        borderWidth: 3,
        overflow: 'hidden',
        ...theme.shadows.md,
    },
    statusIndicator: {
        width: 80,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusInfo: {
        flex: 1,
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.md,
    },
    currentStatusLabel: {
        fontSize: theme.typography.fontSize.sm,
        fontFamily: theme.typography.fontFamily.regular,
        color: theme.colors.textSecondary,
    },
    currentStatus: {
        fontSize: theme.typography.fontSize['2xl'],
        fontFamily: theme.typography.fontFamily.bold,
    },
    lastUpdateText: {
        fontSize: theme.typography.fontSize.xs,
        fontFamily: theme.typography.fontFamily.regular,
        color: theme.colors.textSecondary,
        marginTop: 4,
    },
    toggleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: theme.spacing.md,
        marginTop: theme.spacing.lg,
        paddingVertical: theme.spacing.lg,
        paddingHorizontal: theme.spacing.xl,
        borderRadius: theme.borderRadius.lg,
        ...theme.shadows.lg,
    },
    toggleButtonOpen: {
        backgroundColor: '#E53935', // Bright Red for "GO OFFLINE"
    },
    toggleButtonClosed: {
        backgroundColor: '#00C853', // Bright Green for "GO ONLINE"
    },
    toggleContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
    },
    toggleTextContainer: {
        flex: 1,
    },
    toggleText: {
        fontSize: theme.typography.fontSize['2xl'],
        fontFamily: theme.typography.fontFamily.bold,
        color: theme.colors.textLight,
    },
    toggleSubtext: {
        fontSize: theme.typography.fontSize.sm,
        fontFamily: theme.typography.fontFamily.regular,
        color: theme.colors.textLight,
        opacity: 0.9,
    },
    infoSection: {
        paddingHorizontal: theme.spacing.lg,
        paddingBottom: 100, // Space for bottom navigation bar
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
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.error,
    },
    logoutText: {
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.error,
        marginLeft: theme.spacing.sm,
        fontWeight: '600',
    },
    editProfileButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.md,
        ...theme.shadows.md,
    },
    editProfileText: {
        fontSize: theme.typography.fontSize.base,
        color: 'white',
        marginLeft: theme.spacing.sm,
        fontWeight: '600',
    },
});

export default OwnerDashboard;
