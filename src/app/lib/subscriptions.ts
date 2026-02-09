'use client';

import { Subscription, PlanId } from './types';
import { getSupabaseBrowserClient } from './supabase-browser';

// ============================================
// Helpers
// ============================================

function sb() {
  return getSupabaseBrowserClient();
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function toSubscription(row: any): Subscription {
  return {
    id: row.id,
    userId: row.user_id,
    stripeCustomerId: row.stripe_customer_id,
    stripeSubscriptionId: row.stripe_subscription_id,
    plan: row.plan as PlanId,
    status: row.status,
    seatCount: row.seat_count,
    seatsIncluded: row.seats_included,
    currentPeriodStart: row.current_period_start,
    currentPeriodEnd: row.current_period_end,
    cancelAtPeriodEnd: row.cancel_at_period_end,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// ============================================
// Subscription Repository
// ============================================

export const subscriptionRepo = {
  async get(): Promise<Subscription | null> {
    try {
      const { data, error } = await sb()
        .from('subscriptions')
        .select('*')
        .maybeSingle();

      if (error) {
        // Table may not exist yet (migration not run)
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          return null;
        }
        throw error;
      }
      if (!data) return null;
      return toSubscription(data);
    } catch {
      // Gracefully degrade if subscriptions table isn't available
      return null;
    }
  },

  async createCheckoutSession(mode: 'subscription' | 'credit_pack', packId?: string): Promise<string> {
    const response = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, packId }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to create checkout session');
    }

    const { url } = await response.json();
    return url;
  },

  async openCustomerPortal(): Promise<string> {
    const response = await fetch('/api/stripe/portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to open billing portal');
    }

    const { url } = await response.json();
    return url;
  },

  subscribe(callback: () => void): () => void {
    const channel = sb()
      .channel('subscriptions-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'subscriptions' },
        () => callback(),
      )
      .subscribe();

    return () => {
      sb().removeChannel(channel);
    };
  },
};
