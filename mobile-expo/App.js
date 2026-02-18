import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    TextInput,
    ScrollView,
    Alert,
    Linking,
    Platform,
    KeyboardAvoidingView,
    Image,
    Dimensions
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { MOCK_STALLS, MOCK_OWNER } from './services/mockData';

const Stack = createStackNavigator();
const { width, height } = Dimensions.get('window');

// ===== LANGUAGE SELECTION SCREEN =====
function LanguageSelection({ navigation }) {
    const [selected, setSelected] = useState('en');

    const languages = [
        { code: 'en', name: 'English', native: 'English' },
        { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
        { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
    ];

    return (
        <View style={styles.langContainer}>
            <View style={styles.langHeader}>
                <Text style={styles.emoji}>🍲</Text>
                <Text style={styles.appTitle}>Food Stall Discovery</Text>
                <Text style={styles.subtitle}>Choose your language</Text>
            </View>
            <ScrollView style={styles.langList}>
                {languages.map((lang) => (
                    <TouchableOpacity
                        key={lang.code}
                        style={[styles.langCard, selected === lang.code && styles.langCardActive]}
                        onPress={() => setSelected(lang.code)}
                    >
                        <View>
                            <Text style={styles.langName}>{lang.name}</Text>
                            <Text style={styles.langNative}>{lang.native}</Text>
                        </View>
                        {selected === lang.code && <Text style={styles.checkmark}>✓</Text>}
                    </TouchableOpacity>
                ))}
            </ScrollView>
            <TouchableOpacity style={styles.continueBtn} onPress={() => navigation.navigate('LoginScreen')}>
                <Text style={styles.continueBtnText}>Continue</Text>
            </TouchableOpacity>
        </View>
    );
}

// ===== UNIFIED LOGIN SCREEN =====
function LoginScreen({ navigation }) {
    const [role, setRole] = useState('user');

    // Demo Login - No Auth Required
    const handleLogin = () => {
        if (role === 'vendor') {
            navigation.replace('OwnerDashboard');
        } else {
            navigation.replace('StallsList');
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.loginContainer}>
                <View style={styles.loginHeader}>
                    <Text style={styles.loginTitle}>Welcome</Text>
                    <Text style={styles.loginSubtitle}>Sign in to continue (Demo Mode)</Text>
                </View>

                <View style={styles.roleSwitch}>
                    <TouchableOpacity style={[styles.roleBtn, role === 'user' && styles.roleBtnActive]} onPress={() => setRole('user')}>
                        <MaterialIcons name="person" size={20} color={role === 'user' ? 'white' : '#666'} />
                        <Text style={[styles.roleText, role === 'user' && styles.roleTextActive]}>Customer</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.roleBtn, role === 'vendor' && styles.roleBtnActive]} onPress={() => setRole('vendor')}>
                        <MaterialIcons name="store" size={20} color={role === 'vendor' ? 'white' : '#666'} />
                        <Text style={[styles.roleText, role === 'vendor' && styles.roleTextActive]}>Vendor</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                    <TouchableOpacity style={styles.primaryBtn} onPress={handleLogin}>
                        <Text style={styles.primaryBtnText}>Login as {role === 'user' ? 'Foodie' : 'Vendor'}</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.termsText}>Demo Mode: No password required</Text>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

// ===== STALLS LIST SCREEN =====
function StallsList({ navigation }) {
    const [stalls, setStalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState(null);
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState('list');

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setUserLocation(location.coords);

            // Calculate distance for mock stalls based on user location
            // For Demo: Use mock stalls directly
            setStalls(MOCK_STALLS);
            setLoading(false);
        })();
    }, []);

    const filtered = stalls.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

    if (loading) return <ActivityIndicator style={styles.center} size="large" color="#FF5733" />;

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <View style={styles.searchBox}>
                    <MaterialIcons name="search" size={24} color="#757575" />
                    <TextInput style={styles.searchInput} placeholder="Search stalls..." value={search} onChangeText={setSearch} />
                </View>
                <TouchableOpacity style={styles.toggleViewBtn} onPress={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}>
                    <MaterialIcons name={viewMode === 'list' ? 'map' : 'view-list'} size={24} color="white" />
                </TouchableOpacity>
            </View>

            {viewMode === 'list' ? (
                <FlatList
                    data={filtered}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('StallDetail', { stall: item })}>
                            <Image source={{ uri: item.bg_image }} style={styles.cardImage} />
                            <View style={styles.cardContent}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.stallName}>{item.name}</Text>
                                    <View style={[styles.badge, item.is_open ? styles.open : styles.closed]}>
                                        <Text style={styles.badgeText}>{item.is_open ? 'OPEN' : 'CLOSED'}</Text>
                                    </View>
                                </View>
                                <Text style={styles.cuisine}>{item.cuisine_type}</Text>
                                <View style={styles.infoRow}>
                                    <MaterialIcons name="location-on" size={16} color="#FF5733" />
                                    <Text style={styles.infoText}>{item.distance_km} km</Text>
                                    <Text style={styles.infoText}> • ⭐ {item.rating} ({item.reviews_count})</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            ) : (
                <MapView
                    style={styles.map}
                    provider={PROVIDER_GOOGLE}
                    initialRegion={{
                        latitude: userLocation ? userLocation.latitude : 19.0760,
                        longitude: userLocation ? userLocation.longitude : 72.8777,
                        latitudeDelta: 0.05,
                        longitudeDelta: 0.05,
                    }}
                    showsUserLocation={true}
                >
                    {filtered.map(s => (
                        <Marker
                            key={s.id}
                            coordinate={{ latitude: s.latitude, longitude: s.longitude }}
                            title={s.name}
                            description={s.cuisine_type}
                            onCalloutPress={() => navigation.navigate('StallDetail', { stall: s })}
                        />
                    ))}
                </MapView>
            )}
        </View>
    );
}

