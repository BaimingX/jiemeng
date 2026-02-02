import React, { useEffect, useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Alert
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Check, Brain, HeartPulse, Globe, Sparkles, PenTool } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { loadJournalEntries, addJournalEntry } from '../../lib/dreamJournal';
import JournalCard, { JournalEntry } from '../../components/JournalCard';
import JournalHeader from '../../components/JournalHeader';
import { callDreamChat, AppStage } from '../../lib/dreamService';

// Updated to match HTML colors/styles
const PERSPECTIVE_OPTIONS = [
    { id: 'RATIONAL', label: 'Rational', icon: Brain, color: '#4338CA', bg: '#EEF2FF' },
    { id: 'PSYCHOLOGY', label: 'Psychology', icon: HeartPulse, color: '#B45309', bg: '#FFFBEB' },
    { id: 'FOLK', label: 'Cultural', icon: Globe, color: '#0F766E', bg: '#F0FDFA' },
    { id: 'CREATIVE', label: 'Creative', icon: Sparkles, color: '#BE123C', bg: '#FFF1F2' },
];

export default function HomeScreen() {
    const insets = useSafeAreaInsets();
    const { session } = useAuth();

    // State
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isWriting, setIsWriting] = useState(false);

    // Writing State
    const [dreamText, setDreamText] = useState('');
    const [selectedStyle, setSelectedStyle] = useState('CREATIVE'); // Default to creative as per design vibe
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const isGuest = useMemo(() => {
        const user = session?.user;
        return Boolean(user?.is_anonymous || user?.user_metadata?.is_guest);
    }, [session]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        const data = await loadJournalEntries();
        // transform to view model
        const viewModels: JournalEntry[] = data.map(d => ({
            id: d.id,
            dream: d.dream,
            analysis: d.analysis,
            date: d.createdAt,
            style: d.style as any,
            // Mock data for card display logic if missing
            imageUrl: undefined,
            // We can add logic here to properly split date into day/month etc if needed, but JournalCard handles it
        }));
        setEntries(viewModels);
        setIsLoading(false);
    };

    const handleSaveDream = async () => {
        if (!dreamText.trim()) return;

        setIsAnalyzing(true);
        try {
            // "Analysis is small aspect, encourage recording" - Save first logic
            // But we need the analysis for the card... let's just do it.
            const response = await callDreamChat(
                dreamText,
                AppStage.WAITING_STYLE,
                dreamText,
                selectedStyle,
                []
            );

            if (response.text) {
                await addJournalEntry({
                    id: Date.now().toString(),
                    createdAt: new Date().toISOString(),
                    dream: dreamText,
                    analysis: response.text,
                    style: selectedStyle,
                    isGuest: isGuest
                });

                await loadData(); // Reload list
                setDreamText('');
                setIsWriting(false);
                setIsAnalyzing(false);
            }
        } catch (e) {
            Alert.alert("Error", "Failed to save dream.");
            setIsAnalyzing(false);
        }
    };

    const renderContent = () => {
        if (isWriting) {
            return (
                <View style={styles.writeContainer}>
                    <View style={styles.writeHeader}>
                        <TouchableOpacity onPress={() => setIsWriting(false)} style={styles.iconBtn}>
                            <X size={26} color="#4B5563" />
                        </TouchableOpacity>
                        <Text style={styles.writeTitle}>New Entry</Text>
                        <TouchableOpacity
                            onPress={handleSaveDream}
                            disabled={isAnalyzing || !dreamText.trim()}
                            style={[styles.saveBtn, (!dreamText.trim() || isAnalyzing) && { opacity: 0.5 }]}
                        >
                            {isAnalyzing ? (
                                <ActivityIndicator size="small" color="#FFF" />
                            ) : (
                                <Text style={styles.saveBtnText}>Save</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <TextInput
                        style={styles.input}
                        multiline
                        placeholder="What did you dream about? Capturing the details..."
                        placeholderTextColor="#9CA3AF"
                        value={dreamText}
                        onChangeText={setDreamText}
                        textAlignVertical="top"
                        autoFocus
                    />

                    <View style={styles.styleSelector}>
                        <Text style={styles.styleLabel}>Choose a Perspective</Text>
                        <View style={styles.styleRow}>
                            {PERSPECTIVE_OPTIONS.map(opt => {
                                const isSelected = selectedStyle === opt.id;
                                return (
                                    <TouchableOpacity
                                        key={opt.id}
                                        onPress={() => setSelectedStyle(opt.id)}
                                        style={[
                                            styles.styleChip,
                                            isSelected ? { backgroundColor: opt.color, borderColor: opt.color } : { borderColor: 'rgba(0,0,0,0.1)' }
                                        ]}
                                    >
                                        <Text style={[styles.styleChipText, isSelected && { color: '#FFF' }]}>
                                            {opt.label}
                                        </Text>
                                    </TouchableOpacity>
                                )
                            })}
                        </View>
                    </View>
                </View>
            )
        }

        return (
            <>
                <JournalHeader />
                <View style={[styles.listContainer, { paddingBottom: 100 }]}>
                    {isLoading ? (
                        <ActivityIndicator size="large" color="#C6A87C" style={{ marginTop: 40 }} />
                    ) : entries.length === 0 ? (
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIconCircle}>
                                <PenTool size={32} color="#C6A87C" />
                            </View>
                            <Text style={styles.emptyTitle}>Start Your Journal</Text>
                            <Text style={styles.emptyDesc}>
                                Your subconscious is waiting. Tap the + button to record your first dream.
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            data={entries}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => (
                                <JournalCard entry={item} onPress={() => { /* Navigate to detail */ }} />
                            )}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                        />
                    )}
                </View>
            </>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor="#FDFBF7" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                {renderContent()}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FDFBF7', // bg-light
    },
    listContainer: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 120, // Space for tab bar
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
        marginTop: 60,
    },
    emptyIconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(198, 168, 124, 0.15)', // accent-gold light
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
        fontFamily: 'serif',
    },
    emptyDesc: {
        textAlign: 'center',
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 22,
    },
    // Write Mode Styles
    writeContainer: {
        flex: 1,
        backgroundColor: '#FDFBF7',
        padding: 20,
    },
    writeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    writeTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        fontFamily: 'serif',
    },
    iconBtn: {
        padding: 8,
    },
    saveBtn: {
        backgroundColor: '#5D5CDE', // primary
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    saveBtnText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 14,
    },
    input: {
        flex: 1,
        fontSize: 18,
        lineHeight: 28,
        color: '#1F2937',
        fontFamily: 'serif',
        textAlignVertical: 'top',
    },
    styleSelector: {
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        marginBottom: 20, // Avoid keyboard overlap if possible
    },
    styleLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    styleRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    styleChip: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#FFF',
        borderWidth: 1,
        elevation: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    styleChipText: {
        fontSize: 13,
        color: '#4B5563',
        fontWeight: '500',
    },
});
