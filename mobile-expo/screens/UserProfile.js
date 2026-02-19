import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Image,
    Alert,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import theme from '../styles/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTranslationSync } from '../services/translations';

/**
 * UserProfile Screen
 * Customer profile management with preferences
 */
const UserProfile = ({ navigation }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [t, setT] = useState({});

    React.useEffect(() => {
        const loadTranslations = async () => {
            const lang = await AsyncStorage.getItem('language') || 'en';
            setT({
                editProfile: getTranslationSync('editProfile', lang),
                saveChanges: 'Save Changes', // Add to translations if needed
                personalInfo: 'Personal Information', // Add to translations
                dietaryPrefs: 'Dietary Preferences', // Add to translations
                favCuisines: 'Favorite Cuisines', // Add to translations
                myActivity: 'My Activity', // Add to translations
                favStalls: 'Favorite Stalls', // Add to translations
                myReviews: getTranslationSync('myReviews', lang),
                notifications: getTranslationSync('notifications', lang),
                settings: getTranslationSync('settings', lang),
                logout: getTranslationSync('logout', lang),
                cancel: 'Cancel',
                logoutConfirm: 'Are you sure you want to logout?',
                fullName: 'Full Name',
                email: 'Email',
                phone: 'Phone',
            });
        };
        loadTranslations();
    }, []);

    // User data state
    const [name, setName] = useState('John Doe');
    const [email, setEmail] = useState('john.doe@example.com');
    const [phone, setPhone] = useState('+91 98765 43210');
    const [profileImage, setProfileImage] = useState(null);

    // Dietary preferences
    const [dietaryPrefs, setDietaryPrefs] = useState(['Vegetarian']);
    const dietaryOptions = ['Vegetarian', 'Vegan', 'Non-Veg', 'Halal', 'Jain', 'Gluten-Free'];

    // Favorite cuisines
    const [favCuisines, setFavCuisines] = useState(['South Indian', 'Chinese']);
    const cuisineOptions = ['South Indian', 'North Indian', 'Chinese', 'Street Food', 'Biryani', 'Chaat', 'Fast Food'];

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setProfileImage(result.assets[0].uri);
        }
    };

    const togglePreference = (pref, list, setList) => {
        if (list.includes(pref)) {
            setList(list.filter(p => p !== pref));
        } else {
            setList([...list, pref]);
        }
    };

    const handleSave = () => {
        setIsEditing(false);
        Alert.alert('Saved!', 'Your profile has been updated.');
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', style: 'destructive', onPress: () => navigation.replace('LoginScreen') }
            ]
        );
    };

    return (
        <ScrollView style={styles.container}>
            {/* Profile Header */}
            <View style={styles.profileHeader}>
                <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
                    {profileImage ? (
                        <Image source={{ uri: profileImage }} style={styles.avatar} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Icon name="person" size={50} color={theme.colors.textSecondary} />
                        </View>
                    )}
                    <View style={styles.editAvatarBtn}>
                        <Icon name="camera-alt" size={16} color="white" />
                    </View>
                </TouchableOpacity>
                <Text style={styles.userName}>{name}</Text>
                <Text style={styles.userEmail}>{email}</Text>
            </View>

            {/* Edit Toggle */}
            <TouchableOpacity
                style={styles.editToggle}
                onPress={() => isEditing ? handleSave() : setIsEditing(true)}
            >
                <Icon name={isEditing ? 'check' : 'edit'} size={20} color={theme.colors.primary} />
                <Text style={styles.editToggleText}>{isEditing ? t.saveChanges : t.editProfile}</Text>
            </TouchableOpacity>

            {/* Personal Info */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t.personalInfo || 'Personal Information'}</Text>

                <View style={styles.field}>
                    <Text style={styles.fieldLabel}>{t.fullName || 'Full Name'}</Text>
                    <TextInput
                        style={[styles.input, !isEditing && styles.inputDisabled]}
                        value={name}
                        onChangeText={setName}
                        editable={isEditing}
                    />
                </View>

                <View style={styles.field}>
                    <Text style={styles.fieldLabel}>{t.email || 'Email'}</Text>
                    <TextInput
                        style={[styles.input, !isEditing && styles.inputDisabled]}
                        value={email}
                        onChangeText={setEmail}
                        editable={isEditing}
                        keyboardType="email-address"
                    />
                </View>

                <View style={styles.field}>
                    <Text style={styles.fieldLabel}>{t.phone || 'Phone'}</Text>
                    <TextInput
                        style={[styles.input, !isEditing && styles.inputDisabled]}
                        value={phone}
                        onChangeText={setPhone}
                        editable={isEditing}
                        keyboardType="phone-pad"
                    />
                </View>
            </View>

            {/* Dietary Preferences */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t.dietaryPrefs || 'Dietary Preferences'}</Text>
                <Text style={styles.sectionSubtitle}>We'll highlight stalls matching your diet</Text>
                <View style={styles.tagsContainer}>
                    {dietaryOptions.map((diet) => (
                        <TouchableOpacity
                            key={diet}
                            style={[styles.tag, dietaryPrefs.includes(diet) && styles.tagActive]}
                            onPress={() => togglePreference(diet, dietaryPrefs, setDietaryPrefs)}
                        >
                            <Text style={[styles.tagText, dietaryPrefs.includes(diet) && styles.tagTextActive]}>
                                {diet}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Favorite Cuisines */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t.favCuisines || 'Favorite Cuisines'}</Text>
                <Text style={styles.sectionSubtitle}>Get notified about new stalls in these cuisines</Text>
                <View style={styles.tagsContainer}>
                    {cuisineOptions.map((cuisine) => (
                        <TouchableOpacity
                            key={cuisine}
                            style={[styles.tag, favCuisines.includes(cuisine) && styles.tagActive]}
                            onPress={() => togglePreference(cuisine, favCuisines, setFavCuisines)}
                        >
                            <Text style={[styles.tagText, favCuisines.includes(cuisine) && styles.tagTextActive]}>
                                {cuisine}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Quick Links */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t.myActivity || 'My Activity'}</Text>

                <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('Favorites')}>
                    <Icon name="favorite" size={24} color={theme.colors.error} />
                    <Text style={styles.linkText}>{t.favStalls || 'Favorite Stalls'}</Text>
                    <Icon name="chevron-right" size={24} color={theme.colors.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('MyReviews')}>
                    <Icon name="rate-review" size={24} color={theme.colors.secondary} />
                    <Text style={styles.linkText}>{t.myReviews || 'My Reviews'}</Text>
                    <Icon name="chevron-right" size={24} color={theme.colors.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('Notifications')}>
                    <Icon name="notifications" size={24} color={theme.colors.warning || '#FFA000'} />
                    <Text style={styles.linkText}>{t.notifications || 'Notifications'}</Text>
                    <Icon name="chevron-right" size={24} color={theme.colors.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('Settings')}>
                    <Icon name="settings" size={24} color={theme.colors.primary} />
                    <Text style={styles.linkText}>{t.settings || 'Settings'}</Text>
                    <Icon name="chevron-right" size={24} color={theme.colors.textSecondary} />
                </TouchableOpacity>
            </View>

            {/* Logout */}
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <Icon name="logout" size={20} color={theme.colors.error} />
                <Text style={styles.logoutText}>{t.logout || 'Logout'}</Text>
            </TouchableOpacity>

            <View style={{ height: 100 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    profileHeader: {
        alignItems: 'center',
        paddingVertical: theme.spacing.xl,
        backgroundColor: theme.colors.primary,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: 'white',
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: theme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'white',
    },
    editAvatarBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: theme.colors.secondary,
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    userName: {
        fontSize: theme.typography.fontSize['2xl'],
        fontWeight: 'bold',
        color: 'white',
        marginTop: theme.spacing.md,
    },
    userEmail: {
        fontSize: theme.typography.fontSize.sm,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 4,
    },
    editToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.md,
        backgroundColor: theme.colors.surface,
        marginHorizontal: theme.spacing.md,
        marginTop: -20,
        borderRadius: theme.borderRadius.md,
        ...theme.shadows.md,
        gap: theme.spacing.sm,
    },
    editToggleText: {
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.primary,
        fontWeight: '600',
    },
    section: {
        padding: theme.spacing.md,
        marginTop: theme.spacing.md,
    },
    sectionTitle: {
        fontSize: theme.typography.fontSize.lg,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.md,
    },
    field: {
        marginBottom: theme.spacing.md,
    },
    fieldLabel: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textSecondary,
        marginBottom: 4,
    },
    input: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.textPrimary,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    inputDisabled: {
        backgroundColor: theme.colors.background,
        color: theme.colors.textSecondary,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.sm,
    },
    tag: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderRadius: 20,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    tagActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    tagText: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textSecondary,
    },
    tagTextActive: {
        color: 'white',
        fontWeight: '600',
    },
    linkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        marginBottom: theme.spacing.sm,
        ...theme.shadows.sm,
    },
    linkText: {
        flex: 1,
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.textPrimary,
        marginLeft: theme.spacing.md,
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: theme.spacing.md,
        marginTop: theme.spacing.lg,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.error,
        gap: theme.spacing.sm,
    },
    logoutText: {
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.error,
        fontWeight: '600',
    },
});

export default UserProfile;