// ===== STALL DETAIL SCREEN =====
function StallDetail({ route, navigation }) {
    const { stall } = route.params;

    const openDirections = () => {
        const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
        const latLng = `${stall.latitude},${stall.longitude}`;
        const label = stall.name;
        const url = Platform.select({ ios: `${scheme}${label}@${latLng}`, android: `${scheme}${latLng}(${label})` });
        Linking.openURL(url);
    };

    return (
        <ScrollView style={styles.container}>
            <Image source={{ uri: stall.bg_image }} style={styles.detailImage} />
            <View style={styles.detailContent}>
                <View style={styles.detailHeader}>
                    <Text style={styles.detailName}>{stall.name}</Text>
                    <View style={[styles.badge, stall.is_open ? styles.open : styles.closed]}>
                        <Text style={styles.badgeText}>{stall.is_open ? '● OPEN' : '● CLOSED'}</Text>
                    </View>
                </View>

                <View style={styles.detailSection}>
                    <MaterialIcons name="restaurant" size={20} color="#FF5733" />
                    <Text style={styles.detailCuisine}>{stall.cuisine_type}</Text>
                    <Text style={styles.priceRange}>{stall.price_range}</Text>
                </View>

                <Text style={styles.description}>{stall.description}</Text>

                <Text style={styles.sectionTitle}>Menu</Text>
                {stall.menu.map(item => (
                    <View key={item.id} style={styles.menuItem}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <MaterialIcons name="circle" size={12} color={item.is_veg ? "green" : "red"} />
                            <Text style={styles.menuName}>{item.name}</Text>
                        </View>
                        <Text style={styles.menuPrice}>₹{item.price}</Text>
                    </View>
                ))}

                <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.actionBtn} onPress={openDirections}>
                        <MaterialIcons name="directions" size={24} color="#FFF" />
                        <Text style={styles.actionBtnText}>Directions</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, styles.reviewBtn]} onPress={() => navigation.navigate('ReviewForm', { stallId: stall.id, stallName: stall.name })}>
                        <MaterialIcons name="rate-review" size={24} color="#FF5733" />
                        <Text style={[styles.actionBtnText, { color: '#FF5733' }]}>Review</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

