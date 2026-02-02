import { Platform } from 'react-native';
import { supabase } from './supabase';
import { getDeviceId } from './deviceIdentity';

export const AppStage = {
    WAITING_DREAM: 'waiting_dream',
    WAITING_STYLE: 'waiting_style',
    FOLLOW_UP: 'follow_up'
};

export const PERSPECTIVE_OPTIONS = [
    { id: 'RATIONAL', label: 'Rational Analysis', description: 'Scientific, functional' },
    { id: 'PSYCHOLOGY', label: 'Psychological', description: 'Modern / Freud / Jung' },
    { id: 'FOLK', label: 'Cultural Traditions', description: 'Myths & symbols' },
    { id: 'CREATIVE', label: 'Creative Inspiration', description: 'Storytelling & metaphors' },
];

export interface Message {
    role: 'user' | 'model';
    text: string;
}

interface DreamChatResponse {
    text?: string;
    error?: string;
    trial_remaining?: number;
}

export async function callDreamChat(
    message: string,
    stage: string,
    dreamContext: string,
    style: string,
    history: Message[]
): Promise<DreamChatResponse> {
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;
    const deviceId = Platform.OS === 'web' ? null : await getDeviceId();

    const response = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/dream-chat`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            },
            body: JSON.stringify({
                message,
                stage,
                dreamContext,
                style,
                history,
                device_id: deviceId,
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        const message = data?.message || data?.error || 'Failed to connect to dream service';
        throw new Error(message);
    }

    return data;
}
