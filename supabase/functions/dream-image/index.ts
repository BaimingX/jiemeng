import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

declare const Deno: any;

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Prompt template for generating image descriptions
const IMAGE_PROMPT_TEMPLATE = `
You are helping create a children's picture book illustration based on a dream.

Dream content: "{dreamContent}"
[Analysis Context]: "{analysisResult}"
[Style]: "{style}"

Your task:
1. Extract the most visually striking and emotionally resonant scene from this dream.
2. If an [Analysis Context] and [Style] are provided, infuse the visual description with the mood and themes of that interpretation style.
   - For exmaple, if style is "Rational", keep it clear and structured.
   - If "Jungian", focus on archetypes and symbolic depth.
   - If "Creative", make it more surreal and artistic.

3. Describe it in 1-2 simple sentences, focusing on:
   - The main subject/character (use generic terms like "a person", "a child", "a figure" rather than specific names)
   - The setting/environment
   - The key action or emotion
   - Any symbolic objects

Rules:
- Write in English only (for the image model)
- Keep it simple and painterly - think children's book
- Focus on mood and atmosphere
- Maximum 50 words

Output ONLY the scene description, nothing else.
`;

// Visual style configuration
const VISUAL_STYLE_MAPPING: Record<string, string> = {
    'RATIONAL': "Digital concept art, blueprint schematic aesthetic, clean lines, isometric view, architectural style, muted blue and white tones, precise detailing, 4k render",
    'PSY_JUNG': "Surrealist oil painting in the style of Salvador Dali, dreamlike symbols, mystical atmosphere, rich deep colors, floating objects, metaphysical",
    'PSY_FREUD': "Noir illustration, dramatic chiaroscuro lighting, expressive shadows, psychological depth, muted colors with high contrast, sepia or monochrome",
    'FOLK_CN': "Traditional Chinese ink wash painting (Shuimo), watercolor texture, misty mountains, ethereal atmosphere, calligraphy brush strokes, harmonious natural tones",
    'FOLK_GREEK': "Classical fresco style, ancient greek art, marble textures, golden hour lighting, mythological aesthetic, frieze composition",
    'FOLK_JUDEO': "Biblical illustration style, illuminated manuscript aesthetic, golden leaf details, warm earth tones, solemn and reverent atmosphere",
    'FOLK_ISLAM': "Geometric patterns, miniatures style, persian art influence, intricate gold and blue details, two-dimensional perspective, ornamental",
    'FOLK_DHARMA': "Thangka painting style, mandala patterns, vibrant spiritual colors, lotus motifs, meditative atmosphere, aura glows",
    'CREATIVE': "Abstract expressionism, vibrant colors, chaotic but beautiful, artistic texture, impasto strokes, avant-garde",
    'PSYCHOLOGY': "Soft therapeutic illustration, warm pastel colors, gentle shapes, comforting atmosphere, empathy card style",
    'PSY_INTEGRATIVE': "Modern vector illustration, clean flat design, balanced composition, soothing color palette, mindfulness app aesthetic",
    'UNSELECTED': "Children's picture book illustration style, soft watercolor, dreamy atmosphere",
    'FOLK': "Vintage tarot card style, mystical symbols, aged paper texture, detailed line work, esoteric aesthetic"
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const jsonHeaders = { ...corsHeaders, 'Content-Type': 'application/json' }

        const { dreamContent, analysisResult, style } = await req.json()

        if (!dreamContent) {
            return new Response(
                JSON.stringify({ error: 'Dream content is required' }),
                { status: 400, headers: jsonHeaders }
            )
        }

        const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
        // Try FAI_KEY first as per user screenshot, then FAL_KEY
        const falKey = Deno.env.get('FAI_KEY') || Deno.env.get('FAL_KEY')

        if (!geminiApiKey || !falKey) {
            return new Response(
                JSON.stringify({ error: 'API keys not configured (GEMINI_API_KEY or FAI_KEY)' }),
                { status: 500, headers: jsonHeaders }
            )
        }

        // Step 1: Generate image prompt using Gemini
        const promptText = IMAGE_PROMPT_TEMPLATE
            .replace('{dreamContent}', dreamContent)
            .replace('{analysisResult}', analysisResult || '')
            .replace('{style}', style || '');

        const geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ role: 'user', parts: [{ text: promptText }] }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 256
                    }
                })
            }
        );

        if (!geminiResponse.ok) {
            const errorText = await geminiResponse.text();
            console.error('Gemini API error:', errorText);
            return new Response(
                JSON.stringify({ error: 'Failed to generate image prompt' }),
                { status: 500, headers: jsonHeaders }
            )
        }

        const geminiData = await geminiResponse.json();
        let scenePrompt = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ||
            "a dreamy landscape with soft clouds and gentle light";

        // Clean up the prompt
        scenePrompt = scenePrompt.trim();
        console.log('Generated scene prompt:', scenePrompt);

        // Step 2: Generate image using fal.ai Flux Schnell
        // Determine the visual style based on the input style ID
        console.log("Input style ID:", style);

        // Default to children's book style if style is missing or not found
        let visualStylePrompt = VISUAL_STYLE_MAPPING['UNSELECTED'];

        if (style && VISUAL_STYLE_MAPPING[style]) {
            visualStylePrompt = VISUAL_STYLE_MAPPING[style];
        } else if (style) {
            // Try to match partial keys if exact match fails (e.g. "FOLK" matches "FOLK_CN")
            const key = Object.keys(VISUAL_STYLE_MAPPING).find(k => style.startsWith(k));
            if (key) {
                visualStylePrompt = VISUAL_STYLE_MAPPING[key];
            }
        }

        const fullPrompt = `${visualStylePrompt}, masterpiece, high quality: ${scenePrompt}`;
        console.log('Sending prompt to fal.ai:', fullPrompt);

        // Call fal.ai API
        const falResponse = await fetch('https://fal.run/fal-ai/flux/schnell', {
            method: 'POST',
            headers: {
                'Authorization': `Key ${falKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: fullPrompt,
                image_size: "square_hd",
                num_inference_steps: 4,
                seed: Math.floor(Math.random() * 1000000),
                enable_safety_checker: false // Optional, prevents strict blocking on dream content
            })
        });

        if (!falResponse.ok) {
            const errorText = await falResponse.text();
            console.error('fal.ai API error:', errorText);
            return new Response(
                JSON.stringify({ error: `Failed to generate image via fal.ai: ${errorText}` }),
                { status: 500, headers: jsonHeaders }
            )
        }

        const falData = await falResponse.json();
        console.log('fal.ai response:', JSON.stringify(falData).substring(0, 200));

        const imageUrl = falData.images?.[0]?.url;

        if (!imageUrl) {
            return new Response(
                JSON.stringify({ error: 'No image URL in fal.ai response' }),
                { status: 500, headers: jsonHeaders }
            )
        }

        return new Response(
            JSON.stringify({ imageUrl, prompt: scenePrompt }),
            { headers: jsonHeaders }
        )

    } catch (error: any) {
        console.error('Edge Function Error:', error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
