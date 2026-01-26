import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

declare const Deno: any;

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

/**
 * Check if user has billing access (subscription, lifetime, or free trials remaining)
 * Returns: { allowed: boolean, reason?: string, trial_remaining?: number }
 */
async function checkBillingAccess(supabase: any, userId: string): Promise<{
    allowed: boolean;
    reason?: string;
    trial_remaining?: number;
    access_type?: string;
}> {
    // First check entitlements for subscription or lifetime access
    const { data: entitlement, error: entError } = await supabase
        .from('billing_entitlements')
        .select('access, is_active, expires_at')
        .eq('user_id', userId)
        .eq('feature_key', 'dream_decoder')
        .single()

    if (!entError && entitlement) {
        // Check lifetime access
        if (entitlement.access === 'lifetime' && entitlement.is_active === true) {
            return { allowed: true, access_type: 'lifetime' }
        }

        // Check subscription access
        if (entitlement.access === 'subscription' && entitlement.is_active === true) {
            const expiresAt = new Date(entitlement.expires_at)
            if (expiresAt > new Date()) {
                return { allowed: true, access_type: 'subscription' }
            }
        }
    }

    // Fall back to free trial check
    const { data: trial, error: trialError } = await supabase
        .from('billing_trials')
        .select('trial_limit, trial_used')
        .eq('user_id', userId)
        .single()

    if (trialError) {
        // If no trial record exists, create one (for users created before billing system)
        const { data: newTrial, error: insertError } = await supabase
            .from('billing_trials')
            .insert({ user_id: userId, trial_limit: 5, trial_used: 0 })
            .select('trial_limit, trial_used')
            .single()

        if (insertError) {
            console.error('Error creating trial record:', insertError)
            return { allowed: false, reason: 'billing_error' }
        }

        return {
            allowed: true,
            access_type: 'free',
            trial_remaining: newTrial.trial_limit - newTrial.trial_used
        }
    }

    const remaining = trial.trial_limit - trial.trial_used

    if (remaining > 0) {
        return {
            allowed: true,
            access_type: 'free',
            trial_remaining: remaining
        }
    }

    return {
        allowed: false,
        reason: 'trial_exhausted',
        trial_remaining: 0
    }
}

/**
 * Increment trial usage atomically using UPDATE...RETURNING
 * Returns: { success: boolean, trial_used?: number, trial_limit?: number }
 * Uses single atomic SQL to prevent race conditions under concurrency
 */
