import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { supabase } from '../../lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);

    async function handleAuth() {
        if (!email || !password) {
            Alert.alert('Please enter email and password');
            return;
        }

        setLoading(true);

        if (isSignUp) {
            const { error } = await supabase.auth.signUp({ email, password });
            if (error) Alert.alert('Sign Up Error', error.message);
            else Alert.alert('Success', 'Check your inbox for email verification!');
        } else {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) Alert.alert('Sign In Error', error.message);
        }

        setLoading(false);
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                {/* Logo and Title */}
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Text style={styles.logoText}>🌙</Text>
                    </View>
                    <Text style={styles.title}>Oneiro AI</Text>
                    <Text style={styles.subtitle}>Unlock your subconscious</Text>
                </View>

                {/* Form */}
                <View style={styles.formContainer}>
                    <Text style={styles.formTitle}>
                        {isSignUp ? 'Create Account' : 'Welcome Back'}
                    </Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            value={email}
                            onChangeText={setEmail}
                            placeholder="email@example.com"
                            placeholderTextColor="#6b7280"
                            autoCapitalize="none"
                            keyboardType="email-address"
                            style={styles.input}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            value={password}
                            onChangeText={setPassword}
                            placeholder="••••••••"
                            placeholderTextColor="#6b7280"
                            secureTextEntry
                            autoCapitalize="none"
                            style={styles.input}
                        />
                    </View>

                    <TouchableOpacity
                        onPress={handleAuth}
                        disabled={loading}
                        style={styles.button}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.buttonText}>
                            {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setIsSignUp(!isSignUp)}
                        style={styles.switchButton}
                    >
                        <Text style={styles.switchText}>
                            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                            <Text style={styles.switchTextHighlight}>
                                {isSignUp ? 'Sign In' : 'Sign Up'}
                            </Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0B0C15',
    },
    keyboardView: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoContainer: {
        width: 64,
        height: 64,
        backgroundColor: '#7c3aed',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    logoText: {
        fontSize: 32,
    },
    title: {
        color: '#ffffff',
        fontSize: 24,
        fontWeight: '600',
    },
    subtitle: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 14,
        marginTop: 4,
    },
    formContainer: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    formTitle: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '500',
        marginBottom: 24,
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        color: '#ffffff',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        fontSize: 16,
    },
    button: {
        backgroundColor: '#7c3aed',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 16,
    },
    buttonText: {
        color: '#ffffff',
        fontWeight: '600',
        fontSize: 16,
    },
    switchButton: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    switchText: {
        color: 'rgba(255,255,255,0.5)',
    },
    switchTextHighlight: {
        color: '#a78bfa',
        fontWeight: '500',
    },
});
