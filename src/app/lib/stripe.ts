import Stripe from 'stripe';

// ============================================
// Stripe Server Client
// Only import this in server-side code (API routes)
// ============================================

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is not set — Stripe features will be unavailable');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-01-27.acacia' as Stripe.LatestApiVersion,
  typescript: true,
});

// ============================================
// Stripe Price IDs — set after running seed script
// These map to the products/prices created in Stripe
// ============================================

export const STRIPE_PRICE_IDS = {
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || '',
  pro_seat: process.env.STRIPE_PRICE_PRO_SEAT || '',
  pack_starter: process.env.STRIPE_PRICE_PACK_STARTER || '',
  pack_growth: process.env.STRIPE_PRICE_PACK_GROWTH || '',
  pack_scale: process.env.STRIPE_PRICE_PACK_SCALE || '',
};

// ============================================
// Helpers
// ============================================

export function getStripeCustomerPortalUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
