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
import { ownerAPI } from '../services/api';

/**
 * OwnerDashboard Screen
 * 
 * Features:
 * - Large "GO ONLINE" / "GO OFFLINE" toggle button
 * - High contrast design for outdoor visibility
 * - One-tap status update with automatic GPS location
 * - Real-time status reflection via Socket.io (Simulated in Mock Mode)
 * - Simple, low-tech interface for low digital literacy
 */
const OwnerDashboard = ({ route }) => {
    // Fallback params
    const { stallId, ownerId, stallName } = route.params || { stallId: 1, ownerId: 1, stallName: "My Stall" };

    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Disabled real connection for demo
        console.log("Socket connection simulated for demo");
        return () => { };
    }, []);

    const handleToggle = async () => {
        setLoading(true);
        try {
            const location = await getCurrentLocation();
            const newStatus = !isOpen;

            // Use mocked API
            const response = await ownerAPI.updateStatus(stallId, ownerId, newStatus, {
                lat: location.latitude,
                long: location.longitude
            });

            if (response.success) {
                setIsOpen(newStatus);
                setLastUpdate(new Date());
                Alert.alert(
                    'Success',
                    `Your stall is now ${newStatus ? 'OPEN' : 'CLOSED'}`,
                    [{ text: 'OK' }]
                );
            } else {
                throw new Error('Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            // Fallback for demo
            setIsOpen(!isOpen);
        } finally {
            setLoading(false);
        }
    };

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
                    resolve({ latitude: 19.0760, longitude: 72.8777 }); // Default fallback
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 10000,
                }
            );
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.stallName}>{stallName}</Text>
                <Text style={styles.subtitle}>Vendor Dashboard</Text>
            </View>

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
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { backgroundColor: theme.colors.primary, padding: theme.spacing.xl, paddingTop: theme.spacing['2xl'], alignItems: 'center' },
    stallName: { fontSize: theme.typography.fontSize['2xl'], fontFamily: theme.typography.fontFamily.bold, color: theme.colors.textLight, textAlign: 'center' },
    subtitle: { fontSize: theme.typography.fontSize.base, fontFamily: theme.typography.fontFamily.regular, color: theme.colors.textLight, marginTop: theme.spacing.xs, opacity: 0.9 },
    statusContainer: { alignItems: 'center', paddingVertical: theme.spacing.lg, backgroundColor: theme.colors.surface, marginHorizontal: theme.spacing.md, marginTop: theme.spacing.lg, borderRadius: theme.borderRadius.lg, ...theme.shadows.sm },
    currentStatusLabel: { fontSize: theme.typography.fontSize.base, fontFamily: theme.typography.fontFamily.regular, color: theme.colors.textSecondary },
    currentStatus: { fontSize: theme.typography.fontSize['3xl'], fontFamily: theme.typography.fontFamily.bold, marginTop: theme.spacing.xs },
    lastUpdateText: { fontSize: theme.typography.fontSize.sm, fontFamily: theme.typography.fontFamily.regular, color: theme.colors.textSecondary, marginTop: theme.spacing.sm },
    toggleContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: theme.spacing.lg },
    toggleButton: { ...theme.components.ownerToggle, width: '90%', height: 200, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: theme.colors.textLight },
    toggleButtonOpen: { backgroundColor: '#E53935' },
    toggleButtonClosed: { backgroundColor: '#00C853' },
    toggleText: { fontSize: theme.typography.fontSize['4xl'], fontFamily: theme.typography.fontFamily.bold, color: theme.colors.textLight, marginTop: theme.spacing.md, textAlign: 'center' },
    toggleSubtext: { fontSize: theme.typography.fontSize.base, fontFamily: theme.typography.fontFamily.regular, color: theme.colors.textLight, marginTop: theme.spacing.sm, opacity: 0.9 },
    infoSection: { paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.xl },
    infoBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, padding: theme.spacing.md, borderRadius: theme.borderRadius.md, ...theme.shadows.sm },
    infoText: { flex: 1, fontSize: theme.typography.fontSize.sm, fontFamily: theme.typography.fontFamily.regular, color: theme.colors.textSecondary, marginLeft: theme.spacing.sm },
});

export default OwnerDashboard;
