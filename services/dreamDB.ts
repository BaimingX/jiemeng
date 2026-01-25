/**
 * IndexedDB service for Dream Journal
 * Stores conversations (one per day) and messages
 */

import { supabase } from '../lib/supabaseClient';

const DB_NAME = 'DreamJournalDB';
const DB_VERSION = 1;

export interface Conversation {
    id: string; // yyyy-mm-dd format
    createdAt: Date;
    updatedAt: Date;
    summary?: string;
    imageUrl?: string;
    hasMessages: boolean;
}

export interface FeedbackData {
    rating: number;
    comment: string;
    conversationId?: string;
}

export interface StoredMessage {
    id: string;
    conversationId: string;
    sender: 'user' | 'ai' | 'system';
    text: string;
    type: 'text' | 'loading' | 'image' | 'card_generating' | 'card_ready';
    timestamp: Date;
    imageUrl?: string;
}

let db: IDBDatabase | null = null;

/**
 * Get today's date as yyyy-mm-dd string
 */
export const getTodayId = (): string => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

/**
 * Format a date string for display
 */
export const formatDateForDisplay = (dateId: string, language: 'en' | 'zh'): string => {
    const today = getTodayId();
    const yesterday = (() => {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    })();

    if (dateId === today) {
        return language === 'zh' ? '今天' : 'Today';
    }
    if (dateId === yesterday) {
        return language === 'zh' ? '昨天' : 'Yesterday';
    }

    // Parse the date and format
    const [year, month, day] = dateId.split('-').map(Number);
    if (language === 'zh') {
        return `${month}月${day}日`;
    }
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[month - 1]} ${day}`;
};

/**
 * Initialize the IndexedDB database
 */
export const initDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        if (db) {
            resolve(db);
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            reject(new Error('Failed to open IndexedDB'));
        };

        request.onsuccess = (event) => {
            db = (event.target as IDBOpenDBRequest).result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const database = (event.target as IDBOpenDBRequest).result;

            // Create conversations store
            if (!database.objectStoreNames.contains('conversations')) {
                const conversationStore = database.createObjectStore('conversations', { keyPath: 'id' });
                conversationStore.createIndex('updatedAt', 'updatedAt', { unique: false });
            }

            // Create messages store
            if (!database.objectStoreNames.contains('messages')) {
                const messageStore = database.createObjectStore('messages', { keyPath: 'id' });
                messageStore.createIndex('conversationId', 'conversationId', { unique: false });
                messageStore.createIndex('timestamp', 'timestamp', { unique: false });
            }
        };
    });
};

/**
 * Get or create today's conversation
 */
export const getTodayConversation = async (): Promise<Conversation> => {
    const database = await initDB();
    const todayId = getTodayId();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction(['conversations'], 'readwrite');
        const store = transaction.objectStore('conversations');
        const request = store.get(todayId);

        request.onsuccess = () => {
            if (request.result) {
                resolve(request.result);
            } else {
                // Create new conversation for today
                const newConversation: Conversation = {
                    id: todayId,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    hasMessages: false
                };
                store.add(newConversation);
                resolve(newConversation);
            }
        };

        request.onerror = () => {
            reject(new Error('Failed to get today conversation'));
        };
    });
};

export const getNextConversationIdForToday = async (maxPerDay = 5): Promise<{ id: string; sequence: number } | null> => {
    const database = await initDB();
    const baseId = getTodayId();

    const conversations = await new Promise<Conversation[]>((resolve, reject) => {
        const transaction = database.transaction(['conversations'], 'readonly');
        const store = transaction.objectStore('conversations');
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(new Error('Failed to get conversations'));
    });

    const sameDay = conversations.filter(c => c.id === baseId || c.id.startsWith(`${baseId}-`));
    const sequences = sameDay.map(c => {
        if (c.id === baseId) return 1;
        const parts = c.id.split('-');
        const seq = Number(parts[3]);
        return Number.isFinite(seq) && seq > 0 ? seq : 1;
    });
    const maxSequence = sequences.length > 0 ? Math.max(...sequences) : 0;
    const nextSequence = maxSequence + 1;

    if (nextSequence > maxPerDay) {
        return null;
    }

    return { id: `${baseId}-${nextSequence}`, sequence: nextSequence };
};

/**
 * Get a specific conversation by date
 */
export const getConversation = async (dateId: string): Promise<Conversation | null> => {
    const database = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction(['conversations'], 'readonly');
        const store = transaction.objectStore('conversations');
        const request = store.get(dateId);

        request.onsuccess = () => {
            resolve(request.result || null);
        };

        request.onerror = () => {
            reject(new Error('Failed to get conversation'));
        };
    });
};

/**
 * Get all conversation dates that have messages
 */
export const getConversationDates = async (): Promise<string[]> => {
    const database = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction(['conversations'], 'readonly');
        const store = transaction.objectStore('conversations');
        const request = store.getAll();

        request.onsuccess = () => {
            const conversations: Conversation[] = request.result || [];
            const dates = conversations
                .filter(c => c.hasMessages)
                .map(c => c.id)
                .sort((a, b) => b.localeCompare(a)); // Most recent first
            resolve(dates);
        };

        request.onerror = () => {
            reject(new Error('Failed to get conversation dates'));
        };
    });
};

/**
 * Sync a single message to Supabase
 */
export const syncMessageToSupabase = async (message: StoredMessage, userId: string): Promise<void> => {
    const { error } = await supabase.from('dream_messages').insert({
        user_id: userId,
        conversation_date_id: message.conversationId,
        client_message_id: message.id,
        sender: message.sender,
        message_type: message.type,
        text_content: message.text,
        image_url: message.imageUrl,
        timestamp: message.timestamp
    });

    if (error) {
        throw error;
    }
};

/**
 * Add a message to a conversation
 */
export const addMessage = async (message: StoredMessage): Promise<void> => {
    const database = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction(['messages', 'conversations'], 'readwrite');
        const messageStore = transaction.objectStore('messages');
        const conversationStore = transaction.objectStore('conversations');

        // Add the message
        messageStore.add(message);

        // Update conversation's updatedAt and hasMessages
        const getRequest = conversationStore.get(message.conversationId);
        getRequest.onsuccess = () => {
            const conversation = getRequest.result;
            if (conversation) {
                conversation.updatedAt = new Date();
                conversation.hasMessages = true;
                conversationStore.put(conversation);
            } else {
                const newConversation: Conversation = {
                    id: message.conversationId,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    hasMessages: true
                };
                conversationStore.add(newConversation);
            }
        };

        transaction.oncomplete = async () => {
            // No real-time sync to remove lag.
            // Syncing will happen on next day load via syncDailyConversation
            resolve();
        };

        transaction.onerror = () => {
            reject(new Error('Failed to add message'));
        };
    });
};

/**
 * Get all messages for a conversation
 */
export const getMessages = async (conversationId: string): Promise<StoredMessage[]> => {
    const database = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction(['messages'], 'readonly');
        const store = transaction.objectStore('messages');
        const index = store.index('conversationId');
        const request = index.getAll(conversationId);

        request.onsuccess = () => {
            const messages: StoredMessage[] = request.result || [];
            // Sort by timestamp
            messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
            resolve(messages);
        };

        request.onerror = () => {
            reject(new Error('Failed to get messages'));
        };
    });
};

/**
 * Update conversation summary (for dream map preview)
 */
export const updateConversationSummary = async (dateId: string, summary: string, imageUrl?: string): Promise<void> => {
    const database = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction(['conversations'], 'readwrite');
        const store = transaction.objectStore('conversations');
        const request = store.get(dateId);

        request.onsuccess = () => {
            const conversation = request.result;
            if (conversation) {
                conversation.summary = summary;
                if (imageUrl) {
                    conversation.imageUrl = imageUrl;
                }
                conversation.updatedAt = new Date();
                store.put(conversation);
            } else {
                const newConversation: Conversation = {
                    id: dateId,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    summary,
                    imageUrl,
                    hasMessages: true
                };
                store.add(newConversation);
            }
        };

        transaction.oncomplete = async () => {
            // Sync summary update to Supabase
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    await supabase.from('dream_conversations').upsert({
                        user_id: user.id,
                        date_id: dateId,
                        summary: summary,
                        image_url: imageUrl,
                        updated_at: new Date()
                    }, { onConflict: 'user_id, date_id' });
                }
            } catch (e) {
                console.error("Failed to sync summary", e);
            }
            resolve();
        };

        transaction.onerror = () => {
            reject(new Error('Failed to update conversation summary'));
        };
    });
};

/**
 * Get conversations for a specific month (for calendar view)
 */
export const getConversationsForMonth = async (year: number, month: number): Promise<Map<number, Conversation>> => {
    const database = await initDB();
    const monthStr = String(month).padStart(2, '0');
    const prefix = `${year}-${monthStr}`;

    return new Promise((resolve, reject) => {
        const transaction = database.transaction(['conversations'], 'readonly');
        const store = transaction.objectStore('conversations');
        const request = store.getAll();

        request.onsuccess = () => {
            const conversations: Conversation[] = request.result || [];
            const dayMap = new Map<number, Conversation>();

            conversations
                .filter(c => c.id.startsWith(prefix) && c.hasMessages)
                .forEach(c => {
                    const day = parseInt(c.id.split('-')[2], 10);
                    const existing = dayMap.get(day);
                    if (!existing || new Date(c.updatedAt).getTime() > new Date(existing.updatedAt).getTime()) {
                        dayMap.set(day, c);
                    }
                });

            resolve(dayMap);
        };

        request.onerror = () => {
            reject(new Error('Failed to get conversations for month'));
        };
    });
};

/**
 * Clear all data (for testing/reset)
 */
export const clearAllData = async (): Promise<void> => {
    const database = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction(['conversations', 'messages'], 'readwrite');
        transaction.objectStore('conversations').clear();
        transaction.objectStore('messages').clear();

        transaction.oncomplete = () => {
            resolve();
        };

        transaction.onerror = () => {
            reject(new Error('Failed to clear data'));
        };
    });
};

/**
 * Delete a conversation (clear messages and reset summary)
 */
export const deleteConversation = async (dateId: string): Promise<void> => {
    const database = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction(['conversations', 'messages'], 'readwrite');
        const messageStore = transaction.objectStore('messages');
        const conversationStore = transaction.objectStore('conversations');
        const messageIndex = messageStore.index('conversationId');

        // 1. Delete messages using a cursor or getAllKeys + delete
        const messageRequest = messageIndex.getAllKeys(dateId);

        messageRequest.onsuccess = () => {
            const keys = messageRequest.result;
            keys.forEach(key => {
                messageStore.delete(key);
            });
        };

        // 2. Reset conversation entry
        const convRequest = conversationStore.get(dateId);
        convRequest.onsuccess = () => {
            const conversation = convRequest.result;
            if (conversation) {
                conversation.summary = undefined;
                conversation.imageUrl = undefined;
                conversation.hasMessages = false;
                conversation.updatedAt = new Date();
                conversationStore.put(conversation);
            }
        };

        transaction.oncomplete = () => {
            resolve();
        };

        transaction.onerror = () => {
            reject(new Error('Failed to delete conversation'));
        };
    });
};

export const saveFeedbackToSupabase = async (feedback: FeedbackData): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return; // Retrieve silently if not logged in

    await supabase.from('dream_feedback').insert({
        user_id: user.id,
        conversation_date_id: feedback.conversationId,
        rating: feedback.rating,
        comment: feedback.comment
    });
};

export const restoreFromSupabase = async (): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not logged in");

    // 1. Get all conversations
    const { data: conversations, error: convError } = await supabase
        .from('dream_conversations')
        .select('*');

    if (convError) throw convError;
    if (!conversations) return false;

    // 2. Get all messages
    const { data: messages, error: msgError } = await supabase
        .from('dream_messages')
        .select('*');

    if (msgError) throw msgError;

    // 3. Write to IndexedDB
    const database = await initDB();

    const transaction = database.transaction(['conversations', 'messages'], 'readwrite');
    const conversationStore = transaction.objectStore('conversations');
    const messageStore = transaction.objectStore('messages');

    // Restore conversations
    for (const conv of conversations) {
        conversationStore.put({
            id: conv.date_id,
            createdAt: new Date(conv.created_at),
            updatedAt: new Date(conv.updated_at),
            summary: conv.summary,
            imageUrl: conv.image_url,
            hasMessages: true
        });
    }

    // Restore messages
    if (messages) {
        for (const msg of messages) {
            messageStore.put({
                id: msg.client_message_id || msg.id,
                conversationId: msg.conversation_date_id,
                sender: msg.sender as any,
                text: msg.text_content,
                type: msg.message_type as any,
                timestamp: new Date(msg.timestamp),
                imageUrl: msg.image_url
            });
        }
    }

    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve(true);
        transaction.onerror = () => reject("Failed to write restored data");
    });
};

/**
 * Archive a specific day's conversation to Supabase as a single JSON blob
 */
export const syncDailyConversation = async (dateId: string): Promise<void> => {
    const database = await initDB();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return; // Cannot sync if not logged in

    // 1. Get all messages for this day
    const messages = await getMessages(dateId);
    if (messages.length === 0) return;

    // 2. Get conversation metadata (summary, etc)
    const conversation = await new Promise<Conversation | null>((resolve) => {
        const transaction = database.transaction(['conversations'], 'readonly');
        const req = transaction.objectStore('conversations').get(dateId);
        req.onsuccess = () => resolve(req.result);
    });

    if (!conversation) return;

    console.log(`[DreamSync] Archiving day ${dateId} with ${messages.length} messages...`);

    // 3. Upsert to dream_conversations with the JSON history
    const { error } = await supabase.from('dream_conversations').upsert({
        user_id: user.id,
        date_id: dateId,
        summary: conversation.summary,
        image_url: conversation.imageUrl,
        conversation_history: messages, // Storing full array as JSONB
        updated_at: new Date()
    }, { onConflict: 'user_id, date_id' });

    if (error) {
        console.error("Failed to archive conversation", error);
    } else {
        console.log(`[DreamSync] Successfully archived ${dateId}`);
    }
};

/**
 * Check for previous days that haven't been synced/archived and sync them.
 * Should be called on app start.
 */
/**
 * Try to fetch conversation from Supabase (restoring from JSON backup)
 * Used when local IndexedDB is empty but cloud might have data.
 */
export const fetchConversationFromSupabase = async (dateId: string): Promise<StoredMessage[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    console.log(`[DreamSync] Attempting to restore ${dateId} from cloud...`);

    const { data, error } = await supabase
        .from('dream_conversations')
        .select('*')
        .eq('user_id', user.id)
        .eq('date_id', dateId)
        .single();

    if (error || !data || !data.conversation_history) {
        if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
            console.warn('[DreamSync] Fetch error:', error);
        }
        return [];
    }

    const messages = data.conversation_history as StoredMessage[];
    if (!Array.isArray(messages) || messages.length === 0) return [];

    console.log(`[DreamSync] Found ${messages.length} messages in cloud. Restoring...`);

    // Restore to IndexedDB
    const database = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction(['conversations', 'messages'], 'readwrite');
        const conversationStore = transaction.objectStore('conversations');
        const messageStore = transaction.objectStore('messages');

        // 1. Restore Conversation Metadata
        const conversation: Conversation = {
            id: dateId,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
            summary: data.summary,
            imageUrl: data.image_url,
            hasMessages: true
        };
        conversationStore.put(conversation);

        // 2. Restore Messages
        messages.forEach(msg => {
            // Ensure dates are parsed back to Date objects if they became strings in JSON
            const parsedMsg = {
                ...msg,
                timestamp: new Date(msg.timestamp)
            };
            messageStore.put(parsedMsg);
        });

        transaction.oncomplete = () => {
            console.log(`[DreamSync] Successfully restored ${dateId} to local DB`);
            // Return valid messages with Dates
            resolve(messages.map(m => ({ ...m, timestamp: new Date(m.timestamp) })));
        };

        transaction.onerror = () => {
            console.error('[DreamSync] Restore failed');
            reject(new Error('Failed to restore data'));
        };
    });
};

export const checkAndSyncPreviousDays = async (): Promise<void> => {
    const today = getTodayId();
    const dates = await getConversationDates();

    // Filter for days strictly before today
    const previousDates = dates.filter(date => date < today);

    for (const date of previousDates) {
        // We fundamentally assume anything before today should be "sealed" and synced.
        // In a more complex app, we might check a 'synced' flag in IDB.
        // For now, we just upsert the JSON. It's idempotent-ish (overwrites).
        await syncDailyConversation(date);
    }
};

