import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    Alert,
    Linking,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Crown, RefreshCw } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';

const WEB_SUBSCRIBE_URL = process.env.EXPO_PUBLIC_SUBSCRIBE_URL || 'https://oneiro-ai.vercel.app/subscribe';

const IOS_NATIVE_URLS = [
    'itms-apps://apps.apple.com/account/subscriptions',
    'https://apps.apple.com/account/subscriptions',
];

const ANDROID_NATIVE_URLS = [
    'https://play.google.com/store/account/subscriptions',
    'market://details?id=com.oneiro.ai',
];

async function openFirstAvailable(urls: string[]) {
    for (const url of urls) {
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
            await Linking.openURL(url);
            return true;
        }
    }
    return false;
}

export default function SubscribeScreen() {
    const router = useRouter();
    const { billingStatus, refreshBillingStatus } = useAuth();
    const [isRefreshing, setIsRefreshing] = useState(false);

    const isPaid = useMemo(() => {
        if (!billingStatus) return false;
        return billingStatus.access === 'lifetime' ||
            (billingStatus.access === 'subscription' && billingStatus.isActive);
    }, [billingStatus]);

    const trialText = useMemo(() => {
        if (!billingStatus) return 'Free interpretations left: 5 / 5';
        return `Free interpretations left: ${billingStatus.trialRemaining} / ${billingStatus.trialLimit || 5}`;
    }, [billingStatus]);

    const openNativeSubscription = async () => {
        try {
            const urls = Platform.OS === 'ios' ? IOS_NATIVE_URLS : ANDROID_NATIVE_URLS;
            const opened = await openFirstAvailable(urls);
            if (!opened) {
                Alert.alert('Not available', 'Native subscription page is unavailable on this device.');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to open native subscription page.');
        }
    };

    const openWebSubscription = async () => {
        try {
            const canOpen = await Linking.canOpenURL(WEB_SUBSCRIBE_URL);
            if (!canOpen) {
                Alert.alert('Unavailable link', 'Web subscription URL is not configured.');
                return;
            }
            await Linking.openURL(WEB_SUBSCRIBE_URL);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to open web subscription page.');
        }
    };

    const handleRefreshBilling = async () => {
        setIsRefreshing(true);
        try {
            await refreshBillingStatus();
            Alert.alert('Updated', 'Billing status refreshed.');
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to refresh billing status.');
        } finally {
            setIsRefreshing(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView contentContainerStyle={styles.content}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.8}>
                    <ChevronLeft size={18} color="#CBD5E1" />
                    <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>

                <View style={styles.hero}>
                    <View style={styles.heroIcon}>
                        <Crown size={26} color="#FBBF24" />
                    </View>
                    <Text style={styles.heroTitle}>Upgrade to Unlimited Dream Insights</Text>
                    <Text style={styles.heroSubtitle}>
                        Free users can interpret up to 5 dreams. Upgrade for unlimited deep interpretation.
                    </Text>
                </View>

                <View style={styles.statusCard}>
                    <Text style={styles.statusLabel}>Current Access</Text>
                    <Text style={[styles.statusValue, isPaid && styles.statusPaid]}>
                        {isPaid ? 'Premium Active' : 'Free Plan'}
                    </Text>
                    {!isPaid && <Text style={styles.statusHint}>{trialText}</Text>}
                </View>

                <TouchableOpacity style={styles.primaryButton} onPress={openNativeSubscription} activeOpacity={0.9}>
                    <Text style={styles.primaryButtonText}>
                        {Platform.OS === 'ios' ? 'Open iOS Subscription' : 'Open Android Subscription'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryButton} onPress={openWebSubscription} activeOpacity={0.9}>
                    <Text style={styles.secondaryButtonText}>Open Web Plans (Fallback)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.refreshButton, isRefreshing && styles.refreshButtonDisabled]}
                    onPress={handleRefreshBilling}
                    disabled={isRefreshing}
                    activeOpacity={0.9}
                >
                    {isRefreshing ? (
                        <ActivityIndicator size="small" color="#E2E8F0" />
                    ) : (
                        <>
                            <RefreshCw size={14} color="#E2E8F0" />
                            <Text style={styles.refreshText}>I already subscribed, refresh status</Text>
                        </>
                    )}
                </TouchableOpacity>

                <Text style={styles.noteText}>
                    iOS and Android subscriptions should be completed through their native stores. If native checkout is unavailable, use the web fallback.
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0B1020',
    },
    content: {
        padding: 20,
        gap: 16,
        paddingBottom: 40,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        alignSelf: 'flex-start',
    },
    backButtonText: {
        color: '#CBD5E1',
        fontSize: 14,
        fontWeight: '600',
    },
    hero: {
        backgroundColor: 'rgba(30,41,59,0.7)',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(148,163,184,0.2)',
    },
    heroIcon: {
        width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(251,191,36,0.15)',
        marginBottom: 10,
    },
    heroTitle: {
        color: '#F8FAFC',
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 8,
    },
    heroSubtitle: {
        color: '#CBD5E1',
        fontSize: 14,
        lineHeight: 22,
    },
    statusCard: {
        backgroundColor: 'rgba(15,23,42,0.8)',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(148,163,184,0.2)',
        padding: 14,
    },
    statusLabel: {
        color: '#94A3B8',
        fontSize: 12,
        marginBottom: 4,
    },
    statusValue: {
        color: '#F8FAFC',
        fontSize: 18,
        fontWeight: '700',
    },
    statusPaid: {
        color: '#34D399',
    },
    statusHint: {
        color: '#E2E8F0',
        fontSize: 13,
        marginTop: 6,
    },
    primaryButton: {
        backgroundColor: '#4F46E5',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 12,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
    secondaryButton: {
        backgroundColor: 'rgba(30,41,59,0.9)',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: 'rgba(148,163,184,0.3)',
    },
    secondaryButtonText: {
        color: '#E2E8F0',
        fontSize: 14,
        fontWeight: '600',
    },
    refreshButton: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(148,163,184,0.35)',
        paddingVertical: 12,
    },
    refreshButtonDisabled: {
        opacity: 0.7,
    },
    refreshText: {
        color: '#E2E8F0',
        fontSize: 13,
        fontWeight: '600',
    },
    noteText: {
        color: '#94A3B8',
        fontSize: 12,
        lineHeight: 20,
    },
});

