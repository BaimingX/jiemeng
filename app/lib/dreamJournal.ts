import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

export type DreamJournalEntry = {
    id: string;
    createdAt: string;
    dream: string;
    analysis: string;
    style: string;
    isGuest: boolean;
    tags?: string[];
};

const JOURNAL_KEY = 'oneiro_dream_journal_entries';
const JOURNAL_LIMIT = 50;

type CloudConversation = {
    date_id: string;
    created_at: string;
    updated_at: string;
    conversation_history?: {
        source?: string;
        created_at?: string;
        dream?: string;
        analysis?: string;
        style?: string;
        is_guest?: boolean;
        tags?: string[];
    } | null;
};

const parseLocalEntries = (raw: string | null): DreamJournalEntry[] => {
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
    } catch {
        // Ignore malformed cache.
    }
    return [];
};

const persistLocalEntries = async (entries: DreamJournalEntry[]) => {
    await AsyncStorage.setItem(JOURNAL_KEY, JSON.stringify(entries.slice(0, JOURNAL_LIMIT)));
};

const buildConversationId = (entry: DreamJournalEntry) => {
    const created = new Date(entry.createdAt);
    const day = Number.isNaN(created.getTime())
        ? new Date().toISOString().slice(0, 10)
        : created.toISOString().slice(0, 10);
    return `${day}-${entry.id}`;
};

const syncEntryToSupabase = async (entry: DreamJournalEntry) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const conversationId = buildConversationId(entry);
    const summary = entry.dream.trim().slice(0, 180);

    const { error: conversationError } = await supabase
        .from('dream_conversations')
        .upsert(
            {
                user_id: user.id,
                date_id: conversationId,
                summary,
                conversation_history: {
                    source: 'mobile_journal',
                    created_at: entry.createdAt,
                    dream: entry.dream,
                    analysis: entry.analysis,
                    style: entry.style,
                    is_guest: entry.isGuest,
                    tags: entry.tags || [],
                    messages: [
                        {
                            id: `${entry.id}-user`,
                            sender: 'user',
                            type: 'text',
                            text: entry.dream,
                            timestamp: entry.createdAt,
                        },
                        {
                            id: `${entry.id}-ai`,
                            sender: 'ai',
                            type: 'text',
                            text: entry.analysis,
                            timestamp: entry.createdAt,
                        },
                    ],
                },
                updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id,date_id' }
        );

    if (conversationError) {
        console.error('[DreamJournal] Failed to sync conversation', conversationError);
        return;
    }

    // User messages can be safely inserted by clients under current RLS.
    const { error: userMessageError } = await supabase
        .from('dream_messages')
        .upsert(
            {
                user_id: user.id,
                conversation_date_id: conversationId,
                client_message_id: `${entry.id}-user`,
                sender: 'user',
                message_type: 'text',
                text_content: entry.dream,
                timestamp: entry.createdAt,
            },
            { onConflict: 'user_id,client_message_id' }
        );

    if (userMessageError) {
        console.error('[DreamJournal] Failed to sync user message', userMessageError);
    }
};

const hydrateFromSupabase = async (): Promise<DreamJournalEntry[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('dream_conversations')
        .select('date_id,created_at,updated_at,conversation_history')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(JOURNAL_LIMIT);

    if (error || !Array.isArray(data)) {
        if (error) {
            console.error('[DreamJournal] Failed to fetch cloud journal', error);
        }
        return [];
    }

    const entries: DreamJournalEntry[] = (data as CloudConversation[])
        .map((row) => {
            const payload = row.conversation_history || {};
            const dream = typeof payload.dream === 'string' ? payload.dream : '';
            const analysis = typeof payload.analysis === 'string' ? payload.analysis : '';

            if (!dream.trim()) return null;

            return {
                id: row.date_id,
                createdAt: payload.created_at || row.created_at || row.updated_at || new Date().toISOString(),
                dream,
                analysis,
                style: typeof payload.style === 'string' ? payload.style : 'CREATIVE',
                isGuest: Boolean(payload.is_guest),
                tags: Array.isArray(payload.tags) ? payload.tags : [],
            } as DreamJournalEntry;
        })
        .filter((entry): entry is DreamJournalEntry => Boolean(entry));

    return entries;
};

export const loadJournalEntries = async (): Promise<DreamJournalEntry[]> => {
    const local = parseLocalEntries(await AsyncStorage.getItem(JOURNAL_KEY));
    if (local.length > 0) return local;

    const cloud = await hydrateFromSupabase();
    if (cloud.length > 0) {
        await persistLocalEntries(cloud);
    }

    return cloud;
};

export const addJournalEntry = async (entry: DreamJournalEntry): Promise<DreamJournalEntry[]> => {
    const existing = parseLocalEntries(await AsyncStorage.getItem(JOURNAL_KEY));
    const updated = [entry, ...existing].slice(0, JOURNAL_LIMIT);
    await persistLocalEntries(updated);

    try {
        await syncEntryToSupabase(entry);
    } catch (error) {
        console.error('[DreamJournal] Cloud sync failed', error);
    }

    return updated;
};
