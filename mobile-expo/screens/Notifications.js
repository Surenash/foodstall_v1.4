import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import theme from '../styles/theme';
import { getUserData } from '../services/storage';
import { API_BASE_URL as API_BASE } from '../config/server';

/**
 * Notifications Screen
 * Displays user notifications with read/unread status
 */
const Notifications = ({ navigation }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const userData = await getUserData();
            if (!userData?.id) {
                setLoading(false);
                return;
            }

            const response = await fetch(`${API_BASE}/users/${userData.id}/notifications`);
            const data = await response.json();

            if (data.success) {
                setNotifications(data.notifications);
                setUnreadCount(data.unread_count);
            }
        } catch (error) {
            console.log('Using mock notifications:', error.message);
            // Mock data for demo
            setNotifications([
                {
                    id: '1',
                    type: 'favorite_stall_open',
                    title: "Surena's Stall is now OPEN!",
                    body: 'Your favorite stall is serving fresh dosas today.',
                    read: false,
                    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
                    data: { stall_id: '1' }
                },
                {
                    id: '2',
                    type: 'special_offer',
                    title: '20% Off at Chaat Corner!',
                    body: 'Special discount for the next 2 hours. Order now!',
                    read: false,
                    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
                    data: { stall_id: '2' }
                },
                {
                    id: '3',
                    type: 'system',
                    title: 'Welcome to Food Stall!',
                    body: 'Discover the best street food stalls near you.',
                    read: true,
                    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
                    data: {}
                },
            ]);
            setUnreadCount(2);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchNotifications();
    }, []);

    const markAsRead = async (notificationId) => {
        try {
            const userData = await getUserData();
            if (userData?.id) {
                await fetch(
                    `${API_BASE}/users/${userData.id}/notifications/${notificationId}/read`,
                    { method: 'PUT' }
                );
            }

            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const userData = await getUserData();
            if (userData?.id) {
                await fetch(
                    `${API_BASE}/users/${userData.id}/notifications/read-all`,
                    { method: 'PUT' }
                );
            }

            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleNotificationPress = (notification) => {
        markAsRead(notification.id);

        // Navigate based on notification type
        if (notification.data?.stall_id) {
            navigation.navigate('StallDetail', { stallId: notification.data.stall_id });
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'favorite_stall_open':
                return { name: 'store', color: theme.colors.success };
            case 'review_reply':
                return { name: 'reply', color: theme.colors.primary };
            case 'special_offer':
                return { name: 'local-offer', color: theme.colors.secondary };
            default:
                return { name: 'notifications', color: theme.colors.textSecondary };
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    const renderNotification = ({ item }) => {
        const icon = getNotificationIcon(item.type);

        return (
            <TouchableOpacity
                style={[styles.notificationCard, !item.read && styles.unreadCard]}
                onPress={() => handleNotificationPress(item)}
            >
                <View style={[styles.iconContainer, { backgroundColor: icon.color + '20' }]}>
                    <Icon name={icon.name} size={24} color={icon.color} />
                </View>
                <View style={styles.contentContainer}>
                    <Text style={[styles.title, !item.read && styles.unreadTitle]}>
                        {item.title}
                    </Text>
                    {item.body && (
                        <Text style={styles.body} numberOfLines={2}>
                            {item.body}
                        </Text>
                    )}
                    <Text style={styles.time}>{formatTime(item.created_at)}</Text>
                </View>
                {!item.read && <View style={styles.unreadDot} />}
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {unreadCount > 0 && (
                <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
                    <Icon name="done-all" size={20} color={theme.colors.primary} />
                    <Text style={styles.markAllText}>Mark all as read</Text>
                </TouchableOpacity>
            )}

            {notifications.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Icon name="notifications-none" size={80} color={theme.colors.border} />
                    <Text style={styles.emptyTitle}>No Notifications</Text>
                    <Text style={styles.emptySubtitle}>
                        We'll notify you when your favorite stalls open or have special offers
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderNotification}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[theme.colors.primary]}
                        />
                    }
                />
            )}
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
    markAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.sm,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        gap: theme.spacing.xs,
    },
    markAllText: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.primary,
        fontWeight: '600',
    },
    notificationCard: {
        flexDirection: 'row',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.sm,
        alignItems: 'flex-start',
        ...theme.shadows.sm,
    },
    unreadCard: {
        backgroundColor: theme.colors.primary + '08',
        borderLeftWidth: 3,
        borderLeftColor: theme.colors.primary,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.md,
    },
    contentContainer: {
        flex: 1,
    },
    title: {
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.textPrimary,
        marginBottom: 4,
    },
    unreadTitle: {
        fontWeight: 'bold',
    },
    body: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textSecondary,
        marginBottom: 4,
    },
    time: {
        fontSize: theme.typography.fontSize.xs,
        color: theme.colors.textSecondary,
    },
    unreadDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: theme.colors.primary,
        marginLeft: theme.spacing.sm,
        marginTop: 4,
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
});

export default Notifications;
