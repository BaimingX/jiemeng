import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export default function Profile() {
    const router = useRouter();
    const { billingStatus, refreshBillingStatus } = useAuth();
    const [isRefreshing, setIsRefreshing] = useState(false);

    const isPaid = useMemo(() => {
        if (!billingStatus) return false;
        return billingStatus.access === 'lifetime' ||
            (billingStatus.access === 'subscription' && billingStatus.isActive);
    }, [billingStatus]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await refreshBillingStatus();
        } finally {
            setIsRefreshing(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Profile</Text>

            <View style={styles.statusCard}>
                <Text style={styles.statusLabel}>Billing</Text>
                <Text style={[styles.statusValue, isPaid && styles.statusPaid]}>
                    {isPaid ? 'Premium Active' : 'Free Plan'}
                </Text>
                {!isPaid && (
                    <Text style={styles.statusHint}>
                        {`Free interpretations left: ${billingStatus?.trialRemaining ?? 5} / ${billingStatus?.trialLimit ?? 5}`}
                    </Text>
                )}
            </View>

            <TouchableOpacity
                onPress={() => router.push('/subscribe')}
                style={styles.primaryButton}
                activeOpacity={0.9}
            >
                <Text style={styles.primaryButtonText}>Manage Subscription</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={handleRefresh}
                style={styles.secondaryButton}
                activeOpacity={0.9}
                disabled={isRefreshing}
            >
                {isRefreshing ? (
                    <ActivityIndicator size="small" color="#E5E7EB" />
                ) : (
                    <Text style={styles.secondaryButtonText}>Refresh Billing Status</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => supabase.auth.signOut()}
                style={styles.signOutButton}
                activeOpacity={0.9}
            >
                <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0B1020',
        padding: 20,
        justifyContent: 'center',
        gap: 12,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 8,
    },
    statusCard: {
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(148,163,184,0.25)',
        backgroundColor: 'rgba(30,41,59,0.6)',
        padding: 14,
        gap: 4,
    },
    statusLabel: {
        color: '#94A3B8',
        fontSize: 12,
    },
    statusValue: {
        color: '#E5E7EB',
        fontSize: 18,
        fontWeight: '700',
    },
    statusPaid: {
        color: '#34D399',
    },
    statusHint: {
        color: '#E5E7EB',
        fontSize: 13,
    },
    primaryButton: {
        backgroundColor: '#4F46E5',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
    secondaryButton: {
        backgroundColor: 'rgba(30,41,59,0.9)',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(148,163,184,0.3)',
    },
    secondaryButtonText: {
        color: '#E5E7EB',
        fontSize: 14,
        fontWeight: '600',
    },
    signOutButton: {
        backgroundColor: '#DC2626',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 8,
    },
    signOutText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
});

