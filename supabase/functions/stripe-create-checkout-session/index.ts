import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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

        // Initialize Supabase client with user's JWT to get user info
        const supabaseClient = createClient(supabaseUrl, supabaseServiceKey)

        // Verify JWT and get user
        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

        if (authError || !user) {
            console.error('Auth error:', authError)
            return new Response(
                JSON.stringify({ error: 'Invalid or expired token' }),
                { status: 401, headers: jsonHeaders }
            )
        }

        // Parse request body
        const { plan_key, success_url, cancel_url } = await req.json()

        if (!plan_key || !['monthly', 'yearly', 'lifetime'].includes(plan_key)) {
            return new Response(
                JSON.stringify({ error: 'Invalid plan_key. Must be monthly, yearly, or lifetime' }),
                { status: 400, headers: jsonHeaders }
            )
        }

        // Look up the Stripe price ID from our database
        const { data: planPrice, error: planError } = await supabaseClient
            .from('billing_plan_prices')
            .select('stripe_price_id, mode')
            .eq('plan_key', plan_key)
            .eq('active', true)
            .single()

        if (planError || !planPrice) {
            console.error('Plan lookup error:', planError)
            return new Response(
                JSON.stringify({ error: 'Plan not found or inactive' }),
                { status: 404, headers: jsonHeaders }
            )
        }

        // Initialize Stripe
        const stripe = new Stripe(stripeSecretKey, {
            apiVersion: '2023-10-16',
            httpClient: Stripe.createFetchHttpClient(),
        })

        // Check if user already has a Stripe customer ID
        let customerId: string | undefined

        // First check profiles table
        const { data: profile } = await supabaseClient
            .from('profiles')
            .select('stripe_customer_id')
            .eq('id', user.id)
            .single()

        if (profile?.stripe_customer_id) {
            customerId = profile.stripe_customer_id
        } else {
            // Check billing_subscriptions table
            const { data: subscription } = await supabaseClient
                .from('billing_subscriptions')
                .select('stripe_customer_id')
                .eq('user_id', user.id)
                .single()

            if (subscription?.stripe_customer_id) {
                customerId = subscription.stripe_customer_id
            }
        }

        // If no customer exists, create one
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                metadata: {
                    supabase_user_id: user.id,
                },
            })
            customerId = customer.id

            // Store customer ID in profiles table
            await supabaseClient
                .from('profiles')
                .update({ stripe_customer_id: customerId })
                .eq('id', user.id)
        }

        // Determine checkout mode based on plan
        const mode = planPrice.mode as 'subscription' | 'payment'

        // Create Stripe Checkout Session
        const sessionParams: Stripe.Checkout.SessionCreateParams = {
            customer: customerId,
            mode: mode,
            line_items: [
                {
                    price: planPrice.stripe_price_id,
                    quantity: 1,
                },
            ],
            success_url: success_url || `${req.headers.get('origin')}/billing?success=true`,
            cancel_url: cancel_url || `${req.headers.get('origin')}/billing?canceled=true`,
            metadata: {
                user_id: user.id,
                plan_key: plan_key,
                feature_key: 'dream_decoder',
            },
        }

        // For subscriptions, add subscription metadata
        if (mode === 'subscription') {
            sessionParams.subscription_data = {
                metadata: {
                    user_id: user.id,
                    plan_key: plan_key,
                    feature_key: 'dream_decoder',
                },
            }
        }

        // For one-time payments, add payment intent metadata
        if (mode === 'payment') {
            sessionParams.payment_intent_data = {
                metadata: {
                    user_id: user.id,
                    plan_key: plan_key,
                    feature_key: 'dream_decoder',
                },
            }
        }

        const session = await stripe.checkout.sessions.create(sessionParams)

        console.log(`[Checkout] Created session ${session.id} for user ${user.id}, plan: ${plan_key}`)

        return new Response(
            JSON.stringify({
                url: session.url,
                session_id: session.id
            }),
            { headers: jsonHeaders }
        )

    } catch (error: any) {
        console.error('Checkout session creation error:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
