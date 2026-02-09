/**
 * Stripe Product & Price Seed Script
 *
 * Run with: npx tsx scripts/stripe-seed.ts
 *
 * Prerequisites:
 *   - STRIPE_SECRET_KEY set in .env.local
 *
 * This script creates all products and prices in Stripe,
 * then outputs the price IDs to add to .env.local
 */

import Stripe from 'stripe';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY not found in .env.local');
  process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  typescript: true,
});

async function seed() {
  console.log('🔧 Creating Stripe products and prices...\n');

  // ============================================
  // 1. Pro Plan — Monthly Subscription ($29/mo)
  // ============================================
  const proProduct = await stripe.products.create({
    name: 'RuleKit Pro',
    description: 'For teams shipping decisions to production. 500 evaluations/month, 3 team members included.',
    metadata: { rulekit_plan: 'pro' },
  });

  const proMonthlyPrice = await stripe.prices.create({
    product: proProduct.id,
    unit_amount: 2900, // $29.00
    currency: 'usd',
    recurring: { interval: 'month' },
    metadata: { rulekit_price: 'pro_monthly' },
  });

  console.log(`✅ Pro Plan (monthly): ${proProduct.id}`);
  console.log(`   Price ID: ${proMonthlyPrice.id} — $29/mo\n`);

  // ============================================
  // 2. Pro Seat Add-on — Per additional member ($5/mo)
  // ============================================
  const seatProduct = await stripe.products.create({
    name: 'RuleKit Pro — Additional Seat',
    description: 'Additional team member beyond the 3 included with Pro. $5/month per seat.',
    metadata: { rulekit_plan: 'pro_seat' },
  });

  const seatPrice = await stripe.prices.create({
    product: seatProduct.id,
    unit_amount: 500, // $5.00
    currency: 'usd',
    recurring: { interval: 'month' },
    metadata: { rulekit_price: 'pro_seat' },
  });

  console.log(`✅ Pro Seat Add-on: ${seatProduct.id}`);
  console.log(`   Price ID: ${seatPrice.id} — $5/mo per seat\n`);

  // ============================================
  // 3. Credit Packs — One-time purchases
  // ============================================
  const starterProduct = await stripe.products.create({
    name: 'RuleKit Credits — Starter',
    description: '100 evaluation credits. Never expire.',
    metadata: { rulekit_pack: 'pack-starter', credits: '100' },
  });

  const starterPrice = await stripe.prices.create({
    product: starterProduct.id,
    unit_amount: 1000, // $10.00
    currency: 'usd',
    metadata: { rulekit_price: 'pack_starter', pack_id: 'pack-starter', credits: '100' },
  });

  console.log(`✅ Starter Pack: ${starterProduct.id}`);
  console.log(`   Price ID: ${starterPrice.id} — $10 / 100 credits\n`);

  const growthProduct = await stripe.products.create({
    name: 'RuleKit Credits — Growth',
    description: '300 evaluation credits. Never expire.',
    metadata: { rulekit_pack: 'pack-growth', credits: '300' },
  });

  const growthPrice = await stripe.prices.create({
    product: growthProduct.id,
    unit_amount: 2500, // $25.00
    currency: 'usd',
    metadata: { rulekit_price: 'pack_growth', pack_id: 'pack-growth', credits: '300' },
  });

  console.log(`✅ Growth Pack: ${growthProduct.id}`);
  console.log(`   Price ID: ${growthPrice.id} — $25 / 300 credits\n`);

  const scaleProduct = await stripe.products.create({
    name: 'RuleKit Credits — Scale',
    description: '1,000 evaluation credits. Never expire.',
    metadata: { rulekit_pack: 'pack-scale', credits: '1000' },
  });

  const scalePrice = await stripe.prices.create({
    product: scaleProduct.id,
    unit_amount: 5000, // $50.00
    currency: 'usd',
    metadata: { rulekit_price: 'pack_scale', pack_id: 'pack-scale', credits: '1000' },
  });

  console.log(`✅ Scale Pack: ${scaleProduct.id}`);
  console.log(`   Price ID: ${scalePrice.id} — $50 / 1,000 credits\n`);

  // ============================================
  // Output .env.local values
  // ============================================
  console.log('━'.repeat(50));
  console.log('\n📋 Add these to your .env.local:\n');
  console.log(`STRIPE_PRICE_PRO_MONTHLY=${proMonthlyPrice.id}`);
  console.log(`STRIPE_PRICE_PRO_SEAT=${seatPrice.id}`);
  console.log(`STRIPE_PRICE_PACK_STARTER=${starterPrice.id}`);
  console.log(`STRIPE_PRICE_PACK_GROWTH=${growthPrice.id}`);
  console.log(`STRIPE_PRICE_PACK_SCALE=${scalePrice.id}`);
  console.log('\n✅ Done! Products and prices created in Stripe.\n');
  console.log('Next steps:');
  console.log('  1. Add the env vars above to .env.local');
  console.log('  2. Set up webhook endpoint in Stripe Dashboard:');
  console.log('     URL: https://your-domain.com/api/stripe/webhook');
  console.log('     Events: checkout.session.completed, customer.subscription.created,');
  console.log('             customer.subscription.updated, customer.subscription.deleted,');
  console.log('             invoice.paid');
  console.log('  3. Copy the webhook signing secret to STRIPE_WEBHOOK_SECRET in .env.local');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