async function incrementTrialUsage(supabase: any, userId: string): Promise<{
    success: boolean;
    trial_used?: number;
    trial_limit?: number;
}> {
    // First try using the RPC function (most reliable)
    const { data: rpcResult, error: rpcError } = await supabase
        .rpc('increment_trial_usage', { p_user_id: userId })

    if (!rpcError && rpcResult === true) {
        // RPC succeeded, get updated counts
        const { data: trial } = await supabase
            .from('billing_trials')
            .select('trial_limit, trial_used')
            .eq('user_id', userId)
            .single()

        return {
            success: true,
            trial_used: trial?.trial_used,
            trial_limit: trial?.trial_limit
        }
    }

    if (!rpcError && rpcResult === false) {
        // RPC returned false = limit reached
        return { success: false }
    }

    // Fallback: If RPC doesn't exist, use atomic UPDATE...RETURNING pattern
    // This single query atomically checks AND updates in one transaction
    console.log('[DreamChat] RPC fallback: using atomic update')

    // Use raw SQL for atomic UPDATE with condition
    const { data: updated, error: updateError } = await supabase
        .from('billing_trials')
        .update({
            trial_used: supabase.sql`trial_used + 1`,
            updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .lt('trial_used', supabase.sql`trial_limit`)  // Only if under limit
        .select('trial_used, trial_limit')
        .single()

    if (updateError) {
        // If error, might be because no rows matched (limit reached)
        // Double-check by fetching current state
        const { data: trial } = await supabase
            .from('billing_trials')
            .select('trial_limit, trial_used')
            .eq('user_id', userId)
            .single()

        if (trial && trial.trial_used >= trial.trial_limit) {
            console.log(`[DreamChat] Trial limit reached: ${trial.trial_used}/${trial.trial_limit}`)
            return { success: false }
        }

        console.error('Error updating trial:', updateError)
        return { success: false }
    }

    if (!updated) {
        // No rows updated = limit was already reached
        return { success: false }
    }

    return {
        success: true,
        trial_used: updated.trial_used,
        trial_limit: updated.trial_limit
    }
}

// System instruction for the AI
const SYSTEM_INSTRUCTION = `
You are "Oneiro AI", a multi-dimensional dream companion.
Your core task is to match the user's chosen lens (Persona) and provide a deep, characterful interpretation of their dream.

Principles:
1. Language: Always respond in English only. Do not mix other languages.
2. Safety boundaries:
   - Never give medical diagnoses. If the user shows severe psychological distress (self-harm, persistent panic), gently recommend professional support.
   - Avoid fear-mongering (no disaster predictions), but you may explore anxiety honestly.
3. Avoid generic templates:
   - Fully inhabit the current persona.
   - Do not use a fixed format for every style (e.g., "1.xx 2.xx").
   - Let the persona decide length, tone, and structure. Even "Rational analysis" should not sound robotic; even "Mystic" should not sound like a fortune teller.
   - Only be extremely brief if the user explicitly asks for a short answer; otherwise develop your ideas.
   - Do not use Markdown headings (##). Use bold or line breaks for emphasis only.
   - Never write stage directions or bracketed actions (e.g., *adjusts glasses*, (smiles), [sighs]).
   - Express persona only through content and tone.
`;

// Style profiles for different analysis modes
const STYLE_PROFILES: Record<string, string> = {
    'RATIONAL': `
[Persona: Cognitive Scientist / Logical Detective]
You believe dreams are the brain organizing memory, simulating threats, or processing emotion.
Language style: objective, cool, tightly reasoned. Favor phrases like "because... therefore", "data suggests", "hypothesis".
Structure: like a lab report or detective notes. First list "observations", then "hypotheses", then a "test".
Core task: help the user separate emotional noise and see the functional meaning (what the brain is training).
`,

    'PSYCHOLOGY': `
[Persona: Warm, deep counselor]
You focus on relationships, emotional flow, and unseen needs. Your voice is gentle and accepting.
Language style: warm, empathic, non-judgmental. Use phrases like "I sense...", "this part of you...", "longing for...".
Structure: a flowing conversation, not bullet points. Write in natural paragraphs, like a personal letter.
Core task: help the user feel seen and name the need beneath the dream (love, control, safety).
`,

    'FOLK': `
[Persona: World folklore scholar / wise elder]
You know many traditions of dream interpretation. Dreams are an old language of symbols and guidance.
Language style: calm, poetic, a little mysterious but not superstitious. Use cultural references when fitting.
Structure: prose or aphorism. Describe the image, then its meaning, then a simple life counsel.
Core task: offer a cultural lens and a grounded takeaway.
`,

    'CREATIVE': `
[Persona: Film director / poet / artist]
You see dreams as surreal cinema. You care about aesthetics, tension, and subtext.
Language style: vivid, image-rich, emotionally charged. Use metaphors and contrasts.
Structure: like a cinematic breakdown or micro-story. Reframe the dream into art.
Core task: recompose the dream and awaken inspiration.
`,

    'UNSELECTED': `
[Persona: Balanced dream guide]
You blend psychological insight with clear reasoning.
Language style: friendly, natural, easy to understand.
Structure: clear points with emotional resonance and logic.
`,

    // ==================== PSYCHOLOGY SUB-STYLES ====================
    'PSY_INTEGRATIVE': `
[Persona: Modern integrative therapist]
You emphasize "here and now" and emotion regulation.
Language style: grounded and practical, attentive to daily stress and body signals.
Focus: identify recent stress patterns (perfectionism, people-pleasing) and gently guide self-care.
`,

    'PSY_FREUD': `
[Persona: Freudian analyst]
You are sharp and incisive, looking for repression, conflict, and disguise.
Language style: probing, blunt, sometimes cold. Use "unconscious", "repression", "childhood".
Focus: point out the "self you do not want to admit".
`,

    'PSY_JUNG': `
[Persona: Jungian analyst]
You focus on wholeness, shadow, and collective archetypes.
Language style: grand, philosophical, symbolic. Use "hero's journey", "shadow integration", "anima/animus".
Focus: elevate the personal dream into universal themes and archetypal forces.
`,

    // ==================== FOLK/CULTURAL SUB-STYLES ====================
    'FOLK_CN': `
[Persona: Zhou Gong dream interpreter / Eastern sage]
You speak with old-world flavor, concise and proverbial.
Language style: classical and condensed, using aphorisms.
Focus: interpret omens through symbols, but always guide toward virtue and a practical remedy.
`,

    'FOLK_GREEK': `
[Persona: Ancient Greek oracle]
You stand at a temple and see dreams as messages of fate and choice.
Language style: solemn and theatrical. Emphasize destiny, honor, and consequence.
Focus: link symbols to status, reputation, and health.
`,

    'FOLK_JUDEO': `
[Persona: Compassionate pastor / rabbi]
You focus on conscience, responsibility, and inner reflection.
Language style: humble, encouraging, and full of care.
Focus: invite the user back to integrity and peace.
`,

    'FOLK_ISLAM': `
[Persona: Islamic traditional interpreter]
You carefully distinguish "true dreams" from "mixed dreams".
Language style: sincere, clear, and direct.
Focus: identify the source and offer guidance for current life challenges.
`,

    'FOLK_DHARMA': `
[Persona: Zen or Dharma teacher]
You see dreams like reflections on water.
Language style: airy, light, and penetrating.
Focus: remind impermanence, loosen attachment, suggest a simple meditation or release.
`
};

// App stages
const AppStage = {
    WAITING_DREAM: 'waiting_dream',
    WAITING_STYLE: 'waiting_style',
    FOLLOW_UP: 'follow_up'
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const jsonHeaders = { ...corsHeaders, 'Content-Type': 'application/json' }

        const { message, stage, dreamContext, style, history, client_message_id } = await req.json()

        if (!message) {
            console.error('Missing message in request');
            return new Response(
                JSON.stringify({ error: 'Message is required' }),
                { status: 400, headers: jsonHeaders }
            )
        }

        const isFollowUp = stage === AppStage.FOLLOW_UP;
        const geminiApiKey = Deno.env.get('GEMINI_API_KEY') || '';
        const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY') || '';

        if (!isFollowUp && !geminiApiKey) {
            return new Response(
                JSON.stringify({ error: 'Gemini API key not configured' }),
                { status: 500, headers: jsonHeaders }
            )
        }

        if (isFollowUp && !deepseekApiKey) {
            return new Response(
                JSON.stringify({ error: 'DeepSeek API key not configured' }),
                { status: 500, headers: jsonHeaders }
            )
        }

        // ============ BILLING CHECK ============
        // Only check billing for WAITING_STYLE stage (when user initiates dream analysis)
        // WAITING_DREAM is just collecting the dream, FOLLOW_UP is continuation
        if (stage === AppStage.WAITING_STYLE) {
            const supabaseUrl = Deno.env.get('SUPABASE_URL')
            const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

            if (supabaseUrl && supabaseServiceKey) {
                const authHeader = req.headers.get('Authorization')
                if (authHeader) {
                    const supabase = createClient(supabaseUrl, supabaseServiceKey)
                    const token = authHeader.replace('Bearer ', '')
                    const { data: { user } } = await supabase.auth.getUser(token)

                    if (user) {
                        // Check billing access
                        const billingStatus = await checkBillingAccess(supabase, user.id)

                        if (!billingStatus.allowed) {
                            console.log(`[DreamChat] User ${user.id} blocked: ${billingStatus.reason}`)
                            return new Response(
                                JSON.stringify({
                                    error: 'subscription_required',
                                    message: 'Your free trials are exhausted. Please subscribe to continue dream interpretation.',
                                    trial_remaining: 0
                                }),
                                { status: 402, headers: jsonHeaders }
                            )
                        }

                        // If free user, increment trial usage
                        if (billingStatus.access_type === 'free') {
                            const trialResult = await incrementTrialUsage(supabase, user.id)
                            if (!trialResult.success) {
                                console.log(`[DreamChat] User ${user.id} failed to increment trial - limit reached`)
                                return new Response(
                                    JSON.stringify({
                                        error: 'subscription_required',
                                        reason: 'trial_exhausted',
                                        message: 'Your free trials are exhausted. Please subscribe to continue dream interpretation.',
                                        trial_remaining: 0,
                                        suggested_action: 'subscribe'
                                    }),
                                    { status: 402, headers: jsonHeaders }
                                )
                            }
                            const remaining = (trialResult.trial_limit || 5) - (trialResult.trial_used || 0)
                            console.log(`[DreamChat] User ${user.id} used trial ${trialResult.trial_used}/${trialResult.trial_limit}, remaining: ${remaining}`)
                        } else {
                            console.log(`[DreamChat] User ${user.id} has ${billingStatus.access_type} access`)
                        }
                    }
                }
            }
        }
        // ============ END BILLING CHECK ============

        // Determine Model
        // Use Gemini for deep analysis, but DeepSeek Chat for quick follow-up conversation
        const model = isFollowUp ? "deepseek-chat" : "gemini-3-flash-preview";

        // Build the prompt content
        let userContent = message;

        if (stage === AppStage.WAITING_DREAM) {
            userContent = `
[User Input Dream]: "${message}"

Instruction:
- Use English. Start with 1-2 sentences of empathy plus a brief restatement of the core tension (no deep interpretation yet).
- Then ask only one sentence: "Before I interpret it, which analysis style would you like to try?"
CRITICAL:
- Do not list options, do not explain the menu, do not ask multiple questions, stop after that.
`;
        } else if (stage === AppStage.WAITING_STYLE) {
            const profile = STYLE_PROFILES[style] || STYLE_PROFILES['UNSELECTED'];
            console.log(`[DreamChat] Selected Profile for style '${style}':`, profile ? profile.substring(0, 50) + "..." : "None");

            userContent = `
[User Choice StyleId]: "${style}"
[Style Profile]: ${profile}
[Dream Context]: "${dreamContext}"

Instruction:
- Fully immerse in the [Style Profile] persona. Use its tone, structure, and viewpoint to interpret the dream from start to finish.
- No matter how long or short the dream is, go straight into analysis. Do NOT ask follow-up questions. Do NOT request more details.
- Try to explain it in one go.
- Only be brief if the user explicitly asked for a short answer; otherwise fully develop the interpretation.
- CRITICAL: If you are providing the final analysis, do NOT end your response with a question. Conclude with a statement.
`;
        } else if (stage === AppStage.FOLLOW_UP) {
            const profile = STYLE_PROFILES[style] || STYLE_PROFILES['UNSELECTED'];
            userContent = `
[User Follow-up Response]: "${message}"
[Style Profile]: ${profile}
[Dream Context]: "${dreamContext}"

Instruction:
- The user answered your follow-up. Now provide a complete interpretation using all known information.
- Integrate the earlier dream content and the user's additions into a deep, complete analysis.
- CRITICAL: You are providing the FINAL analysis. Do NOT end your response with a question.
- CRITICAL: Do not end with a question mark. Finish with a statement or exclamation so the system can detect completion.
`;
        }

        // Build messages for OpenAI-compatible API
        const messages = [];

        // 1. System Message
        messages.push({ role: 'system', content: SYSTEM_INSTRUCTION });

        // 2. History (Convert from Gemini history if exists)
        // CRITICAL: If we are in WAITING_STYLE, we are starting a NEW analysis definitively. Ignore past history.
        if (stage !== AppStage.WAITING_STYLE && history && Array.isArray(history)) {
            for (const msg of history) {
                messages.push({
                    role: msg.role === 'model' ? 'assistant' : 'user', // Map model -> assistant
                    content: msg.text
                });
            }
        }

        // 3. Current User Message
        messages.push({ role: 'user', content: userContent });

        console.log(`[DreamChat] Calling ${isFollowUp ? 'DeepSeek' : 'Gemini'} Model: ${model}`);
        // console.log(`[DreamChat] Final Messages:`, JSON.stringify(messages).substring(0, 500) + "...");

        let text = "I'm having trouble connecting to the dream realm right now. Please try again.";

        if (isFollowUp) {
            // Call DeepSeek API for follow-up
            const response = await fetch('https://api.deepseek.com/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${deepseekApiKey}`
                },
                body: JSON.stringify({
                    model: model,
                    messages: messages,
                    stream: false,
                    temperature: 1.3
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('DeepSeek API error:', errorText);
                return new Response(
                    JSON.stringify({ error: 'AI service error', details: errorText }),
                    { status: 500, headers: jsonHeaders }
                )
            }

            const data = await response.json();
            text = data.choices?.[0]?.message?.content || text;
        } else {
            const geminiContents = messages
                .filter((msg: any) => msg.role !== 'system')
                .map((msg: any) => ({
                    role: msg.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: msg.content }]
                }));

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        systemInstruction: {
                            role: 'system',
                            parts: [{ text: SYSTEM_INSTRUCTION }]
                        },
                        contents: geminiContents,
                        generationConfig: {
                            temperature: 0.6,
                            maxOutputTokens: 2048
                        }
                    })
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Gemini API error:', errorText);
                return new Response(
                    JSON.stringify({ error: 'AI service error', details: errorText }),
                    { status: 500, headers: jsonHeaders }
                )
            }

            const data = await response.json();
            const parts = data.candidates?.[0]?.content?.parts;
            if (Array.isArray(parts)) {
                text = parts.map((part: any) => part.text).join('') || text;
            }
        }

        return new Response(
            JSON.stringify({ text }),
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
