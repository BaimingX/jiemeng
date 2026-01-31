import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@14.14.0?target=deno"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

declare const Deno: any;

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const jsonHeaders = { ...corsHeaders, 'Content-Type': 'application/json' }

        // Get environment variables
        const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

        if (!stripeSecretKey || !supabaseUrl || !supabaseServiceKey) {
            console.error('Missing environment variables')
            return new Response(
                JSON.stringify({ error: 'Server configuration error' }),
                { status: 500, headers: jsonHeaders }
            )
        }

        // Get JWT from Authorization header
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            return new Response(
                JSON.stringify({ error: 'Missing authorization header' }),
                { status: 401, headers: jsonHeaders }
            )
        }

        // Initialize Supabase client
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // Verify JWT and get user
        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: authError } = await supabase.auth.getUser(token)

        if (authError || !user) {
            console.error('Auth error:', authError)
            return new Response(
                JSON.stringify({ error: 'Invalid or expired token' }),
                { status: 401, headers: jsonHeaders }
            )
        }

        // Get optional return_url from request body
        let returnUrl: string | undefined
        try {
            const body = await req.json()
            returnUrl = body.return_url
        } catch {
            // No body or invalid JSON, use default
        }

        // Get user's Stripe customer ID
        let customerId: string | undefined

        // Check profiles table first
        const { data: profile } = await supabase
            .from('profiles')
            .select('stripe_customer_id')
            .eq('id', user.id)
            .single()

        if (profile?.stripe_customer_id) {
            customerId = profile.stripe_customer_id
        } else {
            // Check billing_subscriptions table
            const { data: subscription } = await supabase
                .from('billing_subscriptions')
                .select('stripe_customer_id')
                .eq('user_id', user.id)
                .single()

            if (subscription?.stripe_customer_id) {
                customerId = subscription.stripe_customer_id
            }
        }

        if (!customerId) {
            return new Response(
                JSON.stringify({ error: 'No billing account found. Please subscribe first.' }),
                { status: 404, headers: jsonHeaders }
            )
        }

        // Initialize Stripe
        const stripe = new Stripe(stripeSecretKey, {
            apiVersion: '2023-10-16',
            httpClient: Stripe.createFetchHttpClient(),
        })

        // Create Stripe Billing Portal session
        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: returnUrl || `${req.headers.get('origin')}/billing`,
        })

        console.log(`[Portal] Created portal session for user ${user.id}`)

        return new Response(
            JSON.stringify({ url: session.url }),
            { headers: jsonHeaders }
        )

    } catch (error: any) {
        console.error('Customer portal error:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
