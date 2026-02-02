import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Search, Calendar, ChevronLeft } from 'lucide-react-native';

interface JournalHeaderProps {
    onBack?: () => void;
    title?: string;
    subtitle?: string;
}

export default function JournalHeader({
    onBack,
    title = "Oneiro AI",
    subtitle = "Dream Log"
}: JournalHeaderProps) {
    return (
        <View style={styles.container}>
            {/* Top Bar */}
            <View style={styles.topBar}>
                <View style={styles.leftAction}>
                    {/* Always show back button visually or hamburger equivalent if needed, 
                        but effectively just a placeholder action for now based on HTML. */}
                    <TouchableOpacity style={styles.roundButton}>
                        <ChevronLeft size={20} color="#4B5563" />
                    </TouchableOpacity>
                    <Text style={styles.appTitle}>Oneiro AI Journal</Text>
                </View>

                <View style={styles.rightActions}>
                    <TouchableOpacity style={styles.roundButton}>
                        <Search size={20} color="#4B5563" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.roundButton}>
                        <Calendar size={20} color="#4B5563" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Title Section */}
            <View style={styles.titleSection}>
                <Text style={styles.brandSubtitle}>{title}</Text>
                <Text style={styles.mainTitle}>{subtitle}</Text>
                <Text style={styles.tagline}>Capturing the whispers of your subconscious.</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 8,
        paddingBottom: 24,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(253, 251, 247, 0.95)', // bg-light
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    leftAction: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    appTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827', // gray-900
        fontFamily: 'serif', // Display font
    },
    rightActions: {
        flexDirection: 'row',
        gap: 8,
    },
    roundButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        // hover effect simulation
        backgroundColor: 'rgba(0,0,0,0.03)',
    },
    titleSection: {
        alignItems: 'center',
        gap: 6,
    },
    brandSubtitle: {
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 2,
        textTransform: 'uppercase',
        color: '#C6A87C', // accent-gold
    },
    mainTitle: {
        fontSize: 32,
        fontFamily: 'serif',
        fontStyle: 'italic',
        color: '#1F2937', // gray-800
        marginBottom: 2,
    },
    tagline: {
        fontSize: 13,
        color: '#6B7280', // gray-500
        textAlign: 'center',
    },
});
