import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Brain, HeartPulse, Globe, Sparkles } from 'lucide-react-native';

export type JournalEntry = {
    id: string;
    title?: string;
    dream: string;
    analysis?: string;
    date: string; // ISO string
    style: 'RATIONAL' | 'PSYCHOLOGY' | 'FOLK' | 'CREATIVE';
    imageUrl?: string;
    // Pre-formatted strings for display matching the design
    day?: string;      // "19"
    month?: string;    // "JAN"
    weekday?: string;  // "Friday Morning"
    year?: string;     // "2024"
    tags?: string[];   // ["Lucid", "Anxiety"]
};

// Map style to tag colors approximately matching the design
// Lucid (Indigo), Anxiety (Amber), Nature (Teal), Nostalgia (Rose)
const styleTags: Record<string, { label: string, bg: string, text: string }> = {
    RATIONAL: { label: 'Analysis', bg: '#EEF2FF', text: '#4338CA' }, // Indigo
    PSYCHOLOGY: { label: 'Psychology', bg: '#FFFBEB', text: '#B45309' }, // Amber
    FOLK: { label: 'Nature', bg: '#F0FDFA', text: '#0F766E' }, // Teal
    CREATIVE: { label: 'Creative', bg: '#FFF1F2', text: '#BE123C' }, // Rose
};

interface JournalCardProps {
    entry: JournalEntry;
    onPress: () => void;
}

export default function JournalCard({ entry, onPress }: JournalCardProps) {
    const tagStyle = styleTags[entry.style] || styleTags.CREATIVE;

    // Parse date if fields not provided
    const dateObj = new Date(entry.date);
    const dayDisplay = entry.day || dateObj.getDate().toString().padStart(2, '0');
    const monthDisplay = entry.month || dateObj.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const yearDisplay = entry.year || dateObj.getFullYear().toString();
    const weekdayDisplay = entry.weekday || dateObj.toLocaleString('en-US', { weekday: 'long' }) + ' Night'; // Mock "Night"

    return (
        <TouchableOpacity
            style={styles.cardContainer}
            activeOpacity={0.95}
            onPress={onPress}
        >
            {/* Stacked Paper Effect Backgrounds */}
            <View style={styles.stackLayer1} />
            <View style={styles.stackLayer2} />

            {/* Main Card Content */}
            <View style={styles.cardMain}>
                {/* Left decorative strip */}
                <View style={styles.leftStrip} />

                <View style={styles.contentPadding}>
                    {/* Header: Date and Time */}
                    <View style={styles.headerRow}>
                        <View style={styles.dateBlock}>
                            <Text style={styles.dateNumber}>{dayDisplay}</Text>
                            <View style={styles.dateMeta}>
                                <Text style={styles.dateMonth}>{monthDisplay}</Text>
                                <Text style={styles.dateYear}>{yearDisplay}</Text>
                            </View>
                        </View>
                        <Text style={styles.dateTime}>{weekdayDisplay}</Text>
                    </View>

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Body */}
                    <View style={styles.bodyRow}>
                        <View style={styles.textColumn}>
                            <Text style={styles.title} numberOfLines={2}>
                                {entry.title || "Untitled Dream"}
                            </Text>
                            <Text style={styles.previewText} numberOfLines={3}>
                                {entry.dream}
                            </Text>
                        </View>

                        {/* Image Thumbnail */}
                        {entry.imageUrl && (
                            <View style={styles.imageWrapper}>
                                <View style={styles.polaroidFrame}>
                                    <Image
                                        source={{ uri: entry.imageUrl }}
                                        style={styles.thumbnail}
                                    />
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Footer: Tags and Action */}
                    <View style={styles.footerRow}>
                        <View style={styles.tagContainer}>
                            <View style={[styles.tagBadge, { backgroundColor: tagStyle.bg }]}>
                                <Text style={[styles.tagText, { color: tagStyle.text }]}>
                                    {tagStyle.label}
                                </Text>
                            </View>
                            {/* Mock secondary tag if provided in mock data */}
                            {entry.tags && entry.tags.map((t, i) => (
                                <View key={i} style={[styles.tagBadge, { backgroundColor: '#F3F4F6' }]}>
                                    <Text style={[styles.tagText, { color: '#4B5563' }]}>{t}</Text>
                                </View>
                            ))}
                        </View>

                        <View style={styles.actionButton}>
                            <Text style={styles.actionText}>VIEW ANALYSIS</Text>
                            <Sparkles size={14} color="#5D5CDE" />
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        marginBottom: 24,
        marginHorizontal: 4,
    },
    // Stacked layers simulating depth
    stackLayer1: {
        position: 'absolute',
        top: 2,
        left: 2,
        right: -2,
        bottom: -2,
        backgroundColor: '#E5E5E5', // Shadow color
        borderRadius: 20,
        opacity: 0.5,
    },
    stackLayer2: {
        position: 'absolute',
        top: 4,
        left: 4,
        right: -4,
        bottom: -4,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 20,
    },
    cardMain: {
        backgroundColor: '#FFFDF5', // paper-light
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.03)',
        elevation: 4,
        shadowColor: '#000', // iOS shadow
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    leftStrip: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 8,
        backgroundColor: 'rgba(0,0,0,0.02)',
        borderTopLeftRadius: 20,
        borderBottomLeftRadius: 20,
        borderRightWidth: 1,
        borderRightColor: 'rgba(0,0,0,0.02)',
    },
    contentPadding: {
        padding: 20,
        paddingLeft: 28, // Account for strip
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 12,
    },
    dateBlock: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 8,
    },
    dateNumber: {
        fontSize: 32,
        fontWeight: 'bold', // serif bold
        color: '#C6A87C', // accent-gold
        fontFamily: 'serif',
    },
    dateMeta: {
        flexDirection: 'column',
    },
    dateMonth: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        color: '#6B7280',
        letterSpacing: 1,
    },
    dateYear: {
        fontSize: 9,
        color: '#9CA3AF',
    },
    dateTime: {
        fontSize: 11,
        fontStyle: 'italic',
        color: '#9CA3AF',
        fontFamily: 'serif',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(0,0,0,0.05)',
        marginBottom: 16,
    },
    bodyRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 16,
    },
    textColumn: {
        flex: 1,
    },
    title: {
        fontSize: 18, // font-display
        fontWeight: '600',
        color: '#1F2937', // gray-800
        marginBottom: 8,
        fontFamily: 'serif',
        lineHeight: 24,
    },
    previewText: {
        fontSize: 13,
        color: '#4B5563', // gray-600
        fontFamily: 'serif',
        lineHeight: 20,
    },
    imageWrapper: {
        marginTop: 4,
    },
    polaroidFrame: {
        backgroundColor: '#fff',
        padding: 4,
        paddingBottom: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        transform: [{ rotate: '2deg' }],
    },
    thumbnail: {
        width: 72,
        height: 72,
        backgroundColor: '#E5E7EB',
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 8,
    },
    tagContainer: {
        flexDirection: 'row',
        gap: 6,
    },
    tagBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
    },
    tagText: {
        fontSize: 10,
        fontWeight: '600',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    actionText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#5D5CDE', // primary
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
});
