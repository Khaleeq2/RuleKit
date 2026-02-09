import { NextRequest, NextResponse } from 'next/server';
import { stripe, isStripeConfigured } from '@/app/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const supabaseAdmin = createClient(
  `https://${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID}.supabase.co`,
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
);

// Credit pack mapping: packId → credits
const PACK_CREDITS: Record<string, number> = {
  'pack-starter': 100,
  'pack-growth': 300,
  'pack-scale': 1000,
};

// Plan → monthly credit allowance
const PLAN_CREDITS: Record<string, number> = {
  free: 50,
  pro: 500,
  enterprise: 10000,
};

const PLAN_SEATS: Record<string, number> = {
  free: 1,
  pro: 3,
  enterprise: 100,
};

export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
  }

  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      default:
        // Unhandled event type — log and ignore
        console.log(`Unhandled Stripe event: ${event.type}`);
    }
  } catch (err) {
    console.error(`Error handling ${event.type}:`, err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

// ============================================
// Event Handlers
// ============================================

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.supabase_user_id;
  const checkoutType = session.metadata?.checkout_type;

  if (!userId) {
    console.error('No supabase_user_id in checkout session metadata');
    return;
  }

  if (checkoutType === 'credit_pack') {
    const packId = session.metadata?.pack_id;
    const credits = packId ? PACK_CREDITS[packId] : 0;

    if (credits > 0) {
      // Add credits to user balance
      const { data: balance } = await supabaseAdmin
        .from('credit_balances')
        .select('balance')
        .eq('user_id', userId)
        .single();

      const currentBalance = balance?.balance || 0;

      await supabaseAdmin
        .from('credit_balances')
        .upsert({
          user_id: userId,
          balance: currentBalance + credits,
          last_updated: new Date().toISOString(),
        });

      // Log transaction
      await supabaseAdmin.from('credit_transactions').insert({
        user_id: userId,
        type: 'stripe_purchase',
        amount: credits,
        description: `Purchased ${credits} credits ($${(session.amount_total || 0) / 100})`,
      });
    }
  }

  if (checkoutType === 'subscription') {
    // Subscription will be handled by customer.subscription.created event
    // Just update Stripe customer ID if needed
    if (session.customer) {
      await supabaseAdmin
        .from('subscriptions')
        .update({ stripe_customer_id: session.customer as string })
        .eq('user_id', userId);
    }
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.supabase_user_id;
  if (!userId) {
    // Try to find user by Stripe customer ID
    const { data } = await supabaseAdmin
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_customer_id', subscription.customer as string)
      .single();

    if (!data) {
      console.error('Cannot find user for subscription:', subscription.id);
      return;
    }
    return updateSubscription(data.user_id, subscription);
  }

  await updateSubscription(userId, subscription);
}

async function updateSubscription(userId: string, subscription: Stripe.Subscription) {
  // Determine plan from price metadata or product
  let plan: string = 'pro'; // default to pro for any paid subscription

  const { data: existingSub } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();

  const seats = PLAN_SEATS[plan] || 3;
  const credits = PLAN_CREDITS[plan] || 500;

  await supabaseAdmin
    .from('subscriptions')
    .upsert({
      id: existingSub?.id || undefined,
      user_id: userId,
      stripe_customer_id: subscription.customer as string,
      stripe_subscription_id: subscription.id,
      plan,
      status: mapStripeStatus(subscription.status),
      seat_count: existingSub?.seat_count || seats,
      seats_included: seats,
      current_period_start: subscription.items?.data?.[0]?.current_period_start
        ? new Date(subscription.items.data[0].current_period_start * 1000).toISOString()
        : new Date().toISOString(),
      current_period_end: subscription.items?.data?.[0]?.current_period_end
        ? new Date(subscription.items.data[0].current_period_end * 1000).toISOString()
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    });

  // Update monthly credit allowance
  await supabaseAdmin
    .from('credit_balances')
    .update({
      monthly_allowance: credits,
      last_updated: new Date().toISOString(),
    })
    .eq('user_id', userId);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const { data } = await supabaseAdmin
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (!data) return;

  // Downgrade to free
  await supabaseAdmin
    .from('subscriptions')
    .update({
      plan: 'free',
      status: 'canceled',
      stripe_subscription_id: null,
      seat_count: 1,
      seats_included: 1,
      cancel_at_period_end: false,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', data.user_id);

  // Reset to free credit allowance
  await supabaseAdmin
    .from('credit_balances')
    .update({
      monthly_allowance: PLAN_CREDITS.free,
      last_updated: new Date().toISOString(),
    })
    .eq('user_id', data.user_id);
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  // On recurring invoice payment, refresh monthly credits
  if (invoice.billing_reason === 'subscription_cycle') {
    const customerId = invoice.customer as string;

    const { data } = await supabaseAdmin
      .from('subscriptions')
      .select('user_id, plan')
      .eq('stripe_customer_id', customerId)
      .single();

    if (!data) return;

    const credits = PLAN_CREDITS[data.plan] || 50;

    // Add monthly allowance credits
    const { data: balance } = await supabaseAdmin
      .from('credit_balances')
      .select('balance')
      .eq('user_id', data.user_id)
      .single();

    const currentBalance = balance?.balance || 0;

    await supabaseAdmin
      .from('credit_balances')
      .upsert({
        user_id: data.user_id,
        balance: currentBalance + credits,
        monthly_allowance: credits,
        last_updated: new Date().toISOString(),
      });

    await supabaseAdmin.from('credit_transactions').insert({
      user_id: data.user_id,
      type: 'plan_allowance',
      amount: credits,
      description: `Monthly ${data.plan} plan allowance (${credits} credits)`,
    });
  }
}

// ============================================
// Utilities
// ============================================

function mapStripeStatus(status: Stripe.Subscription.Status): string {
  const map: Record<string, string> = {
    active: 'active',
    canceled: 'canceled',
    past_due: 'past_due',
    trialing: 'trialing',
    incomplete: 'incomplete',
    incomplete_expired: 'canceled',
    unpaid: 'past_due',
    paused: 'canceled',
  };
  return map[status] || 'active';
}
