import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@14.14.0?target=deno"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

declare const Deno: any;

// Webhook doesn't need CORS headers as it's called by Stripe servers
const responseHeaders = { 'Content-Type': 'application/json' }

serve(async (req) => {
    try {
        // Get environment variables
        const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
        const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

        if (!stripeSecretKey || !stripeWebhookSecret || !supabaseUrl || !supabaseServiceKey) {
            console.error('Missing environment variables')
            return new Response(
                JSON.stringify({ error: 'Server configuration error' }),
                { status: 500, headers: responseHeaders }
            )
        }

        // Initialize clients
        const stripe = new Stripe(stripeSecretKey, {
            apiVersion: '2023-10-16',
            httpClient: Stripe.createFetchHttpClient(),
        })

        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // Get the signature from Stripe
        const signature = req.headers.get('stripe-signature')
        if (!signature) {
            console.error('Missing stripe-signature header')
            return new Response(
                JSON.stringify({ error: 'Missing signature' }),
                { status: 400, headers: responseHeaders }
            )
        }

        // Get raw body for signature verification
        const body = await req.text()

        // Verify the webhook signature
        let event: Stripe.Event
        try {
            event = await stripe.webhooks.constructEventAsync(
                body,
                signature,
                stripeWebhookSecret
            )
        } catch (err: any) {
            console.error('Webhook signature verification failed:', err.message)
            return new Response(
                JSON.stringify({ error: 'Invalid signature' }),
                { status: 400, headers: responseHeaders }
            )
        }

        console.log(`[Webhook] Received event: ${event.type}`)

        // Handle different event types
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session
                await handleCheckoutCompleted(supabase, session)
                break
            }

            case 'customer.subscription.created':
            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription
                await handleSubscriptionChange(supabase, stripe, subscription)
                break
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription
                await handleSubscriptionDeleted(supabase, subscription)
                break
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice
                await handlePaymentFailed(supabase, invoice)
                break
            }

            default:
                console.log(`[Webhook] Unhandled event type: ${event.type}`)
        }

        return new Response(
            JSON.stringify({ received: true }),
            { status: 200, headers: responseHeaders }
        )

    } catch (error: any) {
        console.error('Webhook handler error:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: responseHeaders }
        )
    }
})

/**
 * Handle checkout.session.completed event
 * For lifetime purchases, create purchase record and update entitlements
 */
async function handleCheckoutCompleted(supabase: any, session: Stripe.Checkout.Session) {
    const userId = session.metadata?.user_id
    const planKey = session.metadata?.plan_key
    const featureKey = session.metadata?.feature_key || 'dream_decoder'

    if (!userId) {
        console.error('[Webhook] checkout.session.completed missing user_id in metadata')
        return
    }

    console.log(`[Webhook] Checkout completed for user ${userId}, plan: ${planKey}, mode: ${session.mode}`)

    // Handle lifetime purchase (one-time payment)
    if (session.mode === 'payment' && planKey === 'lifetime') {
        // Insert purchase record
        const { error: purchaseError } = await supabase
            .from('billing_purchases')
            .upsert({
                user_id: userId,
                plan_key: 'lifetime',
                stripe_payment_intent_id: session.payment_intent,
                stripe_checkout_session_id: session.id,
                status: 'succeeded',
            }, {
                onConflict: 'stripe_checkout_session_id'
            })

        if (purchaseError) {
            console.error('[Webhook] Error inserting purchase:', purchaseError)
        }

        // Update entitlement to lifetime
        const { error: entitlementError } = await supabase
            .from('billing_entitlements')
            .upsert({
                user_id: userId,
                feature_key: featureKey,
                access: 'lifetime',
                is_active: true,
                expires_at: null,
                updated_at: new Date().toISOString(),
            }, {
                onConflict: 'user_id,feature_key'
            })

        if (entitlementError) {
            console.error('[Webhook] Error updating entitlement:', entitlementError)
        }

        console.log(`[Webhook] Lifetime purchase activated for user ${userId}`)
    }

    // For subscription mode, the subscription.created event will handle the rest
}

/**
 * Handle subscription created or updated
 */
function parseEpochSeconds(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value === 'string') {
        const parsed = Number(value)
        if (Number.isFinite(parsed)) return parsed
    }
    return null
}

