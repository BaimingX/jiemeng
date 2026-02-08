import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Image,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Sparkles, Plus, ChevronRight, Palette } from 'lucide-react-native';
import { loadJournalEntries } from '../../lib/dreamJournal';
import { JournalEntry } from '../../components/JournalCard';

export default function HomeScreen() {
    const router = useRouter();
    const [recentEntries, setRecentEntries] = useState<JournalEntry[]>([]);

    // Reload data when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async () => {
        const data = await loadJournalEntries();
        // Take top 2
        setRecentEntries(data.slice(0, 2).map(d => ({
            id: d.id,
            dream: d.dream,
            analysis: d.analysis,
            date: d.createdAt,
            style: d.style as any
        })));
    };

    const formatDate = () => {
        const date = new Date();
        const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
        return date.toLocaleDateString('en-GB', options);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor="#F5F2EB" />
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerIcon}>
                        <Palette size={24} color="#C6A87C" style={{ opacity: 0.6 }} />
                    </View>
                    <Text style={styles.headerTitle}>Dreaming...</Text>
                    <Text style={styles.headerDate}>{formatDate()}</Text>
                </View>

                {/* Hero Section */}
                <View style={styles.heroContainer}>
                    <View style={styles.heroCardGroup}>
                        {/* Background decoration */}
                        <View style={styles.heroBgDecoration} />

                        {/* Main Card */}
                        <View style={styles.heroCard}>
                            <View style={styles.heroContent}>
                                <Text style={styles.heroTitle}>
                                    How was your dream{'\n'}last night?
                                </Text>
                                <Text style={styles.heroSubtitle}>
                                    Tap below to start your journey.
                                </Text>
                            </View>

                            <TouchableOpacity
                                style={styles.recordBtnContainer}
                                activeOpacity={0.9}
                                onPress={() => router.push('/create')}
                            >
                                <View style={styles.recordBtn}>
                                    <Plus size={32} color="#FFFFFF" strokeWidth={1.5} />
                                </View>
                                <Text style={styles.recordBtnText}>RECORD DREAM</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Recent Memories */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Memories</Text>
                        <TouchableOpacity onPress={() => router.push('/gallery')}>
                            <Text style={styles.viewJournalBtn}>VIEW JOURNAL</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.recentList}>
                        {recentEntries.length > 0 ? (
                            recentEntries.map((entry, index) => {
                                const dateObj = new Date(entry.date);
                                const day = dateObj.getDate().toString().padStart(2, '0');
                                const month = dateObj.toLocaleString('en-US', { month: 'short' });
                                const isOpacity = index === 1; // Second item opacity style

                                return (
                                    <TouchableOpacity
                                        key={entry.id}
                                        style={[styles.recentCard, isOpacity && { opacity: 0.8 }]}
                                        onPress={() => router.push('/gallery')}
                                    >
                                        <View style={styles.recentImagePlaceholder}>
                                            {/* Placeholder visualization since we might not have images yet */}
                                            <View style={{ flex: 1, backgroundColor: '#E5E5E5' }} />
                                        </View>

                                        <View style={styles.recentInfo}>
                                            <Text style={styles.recentDate}>{index === 0 ? 'YESTERDAY' : `${day} ${month}`}</Text>
                                            <Text style={styles.recentTitle} numberOfLines={1}>
                                                {entry.dream.substring(0, 20) || "Untitled Dream"}...
                                            </Text>
                                            <Text style={styles.recentSnippet} numberOfLines={1}>
                                                {entry.dream}
                                            </Text>
                                        </View>

                                        <ChevronRight size={20} color="#D1D5DB" />
                                    </TouchableOpacity>
                                );
                            })
                        ) : (
                            <Text style={styles.noRecentText}>No recent dreams recorded.</Text>
                        )}
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F2EB', // Warmer parchment base for contrast
    },
    scrollContent: {
        paddingBottom: 120,
    },
    header: {
        alignItems: 'center',
        paddingTop: 24,
        paddingBottom: 24,
        paddingHorizontal: 24,
    },
    headerIcon: {
        marginBottom: 8,
    },
    headerTitle: {
        fontSize: 32,
        fontFamily: 'serif',
        fontStyle: 'italic',
        color: '#111827',
        marginBottom: 4,
    },
    headerDate: {
        fontSize: 12,
        fontWeight: '700',
        color: '#C6A87C',
        textTransform: 'uppercase',
        letterSpacing: 2,
        opacity: 0.8,
    },
    heroContainer: {
        paddingHorizontal: 24,
        marginBottom: 40,
    },
    heroCardGroup: {
        position: 'relative',
    },
    heroBgDecoration: {
        position: 'absolute',
        top: 8,
        left: 8,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 252, 245, 0.6)',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(210, 200, 180, 0.4)',
    },
    heroCard: {
        backgroundColor: '#FFFCF5', // Elegant cream paper
        borderRadius: 32,
        paddingVertical: 50,
        paddingHorizontal: 30,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 340,
        // Enhanced shadow for book-like depth
        shadowColor: '#8B7355',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
        elevation: 8,
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: 'rgba(200, 185, 160, 0.35)',
    },
    heroContent: {
        alignItems: 'center',
        marginBottom: 32,
        zIndex: 10,
    },
    heroTitle: {
        fontSize: 28, // Matches text-2xl/4xl scale better from ref
        fontFamily: 'serif',
        color: '#374151',
        textAlign: 'center',
        lineHeight: 36,
        marginBottom: 12,
    },
    heroSubtitle: {
        fontSize: 14,
        fontFamily: 'serif',
        fontStyle: 'italic',
        color: '#9CA3AF',
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    recordBtnContainer: {
        alignItems: 'center',
        gap: 16,
        marginTop: 20,
    },
    recordBtn: {
        width: 72, // Larger button like in ref (w-16 h-16 = 64px, maybe slightly bigger for mobile touch)
        height: 72,
        borderRadius: 36,
        backgroundColor: '#5D5CDE',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#5D5CDE',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    recordBtnText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#5D5CDE',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    sectionContainer: {
        paddingHorizontal: 24,
        gap: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingHorizontal: 4,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 20,
        fontFamily: 'serif',
        fontWeight: '600',
        color: '#1F2937',
    },
    viewJournalBtn: {
        fontSize: 11,
        fontWeight: '700',
        color: '#C6A87C', // accent-gold
        textTransform: 'uppercase',
        letterSpacing: 1.2,
    },
    recentList: {
        gap: 16,
    },
    recentCard: {
        backgroundColor: '#FFFDF8', // Warm ivory card
        borderRadius: 20,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        borderWidth: 1,
        borderColor: 'rgba(195, 180, 155, 0.5)', // Warm border for visibility
        shadowColor: '#9D8B70',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 3,
    },
    recentImagePlaceholder: {
        width: 64,
        height: 64,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    recentInfo: {
        flex: 1,
        minWidth: 0,
    },
    recentDate: {
        fontSize: 10,
        fontWeight: '700',
        color: '#C6A87C',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    recentTitle: {
        fontSize: 16,
        fontFamily: 'serif',
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 2,
    },
    recentSnippet: {
        fontSize: 12,
        fontFamily: 'serif',
        fontStyle: 'italic',
        color: '#6B7280',
    },
    noRecentText: {
        textAlign: 'center',
        padding: 20,
        color: '#9CA3AF',
        fontStyle: 'italic',
        fontFamily: 'serif',
    },
});
