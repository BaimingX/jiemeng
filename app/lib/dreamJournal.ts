import AsyncStorage from '@react-native-async-storage/async-storage';

export type DreamJournalEntry = {
    id: string;
    createdAt: string;
    dream: string;
    analysis: string;
    style: string;
    isGuest: boolean;
};

const JOURNAL_KEY = 'oneiro_dream_journal_entries';
const JOURNAL_LIMIT = 50;

export const loadJournalEntries = async (): Promise<DreamJournalEntry[]> => {
    const raw = await AsyncStorage.getItem(JOURNAL_KEY);
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
    } catch {
        // Ignore malformed cache.
    }
    return [];
};

export const addJournalEntry = async (entry: DreamJournalEntry): Promise<DreamJournalEntry[]> => {
    const existing = await loadJournalEntries();
    const updated = [entry, ...existing].slice(0, JOURNAL_LIMIT);
    await AsyncStorage.setItem(JOURNAL_KEY, JSON.stringify(updated));
    return updated;
};
