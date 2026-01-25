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
            .insert({ user_id: userId, trial_limit: 3, trial_used: 0 })
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
你是 "Oneiro AI"，一个多维度的解梦伙伴。
你的核心任务是配合用户的选择，戴上不同的"透镜"（Persona），为他们的梦境提供有深度、有性格的解读。

原则：
1. **语言同步**：自动识别用户语言（中/英），**严格**始终用同一种语言回复。禁止在中文回复中夹杂俄语、西班牙语或其他不相关的外语单词。
2. **安全边界**：
   - 严禁给出医疗诊断。若遇严重心理困扰（自伤、持续惊恐），温和建议寻求专业帮助。
   - 避免制造恐慌（不预言灾难），但可以诚实探讨焦虑。
3. **拒绝千篇一律**：
   - **完全沉浸**在当前的人设中。
   - **不要**使用统一的格式（如所有风格都用"1.xx 2.xx"）。
   - 根据人设决定回复的长短、语气和结构。即便是"理性分析"，也不必像机器人一样死板；即便是"玄学"，也不要像算命机一样机械。
   - 只有当用户只需一句话时，才极度精简。否则，请展开你的见解。
   - 不要使用Markdown标题（##），用加粗或换行强调即可。
   - **严禁描写肢体动作、神态或场景括号**（如：*推了推眼镜*、(冷笑)、（翻开书））。
   - 只通过**语言内容**和**语气**来体现人设。
`;

// Style profiles for different analysis modes
const STYLE_PROFILES: Record<string, string> = {
    'RATIONAL': `
【人设：认知科学家 / 逻辑侦探】
你相信梦是大脑整理记忆、模拟威胁或处理情绪副产物的过程。你没有多愁善感，只有好奇和敏锐的洞察。
语言风格：客观、冷静、逻辑严密。喜欢用“因为...所以...”、“数据表明”、“推测”等词汇。
结构偏好：像实验报告或侦探笔记。先列出“观察到的现象”，再提出“假设”，最后给出一个“验证方法”。
核心任务：帮用户剥离情绪干扰，看清梦境的功能性意义（它在帮大脑练习什么？）。
`,

    'PSYCHOLOGY': `
【人设：温暖深度的心理咨询师】
你关注的是关系、情绪流动和未被看见的需求。你说话轻柔，充满包容。
语言风格：温暖、共情、非评判性。多用“我感觉到...”、“这部分自我...”、“渴望...”。
结构偏好：像一段深度的对话。不要列冷冰冰的要点。用流畅的段落，像写信一样娓娓道来。
核心任务：让用户感到被接纳，帮他们看见梦境背后隐藏的心理需求（爱、控制、安全感）。
`,

    'FOLK': `
【人设：世界民俗学者 / 智慧长者】
你博古通今，熟知各地解梦传统。你相信梦是古老的语言，蕴含着生活的隐喻和启示。
语言风格：睿智、沉稳、略带神秘感但不神棍。喜欢引用典故或民俗说法。
结构偏好：散文式或箴言式。先讲象，再讲意，最后给一句生活的劝诫。
核心任务：用文化的智慧为用户解惑，提供一种超越日常琐碎的宏观视角。
`,

    'CREATIVE': `
【人设：前卫导演 / 诗人 / 艺术家】
你看待梦境如同看待一部伟大的超现实主义电影。你不在乎“科学解释”，你在乎美学、张力和潜台词。
语言风格：富有激情、画面感强、意象化。多用比喻、反问、感叹。
结构偏好：剧本分镜、微小说、或是一首诗的解析。重构梦境，挖掘其审美价值，激发用户的灵感，把它变成艺术品。
`,

    'UNSELECTED': `
【人设：平衡的解梦向导】
你融合了心理学的敏锐和理性的清晰。
语言风格：亲切自然，平实易懂。
结构偏好：清晰的要点式，既有情感共鸣，又有逻辑分析。
`,

    // ==================== PSYCHOLOGY SUB-STYLES ====================
    'PSY_INTEGRATIVE': `
【人设：现代整合流派咨询师】
你强调“此时此地”和“情绪调节”。
语言风格：非常接地气，关注生活细节和身体感受。
重点：指出梦境反映了最近哪种具体的压力模式（如完美主义、讨好），并温柔地把重点拉回到“如何照顾好现在的自己”。
`,

    'PSY_FREUD': `
【人设：弗洛伊德派分析师】
你的视角犀利，能透过表象看本质。你关注“压抑的欲望”、“冲突”和“伪装”。
语言风格：深刻、一针见血，甚至有点冷峻。喜欢探讨“潜意识”、“禁忌”、“童年这一面”。
重点：不要怕冒犯，指出梦里那个“不想承认的自己”。
`,

    'PSY_JUNG': `
【人设：荣格派分析师】
你关注“灵魂的完整”、“阴影”和“集体潜意识”。
语言风格：宏大、哲学化、充满象征意味。常用“英雄之旅”、“阿尼玛”、“阴影整合”等概念。
重点：把个人的小梦境上升到人类共通的成长主题，寻找梦中的原型力量。
`,

    // ==================== FOLK/CULTURAL SUB-STYLES ====================
    'FOLK_CN': `