async function handleSubscriptionChange(
    supabase: any,
    stripe: Stripe,
    subscription: Stripe.Subscription
) {
    let subscriptionData = subscription
    let currentPeriodEndSeconds = parseEpochSeconds(subscriptionData.current_period_end)

    if (currentPeriodEndSeconds === null) {
        try {
            subscriptionData = await stripe.subscriptions.retrieve(subscription.id)
            currentPeriodEndSeconds = parseEpochSeconds(subscriptionData.current_period_end)
            console.log('[Webhook] Refetched subscription for current_period_end')
        } catch (error: any) {
            console.error('[Webhook] Failed to refetch subscription:', error?.message || error)
        }
    }

    const userId = subscriptionData.metadata?.user_id || subscription.metadata?.user_id
    const planKey = subscriptionData.metadata?.plan_key || subscription.metadata?.plan_key
    const featureKey = subscriptionData.metadata?.feature_key || subscription.metadata?.feature_key || 'dream_decoder'

    if (!userId) {
        console.error('[Webhook] subscription missing user_id in metadata')
        return
    }

    console.log(`[Webhook] Subscription ${subscriptionData.status} for user ${userId}, plan: ${planKey}`)

    // Extract subscription item details (first item)
    const subscriptionItem = subscriptionData.items?.data?.[0]
    const priceId = subscriptionItem?.price?.id
    const productId = subscriptionItem?.price?.product as string
    const interval = subscriptionItem?.price?.recurring?.interval  // 'month' | 'year'
    const amountCents = subscriptionItem?.price?.unit_amount
    const currency = subscriptionItem?.price?.currency
    const currentPeriodEndIso = currentPeriodEndSeconds !== null
        ? new Date(currentPeriodEndSeconds * 1000).toISOString()
        : null

    if (currentPeriodEndIso === null) {
        console.warn('[Webhook] subscription missing current_period_end; status:', subscriptionData.status)
    }

    // Upsert subscription record with full details
    const { error: subError } = await supabase
        .from('billing_subscriptions')
        .upsert({
            user_id: userId,
            stripe_customer_id: subscriptionData.customer as string,
            stripe_subscription_id: subscriptionData.id,
            stripe_price_id: priceId,
            stripe_product_id: productId,
            plan_key: planKey,
            plan_interval: interval,
            amount_cents: amountCents,
            currency: currency,
            status: subscriptionData.status,
            current_period_end: currentPeriodEndIso,
            cancel_at_period_end: subscriptionData.cancel_at_period_end,
            updated_at: new Date().toISOString(),
        }, {
            onConflict: 'user_id'
        })

    if (subError) {
        console.error('[Webhook] Error upserting subscription:', subError)
    }

    // Update entitlement based on subscription status
    if (['incomplete', 'incomplete_expired'].includes(subscriptionData.status)) {
        console.log(`[Webhook] Skipping entitlement update for status: ${subscriptionData.status}`)
        return
    }

    const isActive = ['active', 'trialing'].includes(subscriptionData.status)
    if (isActive && currentPeriodEndIso === null) {
        console.error('[Webhook] Active subscription missing current_period_end; skipping entitlement update')
        return
    }

    const { error: entitlementError } = await supabase
        .from('billing_entitlements')
        .upsert({
            user_id: userId,
            feature_key: featureKey,
            access: 'subscription',
            is_active: isActive,
            expires_at: isActive ? currentPeriodEndIso : null,
            updated_at: new Date().toISOString(),
        }, {
            onConflict: 'user_id,feature_key'
        })

    if (entitlementError) {
        console.error('[Webhook] Error updating entitlement:', entitlementError)
    }

    console.log(`[Webhook] Subscription entitlement updated: is_active=${isActive}`)
}

/**
 * Handle subscription deleted (canceled and expired)
 */
async function handleSubscriptionDeleted(supabase: any, subscription: Stripe.Subscription) {
    const userId = subscription.metadata?.user_id
    const featureKey = subscription.metadata?.feature_key || 'dream_decoder'

    if (!userId) {
        console.error('[Webhook] subscription.deleted missing user_id in metadata')
        return
    }

    console.log(`[Webhook] Subscription deleted for user ${userId}`)

    // Update subscription status
    const { error: subError } = await supabase
        .from('billing_subscriptions')
        .update({
            status: 'canceled',
            updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscription.id)

    if (subError) {
        console.error('[Webhook] Error updating subscription:', subError)
    }

    // Deactivate entitlement (revert to free)
    const { error: entitlementError } = await supabase
        .from('billing_entitlements')
        .upsert({
            user_id: userId,
            feature_key: featureKey,
            access: 'free',
            is_active: false,
            expires_at: null,
            updated_at: new Date().toISOString(),
        }, {
            onConflict: 'user_id,feature_key'
        })

    if (entitlementError) {
        console.error('[Webhook] Error updating entitlement:', entitlementError)
    }

    console.log(`[Webhook] Subscription entitlement deactivated for user ${userId}`)
}

/**
 * Handle payment failure
 * Optionally pause the entitlement
 */
async function handlePaymentFailed(supabase: any, invoice: Stripe.Invoice) {
    const subscriptionId = invoice.subscription as string
    if (!subscriptionId) return

    console.log(`[Webhook] Payment failed for subscription ${subscriptionId}`)

    // Get user from subscription record
    const { data: subscription, error: fetchError } = await supabase
        .from('billing_subscriptions')
        .select('user_id')
        .eq('stripe_subscription_id', subscriptionId)
        .single()

    if (fetchError || !subscription) {
        console.error('[Webhook] Could not find subscription for payment failure')
        return
    }

    // Update subscription status to past_due
    const { error: updateError } = await supabase
        .from('billing_subscriptions')
        .update({
            status: 'past_due',
            updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscriptionId)

    if (updateError) {
        console.error('[Webhook] Error updating subscription status:', updateError)
    }

    // Optionally: Deactivate entitlement to prevent usage during past_due
    // Uncomment the following to enforce strict payment requirements
    /*
    const { error: entitlementError } = await supabase
        .from('billing_entitlements')
        .update({
            is_active: false,
            updated_at: new Date().toISOString(),
        })
        .eq('user_id', subscription.user_id)
        .eq('feature_key', 'dream_decoder')

    if (entitlementError) {
        console.error('[Webhook] Error deactivating entitlement:', entitlementError)
    }
    */

    console.log(`[Webhook] Subscription marked as past_due for user ${subscription.user_id}`)
}
