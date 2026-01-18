// Frontend service that calls Supabase Edge Function for dream card image generation

// Get Supabase URL from environment or use default
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const generateDreamCard = async (dreamContent: string, analysisResult?: string, style?: string): Promise<string> => {
    console.log("Generating dream card for:", dreamContent, "Style:", style);

    try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/dream-image`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'apikey': SUPABASE_ANON_KEY
            },
            body: JSON.stringify({ dreamContent, analysisResult, style })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Dream image API error:', errorData);
            throw new Error(errorData.error || 'Failed to generate image');
        }

        const data = await response.json();
        console.log('Generated image URL:', data.imageUrl);

        if (!data.imageUrl) {
            throw new Error('No image URL returned');
        }

        return data.imageUrl;
    } catch (error) {
        console.error("Dream Card Generation Error:", error);
        throw error;
    }
};
