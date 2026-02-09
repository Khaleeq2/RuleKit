import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_PRICE_IDS, isStripeConfigured } from '@/app/lib/stripe';
import { getAuthenticatedUser } from '@/app/lib/api-auth';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  `https://${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID}.supabase.co`,
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
);

export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: 'Stripe is not configured' },
      { status: 503 },
    );
  }

  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const body = await req.json();
  const { mode, priceId, packId } = body as {
    mode: 'subscription' | 'credit_pack';
    priceId?: string;
    packId?: string;
  };

  const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  try {
    // Get or create Stripe customer
    let stripeCustomerId: string | null = null;

    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    stripeCustomerId = subscription?.stripe_customer_id || null;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        metadata: { supabase_user_id: user.id },
      });
      stripeCustomerId = customer.id;

      // Save customer ID
      await supabaseAdmin
        .from('subscriptions')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('user_id', user.id);
    }

    if (mode === 'subscription') {
      // Create subscription checkout for Pro plan
      const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        mode: 'subscription',
        line_items: [
          {
            price: priceId || STRIPE_PRICE_IDS.pro_monthly,
            quantity: 1,
          },
        ],
        success_url: `${origin}/billing?session_id={CHECKOUT_SESSION_ID}&success=true`,
        cancel_url: `${origin}/billing?canceled=true`,
        metadata: {
          supabase_user_id: user.id,
          checkout_type: 'subscription',
        },
        subscription_data: {
          metadata: {
            supabase_user_id: user.id,
          },
        },
      });

      return NextResponse.json({ url: session.url });
    }

    if (mode === 'credit_pack') {
      // Map pack ID to Stripe price
      const packPriceMap: Record<string, string> = {
        'pack-starter': STRIPE_PRICE_IDS.pack_starter,
        'pack-growth': STRIPE_PRICE_IDS.pack_growth,
        'pack-scale': STRIPE_PRICE_IDS.pack_scale,
      };

      const stripePriceId = packId ? packPriceMap[packId] : priceId;
      if (!stripePriceId) {
        return NextResponse.json({ error: 'Invalid pack' }, { status: 400 });
      }

      const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        mode: 'payment',
        line_items: [
          {
            price: stripePriceId,
            quantity: 1,
          },
        ],
        success_url: `${origin}/billing?session_id={CHECKOUT_SESSION_ID}&success=true`,
        cancel_url: `${origin}/billing?canceled=true`,
        metadata: {
          supabase_user_id: user.id,
          checkout_type: 'credit_pack',
          pack_id: packId || '',
        },
      });

      return NextResponse.json({ url: session.url });
    }

    return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 },
    );
  }
}