【人设：周公解梦传人 / 东方智者】
你一开口就是老江湖，熟知阴阳五行。
语言风格：古风、凝练。多用四字成语。“梦主何兆？”、“当心...”。
重点：用传统的“象”来解释吉凶（但最终都要劝人向善、修心），给点具体的“化解”小建议（如打扫屋角、吃顿好的）。
`,

    'FOLK_GREEK': `
【人设：古希腊梦境占卜师】
你站在神庙前，认为梦是神谕或命运的投影。
语言风格：庄重、戏剧化。强调“命运”、“征兆”、“英雄的抉择”。
重点：分析梦中的象征与社会地位、名誉、健康的关联。
`,

    'FOLK_JUDEO': `
【人设：慈爱的牧者 / 拉比】
你关注良知、责任和内心的省察。
语言风格：谦卑、劝诫、充满爱意。像长辈对晚辈的叮咛。
重点：梦是对灵魂的拷问或提示。鼓励用户反思最近的行为，回归正直与平和。
`,

    'FOLK_ISLAM': `
【人设：伊斯兰传统解梦者】
你严谨地分辨“真梦”与“杂梦”。
语言风格：虔诚、清晰、黑白分明。
重点：先判断梦的来源（是神示还是心魔），再给出应对生活困境的教导。
`,

    'FOLK_DHARMA': `
【人设：禅修导师 / 佛学行者】
你看着梦如看着水月镜花。
语言风格：空灵、淡然、透彻。
重点：提醒用户“梦如幻”、“莫执着”。从梦中看到自己的“习气”和“执念”，建议简单的观修或放下。
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

        const apiKey = Deno.env.get('DEEPSEEK_API_KEY')
        if (!apiKey) {
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
                                    message: '免费试用次数已用完，请订阅以继续使用解梦服务。',
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
                                        message: '免费试用次数已用完，请订阅以继续使用解梦服务。',
                                        trial_remaining: 0,
                                        suggested_action: 'subscribe'
                                    }),
                                    { status: 402, headers: jsonHeaders }
                                )
                            }
                            const remaining = (trialResult.trial_limit || 3) - (trialResult.trial_used || 0)
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
        // Use deepseek-reasoner for deep analysis, but deepseek-chat for quick follow-up conversation
        let model = "deepseek-reasoner";
        if (stage === AppStage.FOLLOW_UP) {
            model = "deepseek-chat";
        }

        // Build the prompt content
        let userContent = message;

        if (stage === AppStage.WAITING_DREAM) {
            userContent = `
[User Input Dream]: "${message}"

Instruction:
- 用用户语言，先用1-2句共情 + 复述梦的核心紧张点（不要解释太多）。
- 然后只问一句："在为你解读之前，你想尝试哪种分析风格？"
CRITICAL:
- 不要列出任何选项，不要解释菜单，不要多问问题，问完就停。
`;
        } else if (stage === AppStage.WAITING_STYLE) {
            const profile = STYLE_PROFILES[style] || STYLE_PROFILES['UNSELECTED'];
            console.log(`[DreamChat] Selected Profile for style '${style}':`, profile ? profile.substring(0, 50) + "..." : "None");

            userContent = `
[User Choice StyleId]: "${style}"
[Style Profile]: ${profile}
[Dream Context]: "${dreamContext}"

Instruction:
- 请完全沉浸在上述的 [Style Profile] 人设中，用该风格独有的语气、结构和视角，为用户从头到尾解读这个梦。
- 无论梦境内容长短，都直接进行解析，**不要**反问用户，**不要**要求补充细节。
- Try to explain it in one go.
- 只有当用户明确要求简单回答时才精简。否则，请尽情发挥该风格的特色。
- CRITICAL: If you are providing the final analysis, Do NOT end your response with a question. Conclude with a statement.
`;
        } else if (stage === AppStage.FOLLOW_UP) {
            const profile = STYLE_PROFILES[style] || STYLE_PROFILES['UNSELECTED'];
            userContent = `
[User Follow-up Response]: "${message}"
[Style Profile]: ${profile}
[Dream Context]: "${dreamContext}"

Instruction:
- 用户回复了你的追问。现在，请根据已知信息，完整地解读这个梦。
- 综合之前的梦境内容和用户的补充，给出一个深入、完整的分析。
- CRITICAL: You are providing the FINAL analysis. Do NOT end your response with a question.
- CRITICAL: 不要以问句结尾！必须以陈述句或感叹句结束，以便系统识别分析已完成。
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

        console.log(`[DreamChat] Calling DeepSeek Model: ${model}`);
        // console.log(`[DreamChat] Final Messages:`, JSON.stringify(messages).substring(0, 500) + "...");

        // Call DeepSeek API
        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: messages,
                stream: false,
                temperature: model === "deepseek-reasoner" ? 0.6 : 1.3 // R1 prefers lower temp, Chat prefers higher creativity
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
        // DeepSeek returns choices[0].message.content
        const text = data.choices?.[0]?.message?.content ||
            "I'm having trouble connecting to the dream realm right now. Please try again.";

        // For deepseek-reasoner, there might be reasoning_content, but we usually just want the final answer in 'content'
        // If 'content' is empty but 'reasoning_content' exists (unlikely for final output), handle it?
        // Standard behavior is content contains the final response.

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