// ===== REVIEW FORM SCREEN =====
function ReviewForm({ route, navigation }) {
    const { stallName } = route.params;
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    const submitReview = () => {
        Alert.alert('Success', 'Review Submitted!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.reviewTitle}>Review {stallName}</Text>
            <View style={styles.ratingBox}>
                <View style={styles.stars}>
                    {[1, 2, 3, 4, 5].map(star => (
                        <TouchableOpacity key={star} onPress={() => setRating(star)}>
                            <MaterialIcons name={star <= rating ? "star" : "star-border"} size={40} color="#FFC300" />
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
            <TextInput style={styles.inputBox} placeholder="Write a comment..." multiline value={comment} onChangeText={setComment} />
            <TouchableOpacity style={styles.submitBtn} onPress={submitReview}>
                <Text style={styles.submitBtnText}>Submit Review</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

// ===== OWNER DASHBOARD SCREEN =====
function OwnerDashboard({ navigation }) {
    const [stall, setStall] = useState(MOCK_STALLS[0]);
    const [activeTab, setActiveTab] = useState('status'); // status | location | menu
    const [region, setRegion] = useState({
        latitude: stall.latitude,
        longitude: stall.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    });

    const toggleStatus = () => {
        setStall({ ...stall, is_open: !stall.is_open });
    };

    const updateLocation = () => {
        Alert.alert("Success", "Stall location updated to current map center!");
        // In real app, this would save region.latitude/longitude to backend
    };

    return (
        <View style={styles.dashboardContainer}>
            <View style={styles.tabBar}>
                <TouchableOpacity style={[styles.tab, activeTab === 'status' && styles.activeTab]} onPress={() => setActiveTab('status')}><Text style={activeTab === 'status' ? styles.activeTabText : styles.tabText}>Status</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.tab, activeTab === 'location' && styles.activeTab]} onPress={() => setActiveTab('location')}><Text style={activeTab === 'location' ? styles.activeTabText : styles.tabText}>Location</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.tab, activeTab === 'menu' && styles.activeTab]} onPress={() => setActiveTab('menu')}><Text style={activeTab === 'menu' ? styles.activeTabText : styles.tabText}>Menu</Text></TouchableOpacity>
            </View>

            {activeTab === 'status' && (
                <View style={styles.centerContent}>
                    <Text style={styles.dashTitle}>{stall.name}</Text>
                    <View style={styles.statusCard}>
                        <Text style={styles.statusLabel}>Current Status</Text>
                        <Text style={[styles.statusBig, stall.is_open ? styles.textOpen : styles.textClosed]}>{stall.is_open ? 'ONLINE' : 'OFFLINE'}</Text>
                    </View>
                    <TouchableOpacity style={[styles.toggleBtn, stall.is_open ? styles.btnOffline : styles.btnOnline]} onPress={toggleStatus}>
                        <MaterialIcons name="power-settings-new" size={40} color="white" />
                        <Text style={styles.toggleBtnText}>{stall.is_open ? 'GO OFFLINE' : 'GO ONLINE'}</Text>
                    </TouchableOpacity>
                </View>
            )}

            {activeTab === 'location' && (
                <View style={styles.mapContainer}>
                    <Text style={styles.mapInstruction}>Drag map to move pin. Tap update to save.</Text>
                    <MapView
                        style={styles.fullMap}
                        region={region}
                        onRegionChangeComplete={setRegion}
                        provider={PROVIDER_GOOGLE}
                    >
                        <Marker coordinate={region} />
                    </MapView>
                    <TouchableOpacity style={styles.updateLocBtn} onPress={updateLocation}>
                        <Text style={styles.updateLocText}>Update Location</Text>
                    </TouchableOpacity>
                </View>
            )}
            {activeTab === 'menu' && (
                <View style={styles.centerContent}>
                    <Text>Menu Management (Demo)</Text>
                    <FlatList
                        data={stall.menu}
                        renderItem={({ item }) => (
                            <View style={styles.menuItem}>
                                <Text>{item.name}</Text>
                                <Text>₹{item.price}</Text>
                            </View>
                        )}
                    />
                </View>
            )}
        </View>
    );
}

// ===== SIGN UP SCREEN (Simplified) =====
function SignUpScreen({ navigation }) {
    // Reusing Login for Demo
    return <LoginScreen navigation={navigation} />;
}

// ===== MAIN APP =====
export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#FF5733' }, headerTintColor: '#FFF' }}>
                <Stack.Screen name="LanguageSelection" component={LanguageSelection} options={{ headerShown: false }} />
                <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
                <Stack.Screen name="SignUpScreen" component={SignUpScreen} options={{ headerShown: false }} />
                <Stack.Screen name="StallsList" component={StallsList} options={{ title: '🍲 Food Stalls' }} />
                <Stack.Screen name="StallDetail" component={StallDetail} options={{ title: 'Stall Details' }} />
                <Stack.Screen name="ReviewForm" component={ReviewForm} options={{ title: 'Write Review' }} />
                <Stack.Screen name="OwnerDashboard" component={OwnerDashboard} options={{ title: 'Owner Dashboard' }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

// ===== STYLES =====
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    map: { flex: 1 },

    // Lang
    langContainer: { flex: 1, backgroundColor: '#FFF', padding: 20 },
    langHeader: { alignItems: 'center', marginTop: 50, marginBottom: 30 },
    emoji: { fontSize: 60 },
    appTitle: { fontSize: 24, fontWeight: 'bold', color: '#FF5733', marginTop: 10 },
    subtitle: { fontSize: 16, color: '#666' },
    langList: { flex: 1 },
    langCard: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, backgroundColor: '#f5f5f5', borderRadius: 12, marginBottom: 15, alignItems: 'center' },
    langCardActive: { backgroundColor: '#FF5733', borderWidth: 1, borderColor: '#ff8a65' },
    langName: { fontSize: 18, fontWeight: 'bold' },
    continueBtn: { backgroundColor: '#FF5733', padding: 18, borderRadius: 12, alignItems: 'center', marginBottom: 20 },
    continueBtnText: { color: 'white', fontWeight: 'bold', fontSize: 18 },

    // Login
    loginContainer: { flexGrow: 1, justifyContent: 'center', padding: 30 },
    loginHeader: { marginBottom: 40, alignItems: 'center' },
    loginTitle: { fontSize: 32, fontWeight: 'bold' },
    roleSwitch: { flexDirection: 'row', backgroundColor: '#eee', borderRadius: 10, padding: 5, marginBottom: 30 },
    roleBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', padding: 12, borderRadius: 8, alignItems: 'center' },
    roleBtnActive: { backgroundColor: '#FF5733' },
    roleText: { marginLeft: 8, fontWeight: 'bold', color: '#555' },
    roleTextActive: { color: 'white' },
    primaryBtn: { backgroundColor: '#FF5733', padding: 16, borderRadius: 10, alignItems: 'center' },
    primaryBtnText: { color: 'white', fontSize: 18, fontWeight: 'bold' },

    // List
    headerRow: { flexDirection: 'row', padding: 10, backgroundColor: '#FF5733', alignItems: 'center' },
    searchBox: { flex: 1, flexDirection: 'row', backgroundColor: 'white', borderRadius: 8, padding: 8, alignItems: 'center', marginRight: 10 },
    searchInput: { flex: 1, marginLeft: 5 },
    toggleViewBtn: { padding: 8 },
    card: { backgroundColor: 'white', margin: 10, borderRadius: 12, overflow: 'hidden', elevation: 3 },
    cardImage: { width: '100%', height: 150 },
    cardContent: { padding: 15 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    stallName: { fontSize: 20, fontWeight: 'bold' },
    cuisine: { color: '#666', marginBottom: 8 },
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    open: { backgroundColor: '#e8f5e9' },
    closed: { backgroundColor: '#ffebee' },
    badgeText: { fontSize: 12, fontWeight: 'bold', color: '#2e7d32' },
    infoRow: { flexDirection: 'row', alignItems: 'center' },
    infoText: { marginLeft: 5, color: '#555' },

    // Detail
    detailImage: { width: '100%', height: 250 },
    detailContent: { padding: 20 },
    detailName: { fontSize: 26, fontWeight: 'bold', marginBottom: 5 },
    detailSection: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    detailCuisine: { fontSize: 16, color: '#666', marginLeft: 5, marginRight: 15 },
    priceRange: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    description: { fontSize: 16, lineHeight: 24, marginBottom: 20, color: '#444' },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
    menuItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
    menuName: { fontSize: 16, marginLeft: 10 },
    menuPrice: { fontSize: 16, fontWeight: 'bold' },
    actionButtons: { flexDirection: 'row', marginTop: 30, justifyContent: 'space-between' },
    actionBtn: { flex: 0.48, backgroundColor: '#00C853', flexDirection: 'row', justifyContent: 'center', padding: 15, borderRadius: 10, alignItems: 'center' },
    reviewBtn: { backgroundColor: 'white', borderWidth: 1, borderColor: '#FF5733' },
    actionBtnText: { color: 'white', fontWeight: 'bold', marginLeft: 8 },

    // Review
    reviewTitle: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', margin: 20 },
    stars: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
    inputBox: { backgroundColor: 'white', padding: 15, borderRadius: 10, height: 100, textAlignVertical: 'top', fontSize: 16, marginBottom: 20 },
    submitBtn: { backgroundColor: '#FF5733', padding: 16, borderRadius: 10, alignItems: 'center' },
    submitBtnText: { color: 'white', fontSize: 18, fontWeight: 'bold' },

    // Dashboard
    dashboardContainer: { flex: 1, backgroundColor: '#f0f2f5' },
    tabBar: { flexDirection: 'row', backgroundColor: 'white', elevation: 2 },
    tab: { flex: 1, padding: 15, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
    activeTab: { borderBottomColor: '#FF5733' },
    tabText: { color: '#666', fontWeight: 'bold' },
    activeTabText: { color: '#FF5733', fontWeight: 'bold' },
    centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    dashTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 30 },
    statusCard: { padding: 30, backgroundColor: 'white', borderRadius: 20, alignItems: 'center', width: '100%', marginBottom: 30, elevation: 2 },
    statusLabel: { fontSize: 16, color: '#888', marginBottom: 10 },
    statusBig: { fontSize: 40, fontWeight: 'bold' },
    textOpen: { color: '#00C853' },
    textClosed: { color: '#D32F2F' },
    toggleBtn: { width: 200, height: 200, borderRadius: 100, justifyContent: 'center', alignItems: 'center', elevation: 5 },
    btnOnline: { backgroundColor: '#00C853' },
    btnOffline: { backgroundColor: '#D32F2F' },
    toggleBtnText: { color: 'white', fontSize: 20, fontWeight: 'bold', marginTop: 10 },
    mapContainer: { flex: 1 },
    mapInstruction: { textAlign: 'center', padding: 10, backgroundColor: '#fff3cd' },
    fullMap: { flex: 1 },
    updateLocBtn: { position: 'absolute', bottom: 30, left: 30, right: 30, backgroundColor: '#FF5733', padding: 15, borderRadius: 10, alignItems: 'center', elevation: 5 },
    updateLocText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
});
