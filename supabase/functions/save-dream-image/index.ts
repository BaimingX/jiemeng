import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        const { imageUrl, conversationId } = await req.json()

        if (!imageUrl || !conversationId) {
            throw new Error('Missing imageUrl or conversationId')
        }

        console.log(`Processing image save for conversation: ${conversationId}`)

        // 1. Download image
        console.log(`Fetching image from: ${imageUrl}`)
        const imageRes = await fetch(imageUrl)
        if (!imageRes.ok) throw new Error(`Failed to fetch image: ${imageRes.statusText}`)
        const imageBlob = await imageRes.blob()

        // 2. Generate filename
        const filename = `${conversationId}/${crypto.randomUUID()}.png`

        // 3. Upload to Storage
        console.log(`Uploading to storage as: ${filename}`)
        const { data: uploadData, error: uploadError } = await supabaseClient
            .storage
            .from('permanent_dream_images')
            .upload(filename, imageBlob, {
                contentType: 'image/png',
                upsert: false
            })

        if (uploadError) {
            console.error('Upload Error:', uploadError)
            throw uploadError
        }

        // 4. Get Public URL
        const { data: { publicUrl } } = supabaseClient
            .storage
            .from('permanent_dream_images')
            .getPublicUrl(filename)

        console.log(`Image saved at: ${publicUrl}`)

        // 5. Save to dream_images table
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
        if (userError || !user) throw new Error('User not found')

        const { error: dbError } = await supabaseClient
            .from('dream_images')
            .insert({
                user_id: user.id,
                conversation_id: conversationId,
                temp_url: imageUrl,
                permanent_url: publicUrl,
                is_public: false
            })

        if (dbError) {
            console.error('DB Insert Error:', dbError)
            throw dbError
        }

        return new Response(
            JSON.stringify({ permanentUrl: publicUrl }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        console.error('Function Error:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
