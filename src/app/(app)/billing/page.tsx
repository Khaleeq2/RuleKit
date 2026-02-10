'use client';

import { useState, useEffect } from 'react';
import {
  Coins,
  TrendingUp,
  TrendingDown,
  CreditCard,
  History,
  Zap,
  AlertTriangle,
  Crown,
  ExternalLink,
  Users,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Skeleton } from '@/app/components/ui/skeleton';
// Dialog imports retained for future use
import { billingRepo } from '@/app/lib/billing';
import { subscriptionRepo } from '@/app/lib/subscriptions';
import { CreditBalance, CreditTransaction, Subscription, TopUpPack, TOP_UP_PACKS, PLANS } from '@/app/lib/types';
import { formatRelativeTime } from '@/app/lib/time-utils';
import { toast } from 'sonner';

// ============================================
// Billing Page
// ============================================

export default function BillingPage() {
  const [balance, setBalance] = useState<CreditBalance | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [usageStats, setUsageStats] = useState<{
    totalUsed: number;
    byRulebook: { rulebookId: string; amount: number }[];
    dailyUsage: { date: string; amount: number }[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [balanceData, subscriptionData, transactionsData, statsData] = await Promise.all([
          billingRepo.getBalance(),
          subscriptionRepo.get(),
          billingRepo.getTransactions({ limit: 20 }),
          billingRepo.getUsageStats(7),
        ]);
        setBalance(balanceData);
        setSubscription(subscriptionData);
        setTransactions(transactionsData);
        setUsageStats(statsData);
      } catch (error) {
        console.error('Failed to load billing data:', error);
        setLoadError('Failed to load billing data. Check your connection and try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    const unsubBilling = billingRepo.subscribe(() => { loadData(); });
    const unsubPlan = subscriptionRepo.subscribe(() => { loadData(); });

    return () => { unsubBilling(); unsubPlan(); };
  }, []);

  const handleBuyCredits = async (pack: TopUpPack) => {
    setCheckoutLoading(pack.id);
    try {
      const url = await subscriptionRepo.createCheckoutSession('credit_pack', pack.id);
      window.location.href = url;
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to start checkout. Please try again.');
      setCheckoutLoading(null);
    }
  };

  const handleUpgradeToPro = async () => {
    setCheckoutLoading('pro');
    try {
      const url = await subscriptionRepo.createCheckoutSession('subscription');
      window.location.href = url;
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to start checkout. Please try again.');
      setCheckoutLoading(null);
    }
  };

  const handleManageBilling = async () => {
    setCheckoutLoading('portal');
    try {
      const url = await subscriptionRepo.openCustomerPortal();
      window.location.href = url;
    } catch (error) {
      console.error('Portal error:', error);
      toast.error('Failed to open billing portal.');
      setCheckoutLoading(null);
    }
  };

  const currentPlan = PLANS.find(p => p.id === (subscription?.plan || 'free'));

  if (isLoading) {
    return (
      <div className="min-h-full">
        <div className="max-w-[1400px] mx-auto px-6 py-6">
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-6">
              <div className="space-y-2">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-4 w-72" />
              </div>
              <Skeleton className="h-10 w-40 rounded-md" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-0 shadow-[0_1px_3px_0_rgb(0_0_0/0.1)]">
                  <CardContent className="p-6">
                    <Skeleton className="h-4 w-28 mb-4" />
                    <Skeleton className="h-12 w-40 mb-6" />
                    <div className="grid grid-cols-3 gap-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="p-4 rounded-lg bg-[var(--muted)]/30 border border-[var(--border)]">
                          <Skeleton className="h-3 w-24 mb-2" />
                          <Skeleton className="h-7 w-16" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-[0_1px_3px_0_rgb(0_0_0/0.1)]">
                  <CardContent className="p-6">
                    <Skeleton className="h-4 w-36 mb-4" />
                    <Skeleton className="h-40 w-full" />
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="border-0 shadow-[0_1px_3px_0_rgb(0_0_0/0.1)]">
                  <CardContent className="p-6">
                    <Skeleton className="h-4 w-28 mb-4" />
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-full">
        <div className="max-w-[1400px] mx-auto px-6 py-6">
          <div className="py-16 text-center">
            <AlertTriangle className="w-6 h-6 text-amber-500 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-[var(--foreground)] mb-1 tracking-tight">
              Something went wrong
            </h3>
            <p className="text-[13px] text-[var(--muted-foreground)] mb-4">
              {loadError}
            </p>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              Try again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-6 mb-6">
          <div>
            <h1 className="text-[length:var(--font-size-h1)] font-semibold text-[var(--foreground)] tracking-tight leading-[var(--line-height-h1)]">
              Billing & Credits
            </h1>
            <p className="text-[length:var(--font-size-body)] text-[var(--muted-foreground)] mt-1 leading-[var(--line-height-body)]">
              Manage your plan, credits, and usage
            </p>
          </div>
          <div className="flex gap-2">
            {subscription?.stripeCustomerId && (
              <Button
                variant="outline"
                onClick={handleManageBilling}
                disabled={checkoutLoading === 'portal'}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                {checkoutLoading === 'portal' ? 'Opening...' : 'Manage billing'}
              </Button>
            )}
            {(!subscription || subscription.plan === 'free') && (
              <Button
                onClick={handleUpgradeToPro}
                disabled={checkoutLoading === 'pro'}
              >
                <Crown className="w-4 h-4 mr-2" />
                {checkoutLoading === 'pro' ? 'Redirecting...' : 'Upgrade to Pro'}
              </Button>
            )}
          </div>
        </div>

        {/* Plan Card */}
        <Card className="border-0 shadow-[0_1px_3px_0_rgb(0_0_0/0.1)] mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${subscription?.plan === 'pro' ? 'bg-[var(--brand)]/10' : 'bg-[var(--muted)]'}`}>
                  {subscription?.plan === 'pro' ? (
                    <Crown className="w-5 h-5 text-[var(--brand)]" />
                  ) : (
                    <Zap className="w-5 h-5 text-[var(--muted-foreground)]" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-[var(--foreground)]">
                      {currentPlan?.name || 'Free'} Plan
                    </h3>
                    <Badge variant={subscription?.plan === 'pro' ? 'default' : 'secondary'} className="text-[10px]">
                      {subscription?.status === 'active' ? 'Active' : subscription?.status || 'Active'}
                    </Badge>
                  </div>
                  <p className="text-[13px] text-[var(--muted-foreground)] mt-0.5">
                    {currentPlan?.creditsPerMonth || 50} evaluations/month
                    {subscription?.plan === 'pro' && ` · ${subscription.seatsIncluded} seats included`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-semibold text-[var(--foreground)] tabular-nums">
                  {currentPlan?.price === 0 ? 'Free' : currentPlan?.price === -1 ? 'Custom' : `$${currentPlan?.price}`}
                </p>
                {currentPlan?.period && <p className="text-xs text-[var(--muted-foreground)]">{currentPlan.period}</p>}
              </div>
            </div>
            {subscription?.plan === 'pro' && subscription.seatCount > 0 && (
              <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center gap-2 text-[13px] text-[var(--muted-foreground)]">
                <Users className="w-4 h-4" />
                {subscription.seatCount} of {subscription.seatsIncluded} included seats used
                {subscription.seatCount > subscription.seatsIncluded && (
                  <span className="text-[var(--foreground)] font-medium">
                    · {subscription.seatCount - subscription.seatsIncluded} additional (+${(subscription.seatCount - subscription.seatsIncluded) * 5}/mo)
                  </span>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Balance Card */}
            <Card className="border-0 shadow-[0_1px_3px_0_rgb(0_0_0/0.1)]">
              <CardHeader className="pb-2">
                <CardTitle className="text-[length:var(--font-size-meta)] text-[var(--muted-foreground)] uppercase tracking-[0.02em] font-medium">
                  Credit Balance
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-baseline gap-2 mb-6">
                  <span className={`text-[44px] font-semibold ${balance && balance.balance <= 10 ? 'text-amber-600' : 'text-[var(--foreground)]'}`}>
                    {balance?.balance || 0}
                  </span>
                  <span className="text-[length:var(--font-size-body)] text-[var(--muted-foreground)]">credits</span>
                </div>

                {balance && balance.balance <= 10 && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50/60 border border-amber-200/60 mb-6 dark:bg-amber-900/10 dark:border-amber-800/40">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span className="text-[length:var(--font-size-body-sm)] text-amber-700 dark:text-amber-300">
                      Your credit balance is low. Top up to continue using RuleKit.
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-[var(--muted)]/30 border border-[var(--border)]">
                    <p className="text-[length:var(--font-size-meta)] text-[var(--muted-foreground)] mb-1">Monthly allowance</p>
                    <p className="text-[22px] font-semibold text-[var(--foreground)] tabular-nums">{balance?.monthlyAllowance || 0}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-[var(--muted)]/30 border border-[var(--border)]">
                    <p className="text-[length:var(--font-size-meta)] text-[var(--muted-foreground)] mb-1">Test credits</p>
                    <p className="text-[22px] font-semibold text-[var(--foreground)] tabular-nums">{balance?.testAllowanceRemaining || 0}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-[var(--muted)]/30 border border-[var(--border)]">
                    <p className="text-[length:var(--font-size-meta)] text-[var(--muted-foreground)] mb-1">Used this week</p>
                    <p className="text-[22px] font-semibold text-[var(--foreground)] tabular-nums">{usageStats?.totalUsed || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Usage Chart Placeholder */}
            <Card className="border-0 shadow-[0_1px_3px_0_rgb(0_0_0/0.1)]">
              <CardHeader className="pb-2">
                <CardTitle className="text-[length:var(--font-size-meta)] text-[var(--muted-foreground)] uppercase tracking-[0.02em] font-medium">
                  Usage (Last 7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {usageStats && usageStats.dailyUsage.length > 0 ? (
                  <div className="h-40 flex items-end gap-2">
                    {usageStats.dailyUsage.map((day, i) => {
                      const maxUsage = Math.max(...usageStats.dailyUsage.map(d => d.amount), 1);
                      const height = (day.amount / maxUsage) * 100;
                      return (
                        <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                          <div
                            className="w-full bg-[var(--primary)] rounded-t transition-all"
                            style={{ height: `${Math.max(height, 4)}%` }}
                          />
                          <span className="text-[length:var(--font-size-meta)] text-[var(--muted-foreground)]">
                            {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-40 flex items-center justify-center text-[length:var(--font-size-body-sm)] text-[var(--muted-foreground)]">
                    No usage data yet
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Transaction History */}
            <Card className="border-0 shadow-[0_1px_3px_0_rgb(0_0_0/0.1)]">
              <CardHeader className="pb-2">
                <CardTitle className="text-[length:var(--font-size-meta)] text-[var(--muted-foreground)] uppercase tracking-[0.02em] font-medium flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Transaction History
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {transactions.length === 0 ? (
                  <p className="text-[length:var(--font-size-body-sm)] text-[var(--muted-foreground)] text-center py-8">
                    No transactions yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((txn) => (
                      <TransactionRow key={txn.id} transaction={txn} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Top-Up */}
            <Card className="border-0 shadow-[0_1px_3px_0_rgb(0_0_0/0.1)]">
              <CardHeader className="pb-2">
                <CardTitle className="text-[length:var(--font-size-meta)] text-[var(--muted-foreground)] uppercase tracking-[0.02em] font-medium">Buy Credits</CardTitle>
                <CardDescription className="text-[length:var(--font-size-body-sm)]">Credits never expire</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {TOP_UP_PACKS.map((pack) => (
                  <button
                    key={pack.id}
                    onClick={() => handleBuyCredits(pack)}
                    disabled={checkoutLoading === pack.id}
                    className={`
                      w-full flex items-center justify-between p-4 rounded-lg border transition-all
                      ${pack.popular
                        ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                        : 'border-[var(--border)] hover:border-[var(--muted-foreground)]/30'
                      }
                      ${checkoutLoading === pack.id ? 'opacity-60 cursor-wait' : ''}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <Coins className="w-5 h-5 text-[var(--muted-foreground)]" />
                      <div className="text-left">
                        <p className="font-medium text-[var(--foreground)]">{pack.credits} credits</p>
                        <p className="text-[length:var(--font-size-meta)] text-[var(--muted-foreground)]">
                          {checkoutLoading === pack.id ? 'Redirecting...' : pack.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {pack.popular && (
                        <Badge className="rounded-full bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20 text-[10px] px-2 py-0.5 font-medium">
                          Popular
                        </Badge>
                      )}
                      <span className="font-semibold text-[var(--foreground)]">${pack.price}</span>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Pricing Info */}
            <Card className="border-0 shadow-[0_1px_3px_0_rgb(0_0_0/0.1)]">
              <CardHeader className="pb-2">
                <CardTitle className="text-[length:var(--font-size-meta)] text-[var(--muted-foreground)] uppercase tracking-[0.02em] font-medium">Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[length:var(--font-size-body-sm)] text-[var(--muted-foreground)]">API evaluation run</span>
                  <span className="text-[length:var(--font-size-body-sm)] font-medium text-[var(--foreground)]">1 credit</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[length:var(--font-size-body-sm)] text-[var(--muted-foreground)]">Test run</span>
                  <span className="text-[length:var(--font-size-body-sm)] font-medium text-[var(--foreground)]">Free*</span>
                </div>
                <p className="text-[length:var(--font-size-meta)] text-[var(--muted-foreground)]">
                  *Up to 50 free test runs per month included
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Transaction Row
// ============================================

function TransactionRow({ transaction }: { transaction: CreditTransaction }) {
  const isPositive = transaction.amount > 0;

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--muted)]/30 border border-[var(--border)]">
      <div className="flex items-center gap-3">
        {isPositive ? (
          <div className="p-2 rounded-lg bg-[var(--success)]/10">
            <TrendingUp className="w-4 h-4 text-[var(--success)]" />
          </div>
        ) : (
          <div className="p-2 rounded-lg bg-[var(--muted)]">
            <TrendingDown className="w-4 h-4 text-[var(--muted-foreground)]" />
          </div>
        )}
        <div>
          <p className="text-[length:var(--font-size-body-sm)] font-medium text-[var(--foreground)]">{transaction.description}</p>
          <p className="text-[length:var(--font-size-meta)] text-[var(--muted-foreground)]">
            {formatRelativeTime(transaction.createdAt).relative}
          </p>
        </div>
      </div>
      <span className={`font-semibold tabular-nums ${isPositive ? 'text-[var(--success)]' : 'text-[var(--foreground)]'}`}>
        {isPositive ? '+' : ''}{transaction.amount}
      </span>
    </div>
  );
}

