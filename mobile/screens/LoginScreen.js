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
 * Unified Login Screen
 * Supports Customer/Vendor role toggle, OTP/Password auth, Social Login
 */
const LoginScreen = ({ navigation }) => {
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
            // Pass mock vendor stall data
            navigation.replace('OwnerDashboard', {
                stallId: '1',
                ownerId: 'vendor-001',
                stallName: "Surena's Stall",
            });
        } else {
            navigation.replace('Main');
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
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>Welcome</Text>
                    <Text style={styles.subtitle}>Sign in to continue</Text>
                </View>

                {/* Role Switcher */}
                <View style={styles.roleSwitch}>
                    <TouchableOpacity
                        style={[styles.roleBtn, role === 'user' && styles.roleBtnActive]}
                        onPress={() => { setRole('user'); setAuthMethod('otp'); setStep('input'); }}
                    >
                        <MaterialIcons name="person" size={20} color={role === 'user' ? 'white' : theme.colors.textSecondary} />
                        <Text style={[styles.roleText, role === 'user' && styles.roleTextActive]}>Customer</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.roleBtn, role === 'vendor' && styles.roleBtnActive]}
                        onPress={() => { setRole('vendor'); setAuthMethod('otp'); setStep('input'); }}
                    >
                        <MaterialIcons name="store" size={20} color={role === 'vendor' ? 'white' : theme.colors.textSecondary} />
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
                                <MaterialIcons name={authMethod === 'otp' ? 'phone-iphone' : 'email'} size={20} color={theme.colors.textSecondary} />
                                <TextInput
                                    style={styles.input}
                                    placeholder={authMethod === 'otp' ? "Mobile Number" : "Email Address"}
                                    placeholderTextColor={theme.colors.textSecondary}
                                    value={identifier}
                                    onChangeText={setIdentifier}
                                    keyboardType={authMethod === 'otp' ? 'phone-pad' : 'email-address'}
                                    autoCapitalize="none"
                                />
                            </View>

                            {authMethod === 'password' && (
                                <View style={styles.inputWrapper}>
                                    <MaterialIcons name="lock" size={20} color={theme.colors.textSecondary} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Password"
                                        placeholderTextColor={theme.colors.textSecondary}
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!showPass}
                                    />
                                    <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                                        <MaterialIcons name={showPass ? "visibility" : "visibility-off"} size={20} color={theme.colors.textSecondary} />
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
                                <MaterialIcons name="lock-clock" size={20} color={theme.colors.textSecondary} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter 4-digit OTP"
                                    placeholderTextColor={theme.colors.textSecondary}
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
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
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
    methodTabs: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: theme.spacing.lg,
        gap: theme.spacing.lg,
    },
    methodTab: {
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
    },
    methodText: {
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.textSecondary,
    },
    methodTextActive: {
        color: theme.colors.primary,
        fontWeight: 'bold',
        borderBottomWidth: 2,
        borderBottomColor: theme.colors.primary,
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
    input: {
        flex: 1,
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.sm,
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.textPrimary,
    },
    primaryBtn: {
        backgroundColor: theme.colors.primary,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
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
    termsText: {
        textAlign: 'center',
        color: theme.colors.textSecondary,
        fontSize: theme.typography.fontSize.sm,
        marginBottom: theme.spacing.md,
    },
    linkText: {
        textAlign: 'center',
        color: theme.colors.primary,
        fontSize: theme.typography.fontSize.base,
    },
});

export default LoginScreen;
