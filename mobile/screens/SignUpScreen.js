import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Alert,
    Platform,
    KeyboardAvoidingView,
} from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import theme from '../styles/theme';

/**
 * Unified Sign Up Screen
 * Supports Foodie/Vendor registration with validation, password strength, and social auth
 */
const SignUpScreen = ({ navigation }) => {
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
        if (email.trim() && !/\S+@\S+\.\S+/.test(email)) { newErrors.email = "Enter a valid email address"; valid = false; }

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
            Alert.alert(
                "Account Created",
                `Welcome ${name}! You are registered as a ${role === 'user' ? 'Foodie' : 'Vendor'}.`,
                [{
                    text: "Let's Go!",
                    onPress: () => {
                        if (role === 'vendor') {
                            navigation.replace('OwnerDashboard');
                        } else {
                            navigation.replace('Main');
                        }
                    }
                }]
            );
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Join the community</Text>
                </View>

                {/* Role Switcher */}
                <View style={styles.roleSwitch}>
                    <TouchableOpacity
                        style={[styles.roleBtn, role === 'user' && styles.roleBtnActive]}
                        onPress={() => setRole('user')}
                    >
                        <MaterialIcons name="person" size={20} color={role === 'user' ? 'white' : theme.colors.textSecondary} />
                        <Text style={[styles.roleText, role === 'user' && styles.roleTextActive]}>Foodie</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.roleBtn, role === 'vendor' && styles.roleBtnActive]}
                        onPress={() => setRole('vendor')}
                    >
                        <MaterialIcons name="store" size={20} color={role === 'vendor' ? 'white' : theme.colors.textSecondary} />
                        <Text style={[styles.roleText, role === 'vendor' && styles.roleTextActive]}>Vendor</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                    {/* Name */}
                    <View style={[styles.inputWrapper, errors.name && styles.inputError]}>
                        <MaterialIcons name="person" size={20} color={theme.colors.textSecondary} />
                        <TextInput
                            style={styles.input}
                            placeholder="Full Name"
                            placeholderTextColor={theme.colors.textSecondary}
                            value={name}
                            onChangeText={(t) => { setName(t); if (errors.name) setErrors({ ...errors, name: null }); }}
                        />
                    </View>
                    {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

                    {/* Mobile */}
                    <View style={[styles.inputWrapper, errors.mobile && styles.inputError]}>
                        <MaterialIcons name="phone-iphone" size={20} color={theme.colors.textSecondary} />
                        <TextInput
                            style={styles.input}
                            placeholder="Mobile Number"
                            placeholderTextColor={theme.colors.textSecondary}
                            value={mobile}
                            onChangeText={(t) => { setMobile(t); if (errors.mobile) setErrors({ ...errors, mobile: null }); }}
                            keyboardType="phone-pad"
                        />
                    </View>
                    {errors.mobile && <Text style={styles.errorText}>{errors.mobile}</Text>}

                    {/* Email */}
                    <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
                        <MaterialIcons name="email" size={20} color={theme.colors.textSecondary} />
                        <TextInput
                            style={styles.input}
                            placeholder="Email (Optional)"
                            placeholderTextColor={theme.colors.textSecondary}
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
                            <View style={[styles.inputWrapper, errors.stallName && styles.inputError]}>
                                <MaterialIcons name="storefront" size={20} color={theme.colors.textSecondary} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Stall Name (e.g. Raju's Chaat)"
                                    placeholderTextColor={theme.colors.textSecondary}
                                    value={stallName}
                                    onChangeText={(t) => { setStallName(t); if (errors.stallName) setErrors({ ...errors, stallName: null }); }}
                                />
                            </View>
                            {errors.stallName && <Text style={styles.errorText}>{errors.stallName}</Text>}

                            <View style={[styles.inputWrapper, errors.cuisine && styles.inputError]}>
                                <MaterialIcons name="restaurant-menu" size={20} color={theme.colors.textSecondary} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Cuisine (e.g. North Indian)"
                                    placeholderTextColor={theme.colors.textSecondary}
                                    value={cuisine}
                                    onChangeText={(t) => { setCuisine(t); if (errors.cuisine) setErrors({ ...errors, cuisine: null }); }}
                                />
                            </View>
                            {errors.cuisine && <Text style={styles.errorText}>{errors.cuisine}</Text>}

                            <View style={styles.inputWrapper}>
                                <MaterialIcons name="description" size={20} color={theme.colors.textSecondary} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Short Description (Optional)"
                                    placeholderTextColor={theme.colors.textSecondary}
                                    value={description}
                                    onChangeText={setDescription}
                                />
                            </View>
                        </>
                    )}

                    {/* Password */}
                    <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
                        <MaterialIcons name="lock" size={20} color={theme.colors.textSecondary} />
                        <TextInput
                            style={styles.input}
                            placeholder="Create Password"
                            placeholderTextColor={theme.colors.textSecondary}
                            value={password}
                            onChangeText={(t) => { setPassword(t); if (errors.password) setErrors({ ...errors, password: null }); }}
                            secureTextEntry={!showPass}
                        />
                        <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                            <MaterialIcons name={showPass ? "visibility" : "visibility-off"} size={20} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                    {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

                    {/* Confirm Password */}
                    <View style={[styles.inputWrapper, errors.confirmPassword && styles.inputError]}>
                        <MaterialIcons name="lock-outline" size={20} color={theme.colors.textSecondary} />
                        <TextInput
                            style={styles.input}
                            placeholder="Confirm Password"
                            placeholderTextColor={theme.colors.textSecondary}
                            value={confirmPassword}
                            onChangeText={(t) => { setConfirmPassword(t); if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null }); }}
                            secureTextEntry={!showConfirmPass}
                        />
                        <TouchableOpacity onPress={() => setShowConfirmPass(!showConfirmPass)}>
                            <MaterialIcons name={showConfirmPass ? "visibility" : "visibility-off"} size={20} color={theme.colors.textSecondary} />
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
                    <Text style={styles.linkText}>Already have an account? <Text style={{ fontWeight: 'bold' }}>Login</Text></Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        padding: theme.spacing.lg,
        paddingBottom: 100, // Space for bottom navigation bar
    },
    header: {
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
        marginTop: theme.spacing.xl,
    },
    title: {
        fontSize: theme.typography.fontSize['3xl'],
        fontFamily: theme.typography.fontFamily.bold,
        color: theme.colors.primary,
    },
    subtitle: {
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.xs,
    },
    roleSwitch: {
        flexDirection: 'row',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.xs,
        marginBottom: theme.spacing.lg,
    },
    roleBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        gap: theme.spacing.xs,
    },
    roleBtnActive: {
        backgroundColor: theme.colors.primary,
    },
    roleText: {
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.textSecondary,
    },
    roleTextActive: {
        color: 'white',
        fontWeight: 'bold',
    },
    inputContainer: {
        marginBottom: theme.spacing.lg,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        paddingHorizontal: theme.spacing.md,
        marginBottom: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    inputError: {
        borderColor: theme.colors.error,
    },
    input: {
        flex: 1,
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.sm,
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.textPrimary,
    },
    errorText: {
        color: theme.colors.error,
        fontSize: theme.typography.fontSize.sm,
        marginLeft: theme.spacing.md,
        marginTop: -theme.spacing.sm,
        marginBottom: theme.spacing.sm,
    },
    primaryBtn: {
        backgroundColor: theme.colors.primary,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
        marginTop: theme.spacing.sm,
        ...theme.shadows.md,
    },
    primaryBtnText: {
        color: 'white',
        fontSize: theme.typography.fontSize.lg,
        fontWeight: 'bold',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: theme.spacing.lg,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: theme.colors.border,
    },
    orText: {
        marginHorizontal: theme.spacing.md,
        color: theme.colors.textSecondary,
    },
    socialButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: theme.spacing.md,
        marginBottom: theme.spacing.lg,
    },
    socialBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.lg,
        borderRadius: theme.borderRadius.md,
        gap: theme.spacing.sm,
    },
    socialText: {
        color: 'white',
        fontWeight: 'bold',
    },
    linkText: {
        textAlign: 'center',
        color: theme.colors.primary,
        fontSize: theme.typography.fontSize.base,
        marginBottom: theme.spacing.xl,
    },
});

export default SignUpScreen;
