import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    StatusBar,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PenTool } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { loadJournalEntries } from '../../lib/dreamJournal';
import JournalCard, { JournalEntry } from '../../components/JournalCard';
import JournalHeader from '../../components/JournalHeader';

export default function JournalScreen() {
    const { session } = useAuth();
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        const data = await loadJournalEntries();
        const viewModels: JournalEntry[] = data.map(d => ({
            id: d.id,
            dream: d.dream,
            analysis: d.analysis,
            date: d.createdAt,
            style: d.style as any,
            imageUrl: undefined,
        }));
        setEntries(viewModels);
        setIsLoading(false);
    };

    const renderContent = () => {
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
            {renderContent()}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FDFBF7',
    },
    listContainer: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 120,
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
        backgroundColor: 'rgba(198, 168, 124, 0.15)',
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
});
