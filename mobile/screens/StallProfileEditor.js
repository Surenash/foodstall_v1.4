import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Image,
    Alert,
    Switch,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import theme from '../styles/theme';

/**
 * StallProfileEditor Screen
 * Comprehensive vendor profile management with tabbed sections
 */
const StallProfileEditor = ({ route, navigation }) => {
    const { stallId = '1' } = route?.params || {};

    // Tab state
    const [activeTab, setActiveTab] = useState('info');

    // Basic Info state
    const [stallName, setStallName] = useState("Surena's Stall");
    const [cuisineType, setCuisineType] = useState('South Indian');
    const [description, setDescription] = useState('Authentic South Indian delicacies - Crispy Dosas, fluffy Idlis, and piping hot Sambar.');
    const [priceRange, setPriceRange] = useState('₹₹');
    const [openTime, setOpenTime] = useState('08:00');
    const [closeTime, setCloseTime] = useState('20:00');
    const [dietaryTags, setDietaryTags] = useState(['Vegetarian', 'Vegan']);

    // Photos state
    const [coverPhoto, setCoverPhoto] = useState(null);
    const [galleryPhotos, setGalleryPhotos] = useState([]);

    // Menu state
    const [menuItems, setMenuItems] = useState([
        { id: '1', name: 'Masala Dosa', price: '60', category: 'Main' },
        { id: '2', name: 'Idli Sambar', price: '40', category: 'Main' },
        { id: '3', name: 'Filter Coffee', price: '20', category: 'Beverages' },
    ]);

    // Documents state
    const [fssaiNumber, setFssaiNumber] = useState('');
    const [fssaiDoc, setFssaiDoc] = useState(null);
    const [hygieneBadges, setHygieneBadges] = useState({
        filtered_water: false,
        wears_gloves: true,
        covered_area: true,
        valid_fssai: false,
    });

    // Location state
    const [address, setAddress] = useState('');
    const [landmark, setLandmark] = useState('');

    const cuisineOptions = ['South Indian', 'North Indian', 'Chinese', 'Street Food', 'Fast Food', 'Beverages', 'Biryani', 'Chaat', 'Other'];
    const priceOptions = ['₹', '₹₹', '₹₹₹'];
    const dietaryOptions = ['Vegetarian', 'Vegan', 'Non-Veg', 'Halal', 'Jain', 'Gluten-Free'];
    const menuCategories = ['Starters', 'Main', 'Beverages', 'Desserts', 'Snacks'];

    // Image picker function
    const pickImage = async (setImage, allowMultiple = false) => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: allowMultiple,
            quality: 0.8,
        });

        if (!result.canceled) {
            if (allowMultiple) {
                const newPhotos = result.assets.map(a => a.uri);
                setGalleryPhotos([...galleryPhotos, ...newPhotos].slice(0, 10));
            } else {
                setImage(result.assets[0].uri);
            }
        }
    };

    const handleSave = () => {
        Alert.alert('Saved!', 'Your stall profile has been updated.', [
            { text: 'OK', onPress: () => navigation.goBack() }
        ]);
    };

    const toggleDietaryTag = (tag) => {
        if (dietaryTags.includes(tag)) {
            setDietaryTags(dietaryTags.filter(t => t !== tag));
        } else {
            setDietaryTags([...dietaryTags, tag]);
        }
    };

    const addMenuItem = () => {
        const newItem = {
            id: Date.now().toString(),
            name: '',
            price: '',
            category: 'Main',
        };
        setMenuItems([...menuItems, newItem]);
    };

    const updateMenuItem = (id, field, value) => {
        setMenuItems(menuItems.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const deleteMenuItem = (id) => {
        setMenuItems(menuItems.filter(item => item.id !== id));
    };

    const tabs = [
        { key: 'info', label: 'Info', icon: 'info' },
        { key: 'photos', label: 'Photos', icon: 'photo-library' },
        { key: 'menu', label: 'Menu', icon: 'restaurant-menu' },
        { key: 'docs', label: 'Docs', icon: 'verified-user' },
        { key: 'location', label: 'Location', icon: 'location-on' },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'info':
                return renderInfoTab();
            case 'photos':
                return renderPhotosTab();
            case 'menu':
                return renderMenuTab();
            case 'docs':
                return renderDocsTab();
            case 'location':
                return renderLocationTab();
            default:
                return null;
        }
    };

    const renderInfoTab = () => (
        <View style={styles.tabContent}>
            <Text style={styles.label}>Stall Name *</Text>
            <TextInput
                style={styles.input}
                value={stallName}
                onChangeText={setStallName}
                placeholder="Enter stall name"
            />

            <Text style={styles.label}>Cuisine Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsRow}>
                {cuisineOptions.map((cuisine) => (
                    <TouchableOpacity
                        key={cuisine}
                        style={[styles.optionChip, cuisineType === cuisine && styles.optionChipActive]}
                        onPress={() => setCuisineType(cuisine)}
                    >
                        <Text style={[styles.optionText, cuisineType === cuisine && styles.optionTextActive]}>
                            {cuisine}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <Text style={styles.label}>Description</Text>
            <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe your stall..."
                multiline
                numberOfLines={4}
            />

            <Text style={styles.label}>Price Range</Text>
            <View style={styles.priceRow}>
                {priceOptions.map((price) => (
                    <TouchableOpacity
                        key={price}
                        style={[styles.priceBtn, priceRange === price && styles.priceBtnActive]}
                        onPress={() => setPriceRange(price)}
                    >
                        <Text style={[styles.priceText, priceRange === price && styles.priceTextActive]}>
                            {price}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.label}>Operating Hours</Text>
            <View style={styles.hoursRow}>
                <View style={styles.hourInput}>
                    <Text style={styles.hourLabel}>Open</Text>
                    <TextInput
                        style={styles.timeInput}
                        value={openTime}
                        onChangeText={setOpenTime}
                        placeholder="08:00"
                    />
                </View>
                <Text style={styles.hoursTo}>to</Text>
                <View style={styles.hourInput}>
                    <Text style={styles.hourLabel}>Close</Text>
                    <TextInput
                        style={styles.timeInput}
                        value={closeTime}
                        onChangeText={setCloseTime}
                        placeholder="20:00"
                    />
                </View>
            </View>

            <Text style={styles.label}>Dietary Tags</Text>
            <View style={styles.tagsContainer}>
                {dietaryOptions.map((tag) => (
                    <TouchableOpacity
                        key={tag}
                        style={[styles.tagChip, dietaryTags.includes(tag) && styles.tagChipActive]}
                        onPress={() => toggleDietaryTag(tag)}
                    >
                        <Icon
                            name={dietaryTags.includes(tag) ? 'check-circle' : 'add-circle-outline'}
                            size={16}
                            color={dietaryTags.includes(tag) ? 'white' : theme.colors.primary}
                        />
                        <Text style={[styles.tagText, dietaryTags.includes(tag) && styles.tagTextActive]}>
                            {tag}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const renderPhotosTab = () => (
        <View style={styles.tabContent}>
            <Text style={styles.label}>Cover Photo</Text>
            <TouchableOpacity
                style={styles.coverPhotoUpload}
                onPress={() => pickImage(setCoverPhoto)}
            >
                {coverPhoto ? (
                    <Image source={{ uri: coverPhoto }} style={styles.coverPhotoPreview} />
                ) : (
                    <View style={styles.uploadPlaceholder}>
                        <Icon name="add-photo-alternate" size={48} color={theme.colors.primary} />
                        <Text style={styles.uploadText}>Tap to upload cover photo</Text>
                    </View>
                )}
            </TouchableOpacity>

            <Text style={styles.label}>Gallery Photos ({galleryPhotos.length}/10)</Text>
            <TouchableOpacity
                style={styles.addGalleryBtn}
                onPress={() => pickImage(null, true)}
                disabled={galleryPhotos.length >= 10}
            >
                <Icon name="add-photo-alternate" size={24} color={theme.colors.primary} />
                <Text style={styles.addGalleryText}>Add Photos</Text>
            </TouchableOpacity>

            <View style={styles.galleryGrid}>
                {galleryPhotos.map((uri, index) => (
                    <View key={index} style={styles.galleryItem}>
                        <Image source={{ uri }} style={styles.galleryPhoto} />
                        <TouchableOpacity
                            style={styles.removePhotoBtn}
                            onPress={() => setGalleryPhotos(galleryPhotos.filter((_, i) => i !== index))}
                        >
                            <Icon name="close" size={16} color="white" />
                        </TouchableOpacity>
                    </View>
                ))}
            </View>
        </View>
    );

    const renderMenuTab = () => (
        <View style={styles.tabContent}>
            <View style={styles.menuHeader}>
                <Text style={styles.label}>Menu Items</Text>
                <TouchableOpacity style={styles.addItemBtn} onPress={addMenuItem}>
                    <Icon name="add" size={20} color="white" />
                    <Text style={styles.addItemText}>Add Item</Text>
                </TouchableOpacity>
            </View>

            {menuItems.map((item) => (
                <View key={item.id} style={styles.menuItemCard}>
                    <View style={styles.menuItemRow}>
                        <TextInput
                            style={[styles.menuInput, { flex: 2 }]}
                            value={item.name}
                            onChangeText={(v) => updateMenuItem(item.id, 'name', v)}
                            placeholder="Item name"
                        />
                        <TextInput
                            style={[styles.menuInput, { flex: 1 }]}
                            value={item.price}
                            onChangeText={(v) => updateMenuItem(item.id, 'price', v)}
                            placeholder="₹ Price"
                            keyboardType="numeric"
                        />
                        <TouchableOpacity
                            style={styles.deleteItemBtn}
                            onPress={() => deleteMenuItem(item.id)}
                        >
                            <Icon name="delete" size={20} color={theme.colors.error} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {menuCategories.map((cat) => (
                            <TouchableOpacity
                                key={cat}
                                style={[styles.categoryChip, item.category === cat && styles.categoryChipActive]}
                                onPress={() => updateMenuItem(item.id, 'category', cat)}
                            >
                                <Text style={[styles.categoryText, item.category === cat && styles.categoryTextActive]}>
                                    {cat}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            ))}
        </View>
    );

    const renderDocsTab = () => (
        <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>FSSAI License</Text>

            <Text style={styles.label}>License Number</Text>
            <TextInput
                style={styles.input}
                value={fssaiNumber}
                onChangeText={setFssaiNumber}
                placeholder="Enter 14-digit FSSAI number"
                keyboardType="numeric"
                maxLength={14}
            />

            <Text style={styles.label}>Upload Certificate</Text>
            <TouchableOpacity
                style={styles.docUpload}
                onPress={() => pickImage(setFssaiDoc)}
            >
                {fssaiDoc ? (
                    <View style={styles.docPreview}>
                        <Image source={{ uri: fssaiDoc }} style={styles.docImage} />
                        <Icon name="check-circle" size={24} color={theme.colors.success} />
                    </View>
                ) : (
                    <View style={styles.uploadPlaceholder}>
                        <Icon name="upload-file" size={40} color={theme.colors.primary} />
                        <Text style={styles.uploadText}>Upload FSSAI Certificate</Text>
                    </View>
                )}
            </TouchableOpacity>

            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Hygiene Practices</Text>

            {Object.entries({
                filtered_water: 'Uses filtered/RO water',
                wears_gloves: 'Staff wears gloves',
                covered_area: 'Covered cooking area',
                valid_fssai: 'Valid FSSAI certificate',
            }).map(([key, label]) => (
                <View key={key} style={styles.badgeRow}>
                    <View style={styles.badgeInfo}>
                        <Icon
                            name={hygieneBadges[key] ? 'check-circle' : 'radio-button-unchecked'}
                            size={24}
                            color={hygieneBadges[key] ? theme.colors.success : theme.colors.border}
                        />
                        <Text style={styles.badgeLabel}>{label}</Text>
                    </View>
                    <Switch
                        value={hygieneBadges[key]}
                        onValueChange={(v) => setHygieneBadges({ ...hygieneBadges, [key]: v })}
                        trackColor={{ false: theme.colors.border, true: theme.colors.success }}
                    />
                </View>
            ))}
        </View>
    );

    const renderLocationTab = () => (
        <View style={styles.tabContent}>
            <Text style={styles.label}>Street Address</Text>
            <TextInput
                style={[styles.input, styles.textArea]}
                value={address}
                onChangeText={setAddress}
                placeholder="Enter your stall's full address"
                multiline
                numberOfLines={3}
            />

            <Text style={styles.label}>Nearby Landmark</Text>
            <TextInput
                style={styles.input}
                value={landmark}
                onChangeText={setLandmark}
                placeholder="e.g., Near City Mall, Opposite Bus Stop"
            />

            <TouchableOpacity style={styles.gpsButton}>
                <Icon name="my-location" size={20} color="white" />
                <Text style={styles.gpsButtonText}>Use Current Location</Text>
            </TouchableOpacity>

            <View style={styles.mapPlaceholder}>
                <Icon name="map" size={48} color={theme.colors.textSecondary} />
                <Text style={styles.mapPlaceholderText}>Map preview will appear here</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Tab Bar */}
            <View style={styles.tabBar}>
                {tabs.map((tab) => (
                    <TouchableOpacity
                        key={tab.key}
                        style={[styles.tab, activeTab === tab.key && styles.tabActive]}
                        onPress={() => setActiveTab(tab.key)}
                    >
                        <Icon
                            name={tab.icon}
                            size={20}
                            color={activeTab === tab.key ? theme.colors.primary : theme.colors.textSecondary}
                        />
                        <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Tab Content */}
            <ScrollView style={styles.scrollContent}>
                {renderTabContent()}
            </ScrollView>

            {/* Save Button */}
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Icon name="save" size={24} color="white" />
                <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
    },
    tabActive: {
        borderBottomWidth: 2,
        borderBottomColor: theme.colors.primary,
    },
    tabLabel: {
        fontSize: 10,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    tabLabelActive: {
        color: theme.colors.primary,
        fontWeight: '600',
    },
    scrollContent: {
        flex: 1,
    },
    tabContent: {
        padding: theme.spacing.md,
        paddingBottom: 100,
    },
    label: {
        fontSize: theme.typography.fontSize.sm,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.xs,
        marginTop: theme.spacing.md,
    },
    sectionTitle: {
        fontSize: theme.typography.fontSize.lg,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.sm,
    },
    input: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        fontSize: theme.typography.fontSize.base,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    optionsRow: {
        flexDirection: 'row',
        marginBottom: theme.spacing.sm,
    },
    optionChip: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderRadius: 20,
        backgroundColor: theme.colors.surface,
        marginRight: theme.spacing.sm,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    optionChipActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    optionText: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textSecondary,
    },
    optionTextActive: {
        color: 'white',
        fontWeight: '600',
    },
    priceRow: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
    },
    priceBtn: {
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    priceBtnActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    priceText: {
        fontSize: theme.typography.fontSize.lg,
        color: theme.colors.textSecondary,
    },
    priceTextActive: {
        color: 'white',
        fontWeight: 'bold',
    },
    hoursRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
    },
    hourInput: {
        flex: 1,
    },
    hourLabel: {
        fontSize: theme.typography.fontSize.xs,
        color: theme.colors.textSecondary,
        marginBottom: 4,
    },
    timeInput: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        fontSize: theme.typography.fontSize.base,
        borderWidth: 1,
        borderColor: theme.colors.border,
        textAlign: 'center',
    },
    hoursTo: {
        color: theme.colors.textSecondary,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.sm,
    },
    tagChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderRadius: 20,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.primary,
        gap: 4,
    },
    tagChipActive: {
        backgroundColor: theme.colors.primary,
    },
    tagText: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.primary,
    },
    tagTextActive: {
        color: 'white',
    },
    coverPhotoUpload: {
        height: 180,
        borderRadius: theme.borderRadius.lg,
        backgroundColor: theme.colors.surface,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: theme.colors.border,
        borderStyle: 'dashed',
    },
    coverPhotoPreview: {
        width: '100%',
        height: '100%',
    },
    uploadPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    uploadText: {
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.sm,
    },
    addGalleryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.md,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.primary,
        borderStyle: 'dashed',
        gap: theme.spacing.sm,
    },
    addGalleryText: {
        color: theme.colors.primary,
        fontWeight: '500',
    },
    galleryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.sm,
        marginTop: theme.spacing.md,
    },
    galleryItem: {
        position: 'relative',
    },
    galleryPhoto: {
        width: 100,
        height: 100,
        borderRadius: theme.borderRadius.md,
    },
    removePhotoBtn: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: theme.colors.error,
        borderRadius: 12,
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    addItemBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.primary,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.borderRadius.md,
        gap: 4,
    },
    addItemText: {
        color: 'white',
        fontWeight: '600',
    },
    menuItemCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        marginTop: theme.spacing.md,
        ...theme.shadows.sm,
    },
    menuItemRow: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.sm,
    },
    menuInput: {
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.sm,
        padding: theme.spacing.sm,
        fontSize: theme.typography.fontSize.sm,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    deleteItemBtn: {
        justifyContent: 'center',
        paddingHorizontal: theme.spacing.sm,
    },
    categoryChip: {
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: theme.colors.background,
        marginRight: theme.spacing.xs,
    },
    categoryChipActive: {
        backgroundColor: theme.colors.secondary,
    },
    categoryText: {
        fontSize: theme.typography.fontSize.xs,
        color: theme.colors.textSecondary,
    },
    categoryTextActive: {
        color: theme.colors.textPrimary,
        fontWeight: '600',
    },
    docUpload: {
        height: 120,
        borderRadius: theme.borderRadius.md,
        backgroundColor: theme.colors.surface,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: theme.colors.border,
        borderStyle: 'dashed',
    },
    docPreview: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.md,
    },
    docImage: {
        width: 80,
        height: 80,
        borderRadius: theme.borderRadius.sm,
    },
    badgeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    badgeInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
    },
    badgeLabel: {
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.textPrimary,
    },
    gpsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.primary,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        marginTop: theme.spacing.lg,
        gap: theme.spacing.sm,
    },
    gpsButtonText: {
        color: 'white',
        fontWeight: '600',
    },
    mapPlaceholder: {
        height: 200,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        marginTop: theme.spacing.lg,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    mapPlaceholderText: {
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.sm,
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.success,
        paddingVertical: theme.spacing.md,
        margin: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        gap: theme.spacing.sm,
        ...theme.shadows.md,
    },
    saveButtonText: {
        color: 'white',
        fontSize: theme.typography.fontSize.lg,
        fontWeight: 'bold',
    },
});

export default StallProfileEditor;
