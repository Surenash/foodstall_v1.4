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
    KeyboardAvoidingView
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import axios from 'axios';

const API_BASE = 'http://192.168.0.103:3000/api/v1';
const Stack = createStackNavigator();

// Hardcoded for demo - in real app this comes from Auth
const DEMO_OWNER_ID = 3;
const DEMO_STALL_ID = 1;

// ===== LANGUAGE SELECTION SCREEN =====
function LanguageSelection({ navigation }) {
    const [selected, setSelected] = useState('en');

    const languages = [
        { code: 'en', name: 'English', native: 'English' },
        { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
        { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
        { code: 'mr', name: 'Marathi', native: 'मराठी' },
        { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
        { code: 'te', name: 'Telugu', native: 'తెలుగు' },
        { code: 'bn', name: 'Bengali', native: 'বাংলা' },
        { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
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
                        style={[
                            styles.langCard,
                            selected === lang.code && styles.langCardActive
                        ]}
                        onPress={() => setSelected(lang.code)}
                    >
                        <View>
                            <Text style={styles.langName}>{lang.name}</Text>
                            <Text style={styles.langNative}>{lang.native}</Text>
                        </View>
                        {selected === lang.code && (
                            <Text style={styles.checkmark}>✓</Text>
                        )}
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <TouchableOpacity
                style={styles.continueBtn}
                onPress={() => navigation.navigate('LoginScreen')}
            >
                <Text style={styles.continueBtnText}>Continue</Text>
            </TouchableOpacity>
        </View>
    );
}

// ===== UNIFIED LOGIN SCREEN =====
function LoginScreen({ navigation }) {
    const [role, setRole] = useState('user'); // 'user' | 'vendor'
    const [authMethod, setAuthMethod] = useState('otp'); // 'otp' | 'password'
    const [identifier, setIdentifier] = useState(''); // phone or email
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState('input'); // 'input' | 'verify'

    // UX State
    const [showPass, setShowPass] = useState(false);

    const handleLogin = () => {
        if (role === 'vendor') {
            navigation.replace('OwnerDashboard');
        } else {
            navigation.replace('StallsList');
        }
    };

    const sendOtp = () => {
        if (!identifier) {
            Alert.alert("Error", "Please enter valid number/email");
            return;
        }
        setStep('verify');
        Alert.alert("OTP Sent", "Use 1234 to verify");
    };

    const verifyOtp = () => {
        if (otp === '1234') {
            handleLogin();
        } else {
            Alert.alert("Invalid OTP", "Try 1234");
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
            <ScrollView contentContainerStyle={styles.loginContainer}>
                <View style={styles.loginHeader}>
                    <Text style={styles.loginTitle}>Welcome</Text>
                    <Text style={styles.loginSubtitle}>Sign in to continue</Text>
                </View>

                {/* Role Switcher */}
                <View style={styles.roleSwitch}>
                    <TouchableOpacity
                        style={[styles.roleBtn, role === 'user' && styles.roleBtnActive]}
                        onPress={() => { setRole('user'); setAuthMethod('otp'); setStep('input'); }}
                    >
                        <MaterialIcons name="person" size={20} color={role === 'user' ? 'white' : '#666'} />
                        <Text style={[styles.roleText, role === 'user' && styles.roleTextActive]}>Customer</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.roleBtn, role === 'vendor' && styles.roleBtnActive]}
                        onPress={() => { setRole('vendor'); setAuthMethod('otp'); setStep('input'); }}
                    >
                        <MaterialIcons name="store" size={20} color={role === 'vendor' ? 'white' : '#666'} />
                        <Text style={[styles.roleText, role === 'vendor' && styles.roleTextActive]}>Vendor</Text>
                    </TouchableOpacity>
                </View>

                {/* Auth Method Tabs (User only) */}
                {role === 'user' && (
                    <View style={styles.methodTabs}>
                        <TouchableOpacity onPress={() => setAuthMethod('otp')} style={styles.methodTab}>
                            <Text style={[styles.methodText, authMethod === 'otp' && styles.methodTextActive]}>Phone</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setAuthMethod('password')} style={styles.methodTab}>
                            <Text style={[styles.methodText, authMethod === 'password' && styles.methodTextActive]}>Email</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Input Fields */}
                <View style={styles.inputContainer}>
                    {step === 'input' ? (
                        <>
                            <View style={styles.inputWrapper}>
                                <MaterialIcons name={authMethod === 'otp' ? 'phone-iphone' : 'email'} size={20} color="#888" />
                                <TextInput
                                    style={styles.input}
                                    placeholder={authMethod === 'otp' ? "Mobile Number" : "Email Address"}
                                    value={identifier}
                                    onChangeText={setIdentifier}
                                    keyboardType={authMethod === 'otp' ? 'phone-pad' : 'email-address'}
                                    autoCapitalize="none"
                                />
                            </View>

                            {authMethod === 'password' && (
                                <View style={styles.inputWrapper}>
                                    <MaterialIcons name="lock" size={20} color="#888" />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Password"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!showPass}
                                    />
                                    <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                                        <MaterialIcons name={showPass ? "visibility" : "visibility-off"} size={20} color="#888" />
                                    </TouchableOpacity>
                                </View>
                            )}

                            <TouchableOpacity style={styles.primaryBtn} onPress={authMethod === 'password' ? handleLogin : sendOtp}>
                                <Text style={styles.primaryBtnText}>
                                    {authMethod === 'password' ? 'Login' : 'Send OTP'}
                                </Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <View style={styles.inputWrapper}>
                                <MaterialIcons name="lock-clock" size={20} color="#888" />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter 4-digit OTP"
                                    value={otp}
                                    onChangeText={setOtp}
                                    keyboardType="number-pad"
                                    maxLength={4}
                                />
                            </View>
                            <TouchableOpacity style={styles.primaryBtn} onPress={verifyOtp}>
                                <Text style={styles.primaryBtnText}>Verify & Login</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setStep('input')}>
                                <Text style={styles.linkText}>Change Number</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                {/* Social Login Divider */}
                <View style={styles.divider}>
                    <View style={styles.line} />
                    <Text style={styles.orText}>OR</Text>
                    <View style={styles.line} />
                </View>

                {/* Social Buttons */}
                <View style={styles.socialButtons}>
                    <TouchableOpacity style={[styles.socialBtn, { backgroundColor: '#DB4437' }]} onPress={handleLogin}>
                        <FontAwesome name="google" size={20} color="white" />
                        <Text style={styles.socialText}>Google</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.socialBtn, { backgroundColor: '#4267B2' }]} onPress={handleLogin}>
                        <FontAwesome name="facebook" size={20} color="white" />
                        <Text style={styles.socialText}>Facebook</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.termsText}>
                    By continuing, you agree to our Terms & Privacy Policy
                </Text>

                <TouchableOpacity onPress={() => navigation.navigate('SignUpScreen')}>
                    <Text style={styles.linkText}>Don't have an account? <Text style={{ fontWeight: 'bold' }}>Sign Up</Text></Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

// ===== STALLS LIST SCREEN (Map Logic Restored) =====
function StallsList({ navigation }) {
    const [stalls, setStalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState('list'); // list | map

    useEffect(() => {
        fetchStalls();
    }, []);

    const fetchStalls = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(`${API_BASE}/stalls/nearby`, {
                params: { lat: 19.0760, long: 72.8777, radius: 5000 },
                timeout: 5000
            });
            setStalls(response.data.stalls || []);
        } catch (err) {
            setError(err.message || 'Failed to fetch stalls');
        } finally {
            setLoading(false);
        }
    };

    const filtered = stalls.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase())
    );

    const mapHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
            <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
            <style>body { margin: 0; padding: 0; } #map { height: 100vh; width: 100vw; }</style>
        </head>
        <body>
            <div id="map"></div>
            <script>
                var map = L.map('map').setView([19.0760, 72.8777], 13);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
                var stalls = ${JSON.stringify(filtered)};
                stalls.forEach(function(s) {
                    var color = s.is_open ? 'green' : 'grey';
                    L.circleMarker([s.latitude, s.longitude], {
                        radius: 10, fillColor: color, color: '#fff', weight: 2, opacity: 1, fillOpacity: 0.8
                    }).addTo(map).bindPopup("<b>" + s.name + "</b><br>" + (s.is_open ? "OPEN" : "CLOSED"));
                });
            </script>
        </body>
        </html>
    `;

    if (loading) return <ActivityIndicator style={styles.center} size="large" color="#FF5733" />;

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <View style={styles.searchBox}>
                    <MaterialIcons name="search" size={24} color="#757575" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search stalls..."
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>
                <TouchableOpacity
                    style={styles.toggleViewBtn}
                    onPress={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
                >
                    <MaterialIcons name={viewMode === 'list' ? 'map' : 'view-list'} size={24} color="white" />
                </TouchableOpacity>
            </View>

            {viewMode === 'list' ? (
                <FlatList
                    data={filtered}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.card}
                            onPress={() => navigation.navigate('StallDetail', { stall: item })}
                        >
                            <View style={styles.cardHeader}>
                                <View style={styles.cardTitle}>
                                    <Text style={styles.stallName}>{item.name}</Text>
                                    <Text style={styles.cuisine}>{item.cuisine_type}</Text>
                                </View>
                                <View style={[styles.badge, item.is_open ? styles.open : styles.closed]}>
                                    <Text style={styles.badgeText}>{item.is_open ? 'OPEN' : 'CLOSED'}</Text>
                                </View>
                            </View>
                            <View style={styles.infoRow}>
                                <MaterialIcons name="location-on" size={16} color="#FF5733" />
                                <Text style={styles.infoText}>{item.distance_km} km</Text>
                                {item.price_range && <Text style={styles.infoText}> • {item.price_range}</Text>}
                            </View>
                        </TouchableOpacity>
                    )}
                />
            ) : (
                <WebView originWhitelist={['*']} source={{ html: mapHtml }} style={{ flex: 1 }} />
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
            <View style={styles.detailHeader}>
                <Text style={styles.detailName}>{stall.name}</Text>
                <View style={[styles.badge, stall.is_open ? styles.open : styles.closed]}>
                    <Text style={styles.badgeText}>{stall.is_open ? '● OPEN' : '● CLOSED'}</Text>
                </View>
            </View>

            <View style={styles.detailSection}>
                <MaterialIcons name="restaurant" size={20} color="#FF5733" />
                <Text style={styles.detailCuisine}>{stall.cuisine_type}</Text>
            </View>

            {stall.description && <Text style={styles.description}>{stall.description}</Text>}

            <View style={styles.infoCard}>
                <View style={styles.infoItem}>
                    <MaterialIcons name="location-on" size={24} color="#FF5733" />
                    <Text style={styles.infoValue}>{stall.distance_km} km away</Text>
                </View>
                <View style={styles.infoItem}>
                    <MaterialIcons name="verified-user" size={24} color="#00C853" />
                    <Text style={styles.infoValue}>Hygiene: Excellent</Text>
                </View>
            </View>

            <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.actionBtn} onPress={openDirections}>
                    <MaterialIcons name="directions" size={24} color="#FFF" />
                    <Text style={styles.actionBtnText}>Directions</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionBtn, styles.reviewBtn]}
                    onPress={() => navigation.navigate('ReviewForm', { stallId: stall.id, stallName: stall.name })}
                >
                    <MaterialIcons name="rate-review" size={24} color="#FF5733" />
                    <Text style={[styles.actionBtnText, { color: '#FF5733' }]}>Review</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

// ===== REVIEW FORM SCREEN =====
function ReviewForm({ route, navigation }) {
    const { stallId, stallName } = route.params;
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Hygiene questions
    const [hygieneResponses, setHygieneResponses] = useState({ gloves: null, hairnet: null });

    const submitReview = async () => {
        if (rating === 0) { Alert.alert('Rating Required'); return; }
        setSubmitting(true);
        setTimeout(() => { // Simulate API
            setSubmitting(false);
            Alert.alert('Success', 'Review Submitted!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
        }, 1000);
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.reviewTitle}>Review {stallName}</Text>
            <View style={styles.ratingBox}>
                <Text style={styles.subtitle}>Rate Experience</Text>
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
                <Text style={styles.submitBtnText}>{submitting ? 'Submitting...' : 'Submit Review'}</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

// ===== OWNER DASHBOARD SCREEN =====
function OwnerDashboard({ navigation }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('status'); // status | menu | photos
    const [menuText, setMenuText] = useState('Pani Puri: ₹30\nBhel Puri: ₹40');

    const toggleStatus = async () => {
        setLoading(true);
        // Simulate API
        setTimeout(() => {
            setIsOpen(!isOpen);
            setLoading(false);
        }, 800);
    };

    return (
        <ScrollView contentContainerStyle={styles.dashboardContainer}>
            <Text style={styles.dashTitle}>Vendor Dashboard</Text>
            <Text style={styles.dashSubtitle}>Raju's Famous Chaat Corner</Text>

            <View style={styles.tabBar}>
                <TouchableOpacity style={[styles.tab, activeTab === 'status' && styles.activeTab]} onPress={() => setActiveTab('status')}><Text>Status</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.tab, activeTab === 'menu' && styles.activeTab]} onPress={() => setActiveTab('menu')}><Text>Menu</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.tab, activeTab === 'photos' && styles.activeTab]} onPress={() => setActiveTab('photos')}><Text>Photos</Text></TouchableOpacity>
            </View>

            {activeTab === 'status' && (
                <View style={{ alignItems: 'center', width: '100%' }}>
                    <View style={styles.statusCard}>
                        <Text style={styles.statusLabel}>Current Status</Text>
                        <Text style={[styles.statusBig, isOpen ? styles.textOpen : styles.textClosed]}>{isOpen ? 'ONLINE' : 'OFFLINE'}</Text>
                    </View>
                    <TouchableOpacity style={[styles.toggleBtn, isOpen ? styles.btnOffline : styles.btnOnline]} onPress={toggleStatus}>
                        <MaterialIcons name="power-settings-new" size={40} color="white" />
                        <Text style={styles.toggleBtnText}>{loading ? '...' : (isOpen ? 'GO OFFLINE' : 'GO ONLINE')}</Text>
                    </TouchableOpacity>
                </View>
            )}

            {activeTab === 'menu' && (
                <View style={{ width: '100%' }}>
                    <TextInput style={styles.menuInput} multiline value={menuText} onChangeText={setMenuText} />
                    <TouchableOpacity style={styles.submitBtn} onPress={() => Alert.alert("Success", "Menu Saved!")}><Text style={styles.submitBtnText}>Save Menu</Text></TouchableOpacity>
                </View>
            )}
        </ScrollView>
    );
}

// ===== SIGN UP SCREEN =====
function SignUpScreen({ navigation }) {
    const [role, setRole] = useState('user'); // 'user' | 'vendor'
    const [name, setName] = useState('');
    const [mobile, setMobile] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);

    // Vendor specific fields
    const [stallName, setStallName] = useState('');
    const [cuisine, setCuisine] = useState('');
    const [description, setDescription] = useState('');

    // Error State
    const [errors, setErrors] = useState({});

    const validate = () => {
        let valid = true;
        let newErrors = {};

        // Name
        if (!name.trim()) { newErrors.name = "Name is required"; valid = false; }
        else if (name.length < 3) { newErrors.name = "Name must be at least 3 characters"; valid = false; }

        // Mobile
        if (!mobile.trim()) { newErrors.mobile = "Mobile number is required"; valid = false; }
        else if (!/^\d{10}$/.test(mobile)) { newErrors.mobile = "Enter a valid 10-digit mobile number"; valid = false; }

        // Email (Optional but validated if present)
        if (email.trim() && !/\S+@\S+\.\S/.test(email)) { newErrors.email = "Enter a valid email address"; valid = false; }

        // Vendor Checks
        if (role === 'vendor') {
            if (!stallName.trim()) { newErrors.stallName = "Stall Name is required"; valid = false; }
            if (!cuisine.trim()) { newErrors.cuisine = "Cuisine Type is required"; valid = false; }
        }

        // Password
        const strongPasswordRegex = /^(?=.*[0-9!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
        if (!password) { newErrors.password = "Password is required"; valid = false; }
        else if (!strongPasswordRegex.test(password)) {
            newErrors.password = "Password must be 8+ chars with 1 number/special char";
            valid = false;
        }

        // Confirm Password
        if (confirmPassword !== password) { newErrors.confirmPassword = "Passwords do not match"; valid = false; }

        setErrors(newErrors);
        return valid;
    };

    const handleSignUp = () => {
        if (validate()) {
            // Improve UX: Auto-navigate based on role
            Alert.alert(
                "Account Created",
                `Welcome ${name}! You are registered as a ${role === 'user' ? 'Foodie' : 'Vendor'}.`,
                [{
                    text: "Let's Go!",
                    onPress: () => {
                        if (role === 'vendor') {
                            navigation.replace('OwnerDashboard');
                        } else {
                            navigation.replace('StallsList');
                        }
                    }
                }]
            );
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
            <ScrollView contentContainerStyle={styles.loginContainer}>
                <View style={styles.loginHeader}>
                    <Text style={styles.loginTitle}>Create Account</Text>
                    <Text style={styles.loginSubtitle}>Join the community</Text>
                </View>

                {/* Role Switcher */}
                <View style={styles.roleSwitch}>
                    <TouchableOpacity
                        style={[styles.roleBtn, role === 'user' && styles.roleBtnActive]}
                        onPress={() => setRole('user')}
                    >
                        <MaterialIcons name="person" size={20} color={role === 'user' ? 'white' : '#666'} />
                        <Text style={[styles.roleText, role === 'user' && styles.roleTextActive]}>Foodie</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.roleBtn, role === 'vendor' && styles.roleBtnActive]}
                        onPress={() => setRole('vendor')}
                    >
                        <MaterialIcons name="store" size={20} color={role === 'vendor' ? 'white' : '#666'} />
                        <Text style={[styles.roleText, role === 'vendor' && styles.roleTextActive]}>Vendor</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                    <View style={[styles.inputWrapper, { borderColor: errors.name ? 'red' : '#eee' }]}>
                        <MaterialIcons name="person" size={20} color="#888" />
                        <TextInput
                            style={styles.input}
                            placeholder="Full Name"
                            value={name}
                            onChangeText={(t) => { setName(t); if (errors.name) setErrors({ ...errors, name: null }); }}
                        />
                    </View>
                    {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

                    <View style={[styles.inputWrapper, { borderColor: errors.mobile ? 'red' : '#eee' }]}>
                        <MaterialIcons name="phone-iphone" size={20} color="#888" />
                        <TextInput
                            style={styles.input}
                            placeholder="Mobile Number"
                            value={mobile}
                            onChangeText={(t) => { setMobile(t); if (errors.mobile) setErrors({ ...errors, mobile: null }); }}
                            keyboardType="phone-pad"
                        />
                    </View>
                    {errors.mobile && <Text style={styles.errorText}>{errors.mobile}</Text>}

                    <View style={[styles.inputWrapper, { borderColor: errors.email ? 'red' : '#eee' }]}>
                        <MaterialIcons name="email" size={20} color="#888" />
                        <TextInput
                            style={styles.input}
                            placeholder="Email (Optional)"
                            value={email}
                            onChangeText={(t) => { setEmail(t); if (errors.email) setErrors({ ...errors, email: null }); }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>
                    {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

                    {/* Vendor Extra Fields */}
                    {role === 'vendor' && (
                        <>
                            <View style={[styles.inputWrapper, { borderColor: errors.stallName ? 'red' : '#eee' }]}>
                                <MaterialIcons name="storefront" size={20} color="#888" />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Stall Name (e.g. Raju's Chaat)"
                                    value={stallName}
                                    onChangeText={(t) => { setStallName(t); if (errors.stallName) setErrors({ ...errors, stallName: null }); }}
                                />
                            </View>
                            {errors.stallName && <Text style={styles.errorText}>{errors.stallName}</Text>}

                            <View style={[styles.inputWrapper, { borderColor: errors.cuisine ? 'red' : '#eee' }]}>
                                <MaterialIcons name="restaurant-menu" size={20} color="#888" />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Cuisine (e.g. North Indian)"
                                    value={cuisine}
                                    onChangeText={(t) => { setCuisine(t); if (errors.cuisine) setErrors({ ...errors, cuisine: null }); }}
                                />
                            </View>
                            {errors.cuisine && <Text style={styles.errorText}>{errors.cuisine}</Text>}

                            <View style={[styles.inputWrapper, { borderColor: 'gray' }]}>
                                <MaterialIcons name="description" size={20} color="#888" />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Short Description"
                                    value={description}
                                    onChangeText={setDescription}
                                />
                            </View>
                        </>
                    )}

                    <View style={[styles.inputWrapper, { borderColor: errors.password ? 'red' : '#eee' }]}>
                        <MaterialIcons name="lock" size={20} color="#888" />
                        <TextInput
                            style={styles.input}
                            placeholder="Create Password"
                            value={password}
                            onChangeText={(t) => { setPassword(t); if (errors.password) setErrors({ ...errors, password: null }); }}
                            secureTextEntry={!showPass}
                        />
                        <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                            <MaterialIcons name={showPass ? "visibility" : "visibility-off"} size={20} color="#888" />
                        </TouchableOpacity>
                    </View>
                    {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

                    <View style={[styles.inputWrapper, { borderColor: errors.confirmPassword ? 'red' : '#eee' }]}>
                        <MaterialIcons name="lock-outline" size={20} color="#888" />
                        <TextInput
                            style={styles.input}
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChangeText={(t) => { setConfirmPassword(t); if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null }); }}
                            secureTextEntry={!showConfirmPass}
                        />
                        <TouchableOpacity onPress={() => setShowConfirmPass(!showConfirmPass)}>
                            <MaterialIcons name={showConfirmPass ? "visibility" : "visibility-off"} size={20} color="#888" />
                        </TouchableOpacity>
                    </View>
                    {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

                    <TouchableOpacity style={styles.primaryBtn} onPress={handleSignUp}>
                        <Text style={styles.primaryBtnText}>Sign Up</Text>
                    </TouchableOpacity>
                </View>

                {/* Social Login Divider */}
                <View style={styles.divider}>
                    <View style={styles.line} />
                    <Text style={styles.orText}>OR</Text>
                    <View style={styles.line} />
                </View>

                {/* Social Buttons */}
                <View style={styles.socialButtons}>
                    <TouchableOpacity style={[styles.socialBtn, { backgroundColor: '#DB4437' }]} onPress={handleSignUp}>
                        <FontAwesome name="google" size={20} color="white" />
                        <Text style={styles.socialText}>Google</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.socialBtn, { backgroundColor: '#4267B2' }]} onPress={handleSignUp}>
                        <FontAwesome name="facebook" size={20} color="white" />
                        <Text style={styles.socialText}>Facebook</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
                    <Text style={[styles.linkText, { marginTop: 30 }]}>Already have an account? <Text style={{ fontWeight: 'bold' }}>Login</Text></Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
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
    container: { flex: 1, backgroundColor: '#FFF' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    // Login Styles
    loginContainer: { flexGrow: 1, padding: 30, backgroundColor: 'white', justifyContent: 'center' },
    loginHeader: { marginBottom: 30 },
    loginTitle: { fontSize: 32, fontWeight: 'bold', color: '#333' },
    loginSubtitle: { fontSize: 16, color: '#666', marginTop: 5 },
    roleSwitch: { flexDirection: 'row', backgroundColor: '#f0f0f0', borderRadius: 12, padding: 5, marginBottom: 25 },
    roleBtn: { flex: 1, flexDirection: 'row', padding: 12, justifyContent: 'center', alignItems: 'center', borderRadius: 10 },
    roleBtnActive: { backgroundColor: '#FF5733', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
    roleText: { marginLeft: 8, fontWeight: '600', color: '#666' },
    roleTextActive: { color: 'white' },
    methodTabs: { flexDirection: 'row', marginBottom: 20 },
    methodTab: { marginRight: 20, paddingBottom: 5 },
    methodText: { fontSize: 16, color: '#aaa', fontWeight: '600' },
    methodTextActive: { color: '#FF5733', borderBottomWidth: 2, borderColor: '#FF5733' },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#eee', borderRadius: 12, paddingHorizontal: 15, marginBottom: 15, height: 50 },
    input: { flex: 1, marginLeft: 10, fontSize: 16 },
    primaryBtn: { backgroundColor: '#FF5733', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
    primaryBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    linkText: { textAlign: 'center', color: '#FF5733', marginTop: 15 },
    divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 30 },
    line: { flex: 1, height: 1, backgroundColor: '#eee' },
    orText: { marginHorizontal: 10, color: '#aaa' },
    socialButtons: { flexDirection: 'row', justifyContent: 'space-between' },
    socialBtn: { flex: 1, flexDirection: 'row', padding: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginHorizontal: 5 },
    socialText: { color: 'white', fontWeight: 'bold', marginLeft: 8 },
    termsText: { textAlign: 'center', color: '#ccc', fontSize: 12, marginTop: 40 },

    // Language Screen
    langContainer: { flex: 1, backgroundColor: '#FFF', padding: 20 },
    langHeader: { alignItems: 'center', paddingVertical: 40 },
    emoji: { fontSize: 64, marginBottom: 16 },
    appTitle: { fontSize: 24, fontWeight: 'bold', color: '#FF5733', marginBottom: 8 },
    subtitle: { fontSize: 16, color: '#757575' },
    langList: { flex: 1, marginTop: 20 },
    langCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F5F5F5', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 2, borderColor: 'transparent' },
    langCardActive: { borderColor: '#FF5733', backgroundColor: '#FFF3E0' },
    langName: { fontSize: 18, fontWeight: '600', color: '#212121' },
    langNative: { fontSize: 14, color: '#757575', marginTop: 2 },
    checkmark: { fontSize: 24, color: '#FF5733', fontWeight: 'bold' },
    continueBtn: { backgroundColor: '#FF5733', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 20, marginBottom: 50 },
    continueBtnText: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },

    // Common Cards & List
    card: { backgroundColor: '#F5F5F5', borderRadius: 12, padding: 16, marginHorizontal: 16, marginBottom: 12 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
    cardTitle: { flex: 1, marginRight: 8 },
    stallName: { fontSize: 18, fontWeight: 'bold', color: '#212121' },
    cuisine: { fontSize: 14, color: '#757575' },
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    open: { backgroundColor: '#00C853' },
    closed: { backgroundColor: '#9E9E9E' },
    badgeText: { fontSize: 12, fontWeight: 'bold', color: '#FFF' },
    infoRow: { flexDirection: 'row', alignItems: 'center' },
    infoText: { fontSize: 14, color: '#757575', marginLeft: 4 },
    searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginRight: 10 },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 16 },
    toggleViewBtn: { backgroundColor: '#FF5733', padding: 10, borderRadius: 8 },
    headerRow: { flexDirection: 'row', alignItems: 'center', margin: 16 },

    // Detail & Action btns
    detailHeader: { padding: 20, backgroundColor: '#F5F5F5' },
    detailName: { fontSize: 24, fontWeight: 'bold', color: '#212121', marginBottom: 8 },
    detailSection: { flexDirection: 'row', alignItems: 'center', padding: 16 },
    detailCuisine: { fontSize: 18, color: '#FF5733', fontWeight: '600', marginLeft: 8 },
    description: { fontSize: 16, color: '#757575', paddingHorizontal: 16, marginBottom: 16 },
    infoCard: { margin: 16, backgroundColor: '#F5F5F5', borderRadius: 12, padding: 16 },
    infoItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    infoValue: { fontSize: 16, fontWeight: '600', color: '#212121', marginLeft: 12 },
    actionButtons: { flexDirection: 'row', padding: 16, justifyContent: 'space-between' },
    actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FF5733', paddingVertical: 16, borderRadius: 12, marginRight: 8 },
    reviewBtn: { backgroundColor: 'white', borderWidth: 2, borderColor: '#FF5733', marginLeft: 8, marginRight: 0 },
    actionBtnText: { fontSize: 14, fontWeight: 'bold', color: '#FFF', marginLeft: 8 },

    // Review Form
    reviewTitle: { fontSize: 22, fontWeight: 'bold', padding: 20, textAlign: 'center' },
    ratingBox: { padding: 20, alignItems: 'center', backgroundColor: '#F9F9F9' },
    stars: { flexDirection: 'row', marginTop: 10 },
    inputBox: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, margin: 20, height: 100, textAlignVertical: 'top' },
    submitBtn: { backgroundColor: '#FF5733', margin: 20, padding: 16, borderRadius: 12, alignItems: 'center' },
    submitBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

    // Dashboard
    dashboardContainer: { flexGrow: 1, padding: 20, alignItems: 'center', backgroundColor: 'white' },
    dashTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
    dashSubtitle: { fontSize: 18, color: '#666', marginBottom: 20 },
    tabBar: { flexDirection: 'row', marginBottom: 30, borderBottomWidth: 1, borderColor: '#eee', width: '100%' },
    tab: { flex: 1, padding: 15, alignItems: 'center' },
    activeTab: { borderBottomWidth: 3, borderColor: '#FF5733' },
    statusCard: { alignItems: 'center', marginBottom: 40 },
    statusLabel: { fontSize: 16, color: '#888', marginBottom: 10 },
    statusBig: { fontSize: 32, fontWeight: '900' },
    textOpen: { color: '#00C853' },
    textClosed: { color: '#B0BEC5' },
    toggleBtn: { width: 200, height: 200, borderRadius: 100, alignItems: 'center', justifyContent: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 10 },
    btnOnline: { backgroundColor: '#00C853' },
    btnOffline: { backgroundColor: '#FF3D00' },
    toggleBtnText: { color: 'white', fontSize: 20, fontWeight: 'bold', marginTop: 10 },
    menuInput: { width: '100%', height: 150, borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 8, marginBottom: 20, textAlignVertical: 'top' },

    // Validation
    errorText: { color: 'red', fontSize: 12, marginLeft: 15, marginTop: -10, marginBottom: 10 },
});
