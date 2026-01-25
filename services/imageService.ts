import { supabase } from '../lib/supabaseClient';

export const saveDreamCardForever = async (imageUrl: string, conversationId: string): Promise<string> => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.access_token) throw new Error('User must be logged in to save images');

    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
    const headers: Record<string, string> = {
        Authorization: `Bearer ${session.access_token}`
    };
    if (anonKey) {
        headers.apikey = anonKey;
    }

    const { data, error } = await supabase.functions.invoke('save-dream-image', {
        body: { imageUrl, conversationId },
        headers
    });

    if (error) throw error;
    if (data?.error) throw new Error(data.error);

    return data.permanentUrl;
};

export const shareDreamCard = async (permanentUrl: string): Promise<void> => {
    const { error } = await supabase
        .from('dream_images')
        .update({ is_public: true })
        .eq('permanent_url', permanentUrl);

    if (error) throw error;
};
