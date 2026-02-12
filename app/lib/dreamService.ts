import { Platform } from 'react-native';
import { supabase } from './supabase';
import { getDeviceId } from './deviceIdentity';

export const AppStage = {
    WAITING_DREAM: 'waiting_dream',
    WAITING_STYLE: 'waiting_style',
    FOLLOW_UP: 'follow_up'
};

export type PerspectiveCategoryId = 'RATIONAL' | 'PSYCHOLOGY' | 'FOLK' | 'CREATIVE';

export type AnalysisStyleId =
    | 'RATIONAL'
    | 'PSYCHOLOGY'
    | 'FOLK'
    | 'CREATIVE'
    | 'PSY_INTEGRATIVE'
    | 'PSY_FREUD'
    | 'PSY_JUNG'
    | 'FOLK_CN'
    | 'FOLK_GREEK'
    | 'FOLK_JUDEO'
    | 'FOLK_ISLAM'
    | 'FOLK_DHARMA'
    | 'UNSELECTED';

export type DreamServiceErrorCode =
    | 'subscription_required'
    | 'trial_exhausted'
    | 'anonymous_not_allowed'
    | 'device_id_required'
    | 'billing_error';

export interface PerspectiveOption {
    id: PerspectiveCategoryId;
    label: string;
    description: string;
    hasSubStyles: boolean;
}

export interface SubPerspectiveOption {
    id: AnalysisStyleId;
    parent: 'PSYCHOLOGY' | 'FOLK';
    label: string;
    description: string;
}

export const PERSPECTIVE_OPTIONS: PerspectiveOption[] = [
    { id: 'RATIONAL', label: 'Rational Analysis', description: 'Scientific, Functional', hasSubStyles: false },
    { id: 'PSYCHOLOGY', label: 'Psychological', description: 'Modern / Freud / Jung', hasSubStyles: true },
    { id: 'FOLK', label: 'Cultural Traditions', description: '5 Cultural Traditions', hasSubStyles: true },
    { id: 'CREATIVE', label: 'Creative Inspiration', description: 'Storytelling, Metaphors', hasSubStyles: false },
];

export const SUB_PERSPECTIVE_OPTIONS: SubPerspectiveOption[] = [
    { id: 'PSY_INTEGRATIVE', parent: 'PSYCHOLOGY', label: 'Modern Counseling', description: 'CBT, Emotional patterns' },
    { id: 'PSY_FREUD', parent: 'PSYCHOLOGY', label: 'Freudian', description: 'Conflict, Defense, Repression' },
    { id: 'PSY_JUNG', parent: 'PSYCHOLOGY', label: 'Jungian', description: 'Archetypes, Shadow, Compensation' },
    { id: 'FOLK_CN', parent: 'FOLK', label: 'Chinese Folk', description: 'Zhou Gong, Symbols, Omens' },
    { id: 'FOLK_GREEK', parent: 'FOLK', label: 'Greek-Roman', description: 'Artemidorus, Social roles' },
    { id: 'FOLK_JUDEO', parent: 'FOLK', label: 'Judeo-Christian', description: 'Reflection, Guidance' },
    { id: 'FOLK_ISLAM', parent: 'FOLK', label: 'Islamic', description: 'Dream classification' },
    { id: 'FOLK_DHARMA', parent: 'FOLK', label: 'Buddhist/Hindu', description: 'Mind, Karma, Awareness' },
];

export const DEFAULT_ANALYSIS_STYLE: AnalysisStyleId = 'CREATIVE';

export const getSubPerspectives = (category: PerspectiveCategoryId): SubPerspectiveOption[] => {
    if (category !== 'PSYCHOLOGY' && category !== 'FOLK') return [];
    return SUB_PERSPECTIVE_OPTIONS.filter((option) => option.parent === category);
};

export interface Message {
    role: 'user' | 'model';
    text: string;
}

interface DreamChatResponse {
    text?: string;
    error?: string;
    reason?: string;
    trial_remaining?: number;
    suggested_action?: string;
}

export class DreamChatError extends Error {
    status: number;
    code?: DreamServiceErrorCode;
    trialRemaining?: number;
    suggestedAction?: string;

    constructor(params: {
        message: string;
        status: number;
        code?: DreamServiceErrorCode;
        trialRemaining?: number;
        suggestedAction?: string;
    }) {
        super(params.message);
        this.name = 'DreamChatError';
        this.status = params.status;
        this.code = params.code;
        this.trialRemaining = params.trialRemaining;
        this.suggestedAction = params.suggestedAction;
    }
}

export async function callDreamChat(
    message: string,
    stage: string,
    dreamContext: string,
    style: AnalysisStyleId,
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
        const errorMessage = data?.message || data?.error || 'Failed to connect to dream service';
        throw new DreamChatError({
            message: errorMessage,
            status: response.status,
            code: data?.error || data?.reason,
            trialRemaining: data?.trial_remaining,
            suggestedAction: data?.suggested_action,
        });
    }

    return data;
}
